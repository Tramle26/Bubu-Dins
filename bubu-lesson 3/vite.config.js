import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * The /nessie proxy is not a convenience — it is load-bearing.
 *
 * api.nessieisreal.com is plain http. Its https URL answers but 302-redirects
 * back to http, so any browser on an https page blocks the request as mixed
 * content, with no console error the student would understand. Proxying through
 * the dev server (and through a serverless function in production) is the only
 * way the calls land. It also sidesteps CORS.
 */
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    proxy: {
      '/nessie': {
        target: 'https://prod-api.nessieisreal.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/nessie/, ''),
      },
    },
  },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 4096,
  },
});
