import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest) {
  try {
    // Test basic RAWG API call
    const baseUrl = process.env.NEXT_PUBLIC_BASE_POSTER_URL;
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;

    if (!baseUrl || !apiKey) {
      return NextResponse.json(
        {
          error: "Missing environment variables",
          baseUrl: !!baseUrl,
          apiKey: !!apiKey,
        },
        { status: 500 },
      );
    }

    const testUrl = `${baseUrl}?${apiKey}&page_size=5`;
    console.log("Testing RAWG API with URL:", testUrl);

    const response = await fetch(testUrl);
    const data = await response.json();

    return NextResponse.json({
      status: response.status,
      url: testUrl,
      success: response.ok,
      resultsCount: data?.results?.length || 0,
      data: data,
    });
  } catch (error) {
    console.error("Test API error:", error);
    const err = error instanceof Error ? error : new Error(String(error));
    return NextResponse.json(
      { error: "Test failed", details: err.message },
      { status: 500 },
    );
  }
}
