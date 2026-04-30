import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/authDbConnection/mongo/page";

export async function GET(req: NextRequest) {
  try {
    console.log("Testing direct clientPromise");
    const client = await clientPromise;
    console.log("Client obtained");

    const db = client.db();
    console.log("DB obtained");

    const collection = db.collection("games");
    console.log("Collection obtained");

    const count = await collection.countDocuments();
    console.log("Count obtained:", count);

    return NextResponse.json({
      success: true,
      totalGames: count,
    });
  } catch (error) {
    console.error("Direct test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 },
    );
  }
}
