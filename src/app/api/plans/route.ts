import { NextRequest, NextResponse } from "next/server";
import { PLANS, resolvePlan } from "@/lib/pricing";

// GET: プラン一覧 or 泊数に応じたプラン判定
export async function GET(req: NextRequest) {
  const nights = req.nextUrl.searchParams.get("nights");

  if (nights) {
    const result = resolvePlan(Number(nights));
    return NextResponse.json(result);
  }

  return NextResponse.json(PLANS);
}
