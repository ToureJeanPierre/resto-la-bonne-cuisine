import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guards";
import { getClientCookie } from "@/lib/auth";
import { notifier } from "@/lib/fidelite";
import { verifierMotDePasseAdmin } from "@/lib/verifierMotDePasse";

// Le client ne voit qu'un suivi simplifié : pas de notification pour
// chaque étape interne (confirmée, en préparation, prête, en livraison),
// seulement la livraison et l'annulation.
const MESSAGES: Record<string, string> = {
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

  const { statut, fraisLivraison, supprimeLe } = await req.json();

  if (supprimeLe !== undefined) {
    const commande = await prisma.commande.update({
      where: { id: params.id },
      data: { supprimeLe: supprimeLe ? new Date() : null },
    });
    return NextResponse.json(commande);
  }

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

// Suppression définitive (depuis la corbeille uniquement) : la commande doit
// déjà être à la corbeille, et le mot de passe admin est revérifié pour
// confirmer ce geste irréversible. Détails, paiement et livraison partent
// avec elle (onDelete: Cascade sur le schéma).
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireRole("ADMIN");
  if ("error" in guard) return guard.error;

  const { motDePasse } = await req.json();
  if (!motDePasse || !(await verifierMotDePasseAdmin(motDePasse))) {
    return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
  }

  const commande = await prisma.commande.findUnique({ where: { id: params.id } });
  if (!commande) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  if (!commande.supprimeLe) {
    return NextResponse.json(
      { error: "Cette commande doit d'abord être mise à la corbeille" },
      { status: 400 }
    );
  }

  await prisma.commande.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}
