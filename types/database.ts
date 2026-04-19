/**
 * Supabase `public` 스키마 타입 (schema.sql 기준).
 * Next.js 앱(`web`)에서 단독으로 빌드되도록 이 파일에 완전한 정의를 둡니다.
 * (루트 `types/database.ts`와 동기화 유지)
 */

export const MEDITATION_CATEGORY_TYPES = ['sermon', 'qt', 'praise', 'etc'] as const;

export type MeditationCategoryType = (typeof MEDITATION_CATEGORY_TYPES)[number];

export interface Database {
  public: {
    Tables: {
      meditation_days: {
        Row: {
          id: string;
          user_id: string;
          meditation_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          meditation_date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          meditation_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      meditation_items: {
        Row: {
          id: string;
          day_id: string;
          user_id: string;
          category_type: MeditationCategoryType;
          verse_reference: string;
          title: string;
          content: string;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          day_id: string;
          user_id: string;
          category_type: MeditationCategoryType;
          verse_reference: string;
          title: string;
          content: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          day_id?: string;
          user_id?: string;
          category_type?: MeditationCategoryType;
          verse_reference?: string;
          title?: string;
          content?: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'meditation_items_day_id_fkey';
            columns: ['day_id'];
            isOneToOne: false;
            referencedRelation: 'meditation_days';
            referencedColumns: ['id'];
          },
        ];
      };
      manna_categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          is_default: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          is_default?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          is_default?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      manna_entries: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          verse_reference: string;
          verse_text: string;
          note: string | null;
          entry_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          verse_reference: string;
          verse_text: string;
          note?: string | null;
          entry_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string;
          verse_reference?: string;
          verse_text?: string;
          note?: string | null;
          entry_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'manna_entries_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'manna_categories';
            referencedColumns: ['id'];
          },
        ];
      };
      gratitude_notes: {
        Row: {
          id: string;
          user_id: string;
          note_date: string;
          title: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          note_date: string;
          title: string;
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          note_date?: string;
          title?: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

type PublicTables = Database['public']['Tables'];

export type MeditationDay = PublicTables['meditation_days']['Row'];
export type MeditationDayInsert = PublicTables['meditation_days']['Insert'];
export type MeditationDayUpdate = PublicTables['meditation_days']['Update'];

export type MeditationItem = PublicTables['meditation_items']['Row'];
export type MeditationItemInsert = PublicTables['meditation_items']['Insert'];
export type MeditationItemUpdate = PublicTables['meditation_items']['Update'];

export type MannaCategory = PublicTables['manna_categories']['Row'];
export type MannaCategoryInsert = PublicTables['manna_categories']['Insert'];
export type MannaCategoryUpdate = PublicTables['manna_categories']['Update'];

export type MannaEntry = PublicTables['manna_entries']['Row'];
export type MannaEntryInsert = PublicTables['manna_entries']['Insert'];
export type MannaEntryUpdate = PublicTables['manna_entries']['Update'];

export type GratitudeNote = PublicTables['gratitude_notes']['Row'];
export type GratitudeNoteInsert = PublicTables['gratitude_notes']['Insert'];
export type GratitudeNoteUpdate = PublicTables['gratitude_notes']['Update'];

/** 가입 트리거로 자동 생성되는 기본 카테고리 표시명 (DB `name` 컬럼과 동일) */
export const MANNA_DEFAULT_CATEGORY_NAMES = ['감사', '사랑', '위로', '소망', '믿음'] as const;

export type MannaDefaultCategoryName = (typeof MANNA_DEFAULT_CATEGORY_NAMES)[number];
