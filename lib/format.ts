/** 円を万円表示に変換。例: 700000 → "70万円/月" */
export function formatRate(yen: number | null | undefined): string | null {
  if (!yen) return null
  const man = yen / 10000
  const str = Number.isInteger(man) ? man.toString() : man.toFixed(1).replace(/\.0$/, '')
  return `${str}万円/月`
}

/** 円→万円範囲表示。例: 600000, 700000 → "60〜70万円/月" */
export function formatRateRange(min: number | null | undefined, max: number | null | undefined): string | null {
  if (!min && !max) return null
  const fmt = (v: number | null | undefined) => v ? (v / 10000).toFixed(1).replace(/\.0$/, '') : '?'
  return `${fmt(min)}〜${fmt(max)}万円/月`
}
