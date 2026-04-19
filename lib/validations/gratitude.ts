import { z } from 'zod';

export const gratitudeNoteFormSchema = z.object({
  note_date: z.string().min(1, '날짜를 선택해 주세요.'),
  title: z.string().trim().min(1, '제목을 입력해 주세요.'),
  content: z.string().trim().min(1, '내용을 입력해 주세요.'),
});

export type GratitudeNoteFormValues = z.infer<typeof gratitudeNoteFormSchema>;
