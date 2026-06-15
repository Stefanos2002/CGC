// pages/api/users/[userid].ts
import { deleteUserById } from "@/app/User Collection/connection";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest, { params }: { params: { userid: string } }) {
  const userid = params.userid;

  try {
    // Find the user by ID and delete them
    const deletedUser = await deleteUserById(userid);

    if (!deletedUser) {
      return NextResponse.json({ success: false, message: "User not found" });
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete user:", error);
    return NextResponse.json({ success: false, message: "Failed to delete user" });
  }
}
