import { displayYmdFromDb, toDateInputValue } from '@/lib/date';

/**
 * 숨은 `_payload` JSON과 실제 날짜 입력(`name`)을 맞춤.
 * **폼에 넘어온 날짜가 있으면 최우선**(히든 JSON이 잠깐 구버전이어도 저장 날짜가 어긋나지 않게).
 */
export function mergePayloadDateFromFormData(
  formData: FormData,
  rawJson: string,
  dateKey: 'entry_date' | 'meditation_date' | 'note_date',
): { ok: true; payload: unknown } | { ok: false } {
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(rawJson) as Record<string, unknown>;
  } catch {
    return { ok: false };
  }

  const fromForm = formData.get(dateKey);
  if (typeof fromForm === 'string' && fromForm.trim().length > 0) {
    const t = fromForm.trim();
    const ymd = displayYmdFromDb(t) || toDateInputValue(t);
    if (ymd) {
      parsed[dateKey] = ymd;
      return { ok: true, payload: parsed };
    }
  }

  const raw = parsed[dateKey];
  if (typeof raw === 'string') {
    const ymd = displayYmdFromDb(raw) || toDateInputValue(raw);
    if (ymd) parsed[dateKey] = ymd;
  }
  return { ok: true, payload: parsed };
}
