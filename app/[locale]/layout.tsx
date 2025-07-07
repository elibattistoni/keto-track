import { ColorSchemeScript, mantineHtmlProps, MantineProvider } from '@mantine/core';
import { NextAuthSessionProvider } from '@/components/auth';
import { AffixMenu, Header } from '@/components/layout';
import { routing } from '@/i18n/routing';
import { theme } from '@/theme';

import '@mantine/core/styles.css';

import { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

export const metadata = {
  title: 'Keto Track App',
  description: 'The best ketogenic diet tracking app that exists!',
};

export default async function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Ensure that the incoming `locale` is valid
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <MantineProvider theme={theme} defaultColorScheme="light">
            <NextAuthSessionProvider>
              <Header />
              {children}
              <AffixMenu />
            </NextAuthSessionProvider>
          </MantineProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
