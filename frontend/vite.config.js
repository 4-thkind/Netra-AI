import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,          // listen on 0.0.0.0 so phones on the LAN can reach it
    allowedHosts: true,  // accept tunnel hostnames (*.trycloudflare.com)
    proxy: {
      // Same-origin API: the browser only ever talks to this port, so one
      // tunnel URL serves the whole app and there is no CORS or mixed-content.
      '/api': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/health': { target: 'http://127.0.0.1:8000', changeOrigin: true },
    },
  },
});
