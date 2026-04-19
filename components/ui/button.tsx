import { forwardRef, type ButtonHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'default', type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50',
        variant === 'default' && 'bg-[var(--accent)] text-[var(--background)] hover:opacity-90',
        variant === 'outline' &&
          'border border-[var(--border)] bg-transparent text-[var(--foreground)] hover:bg-[var(--border)]/40',
        variant === 'ghost' && 'bg-transparent text-[var(--foreground)] hover:bg-[var(--border)]/40',
        variant === 'destructive' && 'bg-red-600 text-white hover:bg-red-700',
        className,
      )}
      {...props}
    />
  );
});
