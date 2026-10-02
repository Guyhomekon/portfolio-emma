import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
const site = process.env.PUBLIC_SITE_URL;
export default defineConfig({ output: 'static', redirects: { '/a-propos/': '/about/', '/projets/': '/projects/' }, i18n: { defaultLocale: 'en', locales: ['en', 'fr'], routing: { prefixDefaultLocale: false } }, ...(site ? { site, integrations: [sitemap()] } : {}), });
