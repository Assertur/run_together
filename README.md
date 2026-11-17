# Tri Express

Jeu 3D dans un style cubique à la Kenney : on lance les déchets du bureau dans la bonne poubelle de tri.

## Lancer le jeu

```bash
npm install
npm run dev
```

Ouvrez ensuite l'URL affichée (par défaut http://localhost:5173). `npm run build` génère une version statique dans `dist/`.

## Commandes

- **Viser** : déplacez la souris. Plus le curseur est haut, plus le tir monte en cloche.
- **Puissance** : maintenez le clic, la jauge monte et redescend.
- **Lancer** : relâchez le clic.

Le jeu marche aussi au doigt sur mobile.

## Règles

- 7 niveaux de 5 objets, soit environ 3 minutes de jeu. Les niveaux s'enchaînent quel que soit le score.
- Le temps par lancer passe de 8 s au niveau 1 à 3 s au niveau 7. Si le chrono tombe à zéro, le lancer compte comme raté.
- Bonne poubelle : +100, plus un bonus distance (jusqu'à +50) et un bonus « swish » (+25) si l'objet ne touche pas le rebord. Les réussites consécutives donnent un combo jusqu'à ×3.
- Mauvaise poubelle : −50. Raté : −20.
- Poubelles : jaune (emballages), bleue (papier), verte (verre), marron (compost), grise (ordures, à partir du niveau 5).
- La difficulté monte au fil des niveaux : poubelles plus loin, aide à la visée raccourcie puis masquée, obstacles, vent, poubelles sur roulettes, collègue qui traverse la pièce.
- À la fin, un tableau donne le score de chaque niveau et le score total, qui est leur somme. Le meilleur score est enregistré dans le navigateur.

## Code

| Fichier | Rôle |
| --- | --- |
| `src/config/levels.js` | les niveaux (poubelles, vent, obstacles, temps par lancer) |
| `src/config/items.js`, `src/config/bins.js` | les objets et les catégories de tri |
| `src/scene/` | les modèles cubiques (bureau, poubelles, objets) |
| `src/game/` | la physique, la visée, le score et le chargement des niveaux |
| `src/ui/` | le HUD et les écrans |

Pour ajouter un niveau, ajoutez une entrée à `LEVELS` dans `src/config/levels.js`.
