// Couche de paiement modulaire (cahier des charges §20-22).
// Chaque fournisseur implémente la même interface ; le mode TEST simule un
// paiement réussi pour permettre de développer tout le parcours sans
// dépendre des comptes marchands Wave / Orange Money.

export type MoyenPaiement = "WAVE" | "ORANGE_MONEY" | "A_LA_LIVRAISON" | "TEST";
export type StatutPaiement = "INITIE" | "EN_ATTENTE" | "CONFIRME" | "ECHOUE";

export interface PaymentResult {
  statut: StatutPaiement;
  reference: string;
}

export interface PaymentProvider {
  initier(commandeId: string, montant: number): Promise<PaymentResult>;
}

class TestProvider implements PaymentProvider {
  async initier(commandeId: string, montant: number): Promise<PaymentResult> {
    // Simulation de paiement réussi (mode développement).
    return { statut: "CONFIRME", reference: `TEST-${commandeId.slice(0, 8)}` };
  }
}

class ALaLivraisonProvider implements PaymentProvider {
  async initier(commandeId: string, montant: number): Promise<PaymentResult> {
    return { statut: "EN_ATTENTE", reference: `CASH-${commandeId.slice(0, 8)}` };
  }
}

class WaveProvider implements PaymentProvider {
  async initier(commandeId: string, montant: number): Promise<PaymentResult> {
    // TODO: brancher l'API Checkout Wave (clés API côté serveur uniquement).
    // Tant que le compte Wave Business n'est pas activé, on retombe en attente.
    return { statut: "EN_ATTENTE", reference: `WAVE-PENDING-${commandeId.slice(0, 8)}` };
  }
}

class OrangeMoneyProvider implements PaymentProvider {
  async initier(commandeId: string, montant: number): Promise<PaymentResult> {
    // TODO: brancher le service Web Payment / M Payment Orange Money.
    return { statut: "EN_ATTENTE", reference: `OM-PENDING-${commandeId.slice(0, 8)}` };
  }
}

const providers: Record<MoyenPaiement, PaymentProvider> = {
  TEST: new TestProvider(),
  A_LA_LIVRAISON: new ALaLivraisonProvider(),
  WAVE: new WaveProvider(),
  ORANGE_MONEY: new OrangeMoneyProvider(),
};

export function getPaymentProvider(moyen: MoyenPaiement): PaymentProvider {
  return providers[moyen];
}
