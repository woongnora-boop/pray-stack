/** 마이 페이지 달력: 서울 기준 `YYYY-MM` (URL `month` 쿼리) */

function seoulYmd(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

export function seoulYmToday(): string {
  return seoulYmd(new Date()).slice(0, 7);
}

/** `month` 쿼리 파싱. 형식이 잘못되면 이번 달(서울) */
export function parseJourneyMonthParam(raw: string | undefined): { year: number; month: number } {
  const cur = seoulYmToday();
  if (!raw || !/^\d{4}-\d{2}$/.test(raw)) {
    const [y, m] = cur.split('-').map(Number);
    return { year: y, month: m };
  }
  const [ys, ms] = raw.split('-');
  const year = Number(ys);
  const month = Number(ms);
  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    const [y, m] = cur.split('-').map(Number);
    return { year: y, month: m };
  }
  return { year, month };
}

export function journeyMyQueryString(weekOffset: number, monthYm: string): string {
  const p = new URLSearchParams();
  p.set('month', monthYm);
  if (weekOffset !== 0) p.set('week', String(weekOffset));
  return p.toString();
}
