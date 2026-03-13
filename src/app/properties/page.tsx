"use client";

import { useEffect, useState } from "react";

interface Room {
  id: number;
  name: string;
  qty?: number;
  maxPeople?: number;
}

interface Property {
  id: number;
  name: string;
  address?: string;
  city?: string;
  country?: string;
  currency?: string;
  roomTypes?: Room[];
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [availability, setAvailability] = useState<Record<string, unknown>[]>(
    []
  );

  useEffect(() => {
    fetch("/api/properties")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setProperties(data);
        else setError(data.error || "物件の取得に失敗しました");
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function checkAvailability(roomId: number) {
    const today = new Date().toISOString().split("T")[0];
    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    try {
      const res = await fetch(
        `/api/inventory?type=calendar&roomId=${roomId}&startDate=${today}&endDate=${nextMonth}`
      );
      const data = await res.json();
      if (Array.isArray(data)) setAvailability(data);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  if (loading) return <p className="text-zinc-500">読み込み中...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        物件管理
      </h1>

      {error && (
        <p className="rounded bg-red-50 p-3 text-sm text-red-600">{error}</p>
      )}

      {properties.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-500">
            物件が登録されていません。Beds24コントロールパネルで物件を作成してください。
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {properties.map((p) => (
            <div
              key={p.id}
              className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div
                className="flex cursor-pointer items-center justify-between px-4 py-4"
                onClick={() =>
                  setExpanded(expanded === p.id ? null : p.id)
                }
              >
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {p.name}
                  </h3>
                  <p className="text-sm text-zinc-500">
                    {[p.city, p.country].filter(Boolean).join(", ") || "住所未設定"}
                    {p.currency && ` (${p.currency})`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded bg-zinc-100 px-2 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    {p.roomTypes?.length || 0} 部屋タイプ
                  </span>
                  <span className="text-zinc-400">
                    {expanded === p.id ? "▲" : "▼"}
                  </span>
                </div>
              </div>

              {expanded === p.id && p.roomTypes && (
                <div className="border-t border-zinc-200 px-4 py-4 dark:border-zinc-800">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-zinc-500">
                        <th className="pb-2 font-medium">部屋タイプ</th>
                        <th className="pb-2 font-medium">ID</th>
                        <th className="pb-2 font-medium">数量</th>
                        <th className="pb-2 font-medium">最大人数</th>
                        <th className="pb-2 font-medium">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {p.roomTypes.map((r) => (
                        <tr key={r.id}>
                          <td className="py-2 text-zinc-900 dark:text-zinc-100">
                            {r.name}
                          </td>
                          <td className="py-2 text-zinc-500">{r.id}</td>
                          <td className="py-2 text-zinc-500">{r.qty || "-"}</td>
                          <td className="py-2 text-zinc-500">
                            {r.maxPeople || "-"}
                          </td>
                          <td className="py-2">
                            <button
                              onClick={() => checkAvailability(r.id)}
                              className="text-blue-600 hover:underline"
                            >
                              空室確認
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {availability.length > 0 && (
                    <div className="mt-4">
                      <h4 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        カレンダー（直近30日）
                      </h4>
                      <div className="grid grid-cols-7 gap-1 text-center text-xs">
                        {availability.map((day, i) => (
                          <div
                            key={i}
                            className={`rounded p-1 ${
                              (day.avail as number) > 0
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            <div>{(day.date as string)?.slice(5)}</div>
                            <div className="font-medium">
                              {(day.avail as number) > 0 ? "○" : "×"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
