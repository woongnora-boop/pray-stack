import { BookMarked, BookOpen, ChevronRight, Heart, PenLine, PlusCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';
import type { ReactElement, ReactNode } from 'react';

import type { HomeFeedData } from '@/app/actions/home';
import { MeditationHighlightedBody } from '@/components/meditation/MeditationHighlightedBody';
import { MannaCategoryTag } from '@/components/manna/MannaCategoryTag';
import { hasAnyParagraphHighlight } from '@/lib/meditation-paragraph-highlights';
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
  if (compact) {
    return (
      <div className={homeShellCardClass}>
        <div className="border-b border-[var(--border)] bg-gradient-to-br from-[var(--background)] via-[var(--card)] to-[var(--background)] px-4 py-3 md:px-5 md:py-3.5">
          <div className="flex items-start gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--foreground)]/5 ring-1 ring-[var(--border)]">
              <Sparkles className="h-4 w-4 text-[var(--foreground)]" aria-hidden />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-[var(--foreground)]">최근 기록</h2>
              <p className="mt-0.5 text-xs leading-relaxed text-[var(--muted)]">묵상 · 만나 · 감사를 한눈에 볼 수 있어요.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 p-3 md:grid-cols-3 md:gap-3 md:p-4">
          <HomeCompactColumn
            tone="amber"
            title="묵상"
            description="그날의 묵상"
            icon={<BookOpen className="h-3.5 w-3.5" aria-hidden />}
            listHref="/meditation"
            newHref="/meditation/new"
          >
            {feed.meditation ? (
              <CompactPreviewLink
                href={`/meditation/${feed.meditation.id}`}
                tone="amber"
                meta={feed.meditation.meditation_date}
                title={
                  feed.meditation.items[0]?.title ??
                  feed.meditation.items[0]?.verse_reference ??
                  '묵상 보기'
                }
                body={previewText(feed.meditation.items[0]?.content ?? '', 72)}
                bodyPreview={(() => {
                  const first = feed.meditation?.items[0];
                  if (!first || !hasAnyParagraphHighlight(first.paragraph_highlights) || !first.content?.trim()) {
                    return undefined;
                  }
                  return (
                    <MeditationHighlightedBody
                      content={first.content}
                      highlights={first.paragraph_highlights}
                      compact
                      maxParagraphs={2}
                    />
                  );
                })()}
              />
            ) : (
              <CompactFeedEmpty
                tone="amber"
                message="기록 없음"
                href="/meditation/new"
                actionLabel="작성"
              />
            )}
          </HomeCompactColumn>

          <HomeCompactColumn
            tone="sky"
            title="만나"
            description="말씀과 본문"
            icon={<BookMarked className="h-3.5 w-3.5" aria-hidden />}
            listHref="/manna"
            newHref="/manna/new"
          >
            {feed.manna ? (
              <CompactPreviewLink
                href={`/manna/${feed.manna.id}`}
                tone="sky"
                meta={
                  <>
                    <span>{feed.manna.entry_date}</span>
                    <MannaCategoryTag
                      categoryId={feed.manna.category_id}
                      name={feed.manna.category_name}
                      size="xs"
                    />
                  </>
                }
                title={feed.manna.verse_reference}
                body={previewText(feed.manna.verse_text, 72)}
              />
            ) : (
              <CompactFeedEmpty tone="sky" message="기록 없음" href="/manna/new" actionLabel="추가" />
            )}
          </HomeCompactColumn>

          <HomeCompactColumn
            tone="rose"
            title="감사"
            description="감사 노트"
            icon={<Heart className="h-3.5 w-3.5" aria-hidden />}
            listHref="/gratitude"
            newHref="/gratitude/new"
            footer={
              feed.gratitudeWeekKeywords.length > 0 ? (
                <div className="mt-2 space-y-1">
                  <p className="text-[10px] font-medium text-[var(--muted)]">이번 주 키워드</p>
                  <div className="flex flex-wrap gap-1">
                    {feed.gratitudeWeekKeywords.slice(0, 6).map((k) => (
                      <Link
                        key={k.term}
                        href="/gratitude/keywords"
                        className="inline-flex items-center gap-0.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-900 dark:text-rose-100"
                      >
                        {k.term}
                        <span className="tabular-nums font-medium text-rose-700/70 dark:text-rose-200/70">{k.count}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null
            }
          >
            {feed.gratitude ? (
              <CompactPreviewLink
                href={`/gratitude/${feed.gratitude.id}`}
                tone="rose"
                meta={feed.gratitude.note_date}
                title={feed.gratitude.title}
                body={previewText(feed.gratitude.content, 72)}
              />
            ) : (
              <CompactFeedEmpty tone="rose" message="기록 없음" href="/gratitude/new" actionLabel="쓰기" />
            )}
          </HomeCompactColumn>
        </div>
      </div>
    );
  }

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
              가장 최근에 남긴 묵상, 말씀, 감사 노트예요. 카드를 눌러 상세로 이동합니다.
            </p>
          </div>
        </div>
      </div>

      <div className="grid min-h-[min(68vh,640px)] grid-rows-3 gap-0 divide-y divide-[var(--border)] p-3 md:p-4">
        <FeedRow
          tone="amber"
          title="묵상"
          description="그날의 묵상"
          icon={<BookOpen className="h-4 w-4" aria-hidden />}
          listHref="/meditation"
          newHref="/meditation/new"
        >
          {feed.meditation ? (
            <FeedPreviewLink
              href={`/meditation/${feed.meditation.id}`}
              tone="amber"
              meta={feed.meditation.meditation_date}
              title={
                feed.meditation.items[0]?.title ??
                feed.meditation.items[0]?.verse_reference ??
                '묵상 보기'
              }
              body={previewText(feed.meditation.items[0]?.content ?? '', 200)}
              bodyPreview={(() => {
                const first = feed.meditation?.items[0];
                if (!first || !hasAnyParagraphHighlight(first.paragraph_highlights) || !first.content?.trim()) {
                  return undefined;
                }
                return (
                  <MeditationHighlightedBody
                    content={first.content}
                    highlights={first.paragraph_highlights}
                    compact
                    maxParagraphs={3}
                  />
                );
              })()}
            />
          ) : (
            <FeedEmpty
              tone="amber"
              message="아직 묵상 기록이 없습니다."
              href="/meditation/new"
              actionLabel="묵상 작성하기"
            />
          )}
        </FeedRow>

        <FeedRow
          tone="sky"
          title="만나"
          description="말씀과 본문"
          icon={<BookMarked className="h-4 w-4" aria-hidden />}
          listHref="/manna"
          newHref="/manna/new"
        >
          {feed.manna ? (
            <FeedPreviewLink
              href={`/manna/${feed.manna.id}`}
              tone="sky"
              meta={
                <>
                  <span className="uppercase tracking-wider">{feed.manna.entry_date}</span>
                  <MannaCategoryTag
                    categoryId={feed.manna.category_id}
                    name={feed.manna.category_name}
                    size="xs"
                  />
                </>
              }
              title={feed.manna.verse_reference}
              body={previewText(feed.manna.verse_text, 200)}
            />
          ) : (
            <FeedEmpty tone="sky" message="아직 말씀이 없습니다." href="/manna/new" actionLabel="말씀 추가하기" />
          )}
        </FeedRow>

        <FeedRow
          tone="rose"
          title="감사 기록"
          description="감사 노트"
          icon={<Heart className="h-4 w-4" aria-hidden />}
          listHref="/gratitude"
          newHref="/gratitude/new"
          below={
            feed.gratitudeWeekKeywords.length > 0 ? (
              <div className="space-y-1.5">
                <p className="text-[11px] font-medium text-[var(--muted)]">이번 주 감사 키워드</p>
                <div className="flex flex-wrap gap-1.5">
                  {feed.gratitudeWeekKeywords.slice(0, 8).map((k) => (
                    <Link
                      key={k.term}
                      href="/gratitude/keywords"
                      className="inline-flex items-center gap-1 rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-900 transition-colors [@media(hover:hover)]:hover:border-rose-500/35 dark:text-rose-100"
                    >
                      {k.term}
                      <span className="tabular-nums text-[11px] font-medium text-rose-700/75 dark:text-rose-200/75">{k.count}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null
          }
        >
          {feed.gratitude ? (
            <FeedPreviewLink
              href={`/gratitude/${feed.gratitude.id}`}
              tone="rose"
              meta={feed.gratitude.note_date}
              title={feed.gratitude.title}
              body={previewText(feed.gratitude.content, 200)}
            />
          ) : (
            <FeedEmpty
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

function HomeCompactColumn({
  tone,
  title,
  description,
  icon,
  listHref,
  newHref,
  children,
  footer,
}: {
  tone: HomeTone;
  title: string;
  description: string;
  icon: ReactNode;
  listHref: string;
  newHref: string;
  children: ReactNode;
  footer?: ReactNode;
}): ReactElement {
  const t = homeToneStyles[tone];
  return (
    <div className="flex min-h-0 flex-col rounded-xl border border-[var(--border)] bg-[var(--background)]/35 p-3 dark:bg-[var(--foreground)]/[0.03]">
      <div className="mb-2 flex items-center gap-2">
        <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', t.iconWrap)}>{icon}</div>
        <div className="min-w-0">
          <h3 className="text-xs font-semibold tracking-tight text-[var(--foreground)]">{title}</h3>
          <p className="text-[10px] leading-tight text-[var(--muted)]">{description}</p>
        </div>
      </div>
      <div className="min-h-0 flex-1">{children}</div>
      <div className="mt-2 flex flex-wrap gap-1">
        <Link
          href={newHref}
          className={cn(
            'inline-flex items-center rounded-full px-2 py-1 text-[10px] font-semibold transition-colors',
            t.link,
          )}
        >
          <PenLine className="mr-0.5 h-2.5 w-2.5 opacity-70" aria-hidden />
          새 글
        </Link>
        <Link
          href={listHref}
          className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--card)]/80 px-2 py-1 text-[10px] font-medium text-[var(--muted)] transition-colors [@media(hover:hover)]:hover:text-[var(--foreground)] active:text-[var(--foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
        >
          목록
        </Link>
      </div>
      {footer ? <div className="mt-2 border-t border-[var(--border)]/60 pt-2">{footer}</div> : null}
    </div>
  );
}

function CompactPreviewLink({
  href,
  tone,
  meta,
  title,
  body,
  bodyPreview,
}: {
  href: string;
  tone: HomeTone;
  meta: ReactNode;
  title: string;
  body: string;
  /** 있으면 본문 미리보기 대신 렌더(묵상 형광 등) */
  bodyPreview?: ReactNode;
}): ReactElement {
  const t = homeToneStyles[tone];
  return (
    <Link
      href={href}
      className={cn(
        'group block rounded-lg border border-[var(--border)]/90 bg-[var(--card)]/50 p-2.5 ring-1 ring-transparent transition-all',
        '[@media(hover:hover)]:hover:border-[var(--foreground)]/12 [@media(hover:hover)]:hover:bg-[var(--card)] [@media(hover:hover)]:hover:shadow-sm [@media(hover:hover)]:hover:ring-[var(--foreground)]/5',
        'active:border-[var(--foreground)]/12 active:bg-[var(--card)] active:shadow-sm active:ring-[var(--foreground)]/5',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]',
      )}
    >
      <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-medium text-[var(--muted)]">{meta}</div>
      <p className="mt-0.5 line-clamp-1 text-xs font-semibold leading-snug text-[var(--foreground)]">{title}</p>
      {bodyPreview ? (
        <div className="mt-1 w-full text-[var(--foreground)]">{bodyPreview}</div>
      ) : (
        <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-[var(--muted)]">{body}</p>
      )}
      <span className={cn('mt-2 inline-flex items-center text-[10px] font-semibold', t.icon)}>
        보기
        <ChevronRight className="ml-0.5 h-3 w-3" aria-hidden />
      </span>
    </Link>
  );
}

function CompactFeedEmpty({
  tone,
  message,
  href,
  actionLabel,
}: {
  tone: HomeTone;
  message: string;
  href: string;
  actionLabel: string;
}): ReactElement {
  const t = homeToneStyles[tone];
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--background)]/25 px-2 py-5 text-center dark:bg-[var(--foreground)]/[0.02]">
      <PlusCircle className={cn('mb-1.5 h-6 w-6', t.emptyIcon)} aria-hidden />
      <p className="text-[11px] text-[var(--muted)]">{message}</p>
      <Link href={href} className={cn('mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold', t.link)}>
        {actionLabel}
      </Link>
    </div>
  );
}

function FeedRow({
  tone,
  title,
  description,
  icon,
  listHref,
  newHref,
  children,
  below,
}: {
  tone: HomeTone;
  title: string;
  description: string;
  icon: ReactNode;
  listHref: string;
  newHref: string;
  children: ReactNode;
  below?: ReactNode;
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
              className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--background)]/60 px-3 py-1 text-xs font-medium text-[var(--muted)] transition-colors [@media(hover:hover)]:hover:border-[var(--foreground)]/20 [@media(hover:hover)]:hover:text-[var(--foreground)] active:border-[var(--foreground)]/20 active:text-[var(--foreground)] dark:bg-[var(--card)]/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
            >
              전체 목록
            </Link>
          </div>
        </div>
      </div>
      <div className="flex min-h-[120px] min-w-0 flex-1 flex-col gap-2 md:min-h-[100px]">
        {children}
        {below}
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
  bodyPreview,
}: {
  href: string;
  tone: HomeTone;
  meta: ReactNode;
  title: string;
  body: string;
  bodyPreview?: ReactNode;
}): ReactElement {
  const t = homeToneStyles[tone];
  return (
    <Link
      href={href}
      className={cn(
        'group flex h-full min-h-[120px] flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--background)]/40 p-4 ring-1 ring-transparent transition-all dark:bg-[var(--foreground)]/[0.03]',
        '[@media(hover:hover)]:hover:border-[var(--foreground)]/10 [@media(hover:hover)]:hover:bg-[var(--card)] [@media(hover:hover)]:hover:shadow-md [@media(hover:hover)]:hover:ring-[var(--foreground)]/5 dark:[@media(hover:hover)]:hover:bg-[var(--card)]',
        'active:border-[var(--foreground)]/10 active:bg-[var(--card)] active:shadow-md active:ring-[var(--foreground)]/5 dark:active:bg-[var(--card)]',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]',
      )}
    >
      <div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-[var(--muted)]">{meta}</div>
        <p className="mt-1.5 line-clamp-2 text-sm font-semibold leading-snug text-[var(--foreground)] [@media(hover:hover)]:group-hover:text-[var(--foreground)]">
          {title}
        </p>
        {bodyPreview ? (
          <div className="mt-2 w-full text-[var(--foreground)]">{bodyPreview}</div>
        ) : (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--muted)]">{body}</p>
        )}
      </div>
      <span
        className={cn(
          'mt-3 inline-flex items-center text-xs font-medium transition-transform [@media(hover:hover)]:group-hover:translate-x-0.5',
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
  tone,
  message,
  href,
  actionLabel,
}: {
  tone: HomeTone;
  message: string;
  href: string;
  actionLabel: string;
}): ReactElement {
  const t = homeToneStyles[tone];
  return (
    <div className="flex h-full min-h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--background)]/30 px-4 py-6 text-center dark:bg-[var(--foreground)]/[0.02]">
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
        'inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]',
        primary
          ? 'border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)] shadow-sm [@media(hover:hover)]:hover:opacity-90 active:opacity-90'
          : 'border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] [@media(hover:hover)]:hover:border-[var(--foreground)]/25 [@media(hover:hover)]:hover:shadow-sm active:border-[var(--foreground)]/25 active:shadow-sm',
      )}
    >
      {icon}
      {children}
    </Link>
  );
}
