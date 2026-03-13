import { NextRequest, NextResponse } from "next/server";
import { Beds24Client } from "@/lib/beds24-client";
import {
  setStoredTokens,
  getStoredTokens,
  clearStoredTokens,
} from "@/lib/token-store";

// POST: Setup with invite code or direct token
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.inviteCode) {
      const result = await Beds24Client.setup(body.inviteCode);
      setStoredTokens({
        token: result.token,
        refreshToken: result.refreshToken!,
        tokenExpiresAt: Date.now() + 23 * 60 * 60 * 1000,
      });
      return NextResponse.json({ success: true, message: "認証成功" });
    }

    if (body.token && body.refreshToken) {
      setStoredTokens({
        token: body.token,
        refreshToken: body.refreshToken,
        tokenExpiresAt: Date.now() + 23 * 60 * 60 * 1000,
      });
      return NextResponse.json({ success: true, message: "トークン設定完了" });
    }

    return NextResponse.json(
      { error: "inviteCode または token/refreshToken が必要です" },
      { status: 400 }
    );
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 }
    );
  }
}

// GET: Check auth status
export async function GET() {
  const tokens = getStoredTokens();
  if (!tokens) {
    return NextResponse.json({ authenticated: false });
  }

  try {
    const details = await Beds24Client.getTokenDetails(tokens.token);
    return NextResponse.json({ authenticated: true, details });
  } catch {
    return NextResponse.json({ authenticated: true, tokenExpired: true });
  }
}

// DELETE: Logout
export async function DELETE() {
  clearStoredTokens();
  return NextResponse.json({ success: true });
}
