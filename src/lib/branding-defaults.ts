// Constantes "sûres" pour les composants client (aucune dépendance Prisma,
// contrairement à branding.ts). Les deux sont tenus synchronisés à la main.
export const LOGO_PAR_DEFAUT = "/images/logo.webp";
// Logo propre à l'espace admin (distinct du logo client), pour que les deux
// applications installées se reconnaissent facilement sur l'écran d'accueil.
export const LOGO_ADMIN = "/images/logo-admin.jpg";
export const BANNER_PAR_DEFAUT = "/images/banner.webp";
export const COULEUR_GOLD_PAR_DEFAUT = "#C9A227";
export const COULEUR_INK_PAR_DEFAUT = "#132C54";

export function typeImageDepuisUrl(url: string): string {
  if (url.endsWith(".png")) return "image/png";
  if (url.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}
