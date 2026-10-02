# Emma Expert — Portfolio

Site statique Astro 7 / TypeScript, réalisé à partir du portfolio PDF d’Emma Expert. Les projets sont gérés par les Content Collections dans `src/content/projects`. Les images et les planches proviennent exclusivement du PDF ; aucun visuel de projet n’est généré.

## Démarrer

Node.js 22.12 minimum, ou une version récente compatible avec Astro 7.

```sh
npm install
npm run dev
```

Ouvrir l’adresse affichée par Astro. `npm run check` vérifie les types et les composants ; `npm run build` produit le site statique dans `dist/`. `npm run preview` prévisualise cette version.

## Contenus et images

- `src/content/projects/*.json` : neuf chapitres, textes, métadonnées, galerie et numéro de page source.
- `src/data/profile.ts` : présentation, expériences et outils.
- `src/assets/` : images extraites et planches du portfolio.
- `public/portfolio-emma-expert-2026.pdf` : document original téléchargeable.
- `src/styles/` : tokens, typographie, styles éditoriaux et responsive.

Les pages originales sont conservées dans les galeries pour présenter fidèlement les plans, annotations, dessins et détails techniques. Le bouton Agrandir ouvre une vue accessible au clavier ; Échap la ferme. Les images sont optimisées par Astro en AVIF et WebP avec tailles responsives. Les polices sont hébergées localement.

Le PDF situe le stage BPA en **2024**. Les dates des projets académiques ne sont pas indiquées et ne sont donc pas inventées. Les identifiants sociaux sont présentés sans URL, faute de liens définitifs confirmés.

## Déploiement Cloudflare Pages

Choisir une compilation `npm run build` et le dossier de sortie `dist`. Aucun backend ni adaptateur n’est nécessaire.

Définir `PUBLIC_SITE_URL` avec l’URL publique réelle du site dans les variables d’environnement du déploiement. Cette variable active les URLs canoniques, les liens OpenGraph et la génération du sitemap. Le fichier `robots.txt` référence alors `sitemap-index.xml`. Sans domaine confirmé, le site reste utilisable et aucun domaine fictif n’est publié.

## Vérification navigateur

```sh
node scripts/verify.mjs
```

Ce script utilise Chrome installé sur macOS, ou le binaire indiqué par `CHROME_PATH`. Il teste navigation, routes projets, menu mobile, galeries, absence de débordements et erreurs JavaScript. Définir `TEST_URL` si le serveur utilise une adresse différente de `http://localhost:4321`.

Les objectifs Lighthouse du brief doivent être mesurés sur la version de production ; ils ne sont pas des scores garantis.

## Références de conception

Principes de clarté et de continuité : https://www.ui-skills.com/skills/emilkowalski/apple-design

Direction frontend : https://agenticskills.io/skills/frontend-design

Accessibilité et interactions : https://vercel.com/design/guidelines

Références UI/UX : https://github.com/nextlevelbuilder/ui-ux-pro-max-skill

Architecture Astro : https://github.com/incluud/astro-agent-skills et https://docs.astro.build/
