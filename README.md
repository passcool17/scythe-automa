# Scythe Automa — compagnon en français

Application web (PWA installable, fonctionne hors ligne) pour jouer à **Scythe** contre 1 à 3 **Automates**, sans manipuler le paquet de cartes Automate. Elle pioche les cartes, affiche la carte comme la vraie, applique le bon Programme et explique en français clair ce que l’Automate doit faire.

> Inspirée de [Joelnicolass/scythe-automa](https://github.com/Joelnicolass/scythe-automa). Le code, les icônes et les textes de ce dépôt ont été écrits à neuf ; rien n’y est copié.

## Fonctionnalités

- **1 à 3 Automates**, chacun avec sa faction, sa difficulté (Autometta, Automa, Automaszyna, Ultimaszyna), son paquet, sa défausse et sa carte Étoiles.
- **Tour de l’Automate** : pioche, carte affichée comme une vraie carte (Programme I ou II, actions entre crochets de faction, étoile, tableau de combat, ressources), explication pas à pas des déplacements, gains et recrues.
- **Piste Étoiles** propre à chaque difficulté (cases « eau », étoiles), passage automatique au **Programme II** avec remélange.
- **Combat** : carte Combat piochée, Puissance et cartes Combat engagées selon la tranche (0–7, 8–13, 14+), sans jamais dépasser ce que l’Automate possède ; ressources à placer en cas de conquête ; étoiles de combat (max. 2).
- Compteurs Puissance, pièces, cartes Combat ; **6 étoiles = fin de partie**.
- **Sauvegarde automatique** (localStorage), **Annuler**, **Nouvelle partie**.
- Rappels de règles (bouton « ? »).

### Extensions

| Boîte | Ce qui est inclus |
|---|---|
| Jeu de base | 5 factions, 19 cartes Automate, 4 difficultés, combat, piste Étoiles, variante à plusieurs Automates. |
| Invaders from Afar | Albion (Drapeaux) et Togawa (Pièges) : actions entre crochets, compteur de jetons posés, rappels. |
| The Wind Gambit | Aéronef de l’Automate : règles générales de déplacement et départages ; texte complet de la carte **Bombard** ; pour les autres cartes, l’app renvoie à la carte physique. |
| The Rise of Fenris | Mods modulaires (Infra / Mech / les deux, avec bénéfices et « butin »), Vesna (2 jetons de faction), Fenris (sans actions entre crochets), piste de la Paix sans Alliances (Programme II retardé), Tesla traité comme un mech. |

Non inclus : campagne de Rise of Fenris, Désolation, pistes des Triomphes Guerre/Rivaux, et le départage par jeton de recrue de la variante multi-Automates (à faire à la main).

## Développement

```bash
npm install
npm run dev        # serveur de développement
npm test           # tests unitaires (Vitest)
npx playwright install chromium
npm run e2e        # test de bout en bout, mobile 412×915
npm run build      # build statique dans dist/
```

`npm run icones` régénère les PNG à partir de `public/icones/icone.svg`. `npm run captures` refait les captures d’écran (avec `npx vite preview --port 4173` lancé).

Le flux `.github/workflows/pages.yml` lance les tests et publie `dist/` sur GitHub Pages à chaque push sur `main` (activer d’abord *Settings → Pages → Source : GitHub Actions*).

## Mentions

Scythe est une marque de commerce de Stonemaier Games. Ce projet de fans n’est ni affilié à Stonemaier Games ni approuvé par eux. Il faut posséder le jeu pour l’utiliser : les règles complètes restent celles des livrets officiels.
