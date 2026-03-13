import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/lib/get-client";

export async function GET(req: NextRequest) {
  try {
    const client = await getClient();
    const params: Record<string, string> = {};

    for (const [key, value] of req.nextUrl.searchParams.entries()) {
      params[key] = value;
    }

    if (!params.includeAllRooms) {
      params.includeAllRooms = "true";
    }

    const result = await client.getProperties(params) as { data?: unknown[] };
    return NextResponse.json(result.data || result);
  } catch (e) {
    const msg = (e as Error).message;
    if (msg === "NOT_AUTHENTICATED") {
      return NextResponse.json({ error: "未認証" }, { status: 401 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
