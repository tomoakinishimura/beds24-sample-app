import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/lib/get-client";
import { FREE_NIGHTS, resolvePlan } from "@/lib/pricing";

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function calcNights(arrival: string, departure: string): number {
  const a = new Date(arrival);
  const d = new Date(departure);
  return Math.max(0, Math.round((d.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)));
}

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
// 5泊超の新規予約は、無料分(5泊) + 有料分(残り)に分割して同じゲストで2件作成
export async function POST(req: NextRequest) {
  try {
    const client = await getClient();
    const body = await req.json();

    // 更新の場合はそのまま
    if (body.id) {
      const result = await client.createBooking(body);
      return NextResponse.json(result);
    }

    const nights = calcNights(body.arrival, body.departure);

    // 5泊以下はそのまま1件作成
    if (nights <= FREE_NIGHTS) {
      const result = await client.createBooking(body);
      return NextResponse.json(result);
    }

    // 5泊超: 2件に分割
    const planInfo = resolvePlan(nights);
    const splitDate = addDays(body.arrival, FREE_NIGHTS); // 無料分の終了日 = 有料分の開始日

    const guestInfo = {
      roomId: body.roomId,
      propertyId: body.propertyId,
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      numAdult: body.numAdult,
      numChild: body.numChild,
      status: body.status,
    };

    // 1件目: 無料プラン（最初の5泊）
    const freeBooking = {
      ...guestInfo,
      arrival: body.arrival,
      departure: splitDate,
      notes: `[無料プラン] ${FREE_NIGHTS}泊（${nights}泊滞在の前半）`,
      price: 0,
    };

    // 2件目: 有料プラン（6泊目以降）
    const paidBooking = {
      ...guestInfo,
      arrival: splitDate,
      departure: body.departure,
      notes: `[${planInfo.plan.name}] ${planInfo.paidNights}泊 @¥${planInfo.plan.pricePerExtraNight.toLocaleString()}/泊（${nights}泊滞在の後半）`,
      price: planInfo.extraCharge,
    };

    // Beds24 APIは配列で複数予約を一括作成できる
    const result = await client.createBooking(freeBooking);
    const result2 = await client.createBooking(paidBooking);

    return NextResponse.json({
      split: true,
      totalNights: nights,
      freeNights: FREE_NIGHTS,
      paidNights: planInfo.paidNights,
      extraCharge: planInfo.extraCharge,
      plan: planInfo.plan.name,
      freeBooking: result,
      paidBooking: result2,
    });
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
