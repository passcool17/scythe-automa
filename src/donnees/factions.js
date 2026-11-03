export const FACTIONS = {
  nordique: { nom: 'Royaumes Nordiques', court: 'Nordique', couleur: '#2f6db5', boite: 'base', puissance: 4, cartes: 1 },
  rusviet: { nom: 'Union Rusviet', court: 'Rusviet', couleur: '#b3312c', boite: 'base', puissance: 3, cartes: 2 },
  crimee: { nom: 'Khanat de Crimée', court: 'Crimée', couleur: '#d9a628', boite: 'base', puissance: 5, cartes: 0 },
  saxons: { nom: 'Empire Saxon', court: 'Saxons', couleur: '#3a3a3a', boite: 'base', puissance: 1, cartes: 4 },
  polania: { nom: 'République de Polania', court: 'Polania', couleur: '#e9e4d4', boite: 'base', puissance: 2, cartes: 3 },
  albion: { nom: 'Clan Albion', court: 'Albion', couleur: '#3f8a4a', boite: 'invaders', puissance: 3, cartes: 0 },
  togawa: { nom: 'Shogunat Togawa', court: 'Togawa', couleur: '#7d4aa6', boite: 'invaders', puissance: 0, cartes: 2 },
  vesna: { nom: 'Vesna', court: 'Vesna', couleur: '#c9772e', boite: 'fenris', special: true },
  fenris: { nom: 'Fenris', court: 'Fenris', couleur: '#5b2a2a', boite: 'fenris', special: true },
};
// Les 7 factions dont on peut tirer les jetons pour Vesna.
export const FACTIONS_JETONS = ['nordique', 'rusviet', 'crimee', 'saxons', 'polania', 'albion', 'togawa'];
