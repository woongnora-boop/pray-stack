import { MEDITATION_HIGHLIGHT_IDS, type MeditationHighlightId } from '@/lib/meditation-highlight-styles';

/** 본문을 문단으로 나눔 — 빈 줄(둘 이상의 줄바꿈) 기준 */
export function splitMeditationParagraphs(content: string): string[] {
  const normalized = content.replace(/\r\n/g, '\n');
  const parts = normalized.split(/\n{2,}/);
  return parts.length > 0 ? parts : [''];
}

export function sanitizeParagraphHighlights(
  highlights: Record<string, string> | undefined,
  paragraphCount: number,
): Record<string, MeditationHighlightId> {
  const src = highlights ?? {};
  const out: Record<string, MeditationHighlightId> = {};
  for (let i = 0; i < paragraphCount; i += 1) {
    const k = String(i);
    const v = src[k];
    if (v && (MEDITATION_HIGHLIGHT_IDS as readonly string[]).includes(v)) {
      out[k] = v as MeditationHighlightId;
    }
  }
  return out;
}

export function normalizeHighlightsFromDb(raw: unknown): Record<string, MeditationHighlightId> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return {};
  }
  const out: Record<string, MeditationHighlightId> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!/^\d+$/.test(k)) continue;
    if (typeof v !== 'string') continue;
    if ((MEDITATION_HIGHLIGHT_IDS as readonly string[]).includes(v)) {
      out[k] = v as MeditationHighlightId;
    }
  }
  return out;
}

export function hasAnyParagraphHighlight(
  highlights: Record<string, MeditationHighlightId> | Record<string, string> | null | undefined,
): boolean {
  if (!highlights) return false;
  return Object.keys(highlights).length > 0;
}
