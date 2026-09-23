export const STATUTS_COMMANDE = [
  "RECUE",
  "CONFIRMEE",
  "EN_PREPARATION",
  "PRETE",
  "EN_LIVRAISON",
  "LIVREE",
  "ANNULEE",
] as const;
export type StatutCommande = (typeof STATUTS_COMMANDE)[number];

export const LABELS_STATUT_COMMANDE: Record<StatutCommande, string> = {
  RECUE: "Commande reçue",
  CONFIRMEE: "Confirmée",
  EN_PREPARATION: "En préparation",
  PRETE: "Prête",
  EN_LIVRAISON: "En livraison",
  LIVREE: "Livrée",
  ANNULEE: "Annulée",
};

export const ICONES_STATUT_COMMANDE: Record<StatutCommande, string> = {
  RECUE: "✅",
  CONFIRMEE: "✅",
  EN_PREPARATION: "🟠",
  PRETE: "🔵",
  EN_LIVRAISON: "🛵",
  LIVREE: "✅",
  ANNULEE: "❌",
};

// Statut simplifié montré au client : on ne détaille pas confirmée/en
// préparation/prête/en livraison, uniquement en cours, livrée ou annulée.
export function statutClientSimplifie(statut: StatutCommande): { icone: string; label: string } {
  if (statut === "ANNULEE") return { icone: "❌", label: "Annulée" };
  if (statut === "LIVREE") return { icone: "✅", label: "Livrée" };
  return { icone: "🟡", label: "En cours" };
}

export const MOYENS_PAIEMENT = ["WAVE", "ORANGE_MONEY", "A_LA_LIVRAISON", "TEST"] as const;
export type MoyenPaiementType = (typeof MOYENS_PAIEMENT)[number];

export const LABELS_MOYEN_PAIEMENT: Record<MoyenPaiementType, string> = {
  WAVE: "Wave",
  ORANGE_MONEY: "Orange Money",
  A_LA_LIVRAISON: "Paiement à la livraison",
  TEST: "Paiement TEST (simulation)",
};
