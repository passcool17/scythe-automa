import './style.css';
import { CARTES, TRANCHES_COMBAT } from './donnees/cartes.js';
import { NIVEAUX, ORDRE_NIVEAUX } from './donnees/niveaux.js';
import { FACTIONS } from './donnees/factions.js';
import { AERONEFS, LIBELLE_BENEFICE } from './donnees/extensions.js';
import {
  creerPartie, jouerTour, piocherCombat, victoireCombat, action, annuler, totalEtoiles,
  ressourcesConquete, eauInterdite, signalerConflit, benefices, carte, MAX_ETOILES, PUISSANCE_MAX,
} from './moteur.js';
import { icone } from './icones.js';
import { libelleDep, expliquerDep, libelleGain, expliquerGain, expliquerRecrue, RECRUE } from './textes.js';

const CLE = 'scythe-automa:partie:v1';
const CLE_CONFIG = 'scythe-automa:config:v1';
const app = document.getElementById('app');
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

let partie = charger(CLE);
let config = charger(CLE_CONFIG) || {
  boites: { invaders: true, wind: true, fenris: true },
  nombre: 1,
  automates: [
    { faction: 'rusviet', niveau: 'autometta', aeronef: '' },
    { faction: 'saxons', niveau: 'automa', aeronef: '' },
    { faction: 'crimee', niveau: 'automa', aeronef: '' },
  ],
  mods: 'aucun',
  paix: false,
  aeronefActif: false,
};
let ecran = partie ? 'partie' : 'config';
let vue = { aide: false };
let defiler = false;

function charger(cle) {
  try { return JSON.parse(localStorage.getItem(cle)); } catch { return null; }
}
function sauver() {
  if (partie) localStorage.setItem(CLE, JSON.stringify(partie)); else localStorage.removeItem(CLE);
  localStorage.setItem(CLE_CONFIG, JSON.stringify(config));
}

// ---------- Mise en place ----------
function factionsDispo() {
  return Object.entries(FACTIONS).filter(([, f]) =>
    f.boite === 'base' || (f.boite === 'invaders' && config.boites.invaders) || (f.boite === 'fenris' && config.boites.fenris));
}

function rendreConfig() {
  const b = config.boites;
  const blocs = config.automates.slice(0, config.nombre).map((a, i) => {
    if (!factionsDispo().some(([k]) => k === a.faction)) a.faction = 'rusviet';
    return `
    <fieldset class="bloc automate-config" style="--fc:${FACTIONS[a.faction].couleur}">
      <legend>Automate ${i + 1}</legend>
      <label>Faction
        <select data-champ="faction" data-i="${i}">${factionsDispo().map(([k, f]) =>
          `<option value="${k}" ${k === a.faction ? 'selected' : ''}>${f.nom}</option>`).join('')}</select>
      </label>
      <label>Difficulté (carte Étoiles)
        <select data-champ="niveau" data-i="${i}">${ORDRE_NIVEAUX.map((k) =>
          `<option value="${k}" ${k === a.niveau ? 'selected' : ''}>${NIVEAUX[k].nom} — ${NIVEAUX[k].public}</option>`).join('')}</select>
      </label>
      ${b.wind ? `<label>Aéronef (The Wind Gambit)
        <select data-champ="aeronef" data-i="${i}"><option value="">Sans aéronef</option>${AERONEFS.map((x) =>
          `<option value="${x.id}" ${x.id === a.aeronef ? 'selected' : ''}>${x.nom} (${x.en})</option>`).join('')}</select>
      </label>` : ''}
      ${a.faction === 'vesna' ? '<p class="note">Vesna : deux jetons Faction seront tirés au hasard ; l’Automate fera les actions entre parenthèses de ces deux factions.</p>' : ''}
      ${a.faction === 'fenris' ? '<p class="note">Fenris : l’Automate ignore toutes les actions entre parenthèses.</p>' : ''}
    </fieldset>`;
  }).join('');

  app.innerHTML = `
  <header class="barre"><h1>${icone('mech')} Scythe Automa</h1></header>
  <main class="config">
    <p class="intro">Compagnon pour jouer contre l’Automate de <strong>Scythe</strong> : il pioche les cartes Automate et vous explique quoi faire.</p>
    <fieldset class="bloc"><legend>Boîtes utilisées</legend>
      <label class="case"><input type="checkbox" checked disabled> Jeu de base</label>
      <label class="case"><input type="checkbox" data-boite="invaders" ${b.invaders ? 'checked' : ''}> Invaders from Afar (Albion, Togawa)</label>
      <label class="case"><input type="checkbox" data-boite="wind" ${b.wind ? 'checked' : ''}> The Wind Gambit (aéronefs)</label>
      <label class="case"><input type="checkbox" data-boite="fenris" ${b.fenris ? 'checked' : ''}> The Rise of Fenris (règles modulaires)</label>
    </fieldset>
    <fieldset class="bloc"><legend>Nombre d’Automates</legend>
      <div class="segment" role="group" aria-label="Nombre d’Automates">${[1, 2, 3].map((n) =>
        `<button type="button" data-nombre="${n}" class="${n === config.nombre ? 'actif' : ''}" aria-pressed="${n === config.nombre}">${n}</button>`).join('')}</div>
      ${config.nombre > 1 ? '<p class="note">Variante à plusieurs Automates : chacun a son paquet, sa piste Étoiles et passe au Programme II indépendamment.</p>' : ''}
    </fieldset>
    ${blocs}
    ${b.wind ? `<fieldset class="bloc"><legend>The Wind Gambit</legend>
      <label class="case"><input type="checkbox" data-opt="aeronefActif" ${config.aeronefActif ? 'checked' : ''}> Variante « aéronef plus actif » (3e déclencheur)</label>
      <p class="note">La tuile « Péage » (Toll) n’est pas compatible avec l’Automate.</p></fieldset>` : ''}
    ${b.fenris ? `<fieldset class="bloc"><legend>The Rise of Fenris</legend>
      <label>Mods en jeu
        <select data-opt="mods">
          ${[['aucun', 'Aucun Mod'], ['infra', 'Mods Infrastructure seulement (l’Automate en « achète » 2)'], ['mech', 'Mods Mech seulement (l’Automate en « achète » 3)'], ['deux', 'Les deux types (l’Automate « achète » 4 Mods Infrastructure)']]
            .map(([k, l]) => `<option value="${k}" ${config.mods === k ? 'selected' : ''}>${l}</option>`).join('')}
        </select></label>
      <label class="case"><input type="checkbox" data-opt="paix" ${config.paix ? 'checked' : ''}> Piste des Triomphes de la Paix, sans Alliances</label>
      <p class="note">Avec la piste de la Paix, l’Automate ne passe au Programme II qu’après sa 1re étoile <em>et</em> après avoir combattu ou fait reculer un ouvrier.</p>
    </fieldset>` : ''}
    <button class="principal" data-action="commencer">Commencer la partie</button>
    ${partie ? '<button class="secondaire" data-action="reprendre">Reprendre la partie en cours</button>' : ''}
    <p class="mentions">Scythe est une marque de Stonemaier Games. Application non officielle.</p>
  </main>`;
}

function commencer() {
  const opts = config.automates.slice(0, config.nombre).map((a, i) => ({
    faction: a.faction,
    niveau: a.niveau,
    nom: config.nombre > 1 ? `Automate ${i + 1}` : 'Automate',
    mods: config.boites.fenris ? config.mods : 'aucun',
    pisteDeLaPaix: config.boites.fenris && config.paix,
    aeronef: config.boites.wind && a.aeronef ? a.aeronef : null,
  }));
  partie = creerPartie({ automates: opts, extensions: { ...config.boites, aeronefActif: config.boites.wind && config.aeronefActif } });
  ecran = 'partie';
}

// ---------- Carte ----------
function rendreCarte(n, programme, a) {
  const c = carte(n);
  const prog = c.prog[programme - 1];
  const autre = c.prog[2 - programme];
  const ligne = (p, actif) => `
    <div class="ligne dep"><span class="tag">Déplacement</span>${p.dep.map((d) => puce(d.t, libelleDep(d), d.f, a && actif && d.f && !factionsOk(a, d.f))).join('<span class="ou">ou</span>')}</div>
    <div class="ligne gains"><span class="tag">Gains</span>${p.gains.map((g) => puce(g.t, libelleGain(g), g.f, a && actif && g.f && !factionsOk(a, g.f))).join('')}</div>
    <div class="ligne recrue"><span class="tag">Recrue</span>${p.recrue ? puce(p.recrue, RECRUE[p.recrue]) : '<span class="vide">—</span>'}</div>`;
  const t = a ? TRANCHES_COMBAT.findIndex((x) => a.puissance >= x.de && a.puissance <= x.a) : -1;
  return `
  <article class="carte prog${programme}" aria-label="Carte Automate n° ${n}, Programme ${programme === 1 ? 'I' : 'II'}">
    <div class="carte-haut">
      <span class="num">n° ${n}</span>
      <span class="titre-prog">Programme ${programme === 1 ? 'I' : 'II'}</span>
      ${c.saut ? `<span class="saut" title="Autometta : l’Automate passe son tour">${icone('saut')}</span>` : '<span></span>'}
    </div>
    <div class="prog-actif">${ligne(prog, true)}</div>
    <div class="carte-milieu">
      <span class="etoile ${c.etoile ? '' : 'grise'}" title="${c.etoile ? 'Avance la piste Étoiles' : 'N’avance pas la piste Étoiles'}">${icone('etoile')}</span>
    </div>
    <div class="carte-bas">
      <div class="tableau-combat" aria-label="Tableau de Combat">
        ${TRANCHES_COMBAT.map((x, i) => `<div class="tc ${i === t ? 'sel' : ''}"><small>${x.libelle}</small><b>${c.combat.puissance[i]}</b></div>`).join('')}
        <div class="tc cartes">${c.combat.cartes ? Array(c.combat.cartes).fill(icone('carteCombat')).join('') : '<small>0 carte</small>'}</div>
      </div>
      <div class="cadre-ressources" title="Cadre Ressources"><small>Ressources</small><b>${c.ressources}</b></div>
    </div>
    <div class="prog-autre" aria-hidden="true">${ligne(autre, false)}</div>
  </article>`;
}
function factionsOk(a, f) {
  if (a.faction === 'fenris') return false;
  if (a.faction === 'vesna') return (a.jetonsVesna || []).includes(f);
  return a.faction === f;
}
function puce(ic, texte, f, barre = false) {
  const fac = f ? FACTIONS[f] : null;
  return `<span class="puce ${fac ? 'faction' : ''} ${barre ? 'inactive' : ''}" ${fac ? `style="--pf:${fac.couleur}"` : ''}>
    ${fac ? `<span class="pastille" title="${fac.court}">${fac.court[0]}</span>` : ''}${icone(ic)}<span>${esc(texte)}</span></span>`;
}

// ---------- Explications du tour ----------
function rendreExplication(a, r) {
  if (r.saute) {
    return `<div class="explication saute"><h3>L’Automate passe son tour</h3>
      <p>Cette carte porte le symbole « passer » et vous jouez au niveau Autometta : l’Automate ne fait rien ce tour-ci (la piste Étoiles n’avance pas).</p></div>`;
  }
  const niv = NIVEAUX[a.niveau];
  const ext = partie.extensions;
  const deps = r.deplacements;
  const aFaction = deps.some((d) => d.f);
  const listeDep = deps.length ? `<ol class="etapes">${deps.map((d) => `<li><b>${esc(libelleDep(d))}</b> — ${esc(expliquerDep(d))}</li>`).join('')}</ol>` : '<p>Aucun déplacement possible.</p>';
  const rappels = [];
  if (eauInterdite(a)) rappels.push(`${icone('eau')} Le pion est encore sur une case « eau » : les unités de l’Automate ne vont pas sur les lacs et ne traversent pas les rivières.`);
  if (a.faction === 'albion' && deps.some((d) => d.t === 'rencontre')) rappels.push('Albion : après une action Rencontre/Usine, placez un Drapeau sur le territoire du personnage (s’il en reste).');
  if (a.faction === 'togawa' && deps.some((d) => d.t === 'rencontre')) rappels.push('Togawa : après une action Rencontre/Usine, placez un Piège au hasard, armé, sur le territoire du personnage. Si l’action n’est pas valide, le personnage va plutôt réarmer un Piège désarmé (le plus proche d’un ennemi, puis sens de lecture).');
  if ((a.faction === 'albion' || a.faction === 'togawa') && eauInterdite(a)) rappels.push('Tant que le pion est sur une case « eau », Albion et Togawa n’empruntent pas les tunnels.');
  if (a.faction === 'fenris' && deps.some((d) => d.t === 'perso' || d.t === 'rencontre')) rappels.push('Fenris : après avoir déplacé son personnage, l’Automate pose jusqu’à 3 jetons Influence (voir livret Rise of Fenris, encadré D).');
  if (a.aeronef && deps.some((d) => d.t === 'perso' || d.t === 'rencontre')) rappels.push(`${icone('aeronef')} Si le personnage se déplace sans attaquer, l’aéronef de l’Automate se déplace ensuite (selon sa carte aéronef).`);
  if (a.aeronef && deps.some((d) => ['mech', 'perso', 'attaque', 'attaqueOuvriers'].includes(d.t))) rappels.push('Unités combattantes : départage 1 = territoire le plus proche de l’aéronef de l’Automate ; départage 2 = territoire sans aéronef adverse.');
  const e = r.effet || {};
  const bonusUlti = niv.ultima && (e.bonus?.piece || e.bonus?.puissance);
  return `<div class="explication">
    <h3>1. Déplacement</h3>
    <p>${niv.ultima ? 'Ultimaszyna : faites <b>tous</b> les déplacements valides, dans l’ordre.' : 'Essayez dans l’ordre ; faites <b>seulement le premier</b> qui est valide.'}
      ${aFaction ? ' L’action de faction passe en premier si elle est possible.' : ''}</p>
    ${listeDep}
    ${rappels.map((t) => `<p class="rappel">${t}</p>`).join('')}
    <h3>2. Gains de l’Automate</h3>
    ${r.gains.length ? `<ul>${r.gains.map((g) => `<li>${esc(expliquerGain(g, niv.ultima && (g.t === 'piece' || g.t === 'puissance')))}</li>`).join('')}</ul>` : '<p>Aucun gain.</p>'}
    <p class="auto">Déjà compté par l’appli : Puissance, pièces et cartes Combat.${bonusUlti ? ' Bonus Ultimaszyna inclus.' : ''}</p>
    ${e.etoilePuissance ? '<p class="rappel fort">Puissance au maximum (16) : l’Automate place une étoile.</p>' : ''}
    <h3>3. Bonus Recrue (pour vous)</h3>
    <p>${esc(expliquerRecrue(r.recrue))}</p>
    <h3>4. Piste Étoiles</h3>
    <p>${r.avance ? 'Le pion avance d’une case.' : 'Le pion n’avance pas (étoile grise).'}
    ${r.etoile ? ' <b>L’Automate place une étoile !</b>' : ''}</p>
    ${r.changement ? '<p class="rappel fort">Première étoile de la piste : les deux défausses sont remélangées dans la pioche et l’Automate utilise maintenant le <b>Programme II</b>.</p>' : ''}
    ${r.attente ? '<p class="rappel fort">Piste de la Paix : le Programme II attendra que l’Automate ait combattu ou fait reculer un ouvrier.</p>' : ''}
  </div>`;
}

// ---------- Écran de partie ----------
function rendrePartie() {
  const a = partie.automates[partie.actif];
  const niv = NIVEAUX[a.niveau];
  const f = FACTIONS[a.faction];
  const tot = totalEtoiles(a);
  const fin = partie.automates.find((x) => totalEtoiles(x) >= MAX_ETOILES);
  const onglets = partie.automates.length > 1 ? `<nav class="onglets" role="tablist">${partie.automates.map((x, i) =>
    `<button role="tab" aria-selected="${i === partie.actif}" data-onglet="${i}" style="--fc:${FACTIONS[x.faction].couleur}">
      <span class="pastille-f"></span>${esc(x.nom)}<small>${FACTIONS[x.faction].court} · ${totalEtoiles(x)}★</small></button>`).join('')}</nav>` : '';
  const r = a.dernier;
  const rc = a.dernierCombat;
  const ben = benefices(a.mods);
  const aer = a.aeronef ? AERONEFS.find((x) => x.id === a.aeronef) : null;

  app.innerHTML = `
  <header class="barre">
    <h1>${icone('mech')} Scythe Automa</h1>
    <div class="outils">
      <button data-action="annuler" ${partie.historique.length ? '' : 'disabled'} title="Annuler la dernière action">↶ Annuler</button>
      <button data-action="aide" title="Rappel des règles">?</button>
      <button data-action="nouvelle" aria-label="Nouvelle partie" title="Nouvelle partie">Nouvelle</button>
    </div>
  </header>
  ${onglets}
  <main class="partie" style="--fc:${f.couleur}">
    ${fin ? `<div class="fin">🏁 ${esc(fin.nom)} a placé sa 6e étoile : la partie se termine immédiatement. Comptez les points.</div>` : ''}
    ${vue.aide ? rendreAide() : ''}
    <section class="fiche">
      <div class="entete">
        <div><h2>${esc(a.nom)}</h2>
          <p>${f.nom}${a.jetonsVesna ? ` <span class="jetons">(jetons : ${a.jetonsVesna.map((k) => FACTIONS[k].court).join(' + ')})</span>` : ''}<br>
          <span class="niveau">${niv.nom}</span> · tour ${a.tour}</p></div>
        <span class="badge-prog">Programme ${a.programme === 1 ? 'I' : 'II'}</span>
      </div>
      <div class="etoiles" aria-label="${tot} étoiles sur 6">${Array.from({ length: MAX_ETOILES }, (_, i) => `<span class="${i < tot ? 'pleine' : ''}">${icone('etoile')}</span>`).join('')}
        <small>Piste ${a.etoilesPiste} · Combats ${a.etoilesCombat}/2 · Puissance ${a.etoilePuissance ? 1 : 0}/1${a.autresEtoiles ? ` · Autres ${a.autresEtoiles}` : ''}</small></div>
      <div class="compteurs">
        ${compteur('puissance', 'Puissance', a.puissance)}
        ${compteur('pieces', 'Pièces', a.pieces, 'piece')}
        ${compteur('cartesCombat', 'Cartes Combat', a.cartesCombat, 'carteCombat')}
      </div>
      ${rendrePiste(a)}
    </section>

    <button class="principal piocher" data-action="tour" ${fin ? 'disabled' : ''}>Tour de l’Automate : piocher une carte</button>

    ${r ? `<section class="resultat">${rendreCarte(r.carte, r.programme, a)}${rendreExplication(a, r)}</section>`
        : '<p class="vide-tour">Appuyez sur le bouton pour jouer le premier tour de l’Automate.</p>'}

    <section class="bloc combat">
      <h2>${icone('attaque')} Combat</h2>
      <p>Quand un combat implique cet Automate, piochez une carte : seul son tableau Combat compte.</p>
      <button class="secondaire" data-action="combat">Piocher une carte Combat</button>
      ${rc ? `<div class="res-combat" role="status">
        <p>Carte n° ${rc.carte} · tranche ${TRANCHES_COMBAT[rc.tranche].libelle} → Puissance indiquée <b>${rc.indiquee}</b></p>
        <p class="gros">L’Automate engage <b>${rc.puissance}</b> de Puissance et <b>${rc.cartes}</b> carte${rc.cartes > 1 ? 's' : ''} Combat${rc.cartes < rc.cartesIndiquees ? ` (il n’en avait pas ${rc.cartesIndiquees})` : ''}.</p>
        <p class="auto">Puissance et cartes déjà retirées. S’il perd, ses unités combattantes retournent sur son Plateau Faction${niv.ultima ? ' (Ultimaszyna : sur sa base principale)' : ''}.</p>
        ${aer?.texte ? `<p class="rappel">${icone('aeronef')} Si le combat a lieu sur le territoire de son aéronef : ${esc(aer.texte.combat)}</p>` : aer ? `<p class="rappel">${icone('aeronef')} Si le combat a lieu sur le territoire de son aéronef, appliquez la section Combat de la carte aéronef « ${esc(aer.nom)} ».</p>` : ''}
      </div>` : ''}
      <div class="rangee">
        <button class="secondaire" data-action="victoire" ${a.etoilesCombat >= 2 ? 'disabled' : ''}>L’Automate gagne un combat (+1 ★, max 2)</button>
      </div>
      <p class="info">Si vous conquérez un territoire de l’Automate (attaque gagnée ou ouvrier seul), placez-y <b>${ressourcesConquete(a)}</b> ressource${ressourcesConquete(a) > 1 ? 's' : ''} (Cadre Ressources de la dernière carte de la défausse principale). Rien sur un lac, un village ou l’Usine.</p>
      ${partie.automates.length > 1 ? '<p class="info">Combat entre deux Automates : chacun pioche sa propre carte Combat (ouvrez l’autre onglet) ; aucune ressource n’est placée.</p>' : ''}
    </section>

    ${rendreExtensions(a, ben, aer)}

    <section class="bloc piles">
      <p>Pioche : <b>${a.pioche.length}</b> · Défausse : <b>${a.defausse.length}</b> · Défausse Combat : <b>${a.defausseCombat.length}</b> · Paquet : ${a.paquet.length} cartes</p>
      <div class="rangee">${compteur('autresEtoiles', 'Autres étoiles (Triomphes…)', a.autresEtoiles, 'etoile')}</div>
    </section>
    <p class="mentions">Scythe est une marque de Stonemaier Games. Application non officielle.</p>
  </main>`;
}

function compteur(cle, libelle, val, ic = cle) {
  return `<div class="compteur"><span class="lib">${icone(ic)} ${libelle}</span>
    <div class="ctrl"><button data-moins="${cle}" aria-label="${libelle} moins 1">−</button><b data-val="${cle}">${val}</b><button data-plus="${cle}" aria-label="${libelle} plus 1">+</button></div></div>`;
}

function rendrePiste(a) {
  const niv = NIVEAUX[a.niveau];
  return `<div class="piste" aria-label="Piste Étoiles ${niv.nom}">
    ${niv.piste.map((c, i) => `<span class="case ${c} ${i === a.piste ? 'ici' : ''} ${i < a.piste ? 'passee' : ''}" title="Case ${i}">${c === 'etoile' ? icone('etoile') : c === 'eau' ? icone('eau') : ''}</span>`).join('')}
  </div>
  <p class="etat-eau">${eauInterdite(a) ? `${icone('eau')} Lacs et rivières interdits pour l’instant.` : 'Les unités de l’Automate peuvent traverser rivières et lacs.'}</p>`;
}

function rendreExtensions(a, ben, aer) {
  const out = [];
  if (a.faction === 'albion' || a.faction === 'togawa') {
    const nom = a.faction === 'albion' ? 'Drapeaux' : 'Pièges';
    out.push(`<section class="bloc ext"><h2>Invaders from Afar — ${nom}</h2>
      <p>${nom} posés : <b>${a.jetonsPose}</b> / 4</p>
      <div class="rangee"><button class="secondaire" data-action="jeton-">−</button><button class="secondaire" data-action="jeton+">Poser un ${a.faction === 'albion' ? 'Drapeau' : 'Piège'}</button></div>
      ${a.faction === 'togawa' ? '<p class="note">Les Pièges sont mélangés face cachée sur le Plateau Faction. L’Automate ignore la perte de Popularité des Pièges.</p>' : ''}
    </section>`);
  }
  if (aer) {
    out.push(`<section class="bloc ext aeronef"><h2>${icone('aeronef')} Aéronef : ${esc(aer.nom)} <small>(${aer.en})</small></h2>
      <ul>
        <li>Chaque fois que le personnage de l’Automate se déplace sans attaquer, il bouge d’abord, puis l’aéronef.${partie.extensions.aeronefActif ? ' Variante active : ajoutez le 3e déclencheur indiqué dans le livret The Wind Gambit.' : ''}</li>
        <li>L’aéronef de l’Automate n’a ni capacité passive ni voisinage. « Adjacent » = les 6 territoires autour de lui. Il respecte la même restriction d’eau que les autres unités.</li>
        <li>Base campée : au début de son tour, s’il n’a aucune unité terrestre sur le plateau et que des ennemis contrôlent tous les territoires adjacents à sa base, ignorez les deux premières lignes de la carte et utilisez les symboles spéciaux du livret.</li>
      </ul>
      ${aer.texte ? `<div class="carte-aeronef"><p><b>Mouvement.</b> ${esc(aer.texte.mouvement)}</p><p><b>Capacité.</b> ${esc(aer.texte.capacite)}</p><p><b>Combat.</b> ${esc(aer.texte.combat)}</p></div>`
        : `<p class="note">Lisez la carte aéronef Automate « ${esc(aer.nom)} » de votre boîte pour son mouvement, sa capacité et sa règle de combat.</p>`}
      ${partie.extensions.wind ? '<p class="note">Résolutions : l’Automate déclenche les conditions de fin comme un joueur ; consultez la carte Résolution Automate correspondante.</p>' : ''}
    </section>`);
  }
  if (ben.length || a.pisteDeLaPaix || a.faction === 'vesna' || a.faction === 'fenris') {
    out.push(`<section class="bloc ext"><h2>The Rise of Fenris</h2>
      ${ben.length ? `<p>Mods de l’Automate :</p><ol>${ben.map((b) => `<li>${LIBELLE_BENEFICE[b]}</li>`).join('')}</ol>` : ''}
      ${a.butin.length ? `<p>Butin reçu à la mise en place : ${a.butin.map((x) => `carte n° ${x.carte} → ${x.gains.map(libelleGain).join(', ') || 'rien'}`).join(' ; ')}. Déployez les ouvriers et perso/mechs indiqués ; pièces et Puissance sont déjà comptées.</p>` : ''}
      ${a.jetonsVesna ? `<p>Vesna : l’Automate fait les actions entre parenthèses de <b>${a.jetonsVesna.map((k) => FACTIONS[k].nom).join('</b> et <b>')}</b>. Il ne reçoit pas les 3 cartes Usine supplémentaires.</p>` : ''}
      ${a.faction === 'fenris' ? '<p>Fenris : chaque unité ennemie que l’Automate fait reculer donne 1 jeton Influence à son propriétaire.</p>' : ''}
      ${a.pisteDeLaPaix ? `<p>Piste de la Paix : ${a.programme === 2 ? 'Programme II déjà actif.' : a.programmeIIEnAttente ? '<b>1re étoile atteinte</b> — le Programme II commence dès que l’Automate combat ou fait reculer un ouvrier.' : 'Programme II après la 1re étoile ET un combat ou un recul d’ouvrier.'}</p>
        <button class="secondaire" data-action="conflit" ${a.aCombattu ? 'disabled' : ''}>${a.aCombattu ? 'Conflit déjà noté' : 'Noter : l’Automate a combattu ou fait reculer un ouvrier'}</button>` : ''}
      <p class="note">Tesla contrôlé par l’Automate est traité comme un mech.</p>
    </section>`);
  }
  return out.join('');
}

function rendreAide() {
  return `<section class="bloc aide"><h2>Rappel : tour de l’Automate</h2>
    <ol>
      <li>Piochez une carte (l’appli le fait). Au niveau Autometta, le symbole ${icone('saut')} fait passer son tour.</li>
      <li>Déplacement : symboles de gauche à droite, seul le premier valide est fait. Les actions de faction ne comptent que pour cette faction.</li>
      <li>Gains : chaque symbole est appliqué. Bonus Recrue : pour vous, si vous avez la recrue correspondante.</li>
      <li>Piste Étoiles : avance d’une case si l’étoile n’est pas grise. Première étoile de la piste : Programme II et remélange.</li>
    </ol>
    <p>Sélection d’unité : la plus proche de sa base principale. Égalités : le plus proche de l’Usine, puis sens de lecture. Les unités de l’Automate se « téléportent » dans le voisinage de n’importe laquelle de ses unités.</p>
    <p>Fin : 6 étoiles. L’Automate marque 4 pièces par étoile, 3 par territoire contrôlé, sa Popularité reste à 10.</p>
    <button class="secondaire" data-action="aide">Fermer</button></section>`;
}

// ---------- Rendu et événements ----------
function rendre() {
  if (ecran === 'config') rendreConfig(); else rendrePartie();
  sauver();
}

app.addEventListener('change', (e) => {
  const t = e.target;
  if (t.dataset.boite) config.boites[t.dataset.boite] = t.checked;
  else if (t.dataset.champ) config.automates[+t.dataset.i][t.dataset.champ] = t.value;
  else if (t.dataset.opt) config[t.dataset.opt] = t.type === 'checkbox' ? t.checked : t.value;
  else return;
  rendre();
});

app.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b || b.disabled) return;
  const d = b.dataset;
  const a = partie?.automates[partie.actif];
  if (d.nombre) config.nombre = +d.nombre;
  else if (d.onglet) partie.actif = +d.onglet;
  else if (d.plus || d.moins) {
    const cle = d.plus || d.moins;
    action(partie, () => {
      const max = cle === 'puissance' ? PUISSANCE_MAX : 99;
      a[cle] = Math.max(0, Math.min(max, a[cle] + (d.plus ? 1 : -1)));
      if (cle === 'puissance' && a.puissance === PUISSANCE_MAX) a.etoilePuissance = true;
    });
  } else {
    switch (d.action) {
      case 'commencer': commencer(); break;
      case 'reprendre': ecran = 'partie'; break;
      case 'nouvelle':
        if (!confirm('Abandonner la partie en cours et revenir à la mise en place ?')) return;
        ecran = 'config'; partie = null; break;
      case 'tour': action(partie, () => jouerTour(a)); defiler = true; break;
      case 'combat': action(partie, () => piocherCombat(a)); break;
      case 'victoire': action(partie, () => victoireCombat(a)); break;
      case 'conflit': action(partie, () => signalerConflit(a)); break;
      case 'jeton+': action(partie, () => { a.jetonsPose = Math.min(4, a.jetonsPose + 1); }); break;
      case 'jeton-': action(partie, () => { a.jetonsPose = Math.max(0, a.jetonsPose - 1); }); break;
      case 'annuler': partie = annuler(partie); break;
      case 'aide': vue.aide = !vue.aide; break;
      default: return;
    }
  }
  rendre();
  if (defiler) {
    defiler = false;
    document.querySelector('.resultat')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});

rendre();

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
