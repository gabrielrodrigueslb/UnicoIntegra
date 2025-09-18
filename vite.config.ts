// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(),tailwindcss()],
  server: {
    fs: {
      allow: [
        path.resolve(__dirname, 'src'), // permite a pasta src
        path.resolve(__dirname, 'src/templates'), // permite a pasta de templates
        path.resolve(__dirname)
      ]
    }
  }
});
