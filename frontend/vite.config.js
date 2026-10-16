import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const encryptPublicKey = env.encrypt_public_key || process.env.encrypt_public_key || '';

  return {
    define: {
      __ENCRYPT_PUBLIC_KEY__: JSON.stringify(encryptPublicKey)
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
        manifest: {
          id: '/',
          name: 'Estoque Certo',
          short_name: 'Estoque Certo',
          description: 'Sistema de gestão de estoque da Zênite',
          start_url: '/',
          scope: '/',
          theme_color: '#D4AF37',
          background_color: '#1E1E1E',
          display: 'standalone',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        }
      })
    ],
    build: {
      chunkSizeWarningLimit: 1000
    }
  };
});