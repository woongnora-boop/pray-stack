import { z } from 'zod';

export const mannaEntryFormSchema = z.object({
  entry_date: z.string().min(1, '날짜를 선택해 주세요.'),
  verse_reference: z.string().trim().min(1, '성경 구절을 입력해 주세요.'),
  verse_text: z.string().trim().min(1, '말씀 내용을 입력해 주세요.'),
  category_id: z.string().uuid('카테고리를 선택해 주세요.'),
  note: z
    .string()
    .max(5000)
    .default('')
    .transform((s) => (s.trim() === '' ? undefined : s.trim())),
});

export type MannaEntryFormValues = z.infer<typeof mannaEntryFormSchema>;

export const mannaCategoryNameSchema = z.object({
  name: z.string().trim().min(1, '카테고리 이름을 입력해 주세요.').max(40, '이름은 40자 이내로 입력해 주세요.'),
});

export type MannaCategoryNameValues = z.infer<typeof mannaCategoryNameSchema>;
