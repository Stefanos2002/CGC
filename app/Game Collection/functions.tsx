import { Collection, Document } from "mongodb";
import { unstable_cache } from "next/cache";
import clientPromise from "../../authDbConnection/mongo/page";
import { IoStarSharp } from "react-icons/io5";
import { User } from "../Constants/constants";
import { PostResult, Genre, Platform } from "../Constants/constants";

declare global {
  var _gamesDbInitialized: boolean | undefined;
  var _cachedGames: PostResult[] | null | undefined;
  var _lastUpdated: Date | null | undefined;
}

const basePosterUrl = process.env.NEXT_PUBLIC_BASE_POSTER_URL;
const apiPosterKey = process.env.NEXT_PUBLIC_API_KEY;
const apiPosterUrl = `${basePosterUrl}?${apiPosterKey}`;

const getGameData = async (url: string, page: number) => {
  try {
    const fullUrl = `${url}&page=${page}`;
    console.log(`Fetching from RAWG API: ${fullUrl}`);
    const res = await fetch(fullUrl);
    if (!res.ok) {
      console.error(`RAWG API returned ${res.status} for URL: ${fullUrl}`);
      if (res.status === 404) {
        console.error("This might indicate an invalid API key or changed API endpoint");
      }
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    if (!data || !data.results) {
      console.error("RAWG API returned invalid data structure:", data);
      throw new Error("Invalid data structure");
    }
    return data.results as PostResult[];
  } catch (error) {
    console.error("Error fetching game data:", error);
    throw error;
  }
};

const minimalGameProjection = {
  id: 1,
  released: 1,
  rating: 1,
  ratings_count: 1,
  tba: 1,
  parent_platforms: 1,
  genres: 1,
  slug: 1,
  name: 1,
  background_image: 1,
  rating_top: 1,
  metacritic: 1,
  description_raw: 1,
  esrb_rating: 1,
};

const normalizeGameDocument = (game: any): PostResult => ({
  ...game,
  _id: game._id?.toString(),
});

const MIN_RELEASE_DATE = new Date("2000-01-01");
const MAX_RELEASE_DATE = new Date();
const MAX_STORED_GAMES = 2000;
const MAINSTREAM_MIN_RATING = 3.8;
const MAINSTREAM_MIN_METACRITIC = 60;
const MAINSTREAM_RECENT_MONTHS = 18;
const MAINSTREAM_RECENT_MIN_RATINGS = 15;
const MAINSTREAM_ESTABLISHED_MIN_RATINGS = 200;
const RANGE_PAGE_SIZE = 40;

const EDITION_KEYWORDS = [
  "director's cut",
  "directors cut",
  "definitive edition",
  "remastered",
  "enhanced edition",
  "royal edition",
  "complete edition",
  "game of the year",
  "goty edition",
  "anniversary edition",
  "deluxe edition",
  "ultimate edition",
  "legendary edition",
  "gold edition",
  "expanded edition",
  "extended edition",
  "redux",
  "remaster",
  "pc port",
];

const getValidGameFilter = () => ({
  released: {
    $gte: "2000-01-01",
    $lte: new Date().toISOString().split("T")[0],
  },
  tba: { $ne: true },
});

const parseDateString = (value?: string) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const isEditionVariant = (game: Partial<PostResult>): boolean => {
  if (!game.name) return false;
  const lower = game.name.toLowerCase();
  return EDITION_KEYWORDS.some((kw) => lower.includes(kw));
};

const isAdultGame = (game: Partial<PostResult>): boolean => {
  return (game as any).esrb_rating?.slug === "adults-only";
};

const EXCLUDED_GENRE_SLUGS = ["simulation", "casual", "puzzle"];

const hasExcludedGenre = (game: Partial<PostResult>): boolean => {
  if (!game.genres || !Array.isArray(game.genres)) return false;
  return game.genres.some((g) => EXCLUDED_GENRE_SLUGS.includes(g.slug));
};

const isGameReleasedAndInRange = (game: Partial<PostResult>) => {
  if (game.tba === true) return false;
  const releaseDate = parseDateString(game.released);
  if (!releaseDate) return false;
  const today = new Date();
  if (releaseDate > today) return false;
  return releaseDate >= MIN_RELEASE_DATE && releaseDate <= MAX_RELEASE_DATE;
};

const isMainstreamGame = (game: Partial<PostResult>) => {
  if (!isGameReleasedAndInRange(game)) return false;
  if (isEditionVariant(game)) return false;
  if (isAdultGame(game)) return false;
  if (hasExcludedGenre(game)) return false;
  const rating = Number(game.rating ?? 0);
  const metacritic = Number(game.metacritic ?? 0);
  const ratingCount = Number(game.ratings_count ?? 0);

  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - MAINSTREAM_RECENT_MONTHS);
  const releaseDate = parseDateString(game.released);
  const isRecent = releaseDate !== null && releaseDate >= cutoff;
  const minRatings = isRecent
    ? MAINSTREAM_RECENT_MIN_RATINGS
    : MAINSTREAM_ESTABLISHED_MIN_RATINGS;
  if (ratingCount < minRatings) return false;
  return (
    rating >= MAINSTREAM_MIN_RATING || metacritic >= MAINSTREAM_MIN_METACRITIC
  );
};

const isNotableGame = (game: Partial<PostResult>) => {
  if (!isGameReleasedAndInRange(game)) return false;
  if (isEditionVariant(game)) return false;
  if (isAdultGame(game)) return false;
  const rating = Number(game.rating ?? 0);
  const metacritic = Number(game.metacritic ?? 0);
  const ratingCount = Number(game.ratings_count ?? 0);
  if (ratingCount < 50) return false;
  return rating >= 3.5 || metacritic >= 50;
};

let cachedGames: PostResult[] | null =
  process.env.NODE_ENV !== "production" ? (global._cachedGames ?? null) : null;
let lastUpdated: Date | null =
  process.env.NODE_ENV !== "production" ? (global._lastUpdated ?? null) : null;

// Layer 1 — Seeding: reads quality games from DB for display
export const getAllGames = async (): Promise<PostResult[]> => {
  const gameCollection = await getGamesCollection();
  const docs = (await gameCollection
    .find<PostResult>({ ...getValidGameFilter() })
    .project(minimalGameProjection)
    .toArray()) as PostResult[];
  return docs.map(normalizeGameDocument).filter(isMainstreamGame);
};

// Layer 1 — Seeding: populates DB with basic game metadata from RAWG list endpoint
export const seedGamesDB = async (): Promise<PostResult[]> => {
  const currentTime = new Date();

  if (cachedGames && lastUpdated) {
    const timeDifference = currentTime.getTime() - lastUpdated.getTime();
    const oneMonthInMs = 30 * 24 * 60 * 60 * 1000;

    if (timeDifference < oneMonthInMs) {
      console.log("Returning cached games");
      return cachedGames;
    }
  }

  try {
    const gameCollection = await getGamesCollection();

    const dateRanges: string[] = [];
    for (let year = 2000; year <= 2026; year += 5) {
      const endYear = Math.min(year + 4, 2026);
      dateRanges.push(`${year}-01-01,${endYear}-12-31`);
    }
    dateRanges.reverse();

    const existingDocs = (await gameCollection
      .find<PostResult>({ ...getValidGameFilter() })
      .project(minimalGameProjection)
      .toArray()) as PostResult[];

    const existingGames = existingDocs
      .map(normalizeGameDocument)
      .filter(isMainstreamGame);

    const existingIds = new Set(existingGames.map((game) => game.id));
    let remainingSpace = Math.max(0, MAX_STORED_GAMES - existingGames.length);
    const allGames: PostResult[] = [...existingGames];

    if (remainingSpace <= 0) {
      cachedGames = allGames.slice(0, MAX_STORED_GAMES);
      lastUpdated = new Date();
      if (process.env.NODE_ENV !== "production") {
        global._cachedGames = cachedGames;
        global._lastUpdated = lastUpdated;
      }
      console.log(`DB already has ${cachedGames.length} mainstream games`);
      return cachedGames;
    }

    for (const dateRange of dateRanges) {
      if (remainingSpace <= 0) break;
      console.log(`Checking date range: ${dateRange}`);

      for (let page = 1; page <= 20 && remainingSpace > 0; page += 1) {
        const dateRangeUrl = `${apiPosterUrl}&dates=${dateRange}&ordering=-added&page_size=${RANGE_PAGE_SIZE}`;
        const gameResults = await getGameData(dateRangeUrl, page);

        if (!gameResults.length) {
          console.log(`No results for ${dateRange} page ${page}`);
          break;
        }

        const filteredResults = gameResults
          .filter(isMainstreamGame)
          .filter((game) => !existingIds.has(game.id));

        if (!filteredResults.length) {
          if (page === 1) {
            console.log(`No mainstream RAWG results for date range ${dateRange}`);
          }
          if (gameResults.length < RANGE_PAGE_SIZE) break;
          continue;
        }

        const gamesToInsert = filteredResults.slice(0, remainingSpace);

        if (gamesToInsert.length > 0) {
          const bulkOperations = gamesToInsert.map((game) => ({
            updateOne: {
              filter: { id: game.id },
              update: { $set: { ...game } },
              upsert: true,
            },
          }));

          await gameCollection.bulkWrite(bulkOperations, { ordered: false });

          gamesToInsert.forEach((game) => {
            existingIds.add(game.id);
            allGames.push(normalizeGameDocument(game));
          });

          remainingSpace = Math.max(0, remainingSpace - gamesToInsert.length);
          console.log(`Inserted ${gamesToInsert.length} games for ${dateRange} page ${page}`);
        }

        if (gameResults.length < RANGE_PAGE_SIZE) break;
      }
    }

    if (remainingSpace > 0) {
      const notableGames = existingDocs
        .map(normalizeGameDocument)
        .filter((game) => !existingIds.has(game.id) && isNotableGame(game))
        .slice(0, remainingSpace);

      notableGames.forEach((game) => {
        existingIds.add(game.id);
        allGames.push(game);
      });
      console.log(`Filled ${notableGames.length} notable games from DB`);
    }

    cachedGames = allGames.slice(0, MAX_STORED_GAMES);
    lastUpdated = new Date();
    if (process.env.NODE_ENV !== "production") {
      global._cachedGames = cachedGames;
      global._lastUpdated = lastUpdated;
    }
    console.log(`Total games fetched: ${cachedGames.length}`);
    return cachedGames;
  } catch (error) {
    console.error("Error seeding games DB:", error);
    throw error;
  }
};

export const sortGamesByRelease = (games: PostResult[]) => {
  return games.sort((a, b) => {
    const dateA = new Date(a.released);
    const dateB = new Date(b.released);
    return dateB.getTime() - dateA.getTime();
  });
};

export const extractGenres = (games: PostResult[]): Genre[] => {
  const genreMap = new Map<number, Genre>();
  games.forEach((game) => {
    if (game.genres && Array.isArray(game.genres)) {
      game.genres.forEach((genre) => {
        if (!genreMap.has(genre.id)) genreMap.set(genre.id, genre);
      });
    }
  });
  return Array.from(genreMap.values());
};

export const getCachedGenres = unstable_cache(
  async () => {
    const games = await getAllGames();
    return extractGenres(games);
  },
  ["all-genres"],
  { revalidate: 3600 },
);

// Layer 2 — Enrichment: fetches full details for a single game and stores in DB
const enrichGame = async (game: PostResult) => {
  try {
    if (hasFullDetails(game)) return game;

    const gameCollection = await getGamesCollection();
    const existingGame = await gameCollection.findOne<PostResult>({ id: game.id });
    if (existingGame && existingGame.description_raw) {
      return normalizeGameDocument({ ...existingGame, ...game });
    }

    const gameRes = await fetch(`${basePosterUrl}/${game.id}?${apiPosterKey}`);
    if (!gameRes.ok) {
      throw new Error(`HTTP error! status: ${gameRes.status}`);
    }

    const gameData = await gameRes.json();
    const detailedGame = {
      ...game,
      ...gameData,
      _id: existingGame?._id?.toString() || game._id,
    };

    await gameCollection.updateOne(
      { id: game.id },
      { $set: { ...gameData, id: gameData.id } },
      { upsert: true },
    );

    return normalizeGameDocument(detailedGame as PostResult);
  } catch (error) {
    console.error("Error enriching game:", error);
    throw error;
  }
};

// Layer 2 — Enrichment: lazily fetches and stores full details for a batch of games
export const enrichGames = async (games: PostResult[]): Promise<PostResult[]> => {
  if (!games.length) return [];
  const gameCollection = await getGamesCollection();
  const ids = games.map((g) => g.id);
  const existingDocs = await gameCollection
    .find<PostResult>({ id: { $in: ids } })
    .toArray();
  const docMap = new Map(
    existingDocs.map((d) => [d.id, normalizeGameDocument(d)]),
  );
  return Promise.all(
    games.map((game) => {
      const doc = docMap.get(game.id);
      if (doc?.description_raw) return doc;
      return enrichGame(game);
    }),
  );
};

const platformIds: { [key: string]: number } = {
  pc: 1,
  playstation: 2,
  xbox: 3,
  nintendo: 7,
};

const convertDocuments = (docs: PostResult[]) =>
  docs.map(normalizeGameDocument);

export const getGamesCollection = async (): Promise<Collection<Document>> => {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("games");
    if (!global._gamesDbInitialized) {
      global._gamesDbInitialized = true;
      await collection.createIndex({ id: 1 }, { unique: true, background: true });
      await collection.createIndex({ slug: 1 }, { background: true });
      await collection.createIndex({ released: 1 }, { background: true });
      await collection.createIndex({ "genres.slug": 1 }, { background: true });
      await collection.createIndex(
        { "parent_platforms.platform.id": 1 },
        { background: true },
      );
    }
    return collection;
  } catch (error) {
    console.error("Error getting games collection:", error);
    throw error;
  }
};

// Layer 3 — Read: DB queries with optional in-memory sort applied by the caller
export const getGamesByPlatform = async (name: string) => {
  const platformId = platformIds[name.toLowerCase()];
  if (!platformId) {
    throw new Error(`Invalid platform name: ${name}`);
  }

  const gameCollection = await getGamesCollection();
  const filteredGames = (await gameCollection
    .find<PostResult>({
      ...getValidGameFilter(),
      "parent_platforms.platform.id": platformId,
    })
    .project(minimalGameProjection)
    .toArray()) as PostResult[];

  return convertDocuments(filteredGames);
};

export const getGamesByGenre = async (slug: string) => {
  const gameCollection = await getGamesCollection();
  const filteredGames = (await gameCollection
    .find<PostResult>({
      ...getValidGameFilter(),
      "genres.slug": slug,
    })
    .project(minimalGameProjection)
    .toArray()) as PostResult[];

  return convertDocuments(filteredGames);
};

export const getGamesByPlatformAndGenre = async (name: string, slug: string) => {
  const platformId = platformIds[name.toLowerCase()];
  if (!platformId) {
    throw new Error(`Invalid platform name: ${name}`);
  }

  const gameCollection = await getGamesCollection();
  const filteredGames = (await gameCollection
    .find<PostResult>({
      ...getValidGameFilter(),
      "parent_platforms.platform.id": platformId,
      "genres.slug": slug,
    })
    .project(minimalGameProjection)
    .toArray()) as PostResult[];

  return convertDocuments(filteredGames);
};

export const paginateGames = (
  games: PostResult[],
  page: number,
  pageSize: number,
) => {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return games.slice(start, end);
};

const hasFullDetails = (game: PostResult) => {
  return Boolean(
    game.description_raw &&
    game.parent_platforms &&
    game.genres &&
    game.slug &&
    game.background_image,
  );
};

export const formatCount = (rating_count: number) => {
  let newNum;
  if (rating_count >= 1000) newNum = (rating_count / 1000).toFixed(1) + "K";
  else return rating_count;
  return newNum;
};

export const renderStarRating = (rating: number) => {
  const stars: JSX.Element[] = [];
  const whole = Math.floor(rating);
  const remainder = rating - whole;
  const percentage_r = `${remainder * 100}%`;

  const getColor = (rating: number) => {
    if (rating < 3) return "darkorange";
    if (rating < 4) return "#C4B454";
    return "darkgreen";
  };

  const color = getColor(rating);

  for (let i = 0; i < whole; i++) {
    stars.push(
      <IoStarSharp
        key={i}
        style={{ background: color, fontSize: "24px", padding: "2px" }}
      />,
    );
  }

  if (remainder > 0) {
    stars.push(
      <IoStarSharp
        key="partial"
        style={{
          background: `linear-gradient(to right, ${color} ${percentage_r}, grey ${percentage_r})`,
          fontSize: "24px",
          padding: "2px",
        }}
      />,
    );
  }

  while (stars.length < 5) {
    stars.push(
      <IoStarSharp
        key={stars.length}
        style={{ background: "grey", fontSize: "24px", padding: "2px" }}
      />,
    );
  }

  return stars;
};

export const searchGames = async (query: string): Promise<PostResult[]> => {
  const gameCollection = await getGamesCollection();
  const normalized = query
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = normalized.split(/\s+/).filter(Boolean);
  const wordPatterns = words.map((word) => {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return escaped.split("").join("[\\s\\-'.:]*");
  });
  const flexibleRegex = wordPatterns.join("[\\s:,\\-.']*");
  const docs = (await gameCollection
    .find<PostResult>({
      name: { $regex: flexibleRegex, $options: "i" },
      ...getValidGameFilter(),
      $or: [
        { esrb_rating: null },
        { esrb_rating: { $exists: false } },
        { "esrb_rating.slug": { $ne: "adults-only" } },
      ],
    })
    .project(minimalGameProjection)
    .toArray()) as PostResult[];
  return docs.map(normalizeGameDocument);
};

export const getGameBySlug = async (name: string) => {
  const gameCollection = await getGamesCollection();

  const existingGame = await gameCollection.findOne<PostResult>({ slug: name });
  if (existingGame && existingGame.description_raw) {
    return normalizeGameDocument(existingGame);
  }

  const res = await fetch(`${basePosterUrl}/${name}?${apiPosterKey}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch game info: ${res.statusText}`);
  }

  const data = await res.json();
  await gameCollection.updateOne(
    { id: data.id },
    { $set: { ...data, id: data.id } },
    { upsert: true },
  );

  return normalizeGameDocument({ ...data } as PostResult);
};

export const getUserReviews = async (allUsers: User[], gameId: number) => {
  const gameReviews = allUsers
    ?.flatMap((user) =>
      (user.user_reviews || []).map((review) => ({
        ...review,
        username: user.username || user.name,
      })),
    )
    .filter((review) => review.gameId === gameId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return gameReviews;
};

export async function getScreenshots(slug: string) {
  try {
    const res = await fetch(
      `${basePosterUrl}/${slug}/screenshots?${apiPosterKey}`,
      { cache: "no-store" },
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch screenshots: ${res.statusText}`);
    }

    const data = await res.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching screenshots:", error);
    return undefined;
  }
}
