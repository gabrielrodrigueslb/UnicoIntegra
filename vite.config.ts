// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import tailwindcss from '@tailwindcss/vite'

const packageJsonPath = path.resolve(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
  plugins: [react(),tailwindcss()],
  server: {
    proxy: {
      '/ai-services': {
        target: 'https://unicocontato.tech',
        changeOrigin: true,
        secure: true,
      },
    },
    fs: {
      allow: [
        path.resolve(__dirname, 'src'), // permite a pasta src
        path.resolve(__dirname, 'src/templates'), // permite a pasta de templates
        path.resolve(__dirname)
      ]
    }
  }
});
