import { NextRequest, NextResponse } from "next/server";
import { getGamesCollection } from "@/app/Game Collection/functions";

export async function GET(_req: NextRequest) {
  try {
    console.log("Testing getGamesCollection");
    const collection = await getGamesCollection();
    console.log("Collection obtained:", !!collection);

    const count = await collection.countDocuments();
    console.log("Total games count:", count);

    return NextResponse.json({
      success: true,
      collectionExists: !!collection,
      totalGames: count,
    });
  } catch (error) {
    console.error("Test error:", error);
    const err = error instanceof Error ? error : new Error(String(error));
    return NextResponse.json(
      {
        success: false,
        error: err.message,
        stack: err.stack,
      },
      { status: 500 },
    );
  }
}
