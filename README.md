# Emma Expert - Portfolio

Site statique Astro 7 / TypeScript, réalisé à partir du portfolio PDF d’Emma Expert. Les projets sont gérés par les Content Collections dans `src/content/projects`. Les images et les planches proviennent du PDF. Les 10 visuels individuels ont ensuite été améliorés avec imagegen ; certains détails sont reconstruits par IA. Les originaux sont conservés dans `images/originals/`, les sorties IA dans `images/restored/` et le traitement est documenté dans `images/restoration.md`.

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

Les galeries conservent la mise en page et les textes du PDF, avec les images intégrées restaurées individuellement. Les originaux restent sauvegardés dans `images/pdf-originals/` et `images/originals/`. Le bouton Agrandir ouvre une vue accessible au clavier ; Échap la ferme. Les planches sont rendues depuis le PDF en 3 840 pixels de largeur, puis optimisées par Astro en WebP à une qualité de 90, avec des tailles responsives allant jusqu’à la résolution source pour les écrans Retina et la vue agrandie. Pour reconstruire les planches avec les 118 visuels restaurés : `python scripts/rebuild-gallery.py` avec PyMuPDF installé. Le script `swift scripts/render-portfolio.swift` rend uniquement les planches du PDF original, sans restauration des images intégrées. Les visuels individuels améliorés sont intégrés avec au moins 1 920 pixels de largeur et 1 080 pixels de hauteur, avec leurs proportions d’origine. Ce traitement et le redimensionnement ne constituent pas une source native Full HD ; les visuels des planches ont également été restaurés individuellement. Les annotations incluses dans une image peuvent différer de la source ; les textes natifs du PDF sont conservés. Les polices sont hébergées localement.

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

## Langues

L’anglais est la langue par défaut (`/`, `/projects/`, `/about/`, `/contact/`). Le français est accessible sous `/fr/` (`/fr/projets/`, `/fr/a-propos/`, `/fr/contact/`). Le sélecteur EN / FR conserve la page et le projet consultés. Les anciennes URLs `/projets/` et `/a-propos/` redirigent vers les pages anglaises.

Les vues communes sont dans `src/views/`. Les traductions anglaises sont dans `src/i18n/en.json`, avec le texte français comme clé ; les contenus sources restent en français. Ajouter une traduction lors de toute modification de texte ou de projet. Les images et le PDF original sont partagés entre les langues et gardent leurs annotations françaises.

Définir `PUBLIC_SITE_URL` à la véritable URL du site pour générer les liens canoniques, les alternatives `hreflang` et le sitemap. Les copies de pages portant le suffixe « 2 » sont conservées dans `archive/duplicate-pages/`, hors du routage ; les copies de données sont exclues du chargement.

Validation des langues : lancer le serveur preview sur le port 4324, puis `node scripts/verify-i18n.mjs`.

## Motion éditoriale

La couverture compose ses quatre lignes typographiques, puis révèle l’image et les légendes. Les repères architecturaux décoratifs en SVG se tracent progressivement ; les planches s’ouvrent par masque horizontal. Les planches techniques restent planes. Le mouvement des volumes est apporté par les clips Higgsfield, associés aux images via `src/data/motion.json`. La vue agrandie reste plane pour lire les documents.

Les effets sont désactivés avec la préférence de réduction des animations ; les vidéos restent muettes et utilisent `playsinline` sur mobile. Le contenu reste visible sans JavaScript. Vérification : `node scripts/verify-editorial-motion.mjs` avec le preview sur le port 4324.

Le skill personnalisé `higgsfield-editorial-motion` est installé dans les skills Codex de l’utilisateur. Il ne connecte pas automatiquement Higgsfield ; le plugin nécessite sa propre installation et la connexion au compte. Les animations du site sont natives et fonctionnent sans ce service.

La première vidéo Higgsfield est `public/motion/habitat-dolly.mp4` (Hailuo 2.3 Fast, environ 6 s, 1080 × 1328). `src/scripts/video-motion.ts` assure le chargement visible, la pause hors écran, la préférence de réduction des animations et le contrôle de lecture. Le clip joue une fois et garde sa dernière image ; le bouton permet de le rejouer. Le contenu dans le viewport n’est plus caché à l’initialisation des révélations. Vérification : `node scripts/verify-video-motion.mjs`.
