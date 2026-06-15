// /app/api/users/verify.ts
export const dynamic = 'force-dynamic';
import { verifyUserEmail } from "@/app/User Collection/connection";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

// API Route to verify user email
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token || typeof token !== "string") {
    return NextResponse.json({ message: "Token is required" }, { status: 400 });
  }
  try {
    const { status, message, user } = await verifyUserEmail(token);
    if (status === 200 && user) {
      const newToken = generateToken();
      const baseUrl = `${req.nextUrl.protocol}//${req.nextUrl.host}`;
      const redirectUrl = new URL(`/Verified?token=${newToken}`, baseUrl).toString();
      return NextResponse.redirect(redirectUrl);
    } else {
      return NextResponse.json({ message }, { status: status ?? 400 });
    }
  } catch (error) {
    console.error("Error verifying email:", error);
    return NextResponse.json({ message: "Error verifying the email" }, { status: 500 });
  }
}
