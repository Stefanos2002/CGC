import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const uri = process.env.MONGODB_URI;
  const hasUri = !!uri;
  const uriLength = uri ? uri.length : 0;

  return NextResponse.json({
    hasMongodbUri: hasUri,
    uriLength: uriLength,
    uriStartsWith: hasUri ? uri.substring(0, 20) + "..." : null,
  });
}
