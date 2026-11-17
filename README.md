# Gym Express

Jeu 3D dans un style cubique à la Kenney : à la fin du cours de sport, on range le matériel du gymnase en lançant chaque ballon dans le bac de son sport.

## Lancer le jeu

```bash
npm install
npm run dev
```

Ouvrez ensuite l'URL affichée (par défaut http://localhost:5173). `npm run build` génère une version statique dans `dist/`.

## Commandes

- **Viser** : pointez le bac avec la souris. Un repère et la trajectoire suivent le curseur.
- **Puissance** : maintenez le clic, la jauge monte et redescend lentement. La distance dépend uniquement de la puissance.
- **Lancer** : relâchez le clic.

Le jeu marche aussi au doigt sur mobile.

## Règles

- 7 niveaux de 5 objets, soit environ 3 minutes de jeu. Les niveaux s'enchaînent quel que soit le score.
- Le temps par lancer passe de 8 s au niveau 1 à 3 s au niveau 7. Si le chrono tombe à zéro, le lancer compte comme raté.
- Bon bac : +100, plus des bonus selon la difficulté du lancer :
  - distance : jusqu'à +100 ;
  - bac sur roulettes : +40 à +80 selon sa vitesse ;
  - obstacle (ou entraîneur) entre le joueur et le bac : +40 ;
  - trajectoire raccourcie : +15, masquée : +30 ;
  - « swish », sans toucher le rebord : +25.

  Les réussites consécutives multiplient le tout (combo jusqu'à ×3).
- Mauvais bac : −50. Raté : −20.
- Bacs : basket (orange), foot (vert), tennis (jaune), volley (bleu), rugby (rouge, à partir du niveau 5).
- La physique aide le joueur : une balle qui redescend près d'un bac est attirée vers son centre, et les balles rebondissent peu. Il n'y a pas de vent.
- La difficulté monte au fil des niveaux : bacs plus loin, trajectoire raccourcie puis masquée, obstacles (plinth, tapis, haie), bacs sur roulettes, entraîneur qui traverse le gymnase.
- À la fin, un tableau donne le score de chaque niveau et le score total, qui est leur somme. Le meilleur score est enregistré dans le navigateur.

## Sons

Tout est généré en direct par le navigateur, il n'y a aucun fichier audio :

- une musique de fond chiptune dont le tempo accélère avec les niveaux ;
- l'ambiance du gymnase : murmure de la foule, ballons qui rebondissent au loin, crissements de baskets ;
- des applaudissements et des cris de joie quand l'objet est bien rangé (plus forts pour un swish ou une série), et un « ooooh » déçu en cas d'erreur ;
- un coup de sifflet au début de chaque niveau, une fanfare à la fin de la partie ;
- les encouragements de l'entraîneur, prononcés en français par la synthèse vocale du navigateur et affichés dans une bulle. Il ne commente pas tous les lancers, seulement de temps en temps et toujours les belles séries, et évite de répéter les mêmes phrases.

En jeu, 🔊 coupe tout le son (voix comprise) et 🎵 coupe seulement la musique. Ces réglages sont gardés d'une partie à l'autre. La voix dépend de l'appareil et du navigateur.

## Code

| Fichier | Rôle |
| --- | --- |
| `src/config/levels.js` | les niveaux (bacs, obstacles, temps par lancer) |
| `src/config/items.js`, `src/config/bins.js` | les objets de sport et les bacs |
| `src/scene/` | les modèles cubiques (gymnase, bacs, objets) |
| `src/game/` | la physique (dont l'aide à la visée), la visée, le score et les niveaux |
| `src/ui/` | le HUD et les écrans |
| `src/audio/` | la musique, l'ambiance, la foule et la voix |

Pour ajouter un niveau, ajoutez une entrée à `LEVELS` dans `src/config/levels.js`.
