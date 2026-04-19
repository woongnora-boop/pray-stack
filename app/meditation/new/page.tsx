import type { ReactElement } from 'react';

import { MeditationForm } from '@/components/meditation/MeditationForm';

export default function NewMeditationPage(): ReactElement {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">묵상 작성</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">날짜와 묵상 항목을 입력한 뒤 저장합니다.</p>
      </div>
      <MeditationForm mode="create" />
    </div>
  );
}
