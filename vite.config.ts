import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Car Advisor Pro',
        short_name: 'CarAdvisor',
        description: 'Tu asesor experto en coches',
        start_url: '/?utm_source=pwa',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#2563eb',
        orientation: 'portrait',
        icons: [
          {
            src: 'web-app-manifest-192x192.png?v=2',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'web-app-manifest-512x512.png?v=2',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
        ],
      },
    }),
  ],
});
