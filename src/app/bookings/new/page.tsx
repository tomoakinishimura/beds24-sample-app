"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

interface PropertyOption {
  id: number;
  name: string;
  roomTypes?: { id: number; name: string }[];
}

interface PlanInfo {
  plan: { id: string; name: string; pricePerExtraNight: number };
  totalNights: number;
  freeNights: number;
  paidNights: number;
  extraCharge: number;
}

export default function NewBookingPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    propertyId: "",
    roomId: "",
    arrival: "",
    departure: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    numAdult: "1",
    numChild: "0",
    notes: "",
    status: "confirmed",
  });

  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);

  useEffect(() => {
    fetch("/api/properties")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setProperties(data);
      });
  }, []);

  // 日程が変わったらプラン判定
  const nights = useMemo(() => {
    if (!form.arrival || !form.departure) return 0;
    const a = new Date(form.arrival);
    const d = new Date(form.departure);
    const diff = d.getTime() - a.getTime();
    return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
  }, [form.arrival, form.departure]);

  useEffect(() => {
    if (nights <= 0) {
      setPlanInfo(null);
      return;
    }
    fetch(`/api/plans?nights=${nights}`)
      .then((r) => r.json())
      .then(setPlanInfo)
      .catch(() => setPlanInfo(null));
  }, [nights]);

  const selectedProperty = properties.find(
    (p) => p.id === Number(form.propertyId)
  );

  const needsPaidPlan = planInfo && planInfo.paidNights > 0;

  function updateForm(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: Number(form.propertyId),
          roomId: Number(form.roomId),
          arrival: form.arrival,
          departure: form.departure,
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          numAdult: Number(form.numAdult),
          numChild: Number(form.numChild),
          notes: form.notes,
          status: form.status,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        if (data.split) {
          alert(
            `予約を分割して登録しました！\n\n` +
            `■ 無料プラン: ${data.freeNights}泊（¥0）\n` +
            `■ ${data.plan}: ${data.paidNights}泊（¥${data.extraCharge.toLocaleString()}）\n\n` +
            `同じゲスト名で2件の予約が作成されました。`
          );
        }
        router.push("/bookings");
      } else {
        setError(data.error || "予約の作成に失敗しました");
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        新規予約登録
      </h1>

      {error && (
        <p className="rounded bg-red-50 p-3 text-sm text-red-600">{error}</p>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
      >
        {/* 物件・部屋選択 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              物件 *
            </label>
            <select
              value={form.propertyId}
              onChange={(e) => {
                updateForm("propertyId", e.target.value);
                updateForm("roomId", "");
              }}
              required
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            >
              <option value="">選択してください</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              部屋タイプ *
            </label>
            <select
              value={form.roomId}
              onChange={(e) => updateForm("roomId", e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            >
              <option value="">選択してください</option>
              {selectedProperty?.roomTypes?.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 日程 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              チェックイン日 *
            </label>
            <input
              type="date"
              value={form.arrival}
              onChange={(e) => updateForm("arrival", e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              チェックアウト日 *
            </label>
            <input
              type="date"
              value={form.departure}
              onChange={(e) => updateForm("departure", e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>
        </div>

        {/* プラン表示 */}
        {nights > 0 && planInfo && (
          <div
            className={`rounded-lg border p-4 ${
              needsPaidPlan
                ? "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950"
                : "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {nights}泊 → 適用プラン:
                  <span className="ml-1 font-bold">{planInfo.plan.name}</span>
                </p>
                <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  <span className="text-green-600">{planInfo.freeNights}泊 無料</span>
                  {planInfo.paidNights > 0 && (
                    <span className="ml-2 text-amber-600">
                      + {planInfo.paidNights}泊 有料
                      (@ {planInfo.plan.pricePerExtraNight.toLocaleString()}円/泊)
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {planInfo.extraCharge === 0
                    ? "¥0"
                    : `¥${planInfo.extraCharge.toLocaleString()}`}
                </p>
                {needsPaidPlan && (
                  <p className="text-xs text-amber-600">有料プラン適用</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ゲスト情報 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              姓 *
            </label>
            <input
              type="text"
              value={form.lastName}
              onChange={(e) => updateForm("lastName", e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              名 *
            </label>
            <input
              type="text"
              value={form.firstName}
              onChange={(e) => updateForm("firstName", e.target.value)}
              required
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
              value={form.email}
              onChange={(e) => updateForm("email", e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              電話番号
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => updateForm("phone", e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>
        </div>

        {/* 人数 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              大人
            </label>
            <input
              type="number"
              value={form.numAdult}
              onChange={(e) => updateForm("numAdult", e.target.value)}
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
              value={form.numChild}
              onChange={(e) => updateForm("numChild", e.target.value)}
              min="0"
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              ステータス
            </label>
            <select
              value={form.status}
              onChange={(e) => updateForm("status", e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            >
              <option value="confirmed">確定</option>
              <option value="request">リクエスト</option>
              <option value="new">新規</option>
            </select>
          </div>
        </div>

        {/* メモ */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            メモ
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => updateForm("notes", e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading
              ? "登録中..."
              : needsPaidPlan
                ? `有料プランで予約 (¥${planInfo!.extraCharge.toLocaleString()})`
                : "予約を登録（無料）"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/bookings")}
            className="rounded-lg bg-zinc-100 px-6 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
}
