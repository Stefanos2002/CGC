import { NextRequest, NextResponse } from "next/server";
import { getGamesCollection } from "@/app/Game Collection/functions";

export async function GET(req: NextRequest) {
  try {
    const gameCollection = await getGamesCollection();

    // Count total games
    const totalCount = await gameCollection.countDocuments();
    console.log("Total games in database:", totalCount);

    // Get sample games
    const sampleGames = await gameCollection
      .find()
      .limit(5)
      .project({ id: 1, name: 1, released: 1, slug: 1 })
      .toArray();

    // Check games by date ranges
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 15;

    const dateRanges = [];
    for (let year = startYear; year <= currentYear; year += 5) {
      const endYear = Math.min(year + 4, currentYear);
      dateRanges.push(`${year}-01-01,${endYear}-12-31`);
    }

    const rangeCounts = await Promise.all(
      dateRanges.map(async (range) => {
        const [start, end] = range.split(",");
        const count = await gameCollection.countDocuments({
          released: { $gte: start, $lte: end },
        });
        return { range, count };
      }),
    );

    return NextResponse.json({
      totalCount,
      sampleGames,
      rangeCounts,
      currentYear,
      dateRanges,
    });
  } catch (error) {
    console.error("Error checking database:", error);
    return NextResponse.json(
      { error: "Database check failed" },
      { status: 500 },
    );
  }
}
