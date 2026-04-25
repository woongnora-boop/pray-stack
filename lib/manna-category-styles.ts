/**
 * 만나 카테고리 색 — DB 컬럼 없이 id·이름으로 고정 (필터·폼·카드·태그 공통).
 * 기본 시드 이름(감사·사랑 등)은 고정 팔레트 인덱스, 그 외는 UUID 해시.
 */

export type MannaCategoryColorTokens = {
  solid: string;
  soft: string;
  ring: string;
  onSoft: string;
  onSolid: string;
  dot: string;
};

const PALETTE: MannaCategoryColorTokens[] = [
  { solid: '#0284c7', soft: 'rgba(2,132,199,0.16)', ring: 'rgba(2,132,199,0.42)', onSoft: '#075985', onSolid: '#f0f9ff', dot: '#0ea5e9' },
  { solid: '#db2777', soft: 'rgba(219,39,119,0.14)', ring: 'rgba(219,39,119,0.38)', onSoft: '#9d174d', onSolid: '#fdf2f8', dot: '#ec4899' },
  { solid: '#7c3aed', soft: 'rgba(124,58,237,0.14)', ring: 'rgba(124,58,237,0.38)', onSoft: '#5b21b6', onSolid: '#f5f3ff', dot: '#8b5cf6' },
  { solid: '#059669', soft: 'rgba(5,150,105,0.14)', ring: 'rgba(5,150,105,0.38)', onSoft: '#047857', onSolid: '#ecfdf5', dot: '#10b981' },
  { solid: '#d97706', soft: 'rgba(217,119,6,0.16)', ring: 'rgba(217,119,6,0.4)', onSoft: '#b45309', onSolid: '#fffbeb', dot: '#f59e0b' },
  { solid: '#4f46e5', soft: 'rgba(79,70,229,0.14)', ring: 'rgba(79,70,229,0.38)', onSoft: '#3730a3', onSolid: '#eef2ff', dot: '#6366f1' },
  { solid: '#0d9488', soft: 'rgba(13,148,136,0.14)', ring: 'rgba(13,148,136,0.38)', onSoft: '#0f766e', onSolid: '#f0fdfa', dot: '#14b8a6' },
  { solid: '#c026d3', soft: 'rgba(192,38,211,0.12)', ring: 'rgba(192,38,211,0.36)', onSoft: '#86198f', onSolid: '#fdf4ff', dot: '#d946ef' },
];

/** 가입 시 기본 카테고리 이름 → 안정적인 색 */
const NAME_PALETTE_INDEX: Record<string, number> = {
  감사: 0,
  사랑: 1,
  위로: 2,
  소망: 3,
  믿음: 4,
};

function hashCategoryId(id: string): number {
  const compact = id.replace(/-/g, '');
  let h = 0;
  for (let i = 0; i < compact.length; i += 1) {
    h = (h * 31 + compact.charCodeAt(i)) >>> 0;
  }
  return h % PALETTE.length;
}

export function getMannaCategoryTokens(categoryId: string, categoryName: string): MannaCategoryColorTokens {
  const key = categoryName.trim();
  const byName = NAME_PALETTE_INDEX[key];
  const idx = byName !== undefined ? byName % PALETTE.length : hashCategoryId(categoryId);
  return PALETTE[idx]!;
}
