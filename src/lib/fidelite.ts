import { prisma } from "@/lib/prisma";

export const SEUIL_FIDELITE = 5;

// Le crédit fidélité n'est accordé qu'après une livraison réellement
// validée (cahier des charges §24) — jamais à la simple commande.
export async function crediterFidelite(clientId: string) {
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
