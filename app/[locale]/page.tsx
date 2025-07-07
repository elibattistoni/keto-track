import { getTranslations } from 'next-intl/server';
import { Welcome } from '@/components/layout';

// import { Link as NextIntlLink } from '@/i18n/navigation';

export default async function HomePage() {
  const t = await getTranslations('HomePage');
  return (
    <>
      <Welcome />
      <h1>Locale Page {t('greeting')}</h1>
      {/* <NextIntlLink href="/about">{t('about')}</NextIntlLink> */}
    </>
  );
}
