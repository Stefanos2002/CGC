// pages/api/users/[userid].ts
import { removeReview } from "@/app/User Collection/connection";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest, { params }: { params: { userid: string } }) {
  const userid = params.userid;
  const { reviewId } = await req.json();

  try {
    // Find the user by ID and delete them
    const removedGame = await removeReview(userid, reviewId);

    if (!removedGame) {
      return NextResponse.json({ success: false, message: "Game not found" });
    }

    return NextResponse.json({
      success: true,
      message: "Game removed successfully",
    });
  } catch (error) {
    console.error("Failed to remove game:", error);
    return NextResponse.json({ success: false, message: "Failed to remove game" });
  }
}
