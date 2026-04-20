'use server';

import { JOURNEY_MIN_WEEK_OFFSET } from '@/lib/journey-week';
import { createClient } from '@/lib/supabase/server';

const SEOUL = 'Asia/Seoul';

const KOREAN_STOPWORDS = new Set([
  '그리고',
  '그런',
  '그래서',
  '그냥',
  '그때',
  '이런',
  '저런',
  '어떤',
  '무엇',
  '있는',
  '없는',
  '같은',
  '다른',
  '모든',
  '정말',
  '너무',
  '매우',
  '아주',
  '오늘',
  '내일',
  '어제',
  '우리',
  '나의',
  '저의',
  '것을',
  '것이',
  '수가',
  '때문',
  '대한',
  '위해',
  '있다',
  '없다',
  '한다',
  '된다',
  '이다',
  '아니',
  '하지',
  '그렇',
  '이렇',
  '저렇',
  '그것',
  '이것',
  '저것',
  '여기',
  '거기',
  '저기',
  '때에',
  '중에',
  '으로',
  '에서',
  '까지',
  '부터',
  '보다',
  '밖에',
  '만큼',
  '처럼',
  '같이',
  '함께',
  '혹은',
  '또는',
  '및',
]);

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

function tokenizeForFaithWords(chunk: string, counts: Map<string, number>): void {
  const stripped = chunk.replace(/[\p{P}\p{S}]/gu, ' ');
  const parts = stripped.split(/\s+/);
  for (let raw of parts) {
    raw = raw.trim();
    if (raw.length < 2) continue;
    if (/^\d+$/.test(raw)) continue;
    if (KOREAN_STOPWORDS.has(raw)) continue;
    if (/^[a-zA-Z]{1,2}$/.test(raw)) continue;
    counts.set(raw, (counts.get(raw) ?? 0) + 1);
  }
}

export interface JourneyDayBucket {
  ymd: string;
  label: (typeof WEEKDAY_LABELS)[number];
  count: number;
}

export interface FaithWordItem {
  text: string;
  count: number;
  weight: number;
}

export interface JourneyDashboardData {
  days: JourneyDayBucket[];
  weekTotal: number;
  faithWords: FaithWordItem[];
  weekOffset: number;
  weekRangeLabel: string;
  /** 이번 주(weekOffset===0)일 때만 오늘 요일 막대 강조용 인덱스(0=월) */
  highlightDayIndex: number | null;
}

export async function getJourneyDashboardData(weekOffset = 0): Promise<JourneyDashboardData | null> {
  const offset = Math.max(JOURNEY_MIN_WEEK_OFFSET, Math.min(0, weekOffset));

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const todaySeoul = seoulYmd(new Date());
  const mondayThisWeek = mondayOfSeoulWeekContaining(todaySeoul);
  const monday = addDaysYmd(mondayThisWeek, offset * 7);
  const sunday = addDaysYmd(monday, 6);

  const dayYmcs: string[] = [];
  for (let i = 0; i < 7; i += 1) {
    dayYmcs.push(addDaysYmd(monday, i));
  }

  const countsByDate = new Map<string, number>();
  for (const y of dayYmcs) {
    countsByDate.set(y, 0);
  }

  const bump = (dateStr: string | null | undefined, n: number) => {
    if (!dateStr) return;
    if (!countsByDate.has(dateStr)) return;
    countsByDate.set(dateStr, (countsByDate.get(dateStr) ?? 0) + n);
  };

  const [medRes, mannaRes, gratRes] = await Promise.all([
    supabase
      .from('meditation_days')
      .select('meditation_date')
      .eq('user_id', user.id)
      .gte('meditation_date', monday)
      .lte('meditation_date', sunday),
    supabase
      .from('manna_entries')
      .select('entry_date')
      .eq('user_id', user.id)
      .gte('entry_date', monday)
      .lte('entry_date', sunday),
    supabase
      .from('gratitude_notes')
      .select('note_date')
      .eq('user_id', user.id)
      .gte('note_date', monday)
      .lte('note_date', sunday),
  ]);

  for (const row of medRes.data ?? []) {
    bump(row.meditation_date as string, 1);
  }
  for (const row of mannaRes.data ?? []) {
    bump(row.entry_date as string, 1);
  }
  for (const row of gratRes.data ?? []) {
    bump(row.note_date as string, 1);
  }

  const days: JourneyDayBucket[] = dayYmcs.map((ymd, i) => ({
    ymd,
    label: WEEKDAY_LABELS[i],
    count: countsByDate.get(ymd) ?? 0,
  }));

  const weekTotal = days.reduce((s, d) => s + d.count, 0);

  let highlightDayIndex: number | null = null;
  if (offset === 0) {
    const idx = dayYmcs.indexOf(todaySeoul);
    highlightDayIndex = idx >= 0 ? idx : null;
  }

  const { data: medDayRows } = await supabase
    .from('meditation_days')
    .select('id')
    .eq('user_id', user.id)
    .gte('meditation_date', monday)
    .lte('meditation_date', sunday);

  const medDayIds = (medDayRows ?? []).map((r) => r.id as string).filter(Boolean);

  const [medItemsRes, mannaItemsRes, gratItemsRes] = await Promise.all([
    medDayIds.length
      ? supabase
          .from('meditation_items')
          .select('title, verse_reference, content')
          .eq('user_id', user.id)
          .in('day_id', medDayIds)
          .limit(400)
      : Promise.resolve({ data: [] as { title: string; verse_reference: string; content: string }[] }),
    supabase
      .from('manna_entries')
      .select('verse_reference, verse_text, note')
      .eq('user_id', user.id)
      .gte('entry_date', monday)
      .lte('entry_date', sunday)
      .limit(400),
    supabase
      .from('gratitude_notes')
      .select('title, content')
      .eq('user_id', user.id)
      .gte('note_date', monday)
      .lte('note_date', sunday)
      .limit(400),
  ]);

  const wordCounts = new Map<string, number>();

  for (const row of medItemsRes.data ?? []) {
    tokenizeForFaithWords(`${row.title} ${row.verse_reference} ${row.content}`, wordCounts);
  }
  for (const row of mannaItemsRes.data ?? []) {
    tokenizeForFaithWords(`${row.verse_reference} ${row.verse_text} ${row.note ?? ''}`, wordCounts);
  }
  for (const row of gratItemsRes.data ?? []) {
    tokenizeForFaithWords(`${row.title} ${row.content}`, wordCounts);
  }

  const sorted = [...wordCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 36);
  const max = sorted[0]?.[1] ?? 1;
  const faithWords: FaithWordItem[] = sorted.map(([text, count]) => ({
    text,
    count,
    weight: count / max,
  }));

  return {
    days,
    weekTotal,
    faithWords,
    weekOffset: offset,
    weekRangeLabel: weekRangeLabelKo(monday, sunday),
    highlightDayIndex,
  };
}
