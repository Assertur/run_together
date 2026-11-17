// Objets de sport à ranger. `bin` = bac du sport, `shape` = modèle voxel, `bounce` = rebond.
export const ITEMS = [
  { id: 'basketball', name: 'Ballon de basket', icon: '🏀', bin: 'basket', shape: 'basketball', bounce: 0.35 },
  { id: 'minibasket', name: 'Mini-ballon de basket', icon: '🏀', bin: 'basket', shape: 'miniBasketball', bounce: 0.35 },

  { id: 'football', name: 'Ballon de foot', icon: '⚽', bin: 'foot', shape: 'football', bounce: 0.3 },
  { id: 'cone', name: 'Plot orange', icon: '🔶', bin: 'foot', shape: 'cone', bounce: 0.15 },

  { id: 'tennisball', name: 'Balle de tennis', icon: '🎾', bin: 'tennis', shape: 'tennisBall', bounce: 0.3 },
  { id: 'racket', name: 'Raquette de tennis', icon: '🏸', bin: 'tennis', shape: 'racket', bounce: 0.15 },

  { id: 'volleyball', name: 'Ballon de volley', icon: '🏐', bin: 'volley', shape: 'volleyball', bounce: 0.3 },
  { id: 'beachball', name: 'Ballon de plage', icon: '🏐', bin: 'volley', shape: 'beachBall', bounce: 0.25 },

  { id: 'rugbyball', name: 'Ballon de rugby', icon: '🏉', bin: 'rugby', shape: 'rugbyBall', bounce: 0.2 },
  { id: 'tee', name: 'Tee de rugby', icon: '🔺', bin: 'rugby', shape: 'tee', bounce: 0.15 },
];

export const itemsForBins = (binIds) => ITEMS.filter((it) => binIds.includes(it.bin));
