// Cartes Étoiles (niveaux de difficulté). Chaque case : 'eau' (interdit lacs/rivières),
// 'libre' (peut traverser), 'etoile' (l'Automate place une étoile).
const piste = (eau, motif) => [...Array(eau).fill('eau'), ...motif.split('').map((c) => (c === 'E' ? 'etoile' : 'libre'))];

export const NIVEAUX = {
  autometta: { nom: 'Autometta', public: 'Débutants', piste: piste(5, 'LLLLLELLLLELLELELEE'), sauteTours: true },
  automa: { nom: 'Automa', public: 'Normal', piste: piste(4, 'LLLLLELLLLELLELEEE') },
  automaszyna: { nom: 'Automaszyna', public: 'Vétérans', piste: piste(3, 'LLLLLLELLELELEEE') },
  ultimaszyna: { nom: 'Ultimaszyna', public: 'Experts', piste: piste(0, 'LLLLLLLLELLELELEEE'), ultima: true },
};
export const ORDRE_NIVEAUX = ['autometta', 'automa', 'automaszyna', 'ultimaszyna'];
