import { NextRequest, NextResponse } from "next/server";
import { getGamesCollection } from "@/app/Game Collection/functions";

export async function POST(req: NextRequest) {
  try {
    const gameCollection = await getGamesCollection();

    // Drop the collection
    await gameCollection.drop();
    console.log("Games collection dropped successfully");

    return NextResponse.json({
      message: "Games collection dropped successfully",
    });
  } catch (error) {
    console.error("Error dropping collection:", error);
    return NextResponse.json(
      { error: "Failed to drop collection" },
      { status: 500 },
    );
  }
}
