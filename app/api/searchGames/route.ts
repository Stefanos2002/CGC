export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/authDbConnection/mongo/page";

const EDITION_KEYWORDS_PATTERN = [
  "director.?s cut",
  "definitive edition",
  "remastered?",
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
].join("|");

function buildFlexibleRegex(query: string): string {
  const normalized = query
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = normalized.split(/\s+/).filter(Boolean);

  const wordPatterns = words.map((word) => {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Allow common word-separator chars between each letter so that
    // "spiderman" matches "Spider-Man", "ironman" matches "Iron Man", etc.
    return escaped.split("").join("[\\s\\-'.:]*");
  });

  // Between words allow any combination of separators + articles
  return wordPatterns.join("[\\s:,\\-.']*");
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.toLowerCase().trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] }, { status: 200 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    const gameCollection = db.collection("games");

    const flexibleRegex = buildFlexibleRegex(query);

    const today = new Date().toISOString().split("T")[0];
    const games = await gameCollection
      .find({
        $and: [
          { name: { $regex: flexibleRegex, $options: "i" } },
          { name: { $not: { $regex: EDITION_KEYWORDS_PATTERN, $options: "i" } } },
          { released: { $gte: "2000-01-01", $lte: today } },
          { tba: { $ne: true } },
          {
            $or: [
              { esrb_rating: null },
              { esrb_rating: { $exists: false } },
              { "esrb_rating.slug": { $ne: "adults-only" } },
            ],
          },
        ],
      })
      .project({
        id: 1,
        slug: 1,
        name: 1,
        background_image: 1,
        released: 1,
        parent_platforms: 1,
        rating: 1,
        metacritic: 1,
        ratings_count: 1,
      })
      .limit(30)
      .toArray();

    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - 18);
    const stripPunct = (s: string) => s.toLowerCase().replace(/[\s\-'.:,]+/g, "");
    const q = stripPunct(query);
    const sorted = games.filter((g) => {
      const releaseDate = new Date(g.released);
      const isRecent = releaseDate >= cutoff;
      const minRatings = isRecent ? 15 : 200;
      if ((g.ratings_count ?? 0) < minRatings) return false;
      return (g.rating ?? 0) >= 3.8 || (g.metacritic ?? 0) >= 60;
    }).sort((a, b) => {
      const aName = stripPunct(a.name as string);
      const bName = stripPunct(b.name as string);
      const aExact = aName === q;
      const bExact = bName === q;
      if (aExact !== bExact) return aExact ? -1 : 1;
      const aStarts = aName.startsWith(q);
      const bStarts = bName.startsWith(q);
      if (aStarts !== bStarts) return aStarts ? -1 : 1;
      return aName.localeCompare(bName);
    });

    return NextResponse.json({ results: sorted.slice(0, 4) }, { status: 200 });
  } catch (error) {
    console.error("Error searching games:", error);
    return NextResponse.json(
      { error: "Failed to search games", details: (error as Error).message },
      { status: 500 },
    );
  }
}
