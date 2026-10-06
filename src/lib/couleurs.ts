// Éclaircit (pourcentage > 0) ou assombrit (pourcentage < 0) une couleur hex,
// pour générer les variantes claire/foncée d'une seule couleur choisie dans
// l'admin (voir "gold-light" / "gold-dark" dans tailwind.config.ts).
export function ajusterCouleur(hex: string, pourcentage: number): string {
  const nombre = parseInt(hex.replace("#", ""), 16);
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));

  const r = clamp(((nombre >> 16) & 0xff) + 255 * pourcentage);
  const g = clamp(((nombre >> 8) & 0xff) + 255 * pourcentage);
  const b = clamp((nombre & 0xff) + 255 * pourcentage);

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
