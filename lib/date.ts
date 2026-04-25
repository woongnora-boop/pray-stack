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

/** 밀리초 타임스탬프 → 서울 달력 `YYYY-MM-DD`. */
export function seoulYmdFromTimestamp(ms: number): string {
  if (!Number.isFinite(ms)) return '';
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: SEOUL_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(ms));
}

/**
 * 서울 달력 기준 `ymd`의 요일 (0=일 … 6=토).
 * `ymd`는 `YYYY-MM-DD`로 정규화된 값이어야 합니다.
 */
export function seoulDayOfWeekFromYmd(ymd: string): number {
  const direct = toDateInputValue(ymd);
  if (!direct) return 0;
  const d = new Date(`${direct}T12:00:00+09:00`);
  if (Number.isNaN(d.getTime())) return 0;
  const short = new Intl.DateTimeFormat('en-US', { timeZone: SEOUL_TZ, weekday: 'short' }).format(d);
  const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return map[short] ?? 0;
}

/** 서울 달력 기준으로 `deltaDays`만큼 이동한 `YYYY-MM-DD`. */
export function seoulAddDays(ymd: string, deltaDays: number): string {
  const direct = toDateInputValue(ymd);
  if (!direct) return '';
  const ms = new Date(`${direct}T12:00:00+09:00`).getTime() + deltaDays * 86400000;
  return seoulYmdFromTimestamp(ms);
}

/** 월요일 시작 주의 월요일 `YYYY-MM-DD`. */
export function seoulStartOfWeekMonday(ymd: string): string {
  const dow = seoulDayOfWeekFromYmd(ymd);
  const daysFromMonday = (dow + 6) % 7;
  return seoulAddDays(ymd, -daysFromMonday);
}

export function seoulEndOfWeekSunday(ymd: string): string {
  return seoulAddDays(seoulStartOfWeekMonday(ymd), 6);
}

export function seoulStartOfMonth(ymd: string): string {
  const direct = toDateInputValue(ymd);
  if (!direct) return '';
  return `${direct.slice(0, 7)}-01`;
}

function seoulValidYmd(ymd: string): boolean {
  const ms = new Date(`${ymd}T12:00:00+09:00`).getTime();
  if (Number.isNaN(ms)) return false;
  return seoulYmdFromTimestamp(ms) === ymd;
}

export function seoulEndOfMonth(ymd: string): string {
  const start = seoulStartOfMonth(ymd);
  for (let d = 31; d >= 28; d--) {
    const candidate = `${start.slice(0, 8)}${String(d).padStart(2, '0')}`;
    if (seoulValidYmd(candidate)) return candidate;
  }
  return start;
}

/** 예: `4/21 – 4/27` (서울 달력). */
export function formatSeoulWeekRangeLabel(startYmd: string, endYmd: string): string {
  const fmt = (s: string): string => {
    const d = toDateInputValue(s);
    if (!d) return '';
    const m = parseInt(d.slice(5, 7), 10);
    const day = parseInt(d.slice(8, 10), 10);
    return `${m}/${day}`;
  };
  return `${fmt(startYmd)} – ${fmt(endYmd)}`;
}

/** 예: `2026년 4월` */
export function formatSeoulMonthHeading(ymd: string): string {
  const s = seoulStartOfMonth(ymd);
  const d = toDateInputValue(s);
  if (!d) return '';
  const y = parseInt(d.slice(0, 4), 10);
  const m = parseInt(d.slice(5, 7), 10);
  return `${y}년 ${m}월`;
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
