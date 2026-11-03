// Les 19 cartes Automate (version à jour après Invaders from Afar, qui remplace
// définitivement 4 cartes du paquet de base). Données de règles ré-encodées à la main.
//
// Déplacements (ligne 1) : ouvrier | mech | perso | rencontre | attaque (min = Puissance requise) | attaqueOuvriers
// Gains (ligne 2)        : ouvrier | persoMech | piece | puissance | carteCombat (n = quantité)
// Recrue (ligne 3)       : puissance | piece | popularite | carteCombat | null
// f = action entre parenthèses, réservée à cette faction.

const D = (t, extra = {}) => ({ t, ...extra });
const G = (t, n = 1, f) => (f ? { t, n, f } : { t, n });
const P = (dep, gains, recrue = null) => ({ dep, gains, recrue });

export const CARTES = [
  { n: 1, saut: false, etoile: true, combat: { puissance: [6, 7, 7], cartes: 1 }, ressources: 1, prog: [
    P([D('ouvrier', { f: 'nordique' }), D('rencontre'), D('perso')], [G('puissance'), G('ouvrier')], 'puissance'),
    P([D('ouvrier')], [G('puissance', 4)], 'puissance')] },
  { n: 2, saut: false, etoile: true, combat: { puissance: [5, 6, 7], cartes: 2 }, ressources: 2, prog: [
    P([D('rencontre', { f: 'polania' }), D('ouvrier')], [G('piece', 1, 'crimee'), G('piece')]),
    P([D('rencontre', { f: 'polania' }), D('ouvrier')], [G('piece', 1, 'crimee'), G('carteCombat'), G('persoMech')], 'piece')] },
  { n: 3, saut: false, etoile: true, combat: { puissance: [3, 7, 7], cartes: 0 }, ressources: 0, prog: [
    P([D('ouvrier')], [G('puissance', 3)]),
    P([D('ouvrier')], [G('puissance', 2), G('ouvrier')], 'popularite')] },
  { n: 4, saut: true, etoile: false, combat: { puissance: [0, 1, 2], cartes: 1 }, ressources: 0, prog: [
    P([D('ouvrier')], [G('piece', 1, 'crimee'), G('carteCombat')], 'carteCombat'),
    P([D('ouvrier')], [G('piece', 1, 'crimee'), G('piece', 2)], 'puissance')] },
  { n: 5, saut: false, etoile: true, combat: { puissance: [2, 4, 7], cartes: 1 }, ressources: 4, prog: [
    P([D('rencontre', { f: 'albion' }), D('ouvrier')], [G('persoMech', 1, 'togawa'), G('ouvrier'), G('piece')], 'piece'),
    P([D('mech')], [G('puissance', 4), G('ouvrier')], 'carteCombat')] },
  { n: 6, saut: false, etoile: true, combat: { puissance: [7, 7, 7], cartes: 1 }, ressources: 0, prog: [
    P([D('ouvrier')], [G('puissance', 2)]),
    P([D('mech')], [G('piece', 1, 'crimee'), G('puissance', 2), G('persoMech')], 'puissance')] },
  { n: 7, saut: true, etoile: true, combat: { puissance: [5, 7, 7], cartes: 0 }, ressources: 2, prog: [
    P([D('attaque', { min: 5, f: 'saxons' }), D('ouvrier')], [G('ouvrier'), G('piece')], 'popularite'),
    P([D('attaque', { min: 5, f: 'saxons' }), D('mech')], [G('persoMech', 1, 'rusviet'), G('persoMech'), G('carteCombat')], 'piece')] },
  { n: 8, saut: true, etoile: true, combat: { puissance: [0, 5, 7], cartes: 2 }, ressources: 1, prog: [
    P([D('rencontre', { f: 'togawa' }), D('mech'), D('ouvrier')], [G('persoMech', 1, 'rusviet'), G('persoMech')]),
    P([D('rencontre', { f: 'togawa' }), D('mech')], [G('puissance', 1, 'saxons'), G('piece'), G('persoMech')], 'piece')] },
  { n: 9, saut: false, etoile: true, combat: { puissance: [4, 7, 7], cartes: 1 }, ressources: 3, prog: [
    P([D('rencontre', { f: 'polania' }), D('mech'), D('ouvrier')], [G('ouvrier'), G('persoMech')], 'popularite'),
    P([D('rencontre', { f: 'polania' }), D('mech')], [G('puissance', 3), G('ouvrier')], 'popularite')] },
  { n: 10, saut: false, etoile: true, combat: { puissance: [0, 0, 0], cartes: 1 }, ressources: 1, prog: [
    P([D('mech'), D('ouvrier')], [G('persoMech'), G('puissance', 2)]),
    P([D('mech')], [G('piece', 2), G('persoMech')])] },
  { n: 11, saut: false, etoile: true, combat: { puissance: [6, 7, 7], cartes: 2 }, ressources: 0, prog: [
    P([D('mech'), D('rencontre'), D('perso')], [G('ouvrier', 1, 'rusviet'), G('ouvrier'), G('piece')]),
    P([D('ouvrier', { f: 'nordique' }), D('rencontre'), D('perso')], [G('puissance', 3), G('ouvrier')], 'carteCombat')] },
  { n: 12, saut: false, etoile: true, combat: { puissance: [4, 5, 7], cartes: 2 }, ressources: 1, prog: [
    P([D('ouvrier', { f: 'nordique' }), D('mech')], [G('puissance', 4)]),
    P([D('ouvrier', { f: 'nordique' }), D('mech')], [G('carteCombat'), G('piece'), G('persoMech')], 'puissance')] },
  { n: 13, saut: false, etoile: true, combat: { puissance: [3, 5, 7], cartes: 3 }, ressources: 0, prog: [
    P([D('attaque', { min: 4, f: 'saxons' }), D('rencontre'), D('perso')], [G('piece')]),
    P([D('attaque', { min: 5, f: 'saxons' }), D('rencontre'), D('perso')], [G('carteCombat'), G('piece', 2)], 'piece')] },
  { n: 14, saut: false, etoile: true, combat: { puissance: [1, 1, 1], cartes: 1 }, ressources: 0, prog: [
    P([D('rencontre'), D('perso')], [G('ouvrier'), G('carteCombat')], 'carteCombat'),
    P([D('attaque', { min: 7 }), D('attaqueOuvriers'), D('mech')], [G('puissance', 3)], 'popularite')] },
  { n: 15, saut: false, etoile: true, combat: { puissance: [7, 7, 7], cartes: 0 }, ressources: 2, prog: [
    P([D('rencontre'), D('perso')], [G('puissance', 3), G('piece')], 'piece'),
    P([D('attaque', { min: 1 }), D('attaqueOuvriers'), D('rencontre'), D('perso')], [G('piece', 1, 'crimee'), G('piece')], 'carteCombat')] },
  { n: 16, saut: false, etoile: true, combat: { puissance: [5, 7, 7], cartes: 1 }, ressources: 4, prog: [
    P([D('rencontre'), D('perso')], [G('persoMech')]),
    P([D('attaque', { min: 5 }), D('attaqueOuvriers'), D('mech')], [G('puissance', 1, 'saxons'), G('persoMech'), G('piece')])] },
  { n: 17, saut: true, etoile: false, combat: { puissance: [7, 7, 7], cartes: 2 }, ressources: 2, prog: [
    P([D('attaque', { min: 6 }), D('attaqueOuvriers'), D('ouvrier')], [G('piece', 2)], 'puissance'),
    P([D('attaque', { min: 8 }), D('ouvrier')], [G('piece', 1, 'crimee'), G('piece'), G('ouvrier')], 'popularite')] },
  { n: 18, saut: false, etoile: true, combat: { puissance: [1, 1, 7], cartes: 0 }, ressources: 1, prog: [
    P([D('rencontre'), D('perso')], [G('ouvrier', 1, 'albion'), G('ouvrier'), G('piece')]),
    P([D('rencontre'), D('perso')], [G('persoMech', 1, 'albion'), G('ouvrier'), G('piece', 2)])] },
  { n: 19, saut: false, etoile: true, combat: { puissance: [7, 7, 7], cartes: 1 }, ressources: 1, prog: [
    P([D('attaqueOuvriers'), D('ouvrier')], [G('ouvrier')]),
    P([D('rencontre', { f: 'albion' }), D('attaqueOuvriers'), D('ouvrier')], [G('puissance', 3), G('piece')], 'carteCombat')] },
];

// Intervalles de Puissance du tableau Combat (bas gauche de la carte).
export const TRANCHES_COMBAT = [
  { de: 0, a: 7, libelle: '0–7' },
  { de: 8, a: 13, libelle: '8–13' },
  { de: 14, a: Infinity, libelle: '14+' },
];
