import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
const site = process.env.PUBLIC_SITE_URL;
export default defineConfig({ output: 'static', ...(site ? { site, integrations: [sitemap()] } : {}), });
