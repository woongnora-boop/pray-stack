import { BIBLE_CATALOG } from '@/lib/bible/catalog';

/** `BibleVersePickerKRV` 등: `요한복음 3:16`, `요한복음 3:16-18`, `시편 23:1` */
export type ParsedVerseReferenceLine = {
  bookName: string;
  chapter: number;
  verseFrom?: number;
  verseTo?: number;
};

const BY_NAME_DESC = [...BIBLE_CATALOG].sort((a, b) => b.bookName.length - a.bookName.length);

/**
 * 한글 권명 + `장:절` 또는 `장:절-절`, 또는 `N장`만.
 * 권명은 카탈로그(개역한글 66권)와 정확히 일치해야 한다.
 */
export function parseVerseReferenceLine(ref: string): ParsedVerseReferenceLine | null {
  const trimmed = ref.replace(/\uFF1A/g, ':').trim();
  if (!trimmed) return null;

  for (const meta of BY_NAME_DESC) {
    const prefix = `${meta.bookName} `;
    if (!trimmed.startsWith(prefix)) continue;
    const rest = trimmed.slice(prefix.length).trim();

    const colon = rest.match(/^(\d+)\s*:\s*(\d+)(?:\s*-\s*(\d+))?$/);
    if (colon) {
      const chapter = Number.parseInt(colon[1] ?? '', 10);
      const verseFrom = Number.parseInt(colon[2] ?? '', 10);
      const verseToRaw = colon[3];
      const verseTo = verseToRaw != null && verseToRaw !== '' ? Number.parseInt(verseToRaw, 10) : verseFrom;
      if (
        !Number.isFinite(chapter) ||
        chapter < 1 ||
        chapter > meta.maxChapter ||
        !Number.isFinite(verseFrom) ||
        verseFrom < 1 ||
        !Number.isFinite(verseTo) ||
        verseTo < verseFrom
      ) {
        continue;
      }
      return { bookName: meta.bookName, chapter, verseFrom, verseTo };
    }

    const chapterOnly = rest.match(/^(\d+)\s*장$/);
    if (chapterOnly) {
      const chapter = Number.parseInt(chapterOnly[1] ?? '', 10);
      if (!Number.isFinite(chapter) || chapter < 1 || chapter > meta.maxChapter) continue;
      return { bookName: meta.bookName, chapter };
    }
  }

  return null;
}

/**
 * 묵상·만나 `verse_reference`에서 66권 `bookOrder` 추출.
 * `parseVerseReferenceLine` 성공 시 사용, 아니면 `권이름 ` 뒤에 장·절 숫자가 오는 접두만 인정.
 */
export function bookOrderFromVerseReference(ref: string): number | null {
  const parsed = parseVerseReferenceLine(ref);
  if (parsed) {
    const meta = BIBLE_CATALOG.find((b) => b.bookName === parsed.bookName);
    return meta?.bookOrder ?? null;
  }
  const t = ref.replace(/\uFF1A/g, ':').trim();
  if (!t) return null;
  for (const b of BY_NAME_DESC) {
    const prefix = `${b.bookName} `;
    if (!t.startsWith(prefix)) continue;
    const after = t.slice(prefix.length).trim();
    if (/^\d/.test(after)) return b.bookOrder;
  }
  return null;
}
