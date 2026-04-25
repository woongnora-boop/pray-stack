'use server';

import { JOURNEY_MIN_WEEK_OFFSET } from '@/lib/journey-week';
import { displayYmdFromDb, seoulYmdFromIso } from '@/lib/date';
import { getServerAuth } from '@/lib/supabase/request-session';

const SEOUL = 'Asia/Seoul';

function seoulYmd(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: SEOUL,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

function parseYmdToDate(ymd: string): Date {
  return new Date(`${ymd}T12:00:00+09:00`);
}

function addDaysYmd(ymd: string, deltaDays: number): string {
  const t = parseYmdToDate(ymd).getTime() + deltaDays * 86_400_000;
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: SEOUL,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(t));
}

const SHORT_TO_MON0: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

function weekdayMon0FromYmd(ymd: string): number {
  const short = parseYmdToDate(ymd).toLocaleDateString('en-US', {
    timeZone: SEOUL,
    weekday: 'short',
  });
  return SHORT_TO_MON0[short] ?? 0;
}

function mondayOfSeoulWeekContaining(ymd: string): string {
  return addDaysYmd(ymd, -weekdayMon0FromYmd(ymd));
}

/** 서울 달력상 `fromYmd`~`toYmd` 하루 범위를 UTC ISO로 바꿔 `created_at` 비교에 사용 */
function seoulYmdRangeUtcIsoBounds(fromYmd: string, toYmd: string): { startIso: string; endIso: string } {
  const startIso = new Date(`${fromYmd}T00:00:00+09:00`).toISOString();
  const endIso = new Date(`${toYmd}T23:59:59.999+09:00`).toISOString();
  return { startIso, endIso };
}

/** DB에서 온 date / timestamptz 문자열을 `YYYY-MM-DD`로 맞춤 (버킷 키 일치) */
function normalizeYmd(value: string | null | undefined): string | null {
  if (!value || typeof value !== 'string') return null;
  const s = value.trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  return s;
}

/** `meditation_days` + `meditation_items(count)` 조회 행에서 항목 수 (같은 날 여러 블록 집계용) */
function meditationItemCountFromDayRow(row: unknown): number {
  if (!row || typeof row !== 'object') return 0;
  const mi = (row as { meditation_items?: unknown }).meditation_items;
  if (Array.isArray(mi) && mi[0] != null && typeof mi[0] === 'object' && 'count' in mi[0]) {
    const c = (mi[0] as { count: number | string }).count;
    const n = typeof c === 'number' ? c : Number(c);
    return Number.isFinite(n) ? n : 0;
  }
  if (mi && typeof mi === 'object' && !Array.isArray(mi) && 'count' in (mi as object)) {
    const n = Number((mi as { count: number | string }).count);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

/** `manna.ts`와 동일 — `entry_date` 컬럼 부재 시 만나 주간 집계가 비는 문제 방지 */
function isMissingEntryDateColumnError(error: { message?: string; code?: string } | null): boolean {
  if (!error) return false;
  const msg = (error.message ?? '').toLowerCase();
  if (msg.includes('entry_date') && (msg.includes('does not exist') || msg.includes('could not find'))) return true;
  if (msg.includes('entry_date') && msg.includes('schema cache')) return true;
  if (error.code === '42703') return true;
  return false;
}

type MannaJourneyRow = { id: string; entry_date?: string | null; created_at: string };

/**
 * 만나 1건이 속한 서울 달력 `YYYY-MM-DD`.
 * `manna.ts`의 `entryDateFromRow`와 동일한 기준: `entry_date` 우선, 없으면 `created_at`은 서울 날짜(UTC 앞 10자 금지).
 */
function mannaYmd(row: MannaJourneyRow): string {
  const fromEntry = displayYmdFromDb(row.entry_date ?? undefined);
  if (fromEntry) return fromEntry;
  return seoulYmdFromIso(row.created_at) || normalizeYmd(row.created_at) || row.created_at.slice(0, 10);
}

/**
 * 만나 행: (1) entry_date가 [fromYmd,toYmd] 안 (2) entry_date null + created_at이 그 서울 일 범위(UTC) 안
 * entry_date 컬럼이 없으면 created_at만으로 동일 구간을 가져옵니다.
 */
async function fetchMannaRowsForJourneyYmdRange(
  supabase: Awaited<ReturnType<typeof getServerAuth>>['supabase'],
  userId: string,
  fromYmd: string,
  toYmd: string,
): Promise<MannaJourneyRow[]> {
  const { startIso, endIso } = seoulYmdRangeUtcIsoBounds(fromYmd, toYmd);

  const main = await supabase
    .from('manna_entries')
    .select('id, entry_date, created_at')
    .eq('user_id', userId)
    .gte('entry_date', fromYmd)
    .lte('entry_date', toYmd);

  if (!main.error && main.data) {
    const byId = new Map<string, MannaJourneyRow>();
    for (const raw of main.data) {
      const r = raw as MannaJourneyRow;
      if (r.id) byId.set(r.id, r);
    }
    const orphan = await supabase
      .from('manna_entries')
      .select('id, entry_date, created_at')
      .eq('user_id', userId)
      .is('entry_date', null)
      .gte('created_at', startIso)
      .lte('created_at', endIso);
    if (!orphan.error && orphan.data) {
      for (const raw of orphan.data) {
        const r = raw as MannaJourneyRow;
        if (r.id && !byId.has(r.id)) byId.set(r.id, r);
      }
    }
    return [...byId.values()];
  }

  if (main.error && isMissingEntryDateColumnError(main.error)) {
    const fb = await supabase
      .from('manna_entries')
      .select('id, created_at')
      .eq('user_id', userId)
      .gte('created_at', startIso)
      .lte('created_at', endIso);
    if (fb.error || !fb.data) return [];
    return (fb.data as { id: string; created_at: string }[]).map((r) => ({
      id: r.id,
      entry_date: undefined,
      created_at: r.created_at,
    }));
  }

  return [];
}

const WEEKDAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'] as const;

function weekRangeLabelKo(monday: string, sunday: string): string {
  const f = (ymd: string) =>
    new Intl.DateTimeFormat('ko-KR', {
      timeZone: SEOUL,
      month: 'numeric',
      day: 'numeric',
    }).format(parseYmdToDate(ymd));
  return `${f(monday)} – ${f(sunday)}`;
}

export interface JourneyDayBucket {
  ymd: string;
  label: (typeof WEEKDAY_LABELS)[number];
  /** 묵상(항목 수)·만나·감사 합계 */
  count: number;
  meditationCount: number;
  mannaCount: number;
  gratitudeCount: number;
}

export interface JourneyWeekByType {
  meditation: number;
  manna: number;
  gratitude: number;
}

export interface JourneyDashboardData {
  days: JourneyDayBucket[];
  weekTotal: number;
  /** 선택한 주의 묵상(일별 항목 수 합)·만나·감사 건수 */
  weekByType: JourneyWeekByType;
  weekOffset: number;
  weekRangeLabel: string;
  /** 이번 주(weekOffset===0)일 때만 오늘 요일 막대 강조용 인덱스(0=월) */
  highlightDayIndex: number | null;
}

export async function getJourneyDashboardData(weekOffset = 0): Promise<JourneyDashboardData | null> {
  const offset = Math.max(JOURNEY_MIN_WEEK_OFFSET, Math.min(0, weekOffset));

  const { supabase, user } = await getServerAuth();
  if (!user) return null;

  const todaySeoul = seoulYmd(new Date());
  const mondayThisWeek = mondayOfSeoulWeekContaining(todaySeoul);
  const monday = addDaysYmd(mondayThisWeek, offset * 7);
  const sunday = addDaysYmd(monday, 6);

  const dayYmcs: string[] = [];
  for (let i = 0; i < 7; i += 1) {
    dayYmcs.push(addDaysYmd(monday, i));
  }

  type DayBreakdown = { meditation: number; manna: number; gratitude: number };
  const byDate = new Map<string, DayBreakdown>();
  for (const y of dayYmcs) {
    byDate.set(y, { meditation: 0, manna: 0, gratitude: 0 });
  }

  const bump = (dateStr: string | null | undefined, key: keyof DayBreakdown, n: number) => {
    if (!dateStr) return;
    if (!byDate.has(dateStr)) return;
    const cur = byDate.get(dateStr)!;
    cur[key] += n;
  };

  const [medRes, gratRes, mannaWeekRows] = await Promise.all([
    supabase
      .from('meditation_days')
      .select('meditation_date, meditation_items(count)')
      .eq('user_id', user.id)
      .gte('meditation_date', monday)
      .lte('meditation_date', sunday),
    supabase
      .from('gratitude_notes')
      .select('id, note_date')
      .eq('user_id', user.id)
      .gte('note_date', monday)
      .lte('note_date', sunday),
    fetchMannaRowsForJourneyYmdRange(supabase, user.id, monday, sunday),
  ]);

  for (const row of medRes.data ?? []) {
    const y = normalizeYmd((row as { meditation_date: string }).meditation_date);
    const n = meditationItemCountFromDayRow(row);
    if (y && n > 0) bump(y, 'meditation', n);
  }
  for (const row of mannaWeekRows) {
    const y = normalizeYmd(mannaYmd(row));
    if (y) bump(y, 'manna', 1);
  }
  for (const row of gratRes.data ?? []) {
    const y = normalizeYmd((row as { note_date: string }).note_date);
    if (y) bump(y, 'gratitude', 1);
  }

  const days: JourneyDayBucket[] = dayYmcs.map((ymd, i) => {
    const b = byDate.get(ymd) ?? { meditation: 0, manna: 0, gratitude: 0 };
    const count = b.meditation + b.manna + b.gratitude;
    return {
      ymd,
      label: WEEKDAY_LABELS[i],
      count,
      meditationCount: b.meditation,
      mannaCount: b.manna,
      gratitudeCount: b.gratitude,
    };
  });

  const weekTotal = days.reduce((s, d) => s + d.count, 0);
  const weekByType: JourneyWeekByType = days.reduce(
    (acc, d) => ({
      meditation: acc.meditation + d.meditationCount,
      manna: acc.manna + d.mannaCount,
      gratitude: acc.gratitude + d.gratitudeCount,
    }),
    { meditation: 0, manna: 0, gratitude: 0 },
  );

  let highlightDayIndex: number | null = null;
  if (offset === 0) {
    const idx = dayYmcs.indexOf(todaySeoul);
    highlightDayIndex = idx >= 0 ? idx : null;
  }

  return {
    days,
    weekTotal,
    weekByType,
    weekOffset: offset,
    weekRangeLabel: weekRangeLabelKo(monday, sunday),
    highlightDayIndex,
  };
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function firstYmdOfMonth(year: number, month1: number): string {
  return `${year}-${pad2(month1)}-01`;
}

function ymFromYearMonth(year: number, month1: number): string {
  return `${year}-${pad2(month1)}`;
}

function addMonthsYm(ym: string, deltaMonths: number): string {
  const [y0, m0] = ym.split('-').map(Number);
  let mm = m0 + deltaMonths;
  let yy = y0;
  while (mm > 12) {
    mm -= 12;
    yy += 1;
  }
  while (mm < 1) {
    mm += 12;
    yy -= 1;
  }
  return `${yy}-${pad2(mm)}`;
}

export interface JourneyMonthCalendarCell {
  ymd: string;
  inMonth: boolean;
  dayNumber: number;
  meditationCount: number;
  mannaCount: number;
  gratitudeCount: number;
  count: number;
}

export interface JourneyMonthCalendarData {
  year: number;
  month: number;
  monthYm: string;
  monthLabelKo: string;
  cells: JourneyMonthCalendarCell[];
  monthTotal: number;
  monthByType: JourneyWeekByType;
  prevYm: string;
  nextYm: string;
  canPrevMonth: boolean;
  canNextMonth: boolean;
  todaySeoulYmd: string;
}

/** 마이 페이지 월 달력: 서울 월요일 시작 6주 그리드, 묵상·만나·감사 일별 건수 */
export async function getJourneyMonthCalendarData(
  yearIn: number,
  monthIn: number,
): Promise<JourneyMonthCalendarData | null> {
  const { supabase, user } = await getServerAuth();
  if (!user) return null;

  const todaySeoulYmd = seoulYmd(new Date());
  const currentYm = todaySeoulYmd.slice(0, 7);
  const minYm = addMonthsYm(currentYm, -120);

  let year = yearIn;
  let month = monthIn;
  let requestYm = ymFromYearMonth(year, month);
  if (requestYm > currentYm) {
    const [cy, cm] = currentYm.split('-').map(Number);
    year = cy;
    month = cm;
    requestYm = currentYm;
  } else if (requestYm < minYm) {
    const [mnY, mnM] = minYm.split('-').map(Number);
    year = mnY;
    month = mnM;
    requestYm = minYm;
  }

  const firstYmd = firstYmdOfMonth(year, month);
  const gridStart = addDaysYmd(firstYmd, -weekdayMon0FromYmd(firstYmd));
  const gridKeys: string[] = [];
  for (let i = 0; i < 42; i += 1) {
    gridKeys.push(addDaysYmd(gridStart, i));
  }
  const gridEnd = gridKeys[41];

  type DayBreakdown = { meditation: number; manna: number; gratitude: number };
  const byDate = new Map<string, DayBreakdown>();
  for (const y of gridKeys) {
    byDate.set(y, { meditation: 0, manna: 0, gratitude: 0 });
  }

  const bump = (dateStr: string | null | undefined, key: keyof DayBreakdown, n: number) => {
    const y = normalizeYmd(dateStr ?? undefined);
    if (!y || !byDate.has(y)) return;
    const cur = byDate.get(y)!;
    cur[key] += n;
  };

  const [medRes, gratRes, mannaRows] = await Promise.all([
    supabase
      .from('meditation_days')
      .select('meditation_date, meditation_items(count)')
      .eq('user_id', user.id)
      .gte('meditation_date', gridStart)
      .lte('meditation_date', gridEnd),
    supabase
      .from('gratitude_notes')
      .select('note_date')
      .eq('user_id', user.id)
      .gte('note_date', gridStart)
      .lte('note_date', gridEnd),
    fetchMannaRowsForJourneyYmdRange(supabase, user.id, gridStart, gridEnd),
  ]);

  for (const row of medRes.data ?? []) {
    const y = normalizeYmd((row as { meditation_date: string }).meditation_date);
    const n = meditationItemCountFromDayRow(row);
    if (y && n > 0) bump(y, 'meditation', n);
  }
  for (const row of gratRes.data ?? []) {
    bump((row as { note_date: string }).note_date, 'gratitude', 1);
  }
  for (const row of mannaRows) {
    bump(mannaYmd(row), 'manna', 1);
  }

  const monthYmPrefix = ymFromYearMonth(year, month);
  const cells: JourneyMonthCalendarCell[] = gridKeys.map((ymd) => {
    const b = byDate.get(ymd) ?? { meditation: 0, manna: 0, gratitude: 0 };
    const count = b.meditation + b.manna + b.gratitude;
    const inMonth = ymd.slice(0, 7) === monthYmPrefix;
    const dayNumber = Number(ymd.slice(8, 10));
    return {
      ymd,
      inMonth,
      dayNumber,
      meditationCount: b.meditation,
      mannaCount: b.manna,
      gratitudeCount: b.gratitude,
      count,
    };
  });

  const inMonthCells = cells.filter((c) => c.inMonth);
  const monthTotal = inMonthCells.reduce((s, c) => s + c.count, 0);
  const monthByType: JourneyWeekByType = inMonthCells.reduce(
    (acc, d) => ({
      meditation: acc.meditation + d.meditationCount,
      manna: acc.manna + d.mannaCount,
      gratitude: acc.gratitude + d.gratitudeCount,
    }),
    { meditation: 0, manna: 0, gratitude: 0 },
  );

  const monthLabelKo = new Intl.DateTimeFormat('ko-KR', {
    timeZone: SEOUL,
    year: 'numeric',
    month: 'long',
  }).format(parseYmdToDate(firstYmd));

  const prevYm = addMonthsYm(requestYm, -1);
  const nextYm = addMonthsYm(requestYm, 1);
  const canPrevMonth = prevYm >= minYm;
  const canNextMonth = nextYm <= currentYm;

  return {
    year,
    month,
    monthYm: requestYm,
    monthLabelKo,
    cells,
    monthTotal,
    monthByType,
    prevYm,
    nextYm,
    canPrevMonth,
    canNextMonth,
    todaySeoulYmd: todaySeoulYmd,
  };
}
