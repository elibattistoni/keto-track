'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { SegmentedControl } from '@mantine/core';
import { Link, usePathname } from '@/i18n/navigation';

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const [value, setValue] = useState(locale);

  return (
    <SegmentedControl
      value={value}
      onChange={setValue}
      data={[
        {
          value: 'en',
          label: (
            <Link href={pathname} locale="en" aria-current={locale === 'en' ? 'page' : undefined}>
              EN
            </Link>
          ),
        },
        {
          value: 'it',
          label: (
            <Link href={pathname} locale="it" aria-current={locale === 'it' ? 'page' : undefined}>
              IT
            </Link>
          ),
        },
      ]}
    />
  );
}
