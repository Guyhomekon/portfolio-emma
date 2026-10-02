# Animations Higgsfield proposées pour le portfolio

Recherche du 2 octobre 2026. Les éléments suivants sont des recommandations et des prompts préparés, pas des clips générés. Le plugin Higgsfield est maintenant accessible : catalogue et recommandations de modèles consultés directement. Un clip de perspective a depuis été généré ; voir `motion-generation.json` et `restoration.md`. Les autres propositions restent des pistes non générées.


## Mise à jour : catalogue connecté consulté

Les références ci-dessous viennent directement du connecteur Higgsfield, et non uniquement de sa page web. Les démonstrations ont été téléchargées et des images représentatives examinées. Ce sont des exemples du fournisseur, pas des résultats obtenus avec le portfolio.

### Choix principal : vidéo intérieure sur mesure

Pour `p6-0.png` et `p13-0.png`, retenir les prompts de travelling lent ci-dessous avec un modèle image-vers-vidéo. Le connecteur recommande notamment `kling3_0` et `seedance_2_5`. Seedance 2.5 expose explicitement une sortie 1080p, le mode `omni_reference` et la désactivation de l'audio. Aucun de ces modèles n'a encore été testé sur les sources du portfolio.

### Candidat maquette : Exploded View Loop

- Catalogue : Marketing Studio, hypermotion.
- ID : `be7c1f36-9ace-4819-83a4-1a2578735403`.
- [Aperçu officiel](https://cdn.higgsfield.ai/marketing-studio-motion-preview/acc1ab72-f43f-41d8-9d4b-9a72da284bab.mp4).
- Entrée requise : `product_media_id`, une image confirmée ; prompt facultatif.
- Application proposée : dessin d'axonométrie isolé de la page 8. Tester la séparation/réunion des étages sur un fond papier. La démonstration sombre de produit consultée ne permet pas de valider ce comportement sur une planche architecturale.
- Ne pas confondre ce preset de galerie avec `/Exploded-view`, qui sélectionne un workflow Blender local nécessitant sa connexion et les assets de scène.

### Candidat dessin : Chalk Blueprint

- Catalogue : Marketing Studio, saas_motion.
- ID : `7cc881f5-b124-4a45-b705-0314a08ad12f`.
- [Aperçu officiel](https://cdn.higgsfield.ai/marketing-studio-motion-preview/61b5efb0-60b6-4a32-bac9-003dbcc58c00.mp4).
- Entrée requise : `product_media_id`, prompt facultatif.
- L'aperçu utilise un fond ardoise sombre et une composition typographique ; il ne démontre pas un tracé fidèle des lignes des plans fournis. C'est une piste graphique à adapter, pas le choix principal pour ce portfolio beige.
- Pour un tracé exact, les instructions connectées de `/whiteboard-animation` renvoient au workflow After Effects local. Les outils After Effects ne sont pas exposés dans cette session ; les charger comme instructions ne les installe pas.

### Candidat mouvement de volume : Charcoal Macro Orbit

- Catalogue : Marketing Studio, hypermotion.
- ID : `6e141524-7015-4b83-aa89-e982393da903`.
- [Aperçu officiel](https://cdn.higgsfield.ai/marketing-studio-motion-preview/625c7921-cda4-40ad-8704-fd59d83377f4.mp4).
- La démonstration montre plusieurs vues rapprochées d'un objet ; sa composition sur fond noir est publicitaire. Retenir le principe de déplacement autour d'un volume pour une maquette isolée, plutôt que son habillage. Une image-vers-vidéo sur mesure avec petit arc et fond clair sera plus cohérente.

Le preset Viral `Architecture wave` déforme les bâtiments ; il est exclu de la sélection. `Blueprint Scatter` et `Artisan Orbit` sont des images statiques dans le catalogue, donc ne répondent pas à la demande d'animation.

La sélection est une recherche préalable. Ne soumettre aucun preset ni dépenser de crédits sur la seule base de cette demande de recherche.

## 1. Habitat de A à Z : perspective immersive (priorité)

Source : `src/assets/p6-0.png`, déjà utilisée dans le hero.
Preset officiel : [Dolly In](https://higgsfield.ai/motion/06463063-551a-4cbb-abc0-0ff1007784b3).
Proposition : un seul mouvement de caméra de 5 secondes, extrêmement lent, vers l'intérieur. La parallaxe doit se produire entre le mobilier, la mezzanine et les ouvertures ; aucun déplacement du cadre HTML n'est nécessaire.

Prompt à essayer :

> Animate the supplied architectural interior rendering. One continuous slow physical dolly forward, total travel approximately 20 centimetres over 5 seconds, constant camera height, level horizon, stable focal length. Preserve the exact room geometry, furniture positions, materials, colours and architectural proportions of the reference. Gentle depth parallax between the green seat, staircase, mezzanine and windows. Soft stable daylight. No people, no new objects, no morphing, no flicker, no camera shake, no cuts, no text, no audio. Hold the final framing gently.

Le prompt exprime l'intention : le résultat doit être vérifié, le modèle ne garantit pas la conservation géométrique. Vérifier en particulier l'escalier, la fenêtre et les luminaires.

## 2. L'Âme du Sud : découverte des volumes

Source : `src/assets/p13-0.png`, perspective intérieure du projet.
Preset officiel : [Arc Left](https://higgsfield.ai/motion/2a5d8f86-aef3-4b34-b5ee-fb2020daa131).
Proposition : tester un arc très court, environ 5°, pendant 5 secondes. Garder l'identité méditerranéenne et le mobilier Corolle. Commencer par un test sans prétendre que le preset assure une amplitude précise.

Prompt à essayer :

> Animate the provided interior design rendering with one very slow, shallow camera arc to the left, approximately five degrees over five seconds. Keep the same room, architecture, furniture, materials and Mediterranean palette. Maintain level framing and constant lighting. Reveal only a subtle change in depth between foreground furniture and background walls. No room redesign, no added objects, no people, no morphing, no sudden movement, no text, no audio.

## 3. Axonométrie : assemblage architectural

Source : dessin d'axonométrie de `src/assets/page-8.jpg` ; isoler le dessin de droite avant génération, en conservant la planche originale pour la lecture. Autre candidat : `src/assets/page-15.jpg`.
Preset image-vers-vidéo : [Exploded View](https://higgsfield.ai/motion/c75a47c8-6a28-4a2a-92dc-6e6359d555fe).
Proposition : les étages et le toit séparés dans le dessin descendent progressivement pour s'assembler, sur un fond papier clair avec caméra fixe. Prévoir 6 secondes. Ce serait une vraie animation des parties représentées, plutôt qu'une inclinaison du document entier.

Prompt à essayer :

> Animate this isolated exploded architectural axonometric illustration on a clean warm off-white background. Locked orthographic camera. Keep the exact existing parts, black linework, proportions and muted colours. The existing lower floor, upper floor and roof gently move vertically into their intended assembled positions, one part at a time. No rotation, no camera movement, no new geometry, no destruction, no particles, no warping, no text, no audio. Six-second technical architectural assembly animation, slow precise timing, hold the final assembled state.

Limite : une génération à partir d'une image peut inventer des connexions ou des faces. Si l'exactitude du projet est nécessaire, le workflow officiel [Animate object assembly in Blender](https://higgsfield.ai/mcp/exploded-view?tab=chatgpt) utilise une scène Blender éditable et requiert la géométrie source ainsi que Blender. La planche raster n'est pas une scène 3D.

## 4. Plans : tracé des lignes du projet

Sources : `src/assets/page-10.jpg` (plans et élévation) et `src/assets/page-11.jpg` (coupes et détails techniques).
Workflow officiel : [Whiteboard Animation in After Effects](https://higgsfield.ai/mcp/whiteboard-animation?tab=chatgpt).
Adaptation proposée : utiliser ses annotations et tracés éditables pour faire apparaître progressivement les murs, cloisons, puis le mobilier du plan. Ce n'est pas un preset spécialisé en plans architecturaux. Les textes et les cotes restent fixes. After Effects et des couches séparées/tracés vérifiés sont nécessaires pour préserver fidèlement les lignes techniques.

Brief de production :

> Animate the actual supplied floor-plan linework in After Effects. Preserve the exact geometry, dimensions, labels and board layout. Reveal structural walls first, partitions second, furniture last, with editable stroke reveals. Keep all text and dimensions static and readable. No moving cursors, no sticky notes, no added annotations, no invented architecture, no 3D camera movement. Six-second architectural drawing sequence on the original paper background. Return an editable composition and a web video preview.

## Choix à éviter en première intention

[3D Rotation](https://higgsfield.ai/apps/3d-rotation) génère un tour complet à partir d'une photo. Pour une architecture montrée sous un seul angle, les faces absentes risquent d'être inventées. Le petit Arc Left est un candidat plus raisonnable pour commencer. Aucun preset de destruction, glitch ou explosion n'est adapté à la direction éditoriale du portfolio.

## Intégration prévue une fois les clips validés

- Ajouter les clips comme variantes animées des perspectives ou dessins isolés ; conserver les planches originales et leur vue agrandie.
- Export visé : 1080p, muet, 5 à 6 secondes. Adapter le format au cadrage de chaque source.
- Garder l'image d'origine comme poster et comme affichage lorsque les animations sont réduites.
- Lire seulement la vidéo visible, avec `muted` et `playsinline`, puis la mettre en pause hors écran. Éviter de charger toutes les vidéos à l'ouverture du site.
- Vérifier la continuité avant toute boucle. Un dolly ou un assemblage ne revient pas naturellement à son état initial ; ne pas réinitialiser brutalement le clip.
- Les exemples de la galerie Higgsfield démontrent l'effet, ils ne prouvent pas le résultat sur les images de ce portfolio.
