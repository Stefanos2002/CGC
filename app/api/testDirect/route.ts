import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/authDbConnection/mongo/page";

export async function GET(_req: NextRequest) {
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
    const err = error instanceof Error ? error : new Error(String(error));
    return NextResponse.json(
      {
        success: false,
        error: err.message,
        stack: err.stack,
      },
      { status: 500 },
    );
  }
}
