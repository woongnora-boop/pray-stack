'use client';

import { useTransition, type ReactElement } from 'react';
import { useRouter } from 'next/navigation';

import { deleteGratitudeNote } from '@/app/actions/gratitude';
import { Button } from '@/components/ui/button';

interface DeleteGratitudeButtonProps {
  noteId: string;
}

export function DeleteGratitudeButton({ noteId }: DeleteGratitudeButtonProps): ReactElement {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="destructive"
      disabled={pending}
      onClick={() => {
        if (!window.confirm('이 감사 기록을 삭제할까요? 삭제하면 되돌릴 수 없습니다.')) {
          return;
        }
        startTransition(async () => {
          const result = await deleteGratitudeNote(noteId);
          if (!result.success) {
            window.alert(result.error);
            return;
          }
          router.push('/gratitude');
          router.refresh();
        });
      }}
    >
      {pending ? '삭제 중…' : '삭제'}
    </Button>
  );
}
