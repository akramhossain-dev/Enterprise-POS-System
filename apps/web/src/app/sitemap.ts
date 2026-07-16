import { MetadataRoute } from 'next';
import { appConfig } from '@/config/app';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = appConfig?.url || 'https://enterprise-pos.com';
  const routes = ['', '/dashboard', '/reports', '/bi'];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: route === '' ? 1 : 0.8,
  }));
}
