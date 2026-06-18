// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import keystatic from '@keystatic/astro';

// Deploy híbrido en Vercel: las páginas públicas se prerenderizan (estáticas);
// solo las rutas de Keystatic (/keystatic, /api/keystatic) corren on-demand.
export default defineConfig({
  site: 'https://cyberplant.vercel.app',
  output: 'static',
  adapter: vercel(),
  integrations: [react(), keystatic()],
  vite: {
    plugins: [tailwindcss()],
  },
});
