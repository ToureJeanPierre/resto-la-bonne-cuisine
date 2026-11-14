import { NextRequest } from "next/server";

// Limiteur en mémoire, par instance serverless. Une instance Vercel reste
// « chaude » pendant une rafale de requêtes rapprochées (exactement le cas
// d'un script qui spamme un formulaire) : ça freine ce cas-là sans nouvelle
// infra (Redis, etc.), au prix de ne pas tenir sur plusieurs instances ni
// après un redémarrage à froid. Insuffisant seul contre une attaque distribuée,
// mais une protection réelle contre l'abus le plus probable sur cette appli.
const compteurs = new Map<string, { debut: number; total: number }>();

// Purge périodique pour éviter une fuite mémoire sur une instance longtemps
// chaude (chaque entrée ne pèse presque rien, mais autant nettoyer).
setInterval(() => {
  const maintenant = Date.now();
  for (const [cle, v] of compteurs) {
    if (maintenant - v.debut > 10 * 60_000) compteurs.delete(cle);
  }
}, 5 * 60_000);

export function ipDeLaRequete(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "inconnu";
}

/** Retourne true si la limite est dépassée pour cette clé. */
export function limiteDepassee(cle: string, max: number, fenetreMs: number): boolean {
  const maintenant = Date.now();
  const entree = compteurs.get(cle);

  if (!entree || maintenant - entree.debut > fenetreMs) {
    compteurs.set(cle, { debut: maintenant, total: 1 });
    return false;
  }

  entree.total += 1;
  return entree.total > max;
}
