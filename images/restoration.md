# Amélioration des visuels

Les 10 visuels individuels ont été traités séparément avec l’outil intégré imagegen. Les fichiers sources sont dans originals/, les sorties IA dans restored/, et les versions intégrées d’au moins 1920 pixels de largeur et 1080 pixels de hauteur dans ../src/assets/. Les proportions sources sont conservées. Les sorties IA sont ensuite redimensionnées pour le site ; ce ne sont pas des sources photographiques natives Full HD. Des détails peuvent différer.

Prompt commun : restaurer l’image fournie, réduire le flou et la pixellisation, améliorer les contours et textures avec retenue, préserver cadrage, perspective, objets, couleurs, lumière et medium ; ne rien ajouter ni retirer. Pour les dessins : préserver traits, texte et fond papier. Pour le portrait : préserver identité, expression, cheveux, vêtements, pose et nuances de gris, sans embellissement.

Fichiers : p6-0.png, p13-0.png, p20-0.png, p29-0.png, p30-1.png, p31-0.png, p33-1.png, p38-0.png, p39-0.png, p3-20.png.

## Images à l’intérieur des planches

Les 118 visuels utiles (dont six déjà restaurés) ont été extraits du PDF puis traités individuellement avec l’outil intégré imagegen. `pdf-manifest.json` relie les images aux pages et conserve leurs dimensions sources. `pdf-originals/` conserve les originaux, `pdf-inputs/` fournit des références sur fond blanc, `pdf-generated/` conserve les sorties IA retenues et `pdf-restored/` contient les fichiers préparés pour la réintégration.

Prompt de restauration : réduire la pixellisation et le flou de compression avec retenue, conserver l’image complète, ses proportions, ses marges, ses objets, sa géométrie, sa lumière, ses couleurs et son medium ; préserver les traits, annotations et textes sans ajouter de contenu. Les variantes avec transparence ou recadrage incorrect ont été retraitées sur fond blanc, puis les masques utiles du PDF ont été rétablis.

Les sorties sont redimensionnées avec leurs proportions sources, à au moins 1920 pixels sur le grand côté et 1080 sur le petit côté. Elles ne constituent pas une source native Full HD : les détails fins et les annotations raster peuvent différer. Les textes natifs et la mise en page du PDF sont conservés lors de la reconstruction des 29 planches à 3840 pixels de largeur. Le PDF téléchargeable reste le document original.

Reconstruction depuis les images restaurées déjà préparées : `python scripts/rebuild-gallery.py` (dépendance : PyMuPDF). `node scripts/prepare-gallery-images.mjs` prépare les sorties IA brutes avant cette reconstruction. Les sorties brutes sauvegardées sont réutilisées lors des exécutions suivantes.

## Animation du hero avec Higgsfield

Le 2 octobre 2026, une vidéo a été générée à partir de `src/assets/p6-0.png`, sans modèle 3D, via Higgsfield / Hailuo 2.3 Fast. Le fichier `../public/motion/habitat-dolly.mp4` dure 5,875 secondes, en 1080 × 1328 pixels, sans piste audio. Il conserve le format portrait de l’image et ajoute un mouvement de caméra interprété par le modèle ; ce n’est pas une reconstruction 3D exacte. Coût confirmé : 7 crédits. Le job et la référence sont consignés dans `motion-generation.json`.

Le même clip est utilisé dans le hero, les aperçus et la perspective principale du projet. Il se charge à l’approche du viewport, se met en pause hors écran et conserve sa dernière image à la fin. Le bouton de lecture permet de mettre en pause, reprendre ou rejouer. Avec réduction des animations ou sans JavaScript, l’image originale reste affichée. Les planches techniques sont maintenant planes ; le contenu déjà visible n’est plus masqué après son premier affichage.

L’utilisateur a choisi un seul clip pour le moment : aucune vidéo d’axonométrie n’a été générée.
