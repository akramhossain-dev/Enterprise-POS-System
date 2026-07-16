import { MetadataRoute } from 'next';
import { appConfig } from '@/config/app';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = appConfig?.url || 'https://enterprise-pos.com';
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/pos/', '/accounting/closing'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
