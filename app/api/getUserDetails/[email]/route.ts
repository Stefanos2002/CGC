import clientPromise from "@/authDbConnection/mongo/page";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { email: string } }) {
  const { email } = params;
  try {
    const client = await clientPromise;
    const db = client.db("connectdb");
    const userCollection = db.collection("users");

    const existingUser = await userCollection.findOne(
      { email },
      { projection: { password: 0, verificationToken: 0 } }
    );
    if (!existingUser) {
      return NextResponse.json("User not found", { status: 404 });
    }
    return NextResponse.json(existingUser);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
