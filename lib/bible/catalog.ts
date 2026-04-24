/** 개역한글 66권 — 권명·최대 장 (parsed/DB와 동일 기준). */

export type BibleCatalogEntry = {
  readonly bookOrder: number;
  readonly bookName: string;
  readonly testament: 'OT' | 'NT';
  readonly maxChapter: number;
};

export const BIBLE_CATALOG: readonly BibleCatalogEntry[] = [
  { bookOrder: 1, bookName: '창세기', testament: 'OT', maxChapter: 50 },
  { bookOrder: 2, bookName: '출애굽기', testament: 'OT', maxChapter: 40 },
  { bookOrder: 3, bookName: '레위기', testament: 'OT', maxChapter: 27 },
  { bookOrder: 4, bookName: '민수기', testament: 'OT', maxChapter: 36 },
  { bookOrder: 5, bookName: '신명기', testament: 'OT', maxChapter: 34 },
  { bookOrder: 6, bookName: '여호수아', testament: 'OT', maxChapter: 24 },
  { bookOrder: 7, bookName: '사사기', testament: 'OT', maxChapter: 21 },
  { bookOrder: 8, bookName: '룻기', testament: 'OT', maxChapter: 4 },
  { bookOrder: 9, bookName: '사무엘상', testament: 'OT', maxChapter: 31 },
  { bookOrder: 10, bookName: '사무엘하', testament: 'OT', maxChapter: 24 },
  { bookOrder: 11, bookName: '열왕기상', testament: 'OT', maxChapter: 22 },
  { bookOrder: 12, bookName: '열왕기하', testament: 'OT', maxChapter: 25 },
  { bookOrder: 13, bookName: '역대상', testament: 'OT', maxChapter: 29 },
  { bookOrder: 14, bookName: '역대하', testament: 'OT', maxChapter: 36 },
  { bookOrder: 15, bookName: '에스라', testament: 'OT', maxChapter: 10 },
  { bookOrder: 16, bookName: '느헤미야', testament: 'OT', maxChapter: 13 },
  { bookOrder: 17, bookName: '에스더', testament: 'OT', maxChapter: 10 },
  { bookOrder: 18, bookName: '욥기', testament: 'OT', maxChapter: 42 },
  { bookOrder: 19, bookName: '시편', testament: 'OT', maxChapter: 150 },
  { bookOrder: 20, bookName: '잠언', testament: 'OT', maxChapter: 31 },
  { bookOrder: 21, bookName: '전도서', testament: 'OT', maxChapter: 12 },
  { bookOrder: 22, bookName: '아가', testament: 'OT', maxChapter: 8 },
  { bookOrder: 23, bookName: '이사야', testament: 'OT', maxChapter: 66 },
  { bookOrder: 24, bookName: '예레미야', testament: 'OT', maxChapter: 52 },
  { bookOrder: 25, bookName: '예레미야애가', testament: 'OT', maxChapter: 5 },
  { bookOrder: 26, bookName: '에스겔', testament: 'OT', maxChapter: 48 },
  { bookOrder: 27, bookName: '다니엘', testament: 'OT', maxChapter: 12 },
  { bookOrder: 28, bookName: '호세아', testament: 'OT', maxChapter: 14 },
  { bookOrder: 29, bookName: '요엘', testament: 'OT', maxChapter: 3 },
  { bookOrder: 30, bookName: '아모스', testament: 'OT', maxChapter: 9 },
  { bookOrder: 31, bookName: '오바댜', testament: 'OT', maxChapter: 1 },
  { bookOrder: 32, bookName: '요나', testament: 'OT', maxChapter: 4 },
  { bookOrder: 33, bookName: '미가', testament: 'OT', maxChapter: 7 },
  { bookOrder: 34, bookName: '나훔', testament: 'OT', maxChapter: 3 },
  { bookOrder: 35, bookName: '하박국', testament: 'OT', maxChapter: 3 },
  { bookOrder: 36, bookName: '스바냐', testament: 'OT', maxChapter: 3 },
  { bookOrder: 37, bookName: '학개', testament: 'OT', maxChapter: 2 },
  { bookOrder: 38, bookName: '스가랴', testament: 'OT', maxChapter: 14 },
  { bookOrder: 39, bookName: '말라기', testament: 'OT', maxChapter: 4 },
  { bookOrder: 40, bookName: '마태복음', testament: 'NT', maxChapter: 28 },
  { bookOrder: 41, bookName: '마가복음', testament: 'NT', maxChapter: 16 },
  { bookOrder: 42, bookName: '누가복음', testament: 'NT', maxChapter: 24 },
  { bookOrder: 43, bookName: '요한복음', testament: 'NT', maxChapter: 21 },
  { bookOrder: 44, bookName: '사도행전', testament: 'NT', maxChapter: 28 },
  { bookOrder: 45, bookName: '로마서', testament: 'NT', maxChapter: 16 },
  { bookOrder: 46, bookName: '고린도전서', testament: 'NT', maxChapter: 16 },
  { bookOrder: 47, bookName: '고린도후서', testament: 'NT', maxChapter: 13 },
  { bookOrder: 48, bookName: '갈라디아서', testament: 'NT', maxChapter: 6 },
  { bookOrder: 49, bookName: '에베소서', testament: 'NT', maxChapter: 6 },
  { bookOrder: 50, bookName: '빌립보서', testament: 'NT', maxChapter: 4 },
  { bookOrder: 51, bookName: '골로새서', testament: 'NT', maxChapter: 4 },
  { bookOrder: 52, bookName: '데살로니가전서', testament: 'NT', maxChapter: 5 },
  { bookOrder: 53, bookName: '데살로니가후서', testament: 'NT', maxChapter: 3 },
  { bookOrder: 54, bookName: '디모데전서', testament: 'NT', maxChapter: 6 },
  { bookOrder: 55, bookName: '디모데후서', testament: 'NT', maxChapter: 4 },
  { bookOrder: 56, bookName: '디도서', testament: 'NT', maxChapter: 3 },
  { bookOrder: 57, bookName: '빌레몬서', testament: 'NT', maxChapter: 1 },
  { bookOrder: 58, bookName: '히브리서', testament: 'NT', maxChapter: 13 },
  { bookOrder: 59, bookName: '야고보서', testament: 'NT', maxChapter: 5 },
  { bookOrder: 60, bookName: '베드로전서', testament: 'NT', maxChapter: 5 },
  { bookOrder: 61, bookName: '베드로후서', testament: 'NT', maxChapter: 3 },
  { bookOrder: 62, bookName: '요한일서', testament: 'NT', maxChapter: 5 },
  { bookOrder: 63, bookName: '요한이서', testament: 'NT', maxChapter: 1 },
  { bookOrder: 64, bookName: '요한삼서', testament: 'NT', maxChapter: 1 },
  { bookOrder: 65, bookName: '유다서', testament: 'NT', maxChapter: 1 },
  { bookOrder: 66, bookName: '요한계시록', testament: 'NT', maxChapter: 22 },
] as const;

const BY_NAME = new Map<string, BibleCatalogEntry>(
  BIBLE_CATALOG.map((e) => [e.bookName, e]),
);

/** 정확히 일치하는 한글 권명만 허용 (공백 trim). */
export function resolveBibleBook(bookParam: string): BibleCatalogEntry | null {
  const key = bookParam.trim();
  if (!key) return null;
  return BY_NAME.get(key) ?? null;
}
