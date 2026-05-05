import { Collection, Db, MongoClient, Document, ObjectId } from "mongodb";
import { unstable_cache } from "next/cache";
import clientPromise from "../../authDbConnection/mongo/page";
import { IoStarSharp } from "react-icons/io5";
import { User } from "../Constants/constants";
import { PostResult, Genre, Platform } from "../Constants/constants";

let client: MongoClient | undefined;
let db: Db | undefined;
let games: Collection<Document> | undefined;

//https://api.rawg.io/api/games
const basePosterUrl = process.env.NEXT_PUBLIC_BASE_POSTER_URL;

//api key for connection to RAWG database
const apiPosterKey = process.env.NEXT_PUBLIC_API_KEY;

//combining href with api key
const apiPosterUrl = `${basePosterUrl}?${apiPosterKey}`;

// Ensures the database connection (db) is set up only once.
async function init(): Promise<void> {
  if (db) return;
  try {
    console.log("Initializing database connection...");
    client = await clientPromise;
    console.log("Client connected, getting database...");
    db = await client.db();
    console.log("Database obtained, getting games collection...");
    games = await db.collection("games");
    console.log("Games collection obtained, creating indexes...");
    await games.createIndex({ id: 1 }, { unique: true, background: true });
    await games.createIndex({ slug: 1 }, { background: true });
    await games.createIndex({ released: 1 }, { background: true });
    await games.createIndex({ "genres.slug": 1 }, { background: true });
    await games.createIndex(
      { "parent_platforms.platform.id": 1 },
      { background: true },
    );
    console.log("Database initialization complete");
  } catch (error) {
    console.error("Failed to establish connection to database:", error);
    throw new Error("Failed to establish connection to database");
  }
}

//runs as soon as file is loaded (after awaiting initialization)
(async () => {
  await init();
})();

//THIS FUNCTION RETURNS THE GAME DATA PER PAGE (STARTING FROM PAGE 1)
const getGameData = async (url: string, page: number) => {
  try {
    const fullUrl = `${url}&page=${page}`;
    console.log(`Fetching from RAWG API: ${fullUrl}`);
    const res = await fetch(fullUrl);
    if (!res.ok) {
      console.error(`RAWG API returned ${res.status} for URL: ${fullUrl}`);
      if (res.status === 404) {
        console.error(
          "This might indicate an invalid API key or changed API endpoint",
        );
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
const MAX_RELEASE_DATE = new Date("2026-12-31");
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
];

const validGameFilter = {
  released: { $gte: "2000-01-01", $lte: "2026-12-31" },
  tba: { $ne: true },
};

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
  const minRatings = isRecent ? MAINSTREAM_RECENT_MIN_RATINGS : MAINSTREAM_ESTABLISHED_MIN_RATINGS;
  if (ratingCount < minRatings) return false;
  return rating >= MAINSTREAM_MIN_RATING || metacritic >= MAINSTREAM_MIN_METACRITIC;
};

let cachedGames: PostResult[] | null = null;
let lastUpdated: Date | null = null;

//MAIN FUNCTION RETURNING GAMES BASED ON YEAR
export const fetchAndCombineDataSimple = async (): Promise<PostResult[]> => {
  const currentTime = new Date();

  //LOGIC TO RETURN NEW UPDATED CONTENT IF A MONTH HAS PASSED
  if (cachedGames && lastUpdated) {
    const timeDifference = currentTime.getTime() - lastUpdated.getTime();
    const oneMonthInMs = 30 * 24 * 60 * 60 * 1000; // Approximate one month in milliseconds

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
    dateRanges.reverse(); // most recent years first so new games get priority

    const existingDocs = (await gameCollection
      .find<PostResult>({
        ...validGameFilter,
      })
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
      console.log(`DB already has ${cachedGames.length} mainstream games`);
      return cachedGames;
    }

    for (const dateRange of dateRanges) {
      if (remainingSpace <= 0) break;
      const [start, end] = dateRange.split(",");
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
            console.log(
              `No mainstream RAWG results for date range ${dateRange}`,
            );
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

          await gameCollection.bulkWrite(bulkOperations, {
            ordered: false,
          });

          gamesToInsert.forEach((game) => {
            existingIds.add(game.id);
            allGames.push(normalizeGameDocument(game));
          });

          remainingSpace = Math.max(0, remainingSpace - gamesToInsert.length);
          console.log(
            `Inserted ${gamesToInsert.length} games for ${dateRange} page ${page}`,
          );
        }

        if (gameResults.length < RANGE_PAGE_SIZE) {
          break;
        }
      }
    }

    cachedGames = allGames.slice(0, MAX_STORED_GAMES);
    lastUpdated = new Date();
    console.log(`Total games fetched: ${cachedGames.length}`);
    return cachedGames;
  } catch (error) {
    console.error("Error fetching and combining data:", error);
    throw error;
  }
};
//function to sort the games based on their release
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

// Cached for genre/console+genre pages that need all genres but don't fetch all games
export const getCachedGenres = unstable_cache(
  async () => {
    const games = await fetchAndCombineDataSimple();
    return extractGenres(games);
  },
  ["all-genres"],
  { revalidate: 3600 },
);

// Single batched DB query instead of N individual findOne calls
export const fetchGameDetailsBatch = async (
  games: PostResult[],
): Promise<PostResult[]> => {
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
      return fetchGameDetails(game);
    }),
  );
};

// export const shuffleArray = <T,>(array: T[]): void => {
//   for (let i = array.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [array[i], array[j]] = [array[j], array[i]];
//   }
// };

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
    const games = db.collection("games");
    return games;
  } catch (error) {
    console.error("Error getting games collection:", error);
    throw error;
  }
};

// this works for the company logo games
export const fetchAndCombineData = async (name: string) => {
  const platformId = platformIds[name.toLowerCase()];
  if (!platformId) {
    throw new Error(`Invalid platform name: ${name}`);
  }

  const gameCollection = await getGamesCollection();
  const filteredGames = (await gameCollection
    .find<PostResult>({
      ...validGameFilter,
      "parent_platforms.platform.id": platformId,
    })
    .project(minimalGameProjection)
    .toArray()) as PostResult[];

  return convertDocuments(filteredGames);
};

// this works for the company page games
export const fetchByGenre = async (slug: string) => {
  const gameCollection = await getGamesCollection();
  const filteredGames = (await gameCollection
    .find<PostResult>({
      ...validGameFilter,
      "genres.slug": slug,
    })
    .project(minimalGameProjection)
    .toArray()) as PostResult[];

  return convertDocuments(filteredGames);
};

export const fetchByGenreName = async (name: string) => {
  const allGames = await fetchByGenre(name);
  return allGames.slice().sort((a, b) => a.name.localeCompare(b.name));
};

export const fetchByGenreRating = async (name: string) => {
  const allGames = await fetchByGenre(name);
  return allGames.slice().sort((a, b) => b.rating - a.rating);
};

export const fetchByGenreConsole = async (name: string, slug: string) => {
  const platformId = platformIds[name.toLowerCase()];
  if (!platformId) {
    throw new Error(`Invalid platform name: ${name}`);
  }

  const gameCollection = await getGamesCollection();
  const filteredGames = (await gameCollection
    .find<PostResult>({
      ...validGameFilter,
      "parent_platforms.platform.id": platformId,
      "genres.slug": slug,
    })
    .project(minimalGameProjection)
    .toArray()) as PostResult[];

  return convertDocuments(filteredGames);
};

export const fetchByGenreConsoleName = async (name: string, slug: string) => {
  const allGames = await fetchByGenreConsole(name, slug);
  return allGames.slice().sort((a, b) => a.name.localeCompare(b.name));
};

export const fetchByGenreConsoleRating = async (name: string, slug: string) => {
  const allGames = await fetchByGenreConsole(name, slug);
  return allGames.slice().sort((a, b) => b.rating - a.rating);
};

// this function sorts the greatest games first
export const fetchByRating = async () => {
  const gameCollection = await getGamesCollection();
  const sortedGames = (await gameCollection
    .find<PostResult>({
      ...validGameFilter,
    })
    .project(minimalGameProjection)
    .sort({ rating: -1 })
    .toArray()) as PostResult[];

  return convertDocuments(sortedGames);
};

// this function sorts the greatest games first
export const fetchByName = async () => {
  const gameCollection = await getGamesCollection();
  const sortedGames = (await gameCollection
    .find<PostResult>({
      ...validGameFilter,
    })
    .project(minimalGameProjection)
    .sort({ name: 1 })
    .toArray()) as PostResult[];

  return convertDocuments(sortedGames);
};

// this function sorts the greatest games first
export const fetchByRatingConsole = async (name: string) => {
  const platformId = platformIds[name.toLowerCase()];
  if (!platformId) {
    throw new Error(`Invalid platform name: ${name}`);
  }

  const gameCollection = await getGamesCollection();
  const sortedGames = (await gameCollection
    .find<PostResult>({
      ...validGameFilter,
      "parent_platforms.platform.id": platformId,
    })
    .project(minimalGameProjection)
    .sort({ rating: -1 })
    .toArray()) as PostResult[];

  return convertDocuments(sortedGames);
};

// this function sorts by name alphabetically
export const fetchByNameConsole = async (name: string) => {
  const platformId = platformIds[name.toLowerCase()];
  if (!platformId) {
    throw new Error(`Invalid platform name: ${name}`);
  }

  const gameCollection = await getGamesCollection();
  const sortedGames = (await gameCollection
    .find<PostResult>({
      ...validGameFilter,
      "parent_platforms.platform.id": platformId,
    })
    .project(minimalGameProjection)
    .sort({ name: 1 })
    .toArray()) as PostResult[];

  return convertDocuments(sortedGames);
};

//FUNCTION THAT RETURNS 15 GAMES PER PAGE
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

//FUNCTION TO GET GAME DETAILS
export const fetchGameDetails = async (game: PostResult) => {
  try {
    if (hasFullDetails(game)) return game;

    const gameCollection = await getGamesCollection();
    const existingGame = await gameCollection.findOne<PostResult>({
      id: game.id,
    });
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
    console.error("Error fetching game details:", error);
    throw error;
  }
};

//FUNCTION THAT ROUNDS NUMBER OF RATING (USED ON GAME DETAILS)
export const roundNum = (rating_count: number) => {
  let newNum;
  if (rating_count >= 1000) newNum = (rating_count / 1000).toFixed(1) + "K";
  else return rating_count;
  return newNum;
};

//FUNCTION THAT CONVERTS RATING TO STARS (USED ON GAME DETAILS)
export const convertToStars = (rating: number) => {
  const stars: JSX.Element[] = [];
  const whole = Math.floor(rating);
  const remainder = rating - whole;
  const percentage_r = `${remainder * 100}%`;

  // Define colors based on rating range
  const getColor = (rating: number) => {
    if (rating < 3) return "darkorange";
    if (rating < 4) return "#C4B454";
    return "darkgreen";
  };

  const color = getColor(rating);

  // Add full stars
  for (let i = 0; i < whole; i++) {
    stars.push(
      <IoStarSharp
        key={i}
        style={{
          background: color,
          fontSize: "24px",
          padding: "2px",
        }}
      />,
    );
  }

  // Add partial star if there's a remainder
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

  // Add empty stars to complete 5
  while (stars.length < 5) {
    stars.push(
      <IoStarSharp
        key={stars.length}
        style={{
          background: "grey",
          fontSize: "24px",
          padding: "2px",
        }}
      />,
    );
  }

  return stars;
};

//FUNCTION TO FETCH GAME INFORMATION (USED ON PAGE UNDER NAME)
export const getGameInfoByName = async (name: string) => {
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

//FUNCTIONS TO FETCH USER REVIEWS ON ALL USERS BASED ON GAME
export const getUserReviews = async (allUsers: User[], gameId: number) => {
  // Process all users asynchronously and return reviews filtered by gameId
  const gameReviews = allUsers
    ?.flatMap((user) =>
      (user.user_reviews || []).map((review) => ({
        ...review,
        username: user.username || user.name,
      })),
    ) // Flatten all user reviews from each user
    .filter((review) => review.gameId === gameId) // Filter reviews by gameId
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return gameReviews;
};

//FUNCTION TO FETCH GAME SCREENSHOTS
export async function getScreenshots(slug: string) {
  try {
    const res = await fetch(
      `${basePosterUrl}/${slug}/screenshots?${apiPosterKey}`,
      {
        // Adding no-store ensures fresh data on each request if needed
        cache: "no-store",
      },
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
