import { BookMarked, BookOpen, ChevronRight, Heart, PenLine, PlusCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';
import type { ReactElement, ReactNode } from 'react';

import type { HomeFeedData } from '@/app/actions/home';
import { homeShellCardClass, homeToneStyles, type HomeTone } from '@/components/home/homeTones';
import { cn } from '@/lib/utils';

function previewText(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

export function HomeDashboard({
  feed,
  compact = false,
}: {
  feed: HomeFeedData;
  /** 홈 상단에 다른 블록이 있을 때 세로 높이를 줄입니다 */
  compact?: boolean;
}): ReactElement {
  return (
    <div className={homeShellCardClass}>
      <div className="border-b border-[var(--border)] bg-gradient-to-br from-[var(--background)] via-[var(--card)] to-[var(--background)] px-5 py-4 md:px-6 md:py-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--foreground)]/5 ring-1 ring-[var(--border)]">
            <Sparkles className="h-5 w-5 text-[var(--foreground)]" aria-hidden />
          </div>
          <div>
            <h2 className="text-base font-semibold tracking-tight text-[var(--foreground)]">최근 기록</h2>
            <p className="mt-0.5 text-sm leading-relaxed text-[var(--muted)]">
              {compact
                ? '가장 최근에 남긴 기록이에요. 카드를 눌러 열 수 있습니다.'
                : '가장 최근에 남긴 묵상, 말씀, 감사 노트예요. 카드를 눌러 상세로 이동합니다.'}
            </p>
          </div>
        </div>
      </div>

      <div
        className={
          compact
            ? 'grid grid-rows-3 gap-0 divide-y divide-[var(--border)] p-3 md:p-4'
            : 'grid min-h-[min(68vh,640px)] grid-rows-3 gap-0 divide-y divide-[var(--border)] p-3 md:p-4'
        }
      >
        <FeedRow
          compact={compact}
          tone="amber"
          title="묵상"
          description="그날의 묵상"
          icon={<BookOpen className="h-4 w-4" aria-hidden />}
          listHref="/meditation"
          newHref="/meditation/new"
        >
          {feed.meditation ? (
            <FeedPreviewLink
              compact={compact}
              href={`/meditation/${feed.meditation.id}`}
              tone="amber"
              meta={feed.meditation.meditation_date}
              title={
                feed.meditation.items[0]?.title ??
                feed.meditation.items[0]?.verse_reference ??
                '묵상 보기'
              }
              body={previewText(feed.meditation.items[0]?.content ?? '', 200)}
            />
          ) : (
            <FeedEmpty
              compact={compact}
              tone="amber"
              message="아직 묵상 기록이 없습니다."
              href="/meditation/new"
              actionLabel="묵상 작성하기"
            />
          )}
        </FeedRow>

        <FeedRow
          compact={compact}
          tone="sky"
          title="만나"
          description="말씀과 본문"
          icon={<BookMarked className="h-4 w-4" aria-hidden />}
          listHref="/manna"
          newHref="/manna/new"
        >
          {feed.manna ? (
            <FeedPreviewLink
              compact={compact}
              href={`/manna/${feed.manna.id}`}
              tone="sky"
              meta={`${feed.manna.entry_date} · ${feed.manna.category_name}`}
              title={feed.manna.verse_reference}
              body={previewText(feed.manna.verse_text, 200)}
            />
          ) : (
            <FeedEmpty
              compact={compact}
              tone="sky"
              message="아직 말씀이 없습니다."
              href="/manna/new"
              actionLabel="말씀 추가하기"
            />
          )}
        </FeedRow>

        <FeedRow
          compact={compact}
          tone="rose"
          title="감사 기록"
          description="감사 노트"
          icon={<Heart className="h-4 w-4" aria-hidden />}
          listHref="/gratitude"
          newHref="/gratitude/new"
        >
          {feed.gratitude ? (
            <FeedPreviewLink
              compact={compact}
              href={`/gratitude/${feed.gratitude.id}`}
              tone="rose"
              meta={feed.gratitude.note_date}
              title={feed.gratitude.title}
              body={previewText(feed.gratitude.content, 200)}
            />
          ) : (
            <FeedEmpty
              compact={compact}
              tone="rose"
              message="아직 감사 노트가 없습니다."
              href="/gratitude/new"
              actionLabel="감사 노트 쓰기"
            />
          )}
        </FeedRow>
      </div>
    </div>
  );
}

function FeedRow({
  compact,
  tone,
  title,
  description,
  icon,
  listHref,
  newHref,
  children,
}: {
  compact?: boolean;
  tone: HomeTone;
  title: string;
  description: string;
  icon: ReactNode;
  listHref: string;
  newHref: string;
  children: ReactNode;
}): ReactElement {
  const t = homeToneStyles[tone];
  return (
    <section className="flex min-h-0 flex-1 flex-col gap-3 py-4 first:pt-2 last:pb-2 md:flex-row md:items-stretch md:gap-4 md:py-5">
      <div className="flex shrink-0 items-start gap-3 md:w-[200px] md:flex-col md:gap-2">
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', t.iconWrap)}>{icon}</div>
        <div className="min-w-0 flex-1 md:w-full">
          <div className={cn('h-0.5 w-12 rounded-full bg-gradient-to-r md:w-16', t.bar)} />
          <h3 className="mt-2 text-sm font-semibold tracking-tight text-[var(--foreground)]">{title}</h3>
          <p className="text-xs text-[var(--muted)]">{description}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href={newHref}
              className={cn(
                'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors',
                t.link,
              )}
            >
              <PenLine className="mr-1 h-3 w-3 opacity-70" aria-hidden />
              새로 작성
            </Link>
            <Link
              href={listHref}
              className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--background)]/60 px-3 py-1 text-xs font-medium text-[var(--muted)] transition-colors hover:border-[var(--foreground)]/20 hover:text-[var(--foreground)] dark:bg-[var(--card)]/60"
            >
              전체 목록
            </Link>
          </div>
        </div>
      </div>
      <div
        className={
          compact ? 'min-h-[96px] min-w-0 flex-1 md:min-h-[88px]' : 'min-h-[120px] min-w-0 flex-1 md:min-h-[100px]'
        }
      >
        {children}
      </div>
    </section>
  );
}

function FeedPreviewLink({
  href,
  tone,
  meta,
  title,
  body,
  compact,
}: {
  href: string;
  tone: HomeTone;
  meta: string;
  title: string;
  body: string;
  compact?: boolean;
}): ReactElement {
  const t = homeToneStyles[tone];
  return (
    <Link
      href={href}
      className={cn(
        'group flex h-full flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--background)]/40 p-4 ring-1 ring-transparent transition-all hover:border-[var(--foreground)]/10 hover:bg-[var(--card)] hover:shadow-md hover:ring-[var(--foreground)]/5 dark:bg-[var(--foreground)]/[0.03] dark:hover:bg-[var(--card)]',
        compact ? 'min-h-[96px]' : 'min-h-[120px]',
      )}
    >
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--muted)]">{meta}</p>
        <p className="mt-1.5 line-clamp-2 text-sm font-semibold leading-snug text-[var(--foreground)] group-hover:text-[var(--foreground)]">
          {title}
        </p>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--muted)]">{body}</p>
      </div>
      <span
        className={cn(
          'mt-3 inline-flex items-center text-xs font-medium transition-transform group-hover:translate-x-0.5',
          t.icon,
        )}
      >
        자세히 보기
        <ChevronRight className="ml-0.5 h-3.5 w-3.5" aria-hidden />
      </span>
    </Link>
  );
}

function FeedEmpty({
  compact,
  tone,
  message,
  href,
  actionLabel,
}: {
  compact?: boolean;
  tone: HomeTone;
  message: string;
  href: string;
  actionLabel: string;
}): ReactElement {
  const t = homeToneStyles[tone];
  return (
    <div
      className={cn(
        'flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--background)]/30 px-4 py-6 text-center dark:bg-[var(--foreground)]/[0.02]',
        compact ? 'min-h-[96px]' : 'min-h-[120px]',
      )}
    >
      <PlusCircle className={cn('mb-2 h-8 w-8', t.emptyIcon)} aria-hidden />
      <p className="text-sm text-[var(--muted)]">{message}</p>
      <Link
        href={href}
        className={cn(
          'mt-4 inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition-colors',
          t.link,
        )}
      >
        {actionLabel}
      </Link>
    </div>
  );
}

export function HomeQuickNav({ showLogin }: { showLogin: boolean }): ReactElement {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs font-medium uppercase tracking-widest text-[var(--muted)]">바로가기</p>
      <div className="flex flex-wrap gap-2">
        <NavPill href="/meditation" primary icon={<BookOpen className="h-4 w-4" />}>
          묵상 목록
        </NavPill>
        <NavPill href="/manna" icon={<BookMarked className="h-4 w-4" />}>
          만나 목록
        </NavPill>
        <NavPill href="/gratitude" icon={<Heart className="h-4 w-4" />}>
          감사노트
        </NavPill>
        {showLogin ? (
          <NavPill href="/login" icon={<ChevronRight className="h-4 w-4" />}>
            로그인
          </NavPill>
        ) : null}
      </div>
    </div>
  );
}

function NavPill({
  href,
  children,
  icon,
  primary,
}: {
  href: string;
  children: ReactNode;
  icon: ReactNode;
  primary?: boolean;
}): ReactElement {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-all',
        primary
          ? 'border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)] shadow-sm hover:opacity-90'
          : 'border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:border-[var(--foreground)]/25 hover:shadow-sm',
      )}
    >
      {icon}
      {children}
    </Link>
  );
}
