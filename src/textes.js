import { FACTIONS } from './donnees/factions.js';

const fx = (f) => (f ? ` (${FACTIONS[f].court} seulement)` : '');

export const NOM_DEP = {
  ouvrier: 'Déplacer un ouvrier',
  mech: 'Déplacer un mech',
  perso: 'Déplacer le personnage',
  rencontre: 'Rencontre / Usine',
  attaque: 'Attaque',
  attaqueOuvriers: 'Attaque d’ouvriers',
};

export function libelleDep(d) {
  if (d.t === 'attaque') return `Attaque si Puissance ≥ ${d.min}`;
  return NOM_DEP[d.t];
}

export function expliquerDep(d, ctx = {}) {
  let t;
  switch (d.t) {
    case 'ouvrier':
      t = "Prenez l’ouvrier de l’Automate le plus proche de sa base principale et placez-le sur un territoire du voisinage de ses unités (ou de sa base) sans unité adverse ni autre ouvrier de l’Automate : celui qui touche le plus d’unités de l’Automate et n’est pas dans le voisinage d’unités combattantes adverses.";
      break;
    case 'mech':
    case 'perso':
      t = `Prenez ${d.t === 'mech' ? 'le mech' : 'le personnage'} de l’Automate le plus proche de sa base et placez-le sur le territoire valide le plus proche d’une unité combattante adverse (sans unité adverse ni autre unité combattante de l’Automate).`;
      break;
    case 'rencontre':
      t = "Le personnage de l’Automate va sur un territoire de son voisinage avec un jeton Rencontre, ou sur l’Usine s’il n’a pas encore de carte Usine (sans unité adverse ni mech de l’Automate). Retirez le jeton Rencontre ; sur l’Usine, il prend une carte Usine au hasard, face cachée.";
      break;
    case 'attaque':
      t = `Seulement si l’Automate a au moins ${d.min} de Puissance : son unité combattante la plus proche de sa base attaque le territoire voisin avec une unité combattante adverse, en choisissant celui qui en a le moins.`;
      break;
    case 'attaqueOuvriers':
      t = "Son unité combattante la plus proche de sa base va sur un territoire voisin avec des ouvriers adverses mais sans unité combattante (le plus de ressources d’abord). Les ouvriers retournent sur leur base, les ressources sont retirées.";
      break;
  }
  return t + fx(d.f);
}

export function libelleGain(g) {
  const n = g.n;
  switch (g.t) {
    case 'ouvrier': return n > 1 ? `${n} ouvriers` : 'Ouvrier';
    case 'persoMech': return n > 1 ? `${n} perso/mech` : 'Personnage ou mech';
    case 'piece': return `${n} pièce${n > 1 ? 's' : ''}`;
    case 'puissance': return `${n} Puissance`;
    case 'carteCombat': return `${n} carte${n > 1 ? 's' : ''} Combat`;
  }
}

export function expliquerGain(g, ultima = false) {
  let t;
  switch (g.t) {
    case 'ouvrier': t = `Déployez ${g.n > 1 ? g.n + ' ouvriers' : 'un ouvrier'} du Plateau Faction sur la base principale de l’Automate (s’il en reste).`; break;
    case 'persoMech': t = 'Si le personnage est sur le Plateau Faction, déployez-le sur la base principale ; sinon, déployez un mech (s’il en reste).'; break;
    case 'piece': t = `L’Automate gagne ${g.n} pièce${g.n > 1 ? 's' : ''}${ultima ? ' (+1 Ultimaszyna)' : ''}.`; break;
    case 'puissance': t = `L’Automate gagne ${g.n} de Puissance${ultima ? ' (+1 Ultimaszyna)' : ''}.`; break;
    case 'carteCombat': t = `L’Automate reçoit ${g.n > 1 ? g.n + ' cartes' : 'une carte'} Combat face cachée.`; break;
  }
  return t + fx(g.f);
}

export const RECRUE = {
  puissance: 'Puissance',
  piece: 'Pièce',
  popularite: 'Popularité',
  carteCombat: 'Carte Combat',
};
export function expliquerRecrue(r) {
  if (!r) return 'Aucun Bonus Recrue ce tour-ci.';
  const quoi = { puissance: '1 de Puissance', piece: '1 pièce', popularite: '1 de Popularité', carteCombat: '1 carte Combat' }[r];
  return `Si vous avez enrôlé la recrue « ${RECRUE[r]} », vous gagnez ${quoi}.`;
}
