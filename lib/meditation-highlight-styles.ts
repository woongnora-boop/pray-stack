export const MEDITATION_HIGHLIGHT_IDS = ['amber', 'mint', 'rose', 'sky', 'violet'] as const;

export type MeditationHighlightId = (typeof MEDITATION_HIGHLIGHT_IDS)[number];

export const MEDITATION_HIGHLIGHT_LABELS: Record<MeditationHighlightId, string> = {
  amber: '노랑',
  mint: '민트',
  rose: '로즈',
  sky: '하늘',
  violet: '보라',
};

type PenStyle = { bg: string; border: string; dot: string };

export const MEDITATION_HIGHLIGHT_STYLES: Record<MeditationHighlightId, PenStyle> = {
  amber: {
    bg: 'rgba(251, 191, 36, 0.38)',
    border: 'rgba(217, 119, 6, 0.45)',
    dot: '#d97706',
  },
  mint: {
    bg: 'rgba(52, 211, 153, 0.3)',
    border: 'rgba(5, 150, 105, 0.42)',
    dot: '#059669',
  },
  rose: {
    bg: 'rgba(251, 113, 133, 0.28)',
    border: 'rgba(225, 29, 72, 0.4)',
    dot: '#e11d48',
  },
  sky: {
    bg: 'rgba(125, 211, 252, 0.4)',
    border: 'rgba(2, 132, 199, 0.45)',
    dot: '#0284c7',
  },
  violet: {
    bg: 'rgba(196, 181, 253, 0.38)',
    border: 'rgba(124, 58, 237, 0.42)',
    dot: '#7c3aed',
  },
};
