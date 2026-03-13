import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/lib/get-client";

// GET: List bookings
export async function GET(req: NextRequest) {
  try {
    const client = await getClient();
    const params: Record<string, string> = {};

    const url = req.nextUrl;
    for (const [key, value] of url.searchParams.entries()) {
      params[key] = value;
    }

    const result = await client.getBookings(
      Object.keys(params).length > 0 ? params : undefined
    ) as { data?: unknown[] };
    return NextResponse.json(result.data || result);
  } catch (e) {
    const msg = (e as Error).message;
    if (msg === "NOT_AUTHENTICATED") {
      return NextResponse.json({ error: "未認証" }, { status: 401 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST: Create or update booking
export async function POST(req: NextRequest) {
  try {
    const client = await getClient();
    const body = await req.json();
    const result = await client.createBooking(body);
    return NextResponse.json(result);
  } catch (e) {
    const msg = (e as Error).message;
    if (msg === "NOT_AUTHENTICATED") {
      return NextResponse.json({ error: "未認証" }, { status: 401 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE: Delete booking
export async function DELETE(req: NextRequest) {
  try {
    const client = await getClient();
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "予約IDが必要です" },
        { status: 400 }
      );
    }
    const result = await client.deleteBooking(id);
    return NextResponse.json(result);
  } catch (e) {
    const msg = (e as Error).message;
    if (msg === "NOT_AUTHENTICATED") {
      return NextResponse.json({ error: "未認証" }, { status: 401 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
