export const dynamic = 'force-dynamic';
import { updateUserImage } from "@/app/User Collection/connection";
import { NextRequest, NextResponse } from "next/server";

// import { connectToDatabase } from "@/utils/mongodb"; // A helper function to connect to your MongoDB
// import User from "@/models/User"; // Your Mongoose User model

export async function POST(req: NextRequest) {
  try {
    const { email, profilePicture } = await req.json();

    // Ensure we have both email and profilePicture from the client
    if (!email || !profilePicture) {
      return NextResponse.json({ message: "Missing email or profile picture URL" });
    }

    const updatedUserImage = await updateUserImage(email, profilePicture);

    if (!updatedUserImage) {
      return NextResponse.json({ message: "User not found" });
    }

    return NextResponse.json({
      message: "Profile picture updated successfully",
      profilePicture: updatedUserImage,
    });
  } catch (error) {
    console.error("Error updating profile picture:", error);
    return NextResponse.json({ message: "Internal server error" });
  }
}
