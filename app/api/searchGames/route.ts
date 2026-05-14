export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/authDbConnection/mongo/page";

const EDITION_KEYWORDS_PATTERN = [
  "director.?s cut", "definitive edition", "remastered?", "enhanced edition",
  "royal edition", "complete edition", "game of the year", "goty edition",
  "anniversary edition", "deluxe edition", "ultimate edition", "legendary edition",
  "gold edition", "expanded edition", "extended edition", "redux",
].join("|");

// Builds a regex that tolerates apostrophes, colons, hyphens in game names.
// "assassins" will match "Assassin's Creed"; "horizon zero dawn" matches "Horizon: Zero Dawn".
function buildFlexibleRegex(query: string): string {
  // Strip apostrophes/colons/etc from the query itself
  const normalized = query.replace(/[^\w\s]/g, "").trim();
  const words = normalized.split(/\s+/).filter(Boolean);

  const wordPatterns = words.map((word) => {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return escaped.split("").join("[^a-zA-Z0-9]{0,2}");
  });

  // Between words, allow any combination of spaces, colons, commas, hyphens
  return wordPatterns.join("[\\s:,\\-]*");
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

    const games = await gameCollection
      .find({
        $and: [
          { name: { $regex: flexibleRegex, $options: "i" } },
          { name: { $not: { $regex: EDITION_KEYWORDS_PATTERN, $options: "i" } } },
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
      })
      .limit(4)
      .toArray();

    return NextResponse.json({ results: games }, { status: 200 });
  } catch (error) {
    console.error("Error searching games:", error);
    return NextResponse.json(
      { error: "Failed to search games", details: (error as Error).message },
      { status: 500 },
    );
  }
}
