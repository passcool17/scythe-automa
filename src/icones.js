// Pictogrammes maison (SVG en ligne, 24×24).
const P = {
  ouvrier: '<circle cx="12" cy="6" r="3.2"/><path d="M7 21l1.6-9h6.8L17 21z"/>',
  mech: '<path d="M12 3l2 2.4 3-.6.6 3L20 9.5l-1.2 2.5L20 14.5l-2.4 1.7-.6 3-3-.6L12 21l-2-2.4-3 .6-.6-3L4 14.5 5.2 12 4 9.5l2.4-1.7.6-3 3 .6z"/><circle cx="12" cy="12" r="3" fill="var(--fond-icone,#f4ead2)"/>',
  perso: '<circle cx="12" cy="5.5" r="3"/><path d="M6 21l1.5-10h9L18 21h-4l-2-5-2 5z"/><path d="M12 9.2l.9 1.8 2 .3-1.4 1.4.3 2-1.8-1-1.8 1 .3-2-1.4-1.4 2-.3z" fill="var(--fond-icone,#f4ead2)"/>',
  rencontre: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 6.5l1.6 3.4 3.7.4-2.8 2.5.8 3.7L12 14.6l-3.3 1.9.8-3.7-2.8-2.5 3.7-.4z"/>',
  attaque: '<path d="M4 3l9 9-2 2-9-9V3zM20 3v2l-9 9-2-2 9-9zM5 15l4 4-2 2-1-1-2 1-1-1 1-2-1-1zM19 15l2 2-1 1 1 2-1 1-2-1-1 1-2-2z"/>',
  attaqueOuvriers: '<path d="M4 3l9 9-2 2-9-9V3z"/><circle cx="17" cy="9" r="2.6"/><path d="M13.5 21l1.2-7h4.6l1.2 7z"/>',
  piece: '<circle cx="12" cy="12" r="9"/><text x="12" y="16.5" text-anchor="middle" font-size="12" font-weight="700" fill="var(--fond-icone,#f4ead2)">$</text>',
  puissance: '<path d="M13 2L5 13h6l-2 9 9-12h-6z"/>',
  carteCombat: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M12 7l3 5-3 5-3-5z" fill="var(--fond-icone,#f4ead2)"/>',
  popularite: '<path d="M12 21s-8-5.2-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 10c0 5.8-8 11-8 11z"/>',
  persoMech: '<circle cx="8" cy="6" r="2.6"/><path d="M3.5 19l1.2-8h6.6l1.2 8z"/><path d="M17 8l1.3 1.5 1.9-.4.4 1.9 1.4 1-.8 1.6.8 1.6-1.5 1-.4 1.9-1.9-.4L17 19l-1.3-1.5-1.9.4-.4-1.9-1.4-1 .8-1.6-.8-1.6 1.5-1 .4-1.9 1.9.4z"/>',
  etoile: '<path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5L2.5 9.3l6.6-.8z"/>',
  recrue: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7z"/><path d="M17 3h4v4" fill="none" stroke="currentColor" stroke-width="2"/>',
  saut: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M5.6 18.4L18.4 5.6" stroke="currentColor" stroke-width="2.4"/>',
  eau: '<path d="M2 9c3-3 5 3 8 0s5 3 8 0 3 0 4-1v4c-1 1-1 1-4 1s-5-3-8 0-5-3-8 0z"/><path d="M2 16c3-3 5 3 8 0s5 3 8 0 3 0 4-1v3c-1 1-1 1-4 1s-5-3-8 0-5-3-8 0z"/>',
  aeronef: '<ellipse cx="12" cy="9" rx="9" ry="4.5"/><path d="M9 15h6l-1 3h-4z"/><path d="M10 13.4l-1 1.6M14 13.4l1 1.6" stroke="currentColor" stroke-width="1.5"/>',
};
export function icone(nom, cls = '') {
  return `<svg class="ico ${cls}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${P[nom] || ''}</svg>`;
}
