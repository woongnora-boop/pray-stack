import type { ReactElement, ReactNode } from 'react';

import { GratitudeStackClient } from '@/components/gratitude/GratitudeStackClient';

export default function GratitudeLayout({ children }: { children: ReactNode }): ReactElement {
  return <GratitudeStackClient>{children}</GratitudeStackClient>;
}
