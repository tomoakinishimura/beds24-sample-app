import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/lib/get-client";

// GET: Check availability or get offers
export async function GET(req: NextRequest) {
  try {
    const client = await getClient();
    const params: Record<string, string> = {};
    const type = req.nextUrl.searchParams.get("type") || "availability";

    for (const [key, value] of req.nextUrl.searchParams.entries()) {
      if (key !== "type") params[key] = value;
    }

    let result;
    switch (type) {
      case "offers":
        result = await client.getRoomOffers(params);
        break;
      case "calendar":
        result = await client.getCalendar(params);
        break;
      default:
        result = await client.getRoomAvailability(params);
    }

    const wrapped = result as { data?: unknown[] };
    return NextResponse.json(wrapped.data || result);
  } catch (e) {
    const msg = (e as Error).message;
    if (msg === "NOT_AUTHENTICATED") {
      return NextResponse.json({ error: "未認証" }, { status: 401 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
