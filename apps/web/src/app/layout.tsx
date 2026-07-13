import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/providers';
import '@/styles/globals.css';
import { appConfig } from '@/config/app';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: appConfig.seo.defaultTitle,
    template: appConfig.seo.titleTemplate,
  },
  description: appConfig.seo.defaultDescription,
  applicationName: appConfig.name,
  authors: [{ name: appConfig.author }],
  creator: appConfig.author,
  metadataBase: new URL(appConfig.url),
  openGraph: {
    type: 'website',
    siteName: appConfig.name,
    title: appConfig.seo.defaultTitle,
    description: appConfig.seo.defaultDescription,
    images: [{ url: appConfig.seo.defaultImage, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    creator: appConfig.seo.twitterHandle,
  },
  robots: {
    index: false, // enterprise app — no public indexing
    follow: false,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0f1e' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
