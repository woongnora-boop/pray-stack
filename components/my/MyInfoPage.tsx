import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import type { ReactElement } from 'react';

import { appCardClass } from '@/components/ui/app-card';
import type { MyContent } from '@/lib/my-pages-content';

export function MyInfoPage({
  content,
  extra,
  backHref = '/my',
  backLabel = '마이로 돌아가기',
}: {
  content: MyContent;
  extra?: ReactElement;
  backHref?: string;
  backLabel?: string;
}): ReactElement {
  return (
    <div className="space-y-4">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
      >
        <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
        {backLabel}
      </Link>

      <header>
        <h1 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">{content.title}</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">{content.description}</p>
      </header>

      <article className={appCardClass}>
        <p className="rounded-xl border border-[var(--border)] bg-[var(--background)]/60 px-4 py-3 text-sm leading-relaxed text-[var(--foreground)]">
          {content.summary}
        </p>

        {content.paragraphs?.length ? (
          <div className="mt-5 space-y-3 text-sm leading-relaxed text-[var(--foreground)]">
            {content.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        ) : null}

        {content.sections?.length ? (
          <div className="mt-6 space-y-5">
            {content.sections.map((section) => (
              <section key={section.heading} className="space-y-2">
                <h2 className="text-sm font-semibold text-[var(--foreground)]">{section.heading}</h2>
                {section.intro ? <p className="text-sm text-[var(--muted)]">{section.intro}</p> : null}
                {section.items?.length ? (
                  <ul className="space-y-1.5 pl-5 text-sm leading-relaxed text-[var(--foreground)]">
                    {section.items.map((item) => (
                      <li key={item} className="list-disc">
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>
        ) : null}

        {extra ? <div className="mt-6 border-t border-[var(--border)] pt-4">{extra}</div> : null}

        {content.footerNote ? (
          <p className="mt-6 text-xs leading-relaxed text-[var(--muted)]">{content.footerNote}</p>
        ) : null}
      </article>
    </div>
  );
}
