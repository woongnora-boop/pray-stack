import 'server-only';

import { createRequire } from 'node:module';
import path from 'node:path';

import { MeCab, type Token } from 'kuromoji-ko';

import { isGratitudeStopword, tokenizeGratitudeText } from '@/lib/gratitude-keywords';

const require = createRequire(import.meta.url);

let mecabPromise: Promise<MeCab | null> | null = null;

/**
 * kuromoji-ko(mecab-ko-dic) 기반 형태소 분석기. 사전은 npm 패키지 `dict/`에 포함됩니다.
 * 초기화 실패 시(경로 문제 등) null을 반환하고 호출부는 휴리스틱으로 폴백합니다.
 */
export function getGratitudeMeCab(): Promise<MeCab | null> {
  if (!mecabPromise) {
    mecabPromise = (async () => {
      try {
        const entry = require.resolve('kuromoji-ko');
        const dictPath = path.join(path.dirname(entry), '..', 'dict') + path.sep;
        const dictUrl = dictPath.replace(/\\/g, '/');
        return await MeCab.create({ engine: 'ko', dictPath: dictUrl });
      } catch {
        return null;
      }
    })();
  }
  return mecabPromise;
}

function firstPos(t: Token): string {
  return t.pos[0] ?? '';
}

/** 명사·동사/형용사 어간·의미 있는 부사만 키워드 후보로 사용합니다. */
function keywordSurfaceFromToken(t: Token): string | null {
  const surf = t.surface.trim();
  if (!surf || surf.length < 2) return null;
  if (isGratitudeStopword(surf)) return null;

  const pos0 = firstPos(t);
  if (pos0.startsWith('S')) {
    if (pos0 === 'SL' && /^[A-Za-z]{2,}$/.test(surf)) return surf.toLowerCase();
    return null;
  }
  if (pos0.startsWith('J')) return null;
  if (pos0 === 'EC' || pos0 === 'EF' || pos0 === 'EP' || pos0 === 'ETM' || pos0 === 'ETN') return null;

  if (pos0.startsWith('NN')) {
    if (pos0 === 'NR') return null;
    return surf;
  }

  if (pos0.startsWith('VV') || pos0.startsWith('VA') || pos0.startsWith('VX')) {
    const lemma = (t.lemma ?? '').trim();
    if (lemma.length >= 2 && !isGratitudeStopword(lemma)) return lemma;
    return null;
  }

  if (pos0 === 'MAG') {
    return surf;
  }

  return null;
}

export function collectTokensFromNotes(
  notes: readonly { title: string; content: string }[],
  mecab: MeCab,
): string[] {
  const out: string[] = [];
  for (const n of notes) {
    const text = `${n.title}\n${n.content}`.trim();
    if (!text) continue;
    for (const tok of mecab.parse(text)) {
      const kw = keywordSurfaceFromToken(tok);
      if (kw) out.push(kw);
    }
  }
  return out;
}

export function collectTokensHeuristic(notes: readonly { title: string; content: string }[]): string[] {
  const out: string[] = [];
  for (const n of notes) {
    out.push(...tokenizeGratitudeText(n.title, n.content));
  }
  return out;
}
