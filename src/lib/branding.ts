import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export * from "@/lib/branding-defaults";

// Mis en cache (avec tag "parametres") pour ne pas forcer en rendu
// dynamique les pages statiques (accueil) qui en dépendent indirectement
// via le layout racine. Invalidé immédiatement par revalidateTag dans
// PATCH /api/parametres dès que la restauratrice change un réglage.
//
// Côté serveur uniquement (dépend de Prisma) : les composants client
// doivent importer "@/lib/branding-defaults" directement, jamais ce fichier.
export const getParametresBranding = unstable_cache(
  async () => prisma.parametres.findUnique({ where: { id: "site" } }),
  ["parametres-branding"],
  { revalidate: 30, tags: ["parametres"] }
);
