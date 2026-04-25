/**
 * 감사 노트 키워드 후보 추출.
 * - 서버에서는 `kuromoji-ko`(mecab-ko-dic) 형태소 분석을 우선 사용합니다 (`lib/gratitude-mecab.ts`).
 * - 분석기를 쓸 수 없을 때만 아래 휴리스틱(띄어쓰기·문장부호·한글 덩어리)으로 폴백합니다.
 */

const STOP = new Set([
  '그리고',
  '그런데',
  '그래서',
  '하지만',
  '그냥',
  '정말',
  '너무',
  '오늘',
  '어제',
  '내일',
  '우리',
  '나의',
  '저의',
  '여러',
  '모든',
  '항상',
  '다시',
  '같이',
  '많이',
  '조금',
  '아주',
  '매우',
  '같은',
  '다른',
  '이런',
  '그런',
  '저런',
  '무엇',
  '어떤',
  '때문',
  '있는',
  '없는',
  '살아',
  '있습니다',
  '있어요',
  '없습니다',
  '없어요',
  '합니다',
  '했습니다',
  '됩니다',
  '입니다',
]);

export function isGratitudeStopword(term: string): boolean {
  return STOP.has(term) || STOP.has(term.toLowerCase());
}

function pushHangulRuns(chunk: string, out: string[]): void {
  const runs = chunk.match(/[\uAC00-\uD7A3]{2,12}/g);
  if (!runs) return;
  for (const r of runs) {
    if (!STOP.has(r)) out.push(r);
  }
}

export function tokenizeGratitudeText(title: string, content: string): string[] {
  const raw = `${title}\n${content}`.trim();
  if (!raw) return [];

  const out: string[] = [];
  const pieces = raw.split(/[\s,.!?;:·…'"“”‘’()\[\]{}<>/@#|]+/).map((s) => s.trim());

  for (const piece of pieces) {
    if (piece.length < 2) continue;
    if (/^[\uAC00-\uD7A3]+$/.test(piece)) {
      if (!STOP.has(piece)) out.push(piece);
      continue;
    }
    if (/^[\d]+$/.test(piece)) continue;
    if (/^[A-Za-z][A-Za-z0-9]{1,24}$/.test(piece)) {
      const w = piece.toLowerCase();
      if (!STOP.has(w)) out.push(piece);
      continue;
    }
    pushHangulRuns(piece, out);
  }

  return out;
}

export interface GratitudeKeywordRank {
  term: string;
  count: number;
}

export function rankGratitudeKeywords(tokens: string[], limit: number): GratitudeKeywordRank[] {
  const counts = new Map<string, number>();
  for (const t of tokens) {
    const key = t.trim();
    if (key.length < 2) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([term, count]) => ({ term, count }))
    .sort((a, b) => b.count - a.count || a.term.localeCompare(b.term, 'ko'))
    .slice(0, Math.max(0, limit));
}

export function rankKeywordsFromNotes(
  notes: readonly { title: string; content: string }[],
  limit: number,
): GratitudeKeywordRank[] {
  const all: string[] = [];
  for (const n of notes) {
    all.push(...tokenizeGratitudeText(n.title, n.content));
  }
  return rankGratitudeKeywords(all, limit);
}

/** 서버: MeCab 사용 가능 시 형태소 기반, 아니면 휴리스틱. */
export async function rankKeywordsFromNotesAsync(
  notes: readonly { title: string; content: string }[],
  limit: number,
): Promise<GratitudeKeywordRank[]> {
  const { getGratitudeMeCab, collectTokensFromNotes, collectTokensHeuristic } = await import('@/lib/gratitude-mecab');
  const mecab = await getGratitudeMeCab();
  const all = mecab ? collectTokensFromNotes(notes, mecab) : collectTokensHeuristic(notes);
  return rankGratitudeKeywords(all, limit);
}
