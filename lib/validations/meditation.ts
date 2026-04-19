import { z } from 'zod';

const meditationCategoryEnum = z.enum(['sermon', 'qt', 'praise', 'etc']);

const meditationItemSchema = z.object({
  category_type: meditationCategoryEnum,
  verse_reference: z.string().trim().min(1, '성경 구절을 입력해 주세요.'),
  title: z.string().trim().min(1, '묵상 제목을 입력해 주세요.'),
  content: z.string().trim().min(1, '묵상 내용을 입력해 주세요.'),
});

export const meditationFormSchema = z.object({
  meditation_date: z.string().min(1, '날짜를 선택해 주세요.'),
  items: z
    .array(meditationItemSchema)
    .min(1, '묵상 항목을 최소 1개 이상 추가해 주세요.')
    .max(5, '묵상 항목은 최대 5개까지 추가할 수 있습니다.'),
});

export type MeditationFormValues = z.infer<typeof meditationFormSchema>;
