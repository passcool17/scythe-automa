import { CARTES, TRANCHES_COMBAT } from './donnees/cartes.js';
import { NIVEAUX } from './donnees/niveaux.js';
import { FACTIONS, FACTIONS_JETONS } from './donnees/factions.js';
import { ACHAT_MODS, BENEFICES_INFRA, BENEFICES_MECH } from './donnees/extensions.js';

export const MAX_ETOILES = 6;
export const PUISSANCE_MAX = 16;
export const carte = (n) => CARTES[n - 1];

export function melanger(liste, rng = Math.random) {
  const a = [...liste];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Factions dont l'Automate applique les actions entre parenthèses. */
export function factionsActives(a) {
  if (a.faction === 'fenris') return [];
  if (a.faction === 'vesna') return a.jetonsVesna || [];
  return [a.faction];
}

export function benefices(mods = 'aucun') {
  const { infra, mech } = ACHAT_MODS[mods] || ACHAT_MODS.aucun;
  return [...BENEFICES_INFRA.slice(0, infra), ...BENEFICES_MECH.slice(0, mech)];
}

/** Crée l'état d'un Automate. options : { faction, niveau, mods, rng, nom } */
export function creerAutoma({ faction, niveau, mods = 'aucun', rng = Math.random, nom, id = 1 }) {
  const f = FACTIONS[faction];
  const ben = benefices(mods);
  let numeros = CARTES.map((c) => c.n);
  if (ben.includes('retireCarte4')) numeros = numeros.filter((n) => n !== 4);
  if (ben.includes('retireCarte15')) numeros = numeros.filter((n) => n !== 15);
  const a = {
    id,
    nom: nom || `Automate ${id}`,
    faction,
    niveau,
    mods,
    jetonsVesna: faction === 'vesna' ? melanger(FACTIONS_JETONS, rng).slice(0, 2) : null,
    pioche: melanger(numeros, rng),
    defausse: [],
    defausseCombat: [],
    paquet: numeros,
    piste: ben.filter((b) => b === 'piste').length,
    programme: 1,
    etoilesPiste: 0,
    etoilesCombat: 0,
    etoilePuissance: false,
    autresEtoiles: 0,
    puissance: f.puissance ?? 0,
    pieces: 5,
    cartesCombat: f.cartes ?? 0,
    tour: 0,
    butin: [],
    dernier: null,
    // Rise of Fenris, piste de la Paix sans Alliances : Programme II retardé.
    pisteDeLaPaix: false,
    aCombattu: false,
    programmeIIEnAttente: false,
    // Invaders from Afar
    jetonsPose: 0,
    // The Wind Gambit
    aeronef: null,
  };
  // « Butin » : on pioche une carte et l'Automate reçoit les gains du Programme I.
  for (const b of ben) {
    if (b !== 'butin') continue;
    const n = a.pioche[Math.floor(rng() * a.pioche.length)];
    const gains = gainsApplicables(a, carte(n).prog[0]);
    a.butin.push({ carte: n, gains });
    appliquerGains(a, gains);
  }
  return a;
}

export function gainsApplicables(a, prog) {
  const fa = factionsActives(a);
  return prog.gains.filter((g) => !g.f || fa.includes(g.f));
}
export function deplacementsApplicables(a, prog) {
  const fa = factionsActives(a);
  return prog.dep.filter((d) => !d.f || fa.includes(d.f));
}

function appliquerGains(a, gains) {
  let piece = 0, puissance = 0, cartes = 0;
  for (const g of gains) {
    if (g.t === 'piece') piece += g.n;
    if (g.t === 'puissance') puissance += g.n;
    if (g.t === 'carteCombat') cartes += g.n;
  }
  const ultima = NIVEAUX[a.niveau]?.ultima;
  const bonus = { piece: ultima && piece > 0 ? 1 : 0, puissance: ultima && puissance > 0 ? 1 : 0 };
  a.pieces += piece + bonus.piece;
  const avant = a.puissance;
  a.puissance = Math.min(PUISSANCE_MAX, a.puissance + puissance + bonus.puissance);
  a.cartesCombat += cartes;
  let etoilePuissance = false;
  if (avant < PUISSANCE_MAX && a.puissance === PUISSANCE_MAX && !a.etoilePuissance) {
    a.etoilePuissance = true;
    etoilePuissance = true;
  }
  return { piece, puissance, cartes, bonus, etoilePuissance };
}

export const totalEtoiles = (a) =>
  a.etoilesPiste + a.etoilesCombat + (a.etoilePuissance ? 1 : 0) + (a.autresEtoiles || 0);

function remelanger(a, rng) {
  a.pioche = melanger([...a.pioche, ...a.defausse, ...a.defausseCombat], rng);
  a.defausse = [];
  a.defausseCombat = [];
}

function tirer(a, rng) {
  let melange = false;
  if (a.pioche.length === 0) {
    remelanger(a, rng);
    melange = true;
  }
  return { n: a.pioche.shift(), melange };
}

function passerProgrammeII(a, rng) {
  a.programme = 2;
  a.programmeIIEnAttente = false;
  a.pioche = melanger([...a.pioche, ...a.defausse, ...a.defausseCombat], rng);
  a.defausse = [];
  a.defausseCombat = [];
}

/** Tour de l'Automate : pioche, programme, piste Étoiles. Modifie `a` et renvoie un compte rendu. */
export function jouerTour(a, rng = Math.random) {
  const niv = NIVEAUX[a.niveau];
  const { n, melange } = tirer(a, rng);
  const c = carte(n);
  a.defausse.unshift(n);
  a.tour += 1;
  const r = { type: 'tour', carte: n, programme: a.programme, melange, saute: false, etoile: false, changement: false, fin: false };
  if (niv.sauteTours && c.saut) {
    r.saute = true;
    a.dernier = r;
    return r;
  }
  const prog = c.prog[a.programme - 1];
  r.deplacements = deplacementsApplicables(a, prog);
  r.gains = gainsApplicables(a, prog);
  r.recrue = prog.recrue;
  r.effet = appliquerGains(a, r.gains);
  if (c.etoile && a.piste < niv.piste.length - 1) {
    a.piste += 1;
    r.avance = true;
    if (niv.piste[a.piste] === 'etoile') {
      a.etoilesPiste += 1;
      r.etoile = true;
      if (a.programme === 1 && a.etoilesPiste === 1) {
        if (a.pisteDeLaPaix && !a.aCombattu) {
          a.programmeIIEnAttente = true;
          r.attente = true;
        } else {
          passerProgrammeII(a, rng);
          r.changement = true;
        }
      }
    }
  }
  r.fin = totalEtoiles(a) >= MAX_ETOILES;
  a.dernier = r;
  return r;
}

/** Piste de la Paix : l'Automate a combattu ou fait reculer un ouvrier. */
export function signalerConflit(a, rng = Math.random) {
  a.aCombattu = true;
  if (a.programmeIIEnAttente) {
    passerProgrammeII(a, rng);
    return true;
  }
  return false;
}

export function tranche(puissance) {
  return TRANCHES_COMBAT.findIndex((t) => puissance >= t.de && puissance <= t.a);
}

/** Combat : pioche sur la défausse Combat, calcule Puissance et cartes Combat engagées. */
export function piocherCombat(a, rng = Math.random) {
  const { n, melange } = tirer(a, rng);
  a.defausseCombat.unshift(n);
  const c = carte(n);
  const i = tranche(a.puissance);
  const indiquee = c.combat.puissance[i];
  const puissance = Math.min(indiquee, a.puissance);
  const cartes = Math.min(c.combat.cartes, a.cartesCombat);
  a.puissance -= puissance;
  a.cartesCombat -= cartes;
  const r = { type: 'combat', carte: n, melange, tranche: i, indiquee, puissance, cartes, cartesIndiquees: c.combat.cartes };
  if (a.pisteDeLaPaix) r.paixDebloquee = signalerConflit(a, rng);
  a.dernierCombat = r;
  return r;
}

/** Ressources à placer quand un humain conquiert un territoire de l'Automate. */
export function ressourcesConquete(a) {
  const n = a.defausse[0];
  return n ? carte(n).ressources : 0;
}

export function victoireCombat(a) {
  if (a.etoilesCombat < 2) a.etoilesCombat += 1;
  return totalEtoiles(a) >= MAX_ETOILES;
}

export function eauInterdite(a) {
  return NIVEAUX[a.niveau].piste[a.piste] === 'eau';
}

// ---- Partie : plusieurs Automates + historique pour « Annuler » ----
export function creerPartie({ automates, extensions = {}, rng = Math.random }) {
  return {
    version: 1,
    extensions,
    automates: automates.map((o, i) => {
      const a = creerAutoma({ ...o, id: i + 1, rng });
      if (o.aeronef) a.aeronef = o.aeronef;
      if (o.pisteDeLaPaix) a.pisteDeLaPaix = true;
      return a;
    }),
    actif: 0,
    historique: [],
    journal: [],
  };
}

const LIMITE_HISTORIQUE = 40;
export function action(partie, fn) {
  const avant = JSON.stringify({ ...partie, historique: [] });
  const resultat = fn(partie);
  partie.historique.push(avant);
  if (partie.historique.length > LIMITE_HISTORIQUE) partie.historique.shift();
  return resultat;
}
export function annuler(partie) {
  const avant = partie.historique.pop();
  if (!avant) return partie;
  const p = JSON.parse(avant);
  p.historique = partie.historique;
  return p;
}
