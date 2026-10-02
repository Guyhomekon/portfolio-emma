import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import schemaGraph from '@unschema-graph/astro/integration';
const site = process.env.PUBLIC_SITE_URL || 'https://emma-expert.guyhomekon.fr/';
export default defineConfig({ output: 'static', redirects: { '/a-propos/': '/about/', '/projets/': '/projects/' }, i18n: { defaultLocale: 'en', locales: ['en', 'fr'], routing: { prefixDefaultLocale: false } }, site, integrations: [sitemap(), schemaGraph({ onError: 'throw' })], });
