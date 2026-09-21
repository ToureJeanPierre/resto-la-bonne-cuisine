import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientCookie, getStaffSession } from "@/lib/auth";
import { notifier } from "@/lib/fidelite";

const STATUTS_ANNULABLES = ["RECUE", "CONFIRMEE"];

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const commande = await prisma.commande.findUnique({ where: { id: params.id } });
  if (!commande) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });

  const client = getClientCookie();
  const staff = await getStaffSession();
  const estProprietaire = client && client.id === commande.clientId;

  if (!staff && !estProprietaire) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  if (!staff && !STATUTS_ANNULABLES.includes(commande.statut)) {
    return NextResponse.json(
      { error: "Cette commande est déjà en préparation et ne peut plus être annulée." },
      { status: 400 }
    );
  }

  const updated = await prisma.commande.update({
    where: { id: params.id },
    data: { statut: "ANNULEE" },
  });

  await notifier(commande.clientId, `Commande #${commande.numero} annulée.`);

  return NextResponse.json(updated);
}
