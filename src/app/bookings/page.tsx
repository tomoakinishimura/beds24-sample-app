"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface BookingItem {
  id: number;
  propertyId?: number;
  roomId?: number;
  status?: string;
  arrival?: string;
  departure?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  numAdult?: number;
  numChild?: number;
  price?: number;
  currency?: string;
  referer?: string;
}

const statusLabels: Record<string, string> = {
  confirmed: "確定",
  request: "リクエスト",
  new: "新規",
  cancelled: "キャンセル",
  black: "ブロック",
  inquiry: "問い合わせ",
};

const statusColors: Record<string, string> = {
  confirmed: "bg-green-100 text-green-700",
  request: "bg-yellow-100 text-yellow-700",
  new: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
  black: "bg-zinc-800 text-white",
  inquiry: "bg-purple-100 text-purple-700",
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    setLoading(true);
    try {
      const params = filter ? `?${filter}` : "";
      const res = await fetch(`/api/bookings${params}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setBookings(data);
      } else {
        setError(data.error || "予約の取得に失敗しました");
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(id: number) {
    if (!confirm("この予約をキャンセルしますか？")) return;
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "cancelled" }),
      });
      if (res.ok) {
        loadBookings();
      }
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          予約一覧
        </h1>
        <Link
          href="/bookings/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          新規予約
        </Link>
      </div>

      {/* フィルター */}
      <div className="flex gap-2">
        {["", "arrivals", "departures", "new", "current"].map((f) => (
          <button
            key={f}
            onClick={() => {
              setFilter(f ? `filter=${f}` : "");
              setTimeout(loadBookings, 0);
            }}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              filter === (f ? `filter=${f}` : "")
                ? "bg-blue-600 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
            }`}
          >
            {f === ""
              ? "すべて"
              : f === "arrivals"
                ? "チェックイン"
                : f === "departures"
                  ? "チェックアウト"
                  : f === "new"
                    ? "新規"
                    : "滞在中"}
          </button>
        ))}
      </div>

      {error && (
        <p className="rounded bg-red-50 p-3 text-sm text-red-600">{error}</p>
      )}

      {loading ? (
        <p className="text-zinc-500">読み込み中...</p>
      ) : bookings.length === 0 ? (
        <p className="text-zinc-500">予約がありません</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
              <tr>
                <th className="px-4 py-3 font-medium text-zinc-600">ID</th>
                <th className="px-4 py-3 font-medium text-zinc-600">
                  ゲスト名
                </th>
                <th className="px-4 py-3 font-medium text-zinc-600">
                  チェックイン
                </th>
                <th className="px-4 py-3 font-medium text-zinc-600">
                  チェックアウト
                </th>
                <th className="px-4 py-3 font-medium text-zinc-600">
                  ステータス
                </th>
                <th className="px-4 py-3 font-medium text-zinc-600">料金</th>
                <th className="px-4 py-3 font-medium text-zinc-600">
                  経由
                </th>
                <th className="px-4 py-3 font-medium text-zinc-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900">
                  <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100">
                    {b.id}
                  </td>
                  <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100">
                    {b.firstName} {b.lastName}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {b.arrival}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {b.departure}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        statusColors[b.status || ""] || "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {statusLabels[b.status || ""] || b.status || "不明"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {b.price ? `${b.price} ${b.currency || ""}` : "-"}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {b.referer || "直接"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/bookings/${b.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        編集
                      </Link>
                      {b.status !== "cancelled" && (
                        <button
                          onClick={() => handleCancel(b.id)}
                          className="text-red-600 hover:underline"
                        >
                          取消
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
