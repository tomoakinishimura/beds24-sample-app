"use client";

import { useState, useEffect } from "react";

export default function SetupPage() {
  const [mode, setMode] = useState<"invite" | "token">("invite");
  const [inviteCode, setInviteCode] = useState("");
  const [token, setToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [status, setStatus] = useState("");
  const [authInfo, setAuthInfo] = useState<{
    authenticated: boolean;
    details?: Record<string, unknown>;
    tokenExpired?: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const res = await fetch("/api/auth");
    const data = await res.json();
    setAuthInfo(data);
  }

  async function handleSetup() {
    setLoading(true);
    setStatus("");
    try {
      const body =
        mode === "invite"
          ? { inviteCode }
          : { token, refreshToken };

      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.success) {
        setStatus("認証成功！ダッシュボードに移動できます。");
        checkAuth();
      } else {
        setStatus(`エラー: ${data.error}`);
      }
    } catch (e) {
      setStatus(`エラー: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    setAuthInfo(null);
    setStatus("ログアウトしました");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Beds24 API セットアップ
      </h1>

      {/* 手順ガイド */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-950">
        <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
          セットアップ手順
        </h2>
        <ol className="mt-3 list-inside list-decimal space-y-2 text-sm text-blue-700 dark:text-blue-300">
          <li>
            <a
              href="https://beds24.com/join.html"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Beds24に無料登録
            </a>
            （クレカ不要）
          </li>
          <li>
            テスト用プロパティ（物件）を作成し、部屋タイプと料金を設定
          </li>
          <li>
            コントロールパネル → Settings → Account → API →
            「招待コード」を生成
            <br />
            <span className="text-xs">
              スコープ: all:bookings, all:inventory, all:properties を選択
            </span>
          </li>
          <li>下記に招待コードを入力して認証</li>
        </ol>
      </div>

      {/* 現在のステータス */}
      {authInfo?.authenticated && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
          <div className="flex items-center justify-between">
            <p className="font-medium text-green-700 dark:text-green-300">
              API接続済み
            </p>
            <button
              onClick={handleLogout}
              className="rounded bg-red-100 px-3 py-1 text-sm text-red-600 hover:bg-red-200"
            >
              切断
            </button>
          </div>
          {authInfo.details && (
            <pre className="mt-2 overflow-auto rounded bg-white p-2 text-xs dark:bg-zinc-900">
              {JSON.stringify(authInfo.details, null, 2)}
            </pre>
          )}
        </div>
      )}

      {/* 認証フォーム */}
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-4 flex gap-4">
          <button
            onClick={() => setMode("invite")}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              mode === "invite"
                ? "bg-blue-600 text-white"
                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
            }`}
          >
            招待コードで認証
          </button>
          <button
            onClick={() => setMode("token")}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              mode === "token"
                ? "bg-blue-600 text-white"
                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
            }`}
          >
            トークンを直接入力
          </button>
        </div>

        {mode === "invite" ? (
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              招待コード
            </label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Beds24で生成した招待コードを入力"
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                アクセストークン
              </label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="アクセストークン"
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                リフレッシュトークン
              </label>
              <input
                type="text"
                value={refreshToken}
                onChange={(e) => setRefreshToken(e.target.value)}
                placeholder="リフレッシュトークン"
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>
          </div>
        )}

        <button
          onClick={handleSetup}
          disabled={loading}
          className="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "接続中..." : "接続する"}
        </button>

        {status && (
          <p
            className={`mt-3 text-sm ${status.includes("エラー") ? "text-red-600" : "text-green-600"}`}
          >
            {status}
          </p>
        )}
      </div>

      {/* OTAテスト情報 */}
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          OTA連携テストについて
        </h2>
        <div className="mt-3 space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
          <p>
            Beds24はBooking.com、Agoda、Expedia、Airbnbなどと連携可能です。
            テスト時の注意点：
          </p>
          <ul className="list-inside list-disc space-y-1">
            <li>
              Beds24にサンドボックス環境はないため、テスト用プロパティを作成して使用
            </li>
            <li>
              テスト中はOTAチャネルを接続しないことで、実際の予約が入るのを防止
            </li>
            <li>
              OTA連携はBeds24のコントロールパネルで設定（API経由では不可）
            </li>
            <li>
              Booking.comにはテスト環境（supply-xml.booking.com）がありますが、Beds24側での対応が必要
            </li>
            <li>
              APIで作成した予約は接続中のOTAには送信されません（内部予約として扱われる）
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
