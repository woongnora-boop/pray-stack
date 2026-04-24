/** API 쿼리 기본값(위키 판명과 동일). DB `translation` 컬럼은 `개역한글`로 적재. */
export const DEFAULT_TRANSLATION_QUERY = '개역한글판';

export function toDbTranslation(apiLabel: string): string {
  const t = apiLabel.trim();
  if (t === '개역한글판') return '개역한글';
  return t;
}
