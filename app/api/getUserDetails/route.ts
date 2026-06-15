export const dynamic = 'force-dynamic';
import { fetchUserDets } from "@/app/User Collection/connection";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email || typeof email !== "string") {
    return NextResponse.json({ message: "Invalid email" }, { status: 400 });
  }

  try {
    const { _id, profilePicture, library, watchlist } = await fetchUserDets(
      email as string
    );

    if (!_id) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ _id, profilePicture, library, watchlist });
  } catch (error) {
    console.error("Error fetching User:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
