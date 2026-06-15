// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// Sitio estático listo para Vercel (autodetecta Astro). Deploy en Vercel; se abandona GitHub Pages.
export default defineConfig({
  site: 'https://cyberplant.vercel.app',
  output: 'static',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
