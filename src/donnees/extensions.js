// The Wind Gambit : tuiles aéronef agressives compatibles avec l'Automate.
// « Péage » (Toll) n'est pas compatible avec l'Automate (règle officielle).
export const AERONEFS = [
  { id: 'bombard', nom: 'Bombardement', en: 'Bombard', texte: {
    mouvement: "Territoires valides : celui de l'unité combattante de l'Automate la plus proche d'une unité combattante adverse (les unités adverses sur une base sont ignorées, sauf s'il n'y en a aucune sur le plateau). Départage 1 : le plus proche de l'Usine. Départage 2 : sens de lecture.",
    capacite: "Si l'Automate lance un combat sur un territoire adjacent à son aéronef, l'aéronef s'y déplace.",
    combat: "Avant le combat, piochez et défaussez une carte Automate : l'adversaire perd autant de Puissance que le nombre de cartes Combat indiqué dans la section combat de cette carte.",
  } },
  { id: 'blitzkrieg', nom: 'Blitzkrieg', en: 'Blitzkrieg' },
  { id: 'bounty', nom: 'Prime', en: 'Bounty' },
  { id: 'distract', nom: 'Diversion', en: 'Distract' },
  { id: 'espionage', nom: 'Espionnage', en: 'Espionage' },
  { id: 'siege', nom: 'Engin de siège', en: 'Siege Engine' },
  { id: 'war', nom: 'Correspondant de guerre', en: 'War Correspondent' },
];

// The Rise of Fenris : bénéfices des Mods pour l'Automate (règles modulaires).
export const BENEFICES_INFRA = ['piste', 'butin', 'retireCarte4', 'piste', 'butin', 'retireCarte15'];
export const BENEFICES_MECH = ['butin', 'rien', 'butin', 'rien', 'butin', 'rien'];
// Nombre de Mods « achetés » par l'Automate selon les Mods utilisés dans la partie.
export const ACHAT_MODS = {
  aucun: { infra: 0, mech: 0 },
  infra: { infra: 2, mech: 0 },
  mech: { infra: 0, mech: 3 },
  deux: { infra: 4, mech: 0 },
};
export const LIBELLE_BENEFICE = {
  piste: 'Pion de la piste Étoiles avancé d’une case au départ',
  butin: '« Butin » : gains du Programme I d’une carte piochée, reçus à la mise en place',
  retireCarte4: 'Carte Automate n° 4 retirée du paquet',
  retireCarte15: 'Carte Automate n° 15 retirée du paquet',
  rien: 'Aucun effet',
};
