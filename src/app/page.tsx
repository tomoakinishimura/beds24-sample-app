"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Dashboard() {
  const [auth, setAuth] = useState<{ authenticated: boolean } | null>(null);
  const [bookings, setBookings] = useState<unknown[] | null>(null);
  const [properties, setProperties] = useState<unknown[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth")
      .then((r) => r.json())
      .then(setAuth)
      .catch(() => setAuth({ authenticated: false }));
  }, []);

  useEffect(() => {
    if (!auth?.authenticated) return;

    fetch("/api/bookings")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setBookings(data);
        else setBookings([]);
      })
      .catch((e) => setError(e.message));

    fetch("/api/properties")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setProperties(data);
        else setProperties([]);
      })
      .catch((e) => setError(e.message));
  }, [auth]);

  if (auth === null) {
    return <p className="text-zinc-500">読み込み中...</p>;
  }

  if (!auth.authenticated) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-950">
        <h2 className="text-lg font-semibold text-amber-800 dark:text-amber-200">
          セットアップが必要です
        </h2>
        <p className="mt-2 text-amber-700 dark:text-amber-300">
          Beds24 APIに接続するには、まずセットアップを完了してください。
        </p>
        <Link
          href="/setup"
          className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          セットアップへ進む
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        ダッシュボード
      </h1>

      {error && (
        <p className="rounded bg-red-50 p-3 text-sm text-red-600">{error}</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500">予約数</p>
          <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            {bookings ? bookings.length : "..."}
          </p>
          <Link
            href="/bookings"
            className="mt-2 text-sm text-blue-600 hover:underline"
          >
            予約一覧を見る →
          </Link>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500">物件数</p>
          <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            {properties ? properties.length : "..."}
          </p>
          <Link
            href="/properties"
            className="mt-2 text-sm text-blue-600 hover:underline"
          >
            物件を見る →
          </Link>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500">ステータス</p>
          <p className="text-lg font-semibold text-green-600">接続済み</p>
          <Link
            href="/setup"
            className="mt-2 text-sm text-blue-600 hover:underline"
          >
            設定を確認 →
          </Link>
        </div>
      </div>

      {bookings && bookings.length > 0 && (
        <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
              最近の予約
            </h2>
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {bookings.slice(0, 5).map((b: unknown) => {
              const booking = b as Record<string, unknown>;
              return (
                <div
                  key={booking.id as number}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {(booking.firstName as string) || ""}{" "}
                      {(booking.lastName as string) || ""}
                    </p>
                    <p className="text-sm text-zinc-500">
                      {(booking.arrival as string) || ""} 〜{" "}
                      {(booking.departure as string) || ""}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      booking.status === "confirmed"
                        ? "bg-green-100 text-green-700"
                        : booking.status === "cancelled"
                          ? "bg-red-100 text-red-700"
                          : "bg-zinc-100 text-zinc-700"
                    }`}
                  >
                    {(booking.status as string) || "不明"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
