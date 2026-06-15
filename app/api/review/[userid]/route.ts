// pages/api/review.ts
import { addUserReview } from "@/app/User Collection/connection";
import { NextRequest, NextResponse } from "next/server";

//adding a review in Games
export async function POST(
  req: NextRequest,
  { params }: { params: { userid: string } }
) {
  const userid = params.userid;
  try {
    const { gameId, gameName, selectedReaction, reviewText, date } =
      await req.json();

    const result = await addUserReview(
      userid,
      gameId,
      gameName,
      selectedReaction,
      reviewText,
      date
    );

    if (!result?._id) {
      return NextResponse.json({ error: "User not found or review not added" }, { status: 400 });
    }

    return NextResponse.json({ message: "Review added successfully" });
  } catch (error) {
    console.error("Error adding review:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
