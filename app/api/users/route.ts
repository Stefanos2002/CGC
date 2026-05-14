export const dynamic = 'force-dynamic';
import { addUser } from "@/app/User Collection/connection";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { username, email, password } = await req.json();
    const result = await addUser({
      username,
      email,
      password,
    });
    return NextResponse.json({
      message:
        "User added successfully, please check your email for verification.",
      result,
    });
  } catch (error) {
    console.error("Failed to add user:", error);
    return NextResponse.json("Failed to add user", { status: 400 });
  }
}
