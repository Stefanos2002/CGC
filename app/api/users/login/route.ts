// /app/api/users/login.ts
export const dynamic = 'force-dynamic';
import { findUserByEmail } from "@/app/User Collection/connection";
import { signIn } from "next-auth/react";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Parse the request body to get email and password
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    // Call the logUser function to verify the user
    const data = await findUserByEmail(email);

    // Return the appropriate status and message
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error verifying user:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
