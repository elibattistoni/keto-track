'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function LocaleSwitcher() {
  const pathname = usePathname();

  // Remove the current locale from the path and replace it
  const getPathWithLocale = (newLocale: string) => {
    const segments = pathname.split('/');
    segments[1] = newLocale; // Replace the locale segment
    return segments.join('/') || '/';
  };

  return (
    <nav style={{ border: '2px solid red' }}>
      <Link href={getPathWithLocale('en')} locale={false}>
        English
      </Link>{' '}
      |{' '}
      <Link href={getPathWithLocale('it')} locale={false}>
        Italiano
      </Link>
    </nav>
  );
}

// alternative
/*
'use client';

import { usePathname, useRouter } from 'next/navigation';

export default function LocaleSwitcher({ locale }) {
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(newLocale) {
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
  }

  return (
    <div>
      <button onClick={() => switchLocale('en')}>English</button>
      <button onClick={() => switchLocale('it')}>Italiano</button>
    </div>
  );
}

*/
