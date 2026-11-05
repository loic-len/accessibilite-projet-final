# Audit AtelierLocal

## Binôme et environnement

- Membres : Poiron Roman, Lenormand Loïc
- Navigateur et version : Google Chrome 156.0.8078.48, Google Chrome v156.0.8078.74

## Problème 1 — Le déclencheur « Détails de l'atelier » n'est pas accessible au clavier (parcours)

### Problème identifié

Sur les cartes d'ateliers, il y a un bouton « Détails de l'atelier » qui permet d'afficher ou masquer la description. En naviguant au clavier avec Tab, on passe directement du champ de recherche au lien « Consulter les informations pratiques » puis au bouton « M'inscrire » sans jamais s'arrêter sur le bouton « Détails ». Le bouton « Détails de l'atelier » est tout simplement invisible au clavier : on ne peut ni l'atteindre ni l'activer. On ne peut donc pas déplier le panneau pour lire la description de l'atelier.

Le lien « Consulter les informations pratiques » est techniquement atteignable au clavier, mais comme il se trouve dans le panneau replié par défaut, le focus est invisible. On tombe sur ce lien sans comprendre où on est ni pourquoi, avant d'arriver sur le bouton « M'inscrire ». Ce n'est pas du tout clair pour la personne qui navigue.

Par ailleurs, quand on utilise un lecteur d'écran, rien n'indique que le bouton est déplié ou replié. On active le bouton, mais on ne sait pas dans quel état on se trouve.

Ce problème est présent sur les trois cartes d'ateliers.

### Reproduction

1. Lancer l'application et naviguer au clavier avec Tab.
2. Le focus passe du champ de recherche au lien « Consulter les informations pratiques » puis au bouton « M'inscrire », sans jamais s'arrêter sur le déclencheur « Détails de l'atelier ».
3. Il est impossible d'activer le déclencheur au clavier pour afficher les détails.
4. Le lien « Consulter les informations pratiques » reçoit le focus alors qu'il n'est pas visible à l'écran (panneau replié par défaut).

### Comportement attendu

Le déclencheur doit être un véritable bouton, focusable et activable au clavier. Son état déplié/replié doit être annoncé. Le panneau associé doit être lié au déclencheur. Lorsque le panneau est replié, son contenu, notamment le lien, ne doit plus être focusable.

### Correction à apporter

- Remplacer le `<div onClick>` par un `<button type="button">` avec `aria-expanded={expanded}` et `aria-controls={panelId}`.
- Donner un `id` au panneau pour le lier au déclencheur.
- Rendre le contenu du panneau non focusable lorsqu'il est replié : utiliser l'attribut `hidden` plutôt que `aria-hidden="true"` seul, ou conditionner le rendu du lien à l'état déplié.

Correction effectuée (dans `src/components/WorkshopCard.tsx`) :

- Le `<div className="details-trigger" onClick>` a été remplacé par un vrai `<button type="button" className="details-trigger">`, atteignable avec Tab et activable avec Entrée ou Espace.
- Ajout de `aria-expanded={expanded}` : l'état replié/déplié est annoncé.
- Ajout d'un identifiant unique par carte, `panelId = \`details-${workshop.id}\``, posé en `id` sur le panneau et référencé par `aria-controls={panelId}` sur le bouton.
- Le panneau utilise `hidden={!expanded}` au lieu de `aria-hidden={!expanded}` : quand il est replié, son contenu (dont le lien « Consulter les informations pratiques ») est retiré de l'ordre de tabulation.
- Le visuel est préservé. Un style de focus adapté (`.details-trigger:focus-visible`) a été ajouté dans `src/styles.css` pour que le contour épouse le bouton.

Vérification (NVDA + Chrome, Windows) : le bouton est annoncé « Détails de l'atelier, bouton, réduit » puis « développé » après activation ; une fois le panneau replié, le lien n'est plus atteignable au clavier. Dans l'arbre d'accessibilité de DevTools, la propriété `expanded` bascule et `controls` pointe vers l'`id` du panneau.

---

## Problème 2 — Le champ de recherche n'a pas d'étiquette associée et les résultats ne sont pas correctement annoncés (parcours)

### Problème identifié

Quand on arrive sur le champ de recherche avec un lecteur d'écran, celui-ci ne dit pas à quoi sert le champ. Le texte « Rechercher un atelier » est affiché juste au-dessus, mais il n'est pas lié au champ. On se retrouve sur un input sans savoir ce qu'on doit y saisir. Le texte d'aide « Saisissez un titre ou une ville. » n'est pas non plus associé au champ de recherche.

Quand on fait une recherche, le nombre d'ateliers affichés change, mais le lecteur d'écran annonce toujours « Résultats de recherche » au lieu du nombre réel. On ne sait donc pas combien de résultats on a obtenus.

### Reproduction

1. Naviguer au clavier jusqu'au champ de recherche.
2. Avec un lecteur d'écran : le champ est annoncé sans son libellé « Rechercher un atelier ».
3. Saisir un terme de recherche (ex. « céramique »).
4. Le compteur change visuellement (« 1 atelier ») mais le lecteur d'écran annonce « Résultats de recherche » et non « 1 atelier ».

### Comportement attendu

Le champ de recherche doit avoir une étiquette programmatiquement associée, annonçant « Rechercher un atelier » à l'arrivée du focus. Le texte d'aide doit être relié. Le compteur de résultats doit annoncer le nombre réel d'ateliers trouvés, pas un label générique.

### Correction à apporter

- Remplacer le `<p class="search-label">` par un `<label for="workshop-search">` (ou ajouter `aria-labelledby` sur l'input).
- Ajouter `aria-describedby` sur l'input pour associer le texte d'aide.
- Supprimer `aria-label` du compteur de résultats pour que le texte visible (« 3 ateliers ») serve de nom accessible, ou remplacer par un `aria-label` qui inclut le nombre dynamique.


---

## Problème 3 — L'image de l'atelier de sérigraphie n'a pas d'attribut alt (ciblé)

### Problème identifié

En parcourant les cartes d'ateliers avec un lecteur d'écran, on remarque que l'image de la sérigraphie est annoncée avec son chemin de fichier, alors que les images des deux autres ateliers ne sont pas annoncées du tout. Le comportement n'est pas cohérent entre les trois cartes : sur deux cartes, le lecteur d'écran ignore l'image, mais sur celle de la sérigraphie, il lit le chemin du fichier.

### Reproduction

1. Naviguer avec un lecteur d'écran jusqu'à la carte de sérigraphie.
2. L'image est annoncée avec son chemin (`/images/serigraphie.svg`) ou ignorée de manière incohérente selon le lecteur.

### Comportement attendu

Toutes les images décoratives doivent être ignorées par les lecteurs d'écran. Le comportement doit être cohérent entre les trois cartes.

### Correction à apporter

Ajouter `alt=""` à l'image de sérigraphie, comme pour les deux autres, puisque les illustrations sont décoratives et que le titre de l'atelier est déjà annoncé par le texte de la carte.


---

## Problème 4 — L'indicateur de focus du bouton « M'inscrire » est supprimé (ciblé)

### Problème identifié

Sur les cartes des ateliers, on ne sait pas où on se trouve quand on parcourt avec la tabulation. Quand on arrive sur le bouton « M'inscrire », aucun contour n'apparaît autour du bouton, contrairement à tous les autres éléments de la page où l'on voit bien le focus. On est obligé de deviner où se trouve le focus pour pouvoir interagir.

### Reproduction

1. Naviguer au clavier avec Tab jusqu'au bouton « M'inscrire » d'une carte.
2. Aucun contour de focus n'est visible, contrairement aux autres éléments interactifs de la page.

### Comportement attendu

Le bouton « M'inscrire » doit afficher un indicateur de focus visible lorsqu'il reçoit le focus au clavier, comme tous les autres éléments interactifs de la page.

### Correction à apporter

Supprimer la règle `.reserve-button:focus-visible { outline: none; box-shadow: none; }` pour que le contour de focus global s'applique, ou la remplacer par une alternative de focus visible suffisamment contrastée.

Correction effectuée : dans `src/styles.css`
La règle `.reserve-button:focus-visible{outline:none;box-shadow:none}` a été supprimée. Le bouton « M'inscrire » hérite désormais du style de focus global appliqué à tous les éléments interactifs.

Vérification (clavier, Chrome) : en tabulant jusqu'au bouton « M'inscrire », un contour bleu contrasté apparaît comme sur les autres éléments de la page.


---

## Problème 5 — La confirmation de préinscription n'est pas annoncée aux lecteurs d'écran (ciblé)

### Problème identifié

Quand on clique sur « M'inscrire », un message de confirmation s'affiche, mais il apparaît tout en bas de la page, loin du bouton, hors de l'écran visible. On a donc l'impression que rien ne s'est passé après avoir cliqué. Il faut scroller pour découvrir le message de confirmation.

Avec un lecteur d'écran, c'est encore pire : rien n'est annoncé après l'action. On clique sur le bouton, on entend qu'on l'a activé, mais on ne sait pas si l'inscription a bien été prise en compte. Le message est présent dans la page mais reste silencieux.

### Reproduction

1. Activer un lecteur d'écran (ou naviguer au clavier).
2. Cliquer sur le bouton « M'inscrire » d'un atelier disponible.
3. Le message « Préinscription de démonstration n° 1 enregistrée… » apparaît tout en bas de la page, hors de l'écran visible.
4. Avec un lecteur d'écran, le message n'est pas annoncé automatiquement.

### Comportement attendu

Le résultat de la préinscription doit être annoncé automatiquement après l'action, pour que la personne sache que sa demande a été prise en compte sans avoir à chercher l'information. Le message ne doit pas apparaître hors de l'écran : la personne doit être informée que quelque chose s'est passé, que ce soit en déplaçant le focus vers le message ou en l'affichant à proximité de l'action.

### Correction à apporter

Ajouter `role="status"` sur le conteneur du message de confirmation pour que son apparition soit annoncée automatiquement aux lecteurs d'écran. Déplacer le focus vers le message après l'action, ou rapprocher le message du bouton, pour que la personne qui navigue au clavier comprenne que quelque chose s'est passé.


---

## Problème 6 — Les titres d'ateliers ne sont pas des titres HTML (ciblé)

### Problème identifié

Sur les cartes d'ateliers, le titre de chaque atelier (par exemple « Premiers pas en sérigraphie ») est un paragraphe, pas un titre HTML. Quand on utilise la navigation par titres d'un lecteur d'écran pour se déplacer dans la page, on trouve les grands titres (h1, h2) mais pas les titres des ateliers. On ne peut pas sauter directement à un atelier spécifique.

De plus, les cartes sont des éléments articles mais elles n'ont pas de nom accessible. Le lecteur d'écran annonce simplement « article » sans dire de quel atelier il s'agit. On doit écouter tout le contenu de la carte pour l'identifier.

### Reproduction

1. Avec un lecteur d'écran, utiliser la navigation par titres.
2. On trouve le titre de la page et les titres de section, mais pas les titres des ateliers.
3. En parcourant les cartes, le lecteur annonce « article » sans identifier l'atelier.
4. Dans l'arbre d'accessibilité de Chrome DevTools, les trois articles n'ont pas de nom accessible.

### Comportement attendu

Chaque carte d'atelier devrait avoir un titre HTML pour son nom. Le lecteur d'écran pourrait ainsi naviguer par titres et annoncer le nom de l'article à l'arrivée du focus.

### Correction à apporter

Remplacer le `<p className="workshop-title">` par `<h3 className="workshop-title">`. Les styles existants s'appliquent déjà au sélecteur `.workshop-title`, le rendu visuel est préservé.

Correction effectuée : dans `src/components/WorkshopCard.tsx`
Le `<p className="workshop-title">` a été remplacé par `<h3 className="workshop-title">`. Le niveau `h3` s'insère logiquement sous les `h2` de section (« Les prochains ateliers »). Le sélecteur CSS `.workshop-title` s'appliquant indifféremment, le rendu visuel est inchangé. Le titre sert aussi de nom accessible à l'`<article>` de la carte.

Vérification (NVDA + Chrome, Windows) : la navigation par titres atteint désormais chaque atelier, annoncé « …, titre niveau 3 ». Dans DevTools, les titres ont bien le rôle `heading` de niveau 3.

---

## Composant créé

Le composant `QuestionDialog` (`src/components/QuestionDialog.tsx`) ajoute, sur chaque carte, un bouton « Poser une question » intégré via la prop `extraAction` de `WorkshopCard`. L'atelier concerné est transmis par l'état d'`App` et rappelé dans le titre de la modale, ce qui garantit la prise en compte du bon atelier. Le bouton est présent même lorsque l'atelier est complet.

Principaux choix d'accessibilité :

- **Élément natif `<dialog>` ouvert avec `showModal()`** : on bénéficie gratuitement du rôle `dialog`, de `aria-modal`, du piège de focus, de la fermeture par Échap et de l'arrière-plan inerte. La modale a un nom accessible via `aria-labelledby` pointant vers son `<h2>`.
- **Gestion du focus** : à l'ouverture, le focus entre dans la modale ; à la fermeture (envoi, Annuler, bouton ×, Échap), le focus est rendu au bouton déclencheur mémorisé, pour ne pas perdre la personne qui navigue au clavier.
- **Contrôle du sujet par `<select>` natif** : la première option `value=""` (« Choisissez un sujet ») est sélectionnée par défaut, donc aucun sujet n'est présélectionné. Les options correspondent à `requestOptions.question`.
- **Champs obligatoires et reprise après erreur** : la validation s'appuie sur `readRequest(form, "question", workshop.id)`. L'email est un `input type="email"`. En cas d'erreur, chaque champ reçoit `aria-invalid`, un message `.field-error` associé par `aria-describedby`, et un résumé d'erreurs `.error-summary` focusable (déplacement du focus dessus) liste les problèmes avec des liens vers les champs. Le formulaire étant non contrôlé, le sujet et la question saisis sont conservés après une tentative échouée : on peut corriger et renvoyer.
- **Confirmation compréhensible** : après un envoi valide, la modale se ferme et un message dans un conteneur `role="status"` / `aria-live="polite"` annonce **l'atelier concerné et le sujet choisi**, sans reprendre l'adresse de contact. Annuler ou fermer ne déclenche aucune confirmation.

Vérifications : navigation complète au clavier (ouverture, Tab dans la modale, Échap, retour du focus) ; essais d'envoi incomplet puis corrigé ; contrôle de l'arbre d'accessibilité dans Chrome DevTools ; contrôle automatique avec jest-axe (aucune violation, modale ouverte avec erreurs affichées).

## Mini-test

Fichier : `src/__tests__/Composant.test.tsx`. Résultat : le test passe (`npm test -- --run` → 4 tests au vert).

Le test rend l'application avec `render(<App />)` et simule le parcours avec `userEvent` : ouverture de « Poser une question » pour « Une tasse en céramique », choix du sujet « Le matériel à apporter » et saisie d'une question, envoi avec l'email vide. Il vérifie alors qu'une erreur est indiquée, que la modale reste ouverte, que le sujet et la question sont conservés et qu'aucune confirmation n'apparaît. Après saisie d'un email valide et nouvel envoi, il vérifie que la modale se ferme et qu'une confirmation mentionne bien « Une tasse en céramique » et « Le matériel à apporter ». Le test couvre donc l'intégration, la validation et la reprise après erreur, et la cohérence de la confirmation.