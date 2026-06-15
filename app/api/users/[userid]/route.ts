import { findUserById, updateUserById } from "@/app/User Collection/connection";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function GET(
  req: NextRequest,
  { params }: { params: { userid: string } }
) {
  const userid = params.userid;
  try {
    const result = await findUserById(userid);
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    return NextResponse.json({ success: false, message: "No data found" });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { userid: string } }
) {
  const userid = params.userid;
  const { username, email, password } = await req.json();
  try {
    // Fetch the current user data
    const currentUser = await findUserById(userid);

    // Prepare the updated fields
    const updatedFields: any = {
      username: username || currentUser?.username, // Default to current username if not provided
    };

    // Only update password if it's provided and non-empty
    if (password && password.trim()) {
      updatedFields.password = await bcrypt.hash(password, 10);
    }

    // Update user in the database
    const result = await updateUserById(userid, updatedFields);

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    return NextResponse.json({ success: false, message: "No data found" });
  }
}
