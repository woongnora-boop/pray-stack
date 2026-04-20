export const JOURNEY_MIN_WEEK_OFFSET = -104;

/** URL `week` 쿼리: 0=이번 주(서울), -1=지난주 … 미래 주는 0으로 맞춤 */
export function parseJourneyWeekOffset(raw: string | string[] | undefined): number {
  const s = Array.isArray(raw) ? raw[0] : raw;
  if (s === undefined || s === '') return 0;
  const n = Number.parseInt(s, 10);
  if (!Number.isFinite(n)) return 0;
  return Math.max(JOURNEY_MIN_WEEK_OFFSET, Math.min(0, n));
}
