/**
 * 브라우저/Node 로컬 타임존 기준 오늘 날짜 (YYYY-MM-DD).
 * `<input type="date">` 값으로 사용합니다.
 */
export function getTodayLocalDateString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
