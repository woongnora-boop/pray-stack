export type BibleVerseRow = {
  verse: number;
  text: string;
};

export type BibleChapterResponse = {
  translation: string;
  book: string;
  chapter: number;
  verses: BibleVerseRow[];
};

export type BibleApiError = {
  error: string;
  message: string;
};
