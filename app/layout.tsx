import { ColorSchemeScript, mantineHtmlProps, MantineProvider } from '@mantine/core';
import { Header } from '@/components';
import { theme } from '@/theme';

import '@mantine/core/styles.css';

import { ReactNode } from 'react';

// TODO  ADD FOOTER

export const metadata = {
  title: 'Keto Track App',
  description: 'The best ketogenic diet tracking app that exists!',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="light">
          <Header />
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
