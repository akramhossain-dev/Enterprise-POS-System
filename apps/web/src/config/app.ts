export const appConfig = {
  name: 'Enterprise POS',
  shortName: 'EPOS',
  description: 'Enterprise-grade Point of Sale and Retail Management System',
  version: '1.0.0',
  url: process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000',
  author: 'Enterprise POS Team',
  locale: 'en-US',
  timezone: 'UTC',
  currency: {
    code: 'USD',
    symbol: '$',
    locale: 'en-US',
  },
  dateFormat: 'MM/dd/yyyy',
  timeFormat: 'HH:mm',
  dateTimeFormat: 'MM/dd/yyyy HH:mm',
  pagination: {
    defaultPageSize: 25,
    pageSizeOptions: [10, 25, 50, 100],
  },
  seo: {
    defaultTitle: 'Enterprise POS System',
    titleTemplate: '%s | Enterprise POS',
    defaultDescription: 'Production-grade enterprise point of sale and retail management platform.',
    defaultImage: '/og-image.png',
    twitterHandle: '@enterprisepos',
  },
  sidebar: {
    defaultCollapsed: false,
    mobileBreakpoint: 768,
  },
} as const;

export type AppConfig = typeof appConfig;
