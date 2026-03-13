export const FREE_NIGHTS = 5;

export const PLANS = [
  { id: "free", name: "無料プラン", maxNights: 5, pricePerExtraNight: 0 },
  { id: "standard", name: "スタンダード", maxNights: 14, pricePerExtraNight: 3000 },
  { id: "long_stay", name: "長期滞在", maxNights: 30, pricePerExtraNight: 2500 },
] as const;

export type PlanId = (typeof PLANS)[number]["id"];

/**
 * 泊数からプランと料金を判定
 */
export function resolvePlan(totalNights: number) {
  if (totalNights <= FREE_NIGHTS) {
    return {
      plan: PLANS[0],
      totalNights,
      freeNights: totalNights,
      paidNights: 0,
      extraCharge: 0,
    };
  }

  const paidNights = totalNights - FREE_NIGHTS;
  // 泊数に収まる最小プラン
  const plan = PLANS.find((p) => p.id !== "free" && p.maxNights >= totalNights) || PLANS[2];

  return {
    plan,
    totalNights,
    freeNights: FREE_NIGHTS,
    paidNights,
    extraCharge: paidNights * plan.pricePerExtraNight,
  };
}
