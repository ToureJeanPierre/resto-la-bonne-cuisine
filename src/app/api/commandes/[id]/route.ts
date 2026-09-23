import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guards";
import { getClientCookie } from "@/lib/auth";
import { notifier } from "@/lib/fidelite";

const MESSAGES: Record<string, string> = {
  CONFIRMEE: "Votre commande a été confirmée.",
  EN_PREPARATION: "Votre commande est en cours de préparation.",
  PRETE: "Votre commande est prête.",
  EN_LIVRAISON: "Votre commande est en livraison.",
  LIVREE: "Votre commande a été livrée. Bon appétit !",
  ANNULEE: "Votre commande a été annulée.",
};

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const commande = await prisma.commande.findUnique({
    where: { id: params.id },
    include: { details: true, client: true, paiement: true, livraison: true, avis: true },
  });
  if (!commande) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });

  const client = getClientCookie();
  const staff = await import("@/lib/auth").then((m) => m.getStaffSession());
  if (!staff && (!client || client.id !== commande.clientId)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  return NextResponse.json(commande);
}

const VALID_STATUTS = [
  "RECUE",
  "CONFIRMEE",
  "EN_PREPARATION",
  "PRETE",
  "EN_LIVRAISON",
  "LIVREE",
  "ANNULEE",
];

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireRole("ADMIN");
  if ("error" in guard) return guard.error;

  const { statut, fraisLivraison } = await req.json();

  if (statut !== undefined) {
    if (!VALID_STATUTS.includes(statut)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }

    const commande = await prisma.commande.update({
      where: { id: params.id },
      data: { statut },
    });

    if (statut === "EN_LIVRAISON") {
      await prisma.livraison.updateMany({
        where: { commandeId: commande.id },
        data: { statut: "EN_ROUTE" },
      });
    }

    if (MESSAGES[statut]) {
      await notifier(commande.clientId, `Commande #${commande.numero} — ${MESSAGES[statut]}`);
    }

    return NextResponse.json(commande);
  }

  if (fraisLivraison !== undefined) {
    const montant = Number(fraisLivraison);
    if (!Number.isFinite(montant) || montant < 0) {
      return NextResponse.json({ error: "Montant invalide" }, { status: 400 });
    }

    const existante = await prisma.commande.findUnique({
      where: { id: params.id },
      include: { details: true },
    });
    if (!existante) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });

    const sousTotal = existante.details.reduce((s, d) => s + d.prixUnitaire * d.quantite, 0);
    const total = Math.max(0, sousTotal + montant - existante.remiseFidelite);

    const commande = await prisma.commande.update({
      where: { id: params.id },
      data: { fraisLivraison: montant, fraisLivraisonConfirme: true, total },
    });

    await notifier(
      commande.clientId,
      `Commande #${commande.numero} — frais de livraison confirmés : ${montant} F. Nouveau total : ${total} F.`
    );

    return NextResponse.json(commande);
  }

  return NextResponse.json({ error: "Aucune modification fournie" }, { status: 400 });
}
