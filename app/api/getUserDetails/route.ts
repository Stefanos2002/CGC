import { fetchUserDets } from "@/app/User Collection/connection";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email || typeof email !== "string") {
    return NextResponse.json({ message: "Invalid email" });
  }

  try {
    const { _id, profilePicture, library, watchlist } = await fetchUserDets(
      email as string
    );

    if (!_id) {
      return NextResponse.json({ message: "User not found" });
    }
    return NextResponse.json({ _id, profilePicture, library, watchlist });
  } catch (error) {
    console.error("Error fetching User:", error);
    return NextResponse.json({ message: "Internal server error" });
  }
}
