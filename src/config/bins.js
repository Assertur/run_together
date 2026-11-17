// Catégories de tri : chaque poubelle a une couleur, un nom et une icône.
export const BIN_TYPES = {
  yellow: {
    id: 'yellow',
    label: 'Emballages',
    hint: 'plastique, métal, briques',
    color: 0xf7c843,
    rim: 0xffe08a,
    icon: '♻️',
  },
  blue: {
    id: 'blue',
    label: 'Papier',
    hint: 'papier, carton',
    color: 0x3d8bfd,
    rim: 0x8dbdff,
    icon: '📄',
  },
  green: {
    id: 'green',
    label: 'Verre',
    hint: 'bouteilles, bocaux',
    color: 0x3fbf6f,
    rim: 0x8fe3ad,
    icon: '🍾',
  },
  brown: {
    id: 'brown',
    label: 'Compost',
    hint: 'restes alimentaires',
    color: 0x9a6a3e,
    rim: 0xc89a6e,
    icon: '🍂',
  },
  gray: {
    id: 'gray',
    label: 'Ordures',
    hint: 'non recyclable',
    color: 0x6f7682,
    rim: 0xa6adb8,
    icon: '🗑️',
  },
};

export const binLabel = (id) => `${BIN_TYPES[id].label}`;
