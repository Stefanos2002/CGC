// /app/api/users/login.ts
export const dynamic = 'force-dynamic';
import { findUserByEmail } from "@/app/User Collection/connection";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    const user = await findUserByEmail(email);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const { password, verificationToken, ...safeData } = user;
    return NextResponse.json({ data: safeData });
  } catch (error) {
    console.error("Error verifying user:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
