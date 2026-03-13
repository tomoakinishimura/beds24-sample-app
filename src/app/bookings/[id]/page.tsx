"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

interface BookingDetail {
  id: number;
  propertyId?: number;
  roomId?: number;
  status?: string;
  arrival?: string;
  departure?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  numAdult?: number;
  numChild?: number;
  notes?: string;
  price?: number;
  currency?: string;
  referer?: string;
}

export default function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch(`/api/bookings?id=${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setBooking(data[0]);
        } else {
          setError("予約が見つかりません");
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  function updateField(field: string, value: string | number) {
    setBooking((prev) => (prev ? { ...prev, [field]: value } : null));
  }

  async function handleSave() {
    if (!booking) return;
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(booking),
      });

      if (res.ok) {
        setSuccess("予約を更新しました");
      } else {
        const data = await res.json();
        setError(data.error || "更新に失敗しました");
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-zinc-500">読み込み中...</p>;
  if (!booking) return <p className="text-red-500">{error || "予約が見つかりません"}</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          予約 #{booking.id}
        </h1>
        <button
          onClick={() => router.push("/bookings")}
          className="text-sm text-blue-600 hover:underline"
        >
          ← 一覧に戻る
        </button>
      </div>

      {error && (
        <p className="rounded bg-red-50 p-3 text-sm text-red-600">{error}</p>
      )}
      {success && (
        <p className="rounded bg-green-50 p-3 text-sm text-green-600">
          {success}
        </p>
      )}

      <div className="space-y-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        {/* ステータス */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            ステータス
          </label>
          <select
            value={booking.status || ""}
            onChange={(e) => updateField("status", e.target.value)}
            className="mt-1 w-full max-w-xs rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          >
            <option value="confirmed">確定</option>
            <option value="request">リクエスト</option>
            <option value="new">新規</option>
            <option value="cancelled">キャンセル</option>
            <option value="inquiry">問い合わせ</option>
          </select>
        </div>

        {/* 日程 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              チェックイン日
            </label>
            <input
              type="date"
              value={booking.arrival || ""}
              onChange={(e) => updateField("arrival", e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              チェックアウト日
            </label>
            <input
              type="date"
              value={booking.departure || ""}
              onChange={(e) => updateField("departure", e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>
        </div>

        {/* ゲスト情報 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              姓
            </label>
            <input
              type="text"
              value={booking.lastName || ""}
              onChange={(e) => updateField("lastName", e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              名
            </label>
            <input
              type="text"
              value={booking.firstName || ""}
              onChange={(e) => updateField("firstName", e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              メールアドレス
            </label>
            <input
              type="email"
              value={booking.email || ""}
              onChange={(e) => updateField("email", e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              電話番号
            </label>
            <input
              type="text"
              value={booking.phone || ""}
              onChange={(e) => updateField("phone", e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>
        </div>

        {/* 人数 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              大人
            </label>
            <input
              type="number"
              value={booking.numAdult || 1}
              onChange={(e) => updateField("numAdult", Number(e.target.value))}
              min="1"
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              子供
            </label>
            <input
              type="number"
              value={booking.numChild || 0}
              onChange={(e) => updateField("numChild", Number(e.target.value))}
              min="0"
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>
        </div>

        {/* メモ */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            メモ
          </label>
          <textarea
            value={booking.notes || ""}
            onChange={(e) => updateField("notes", e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          />
        </div>

        {/* 情報表示 */}
        {booking.referer && (
          <p className="text-sm text-zinc-500">
            予約経由: {booking.referer}
          </p>
        )}
        {booking.price !== undefined && (
          <p className="text-sm text-zinc-500">
            料金: {booking.price} {booking.currency || ""}
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "保存中..." : "変更を保存"}
          </button>
        </div>
      </div>
    </div>
  );
}
