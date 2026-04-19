'use client';

import { useTransition, type ReactElement } from 'react';
import { useRouter } from 'next/navigation';

import { deleteMeditation } from '@/app/actions/meditation';
import { Button } from '@/components/ui/button';

interface DeleteMeditationButtonProps {
  dayId: string;
}

export function DeleteMeditationButton({ dayId }: DeleteMeditationButtonProps): ReactElement {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="destructive"
      disabled={pending}
      onClick={() => {
        if (!window.confirm('이 묵상 기록을 삭제할까요? 삭제하면 되돌릴 수 없습니다.')) {
          return;
        }
        startTransition(async () => {
          const result = await deleteMeditation(dayId);
          if (!result.success) {
            window.alert(result.error);
            return;
          }
          router.push('/meditation');
          router.refresh();
        });
      }}
    >
      {pending ? '삭제 중…' : '삭제'}
    </Button>
  );
}
