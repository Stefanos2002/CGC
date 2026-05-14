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
    return NextResponse.json({ message: "Token is required" });
  }
  try {
    const { status, message, user } = await verifyUserEmail(token);
    if (status && user) {
      const newToken = generateToken();
      // Get the base URL from the incoming request
      const baseUrl = `${req.nextUrl.protocol}//${req.nextUrl.host}`;
      // Construct a full URL for the redirect
      const redirectUrl = new URL(
        `/Verified?token=${newToken}`,
        baseUrl
      ).toString();
      // If verification is successful, redirect to the Verified page
      return NextResponse.redirect(redirectUrl);
    } else {
      // If verification fails, return the failure message
      return NextResponse.json({ message });
    }
  } catch (error) {
    console.error("Error verifying email:", error);
    return NextResponse.json({ message: "Error verifying the email" });
  }
}
