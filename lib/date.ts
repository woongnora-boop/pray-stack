const SEOUL_TZ = 'Asia/Seoul';

/**
 * timestamptz ISO 문자열을 서울 달력 기준 `YYYY-MM-DD`로 (앱 여정·만나 집계와 동일한 “하루” 기준).
 */
export function seoulYmdFromIso(iso: string): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return '';
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: SEOUL_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(t));
}

/** 서버·클라 공통: 지금 시각을 서울 달력 `YYYY-MM-DD`로 (만나 `entry_date` 기본값 등). */
export function seoulYmdNow(): string {
  return seoulYmdFromIso(new Date().toISOString());
}

/**
 * DB·API에서 온 날짜/시각 문자열을 `<input type="date">`용 `YYYY-MM-DD`로만 맞춤.
 * 잘못된 값이면 빈 문자열 (브라우저가 이전 값을 깨뜨리지 않게).
 */
export function toDateInputValue(value: string | null | undefined): string {
  if (value == null || typeof value !== 'string') return '';
  const s = value.trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return '';
  return s;
}

/**
 * 기록 날짜 필드를 UI·API 응답에 쓸 `YYYY-MM-DD`로 통일합니다.
 * - 일반적인 SQL `date` / `YYYY-MM-DD` 문자열은 그대로 사용
 * - PostgREST 등에서 전체 ISO가 온 경우 서울 달력 날짜로 맞춰 여정(서울 기준)과 표시를 일치시킵니다.
 */
export function displayYmdFromDb(value: string | null | undefined): string {
  const direct = toDateInputValue(value);
  if (direct) return direct;
  const raw = String(value ?? '').trim();
  if (raw.includes('T')) {
    const y = seoulYmdFromIso(raw);
    if (y) return y;
  }
  return '';
}

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
