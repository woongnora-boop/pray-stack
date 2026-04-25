/**
 * `meditation_items.paragraph_highlights` 컬럼이 아직 없을 때 PostgREST/Supabase 오류.
 * SELECT/INSERT 폴백 판별용 (마이그레이션 적용 전 환경).
 */
export function isMissingParagraphHighlightsColumnError(
  error: { message?: string; code?: string } | null,
): boolean {
  if (!error) return false;
  const msg = (error.message ?? '').toLowerCase();
  if (
    msg.includes('paragraph_highlights') &&
    (msg.includes('does not exist') || msg.includes('could not find'))
  ) {
    return true;
  }
  if (msg.includes('paragraph_highlights') && msg.includes('schema cache')) return true;
  if (error.code === '42703') return true;
  return false;
}
