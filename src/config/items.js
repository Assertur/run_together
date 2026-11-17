// Catalogue des objets à lancer. `bin` = poubelle correcte, `shape` = constructeur voxel.
export const ITEMS = [
  { id: 'can', name: 'Canette', icon: '🥫', bin: 'yellow', shape: 'can', bounce: 0.45 },
  { id: 'plastic', name: 'Bouteille plastique', icon: '🧴', bin: 'yellow', shape: 'plasticBottle', bounce: 0.5 },
  { id: 'yogurt', name: 'Pot de yaourt', icon: '🥛', bin: 'yellow', shape: 'yogurt', bounce: 0.4 },
  { id: 'juice', name: 'Brique de jus', icon: '🧃', bin: 'yellow', shape: 'juice', bounce: 0.35 },

  { id: 'paperball', name: 'Boule de papier', icon: '📃', bin: 'blue', shape: 'paperBall', bounce: 0.3 },
  { id: 'newspaper', name: 'Journal', icon: '📰', bin: 'blue', shape: 'newspaper', bounce: 0.2 },
  { id: 'box', name: 'Petit carton', icon: '📦', bin: 'blue', shape: 'cardboard', bounce: 0.25 },
  { id: 'envelope', name: 'Enveloppe', icon: '✉️', bin: 'blue', shape: 'envelope', bounce: 0.2 },

  { id: 'glassbottle', name: 'Bouteille en verre', icon: '🍾', bin: 'green', shape: 'glassBottle', bounce: 0.35 },
  { id: 'jar', name: 'Bocal de confiture', icon: '🫙', bin: 'green', shape: 'jar', bounce: 0.3 },

  { id: 'apple', name: 'Trognon de pomme', icon: '🍎', bin: 'brown', shape: 'apple', bounce: 0.3 },
  { id: 'banana', name: 'Peau de banane', icon: '🍌', bin: 'brown', shape: 'banana', bounce: 0.15 },
  { id: 'teabag', name: 'Sachet de thé', icon: '🍵', bin: 'brown', shape: 'teabag', bounce: 0.1 },

  // Objets « pièges » : non recyclables → ordures ménagères (poubelle grise).
  { id: 'tissue', name: 'Mouchoir usagé', icon: '🤧', bin: 'gray', shape: 'tissue', bounce: 0.15, tricky: true },
  { id: 'dirtycup', name: 'Gobelet de café sale', icon: '☕', bin: 'gray', shape: 'coffeeCup', bounce: 0.3, tricky: true },
  { id: 'pen', name: 'Stylo usagé', icon: '🖊️', bin: 'gray', shape: 'pen', bounce: 0.4, tricky: true },
];

export const itemsForBins = (binIds) => ITEMS.filter((it) => binIds.includes(it.bin));
