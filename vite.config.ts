import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/historiasAdo/",
  define: {
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
  },
  build: {
    chunkSizeWarningLimit: 2500,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('jspdf') || id.includes('jspdf-autotable')) {
              return 'jspdf';
            }
            if (id.includes('lucide-svelte')) {
              return 'lucide';
            }
            if (id.includes('html2canvas')) {
              return 'html2canvas';
            }
          }
        },
      },
    },
  },
  plugins: [
    svelte(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons.png", "vite.svg"],
      manifest: {
        name: "HistoriasAdo - Sistema de Gestión de Pacientes",
        short_name: "HistoriasAdo",
        description: "Sistema de gestión de pacientes odontológicos",
        theme_color: "#2563eb",
        background_color: "#ffffff",
        display: "standalone",
        scope: "/historiasAdo/",
        start_url: "/historiasAdo/",
        icons: [
          {
            src: "icons.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icons.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        globPatterns: ["**/*.{js,css,html,svg,png,woff,woff2}"],
        globIgnores: ['node_modules/**/*', '**/paciente.json'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/(api|app)\..*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "image-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
        ],
      },
    }),
  ],
});
