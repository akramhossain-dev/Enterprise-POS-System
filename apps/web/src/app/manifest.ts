import { MetadataRoute } from 'next';
import { appConfig } from '@/config/app';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: appConfig?.name || 'Enterprise POS System',
    short_name: 'EPOS',
    description: 'Production-grade retail management platform',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#0c1220',
    theme_color: '#0c1220',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
