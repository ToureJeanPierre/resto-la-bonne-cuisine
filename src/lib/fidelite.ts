import { prisma } from "@/lib/prisma";

export const SEUIL_FIDELITE = 5;

// Le programme de fidélité peut être désactivé globalement (Paramètres)
// ou pour un client précis (fiche client) — dans ce cas, aucun crédit
// n'est accordé, silencieusement.
export async function fideliteEstActive(clientId: string): Promise<boolean> {
  const [parametres, client] = await Promise.all([
    prisma.parametres.findUnique({ where: { id: "site" }, select: { fideliteActive: true } }),
    prisma.client.findUnique({ where: { id: clientId }, select: { fideliteActive: true } }),
  ]);

  if (parametres && !parametres.fideliteActive) return false;
  if (client && !client.fideliteActive) return false;
  return true;
}

// Le crédit fidélité n'est accordé qu'après une livraison réellement
// validée (cahier des charges §24) — jamais à la simple commande.
export async function crediterFidelite(clientId: string) {
  if (!(await fideliteEstActive(clientId))) return null;

  const fidelite = await prisma.fidelite.upsert({
    where: { clientId },
    create: { clientId, credits: 1 },
    update: { credits: { increment: 1 } },
  });

  if (fidelite.credits >= SEUIL_FIDELITE) {
    const recompenses = Math.floor(fidelite.credits / SEUIL_FIDELITE);
    const resteCredits = fidelite.credits % SEUIL_FIDELITE;
    return prisma.fidelite.update({
      where: { clientId },
      data: {
        credits: resteCredits,
        recompensesDisponibles: { increment: recompenses },
      },
    });
  }

  return fidelite;
}

export async function notifier(clientId: string, message: string) {
  return prisma.notification.create({ data: { clientId, message } });
}
