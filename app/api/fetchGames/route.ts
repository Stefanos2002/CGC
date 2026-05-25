// app/api/fetchGames/route.ts
export const dynamic = 'force-dynamic';
import { seedGamesDB } from "@/app/Game Collection/functions";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  //   const apiPosterKey = process.env.NEXT_PUBLIC_API_KEY;
  //   const basePosterUrl = process.env.NEXT_PUBLIC_BASE_POSTER_URL;

  try {
    // const response = await fetch(`${basePosterUrl}?${apiPosterKey}`);
    const data = await seedGamesDB();

    // Validate that data is an array
    if (Array.isArray(data)) {
      // Wrap the array in an object with a `results` property
      return NextResponse.json({ results: data }, { status: 200 });
    } else {
      console.error("Invalid data format: Expected an array");
      return NextResponse.json(
        { error: "Invalid data format: Expected an array" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in fetchGames API route:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while fetching data" },
      { status: 500 }
    );
  }
}
