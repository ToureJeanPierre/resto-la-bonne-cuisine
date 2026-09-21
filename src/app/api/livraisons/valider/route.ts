import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guards";
import { crediterFidelite, notifier } from "@/lib/fidelite";

export async function POST(req: NextRequest) {
  const guard = await requireRole("LIVREUR");
  if ("error" in guard) return guard.error;

  const { valeur, type } = await req.json();
  if (!valeur || !["qr", "code"].includes(type)) {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const commande = await prisma.commande.findFirst({
    where: type === "qr" ? { qrCode: valeur } : { codeSecours: valeur },
    include: { livraison: true },
  });

  if (!commande) {
    return NextResponse.json({ error: "Code ou QR Code introuvable" }, { status: 404 });
  }

  // §18 Sécurité de la livraison : empêcher double validation / commande déjà livrée.
  if (commande.statut === "LIVREE" || commande.livraison?.statut === "LIVREE") {
    return NextResponse.json({ error: "Cette commande a déjà été livrée." }, { status: 409 });
  }

  if (commande.statut === "ANNULEE") {
    return NextResponse.json({ error: "Cette commande a été annulée." }, { status: 409 });
  }

  if (type === "code" && commande.codeSecoursUtilise) {
    return NextResponse.json({ error: "Ce code a déjà été utilisé." }, { status: 409 });
  }

  const updated = await prisma.commande.update({
    where: { id: commande.id },
    data: {
      statut: "LIVREE",
      codeSecoursUtilise: type === "code" ? true : commande.codeSecoursUtilise,
      livraison: {
        update: {
          statut: "LIVREE",
          dateValidation: new Date(),
          livreurId: guard.session.sub,
        },
      },
    },
    include: { livraison: true },
  });

  if (!commande.fideliteCreditee) {
    await crediterFidelite(commande.clientId);
    await prisma.commande.update({
      where: { id: commande.id },
      data: { fideliteCreditee: true },
    });
  }

  await notifier(
    commande.clientId,
    `Commande #${commande.numero} livrée. Merci pour votre confiance !`
  );

  return NextResponse.json(updated);
}
