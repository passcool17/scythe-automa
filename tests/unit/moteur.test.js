import { describe, it, expect } from 'vitest';
import { CARTES } from '../../src/donnees/cartes.js';
import { NIVEAUX, ORDRE_NIVEAUX } from '../../src/donnees/niveaux.js';
import {
  melanger, creerAutoma, jouerTour, piocherCombat, tranche, victoireCombat, totalEtoiles,
  creerPartie, action, annuler, benefices, gainsApplicables, signalerConflit, eauInterdite, carte, ressourcesConquete,
} from '../../src/moteur.js';

// Générateur pseudo-aléatoire déterministe (mulberry32).
function graine(s = 1) {
  return () => {
    s |= 0; s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Place une carte précise en haut de la pioche. */
function forcer(a, n) {
  a.pioche = [n, ...a.pioche.filter((x) => x !== n)];
}

describe('paquet Automate', () => {
  it('contient 19 cartes numérotées de 1 à 19, chacune avec 2 programmes', () => {
    expect(CARTES.map((c) => c.n)).toEqual(Array.from({ length: 19 }, (_, i) => i + 1));
    for (const c of CARTES) {
      expect(c.prog).toHaveLength(2);
      expect(c.combat.puissance).toHaveLength(3);
    }
  });
  it('cartes « saut » : 4, 7, 8 et 17', () => {
    expect(CARTES.filter((c) => c.saut).map((c) => c.n)).toEqual([4, 7, 8, 17]);
  });
  it('seules les cartes 4 et 17 ne font pas avancer la piste', () => {
    expect(CARTES.filter((c) => !c.etoile).map((c) => c.n)).toEqual([4, 17]);
  });
  it('répartition des cartes Combat engagées : 0×4, 1×9, 2×5, 3×1', () => {
    const compte = {};
    for (const c of CARTES) compte[c.combat.cartes] = (compte[c.combat.cartes] || 0) + 1;
    expect(compte).toEqual({ 0: 4, 1: 9, 2: 5, 3: 1 });
  });
  it('le mélange conserve toutes les cartes', () => {
    const m = melanger(CARTES.map((c) => c.n), graine(7));
    expect([...m].sort((a, b) => a - b)).toEqual(CARTES.map((c) => c.n));
  });
});

describe('pioche', () => {
  it('pioche la carte du dessus et la défausse', () => {
    const a = creerAutoma({ faction: 'rusviet', niveau: 'automa', rng: graine(2) });
    const dessus = a.pioche[0];
    const r = jouerTour(a, graine(3));
    expect(r.carte).toBe(dessus);
    expect(a.defausse[0]).toBe(dessus);
    expect(a.pioche).toHaveLength(18);
  });
  it('remélange la défausse quand la pioche est vide', () => {
    const a = creerAutoma({ faction: 'saxons', niveau: 'automaszyna', rng: graine(4) });
    a.pioche = [];
    a.defausse = CARTES.map((c) => c.n);
    const r = jouerTour(a, graine(5));
    expect(r.melange).toBe(true);
    expect(a.pioche.length + a.defausse.length).toBe(19);
  });
  it('une carte entre crochets d’une autre faction est ignorée', () => {
    const a = creerAutoma({ faction: 'saxons', niveau: 'automa', rng: graine(1) });
    const prog = carte(8).prog[0];
    const g = gainsApplicables(a, prog);
    expect(g.every((x) => !x.f || x.f === 'saxons')).toBe(true);
  });
});

describe('niveaux de difficulté', () => {
  const attendu = {
    autometta: { cases: 24, etoiles: [10, 15, 18, 20, 22, 23], eau: 5 },
    automa: { cases: 22, etoiles: [9, 14, 17, 19, 20, 21], eau: 4 },
    automaszyna: { cases: 19, etoiles: [9, 12, 14, 16, 17, 18], eau: 3 },
    ultimaszyna: { cases: 18, etoiles: [8, 11, 13, 15, 16, 17], eau: 0 },
  };
  for (const id of ORDRE_NIVEAUX) {
    it(`piste Étoiles de ${NIVEAUX[id].nom}`, () => {
      const p = NIVEAUX[id].piste;
      expect(p).toHaveLength(attendu[id].cases);
      expect(p.flatMap((c, i) => (c === 'etoile' ? [i] : []))).toEqual(attendu[id].etoiles);
      expect(p.filter((c) => c === 'eau')).toHaveLength(attendu[id].eau);
    });
  }
  it('Autometta saute son tour sur une carte « saut » sans avancer', () => {
    const a = creerAutoma({ faction: 'nordique', niveau: 'autometta', rng: graine(1) });
    forcer(a, 7);
    const r = jouerTour(a);
    expect(r.saute).toBe(true);
    expect(a.piste).toBe(0);
  });
  it('Automa joue normalement une carte « saut » et avance', () => {
    const a = creerAutoma({ faction: 'nordique', niveau: 'automa', rng: graine(1) });
    forcer(a, 7);
    const r = jouerTour(a);
    expect(r.saute).toBe(false);
    expect(a.piste).toBe(1);
  });
  it('Ultimaszyna gagne +1 pièce quand une carte donne des pièces', () => {
    const avec = CARTES.find((c) => c.prog[0].gains.some((g) => g.t === 'piece' && !g.f));
    const n = avec.prog[0].gains.filter((g) => g.t === 'piece' && !g.f).reduce((s, g) => s + g.n, 0);
    const u = creerAutoma({ faction: 'polania', niveau: 'ultimaszyna', rng: graine(1) });
    forcer(u, avec.n);
    jouerTour(u);
    expect(u.pieces).toBe(5 + n + 1);
  });
  it('les cases « eau » interdisent les lacs/rivières au début', () => {
    const a = creerAutoma({ faction: 'crimee', niveau: 'automa', rng: graine(1) });
    expect(eauInterdite(a)).toBe(true);
    const u = creerAutoma({ faction: 'crimee', niveau: 'ultimaszyna', rng: graine(1) });
    expect(eauInterdite(u)).toBe(false);
  });
});

describe('phases : Programme I → II et fin de partie', () => {
  it('passe au Programme II à la première étoile et remélange tout', () => {
    const a = creerAutoma({ faction: 'rusviet', niveau: 'ultimaszyna', rng: graine(9) });
    a.piste = 7; // case 8 = première étoile
    forcer(a, 1);
    const r = jouerTour(a, graine(10));
    expect(r.etoile).toBe(true);
    expect(r.changement).toBe(true);
    expect(a.programme).toBe(2);
    expect(a.pioche).toHaveLength(19);
    expect(a.defausse).toHaveLength(0);
  });
  it('piste de la Paix : le Programme II attend un conflit', () => {
    const a = creerAutoma({ faction: 'rusviet', niveau: 'ultimaszyna', rng: graine(9) });
    a.pisteDeLaPaix = true;
    a.piste = 7;
    forcer(a, 1);
    const r = jouerTour(a);
    expect(r.attente).toBe(true);
    expect(a.programme).toBe(1);
    expect(signalerConflit(a)).toBe(true);
    expect(a.programme).toBe(2);
  });
  it('fin de partie à 6 étoiles', () => {
    const a = creerAutoma({ faction: 'rusviet', niveau: 'automa', rng: graine(9) });
    a.etoilesPiste = 4;
    a.etoilesCombat = 1;
    expect(victoireCombat(a)).toBe(true);
    expect(totalEtoiles(a)).toBe(6);
  });
  it('au plus 2 étoiles de combat', () => {
    const a = creerAutoma({ faction: 'rusviet', niveau: 'automa', rng: graine(9) });
    victoireCombat(a); victoireCombat(a); victoireCombat(a);
    expect(a.etoilesCombat).toBe(2);
  });
  it('la piste ne dépasse jamais la dernière case', () => {
    const a = creerAutoma({ faction: 'albion', niveau: 'automa', rng: graine(3) });
    for (let i = 0; i < 200; i++) jouerTour(a, graine(i));
    expect(a.piste).toBe(NIVEAUX.automa.piste.length - 1);
    expect(a.etoilesPiste).toBe(6);
  });
});

describe('combat', () => {
  it('tranches de Puissance 0–7, 8–13, 14+', () => {
    expect([0, 7, 8, 13, 14, 16].map(tranche)).toEqual([0, 0, 1, 1, 2, 2]);
  });
  it('ne dépense jamais plus que ce que l’Automate possède', () => {
    const a = creerAutoma({ faction: 'crimee', niveau: 'automa', rng: graine(1) });
    a.puissance = 2;
    a.cartesCombat = 0;
    const r = piocherCombat(a);
    expect(r.puissance).toBeLessThanOrEqual(2);
    expect(r.cartes).toBe(0);
    expect(a.puissance).toBe(2 - r.puissance);
    expect(a.defausseCombat[0]).toBe(r.carte);
  });
  it('ressources à placer = cadre de la dernière carte jouée', () => {
    const a = creerAutoma({ faction: 'crimee', niveau: 'automa', rng: graine(1) });
    forcer(a, 5);
    jouerTour(a);
    expect(ressourcesConquete(a)).toBe(carte(5).ressources);
  });
});

describe('extensions', () => {
  it('Rise of Fenris – mods : achats et bénéfices', () => {
    expect(benefices('aucun')).toEqual([]);
    expect(benefices('infra')).toHaveLength(2);
    expect(benefices('mech')).toHaveLength(3);
    expect(benefices('deux')).toHaveLength(4);
  });
  it('mods Infra (deux) : 4 bénéfices Infra — carte 4 retirée, +2 cases, 1 butin', () => {
    const a = creerAutoma({ faction: 'togawa', niveau: 'automa', mods: 'deux', rng: graine(4) });
    expect(a.paquet).not.toContain(4);
    expect(a.pioche).toHaveLength(18);
    expect(a.piste).toBe(2);
    expect(a.butin).toHaveLength(1);
  });
  it('Vesna : 2 jetons de faction différents', () => {
    const a = creerAutoma({ faction: 'vesna', niveau: 'automa', rng: graine(8) });
    expect(a.jetonsVesna).toHaveLength(2);
    expect(new Set(a.jetonsVesna).size).toBe(2);
  });
  it('Fenris : aucune action entre crochets', () => {
    const a = creerAutoma({ faction: 'fenris', niveau: 'automa', rng: graine(8) });
    for (const c of CARTES) expect(gainsApplicables(a, c.prog[0]).every((g) => !g.f)).toBe(true);
  });
});

describe('partie et annulation', () => {
  it('3 Automates avec chacun son paquet et sa piste', () => {
    const p = creerPartie({
      automates: [
        { faction: 'rusviet', niveau: 'autometta' },
        { faction: 'albion', niveau: 'automa', aeronef: 'bombard' },
        { faction: 'togawa', niveau: 'ultimaszyna' },
      ], rng: graine(11),
    });
    expect(p.automates).toHaveLength(3);
    expect(p.automates[1].aeronef).toBe('bombard');
    jouerTour(p.automates[0]);
    expect(p.automates[0].pioche).toHaveLength(18);
    expect(p.automates[1].pioche).toHaveLength(19);
  });
  it('« Annuler » restaure l’état précédent', () => {
    let p = creerPartie({ automates: [{ faction: 'saxons', niveau: 'automa' }], rng: graine(12) });
    const avant = JSON.stringify(p.automates[0]);
    action(p, () => jouerTour(p.automates[0]));
    expect(JSON.stringify(p.automates[0])).not.toBe(avant);
    p = annuler(p);
    expect(JSON.stringify(p.automates[0])).toBe(avant);
    expect(p.historique).toHaveLength(0);
  });
});
