// app/api/fetchGame/route.ts
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const gameName = searchParams.get("gameName");
  const apiPosterKey = process.env.NEXT_PUBLIC_API_KEY;
  const basePosterUrl = process.env.NEXT_PUBLIC_BASE_POSTER_URL;

  if (!gameName) {
    return NextResponse.json({ error: "Invalid game name" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `${basePosterUrl}/${gameName}?${apiPosterKey}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch game data: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error in fetchGame API route:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
