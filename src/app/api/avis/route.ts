import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getClientCookie } from "@/lib/auth";
import { requireRole } from "@/lib/guards";
import { ipDeLaRequete, limiteDepassee } from "@/lib/rate-limit";

const COMMENTAIRE_MAX = 500;

export async function GET(req: NextRequest) {
  const scope = req.nextUrl.searchParams.get("scope");

  if (scope === "admin") {
    const guard = await requireRole("ADMIN");
    if ("error" in guard) return guard.error;

    const avis = await prisma.avis.findMany({
      where: { commande: { supprimeLe: null } },
      include: { client: true, commande: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(avis);
  }

  const avis = await prisma.avis.findMany({
    where: { masque: false, commande: { supprimeLe: null } },
    include: { client: { select: { nom: true } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const moyenne =
    avis.length > 0 ? avis.reduce((sum, a) => sum + a.note, 0) / avis.length : null;

  return NextResponse.json({ avis, moyenne, total: avis.length });
}

export async function POST(req: NextRequest) {
  if (limiteDepassee(`avis:${ipDeLaRequete(req)}`, 10, 10 * 60_000)) {
    return NextResponse.json({ error: "Trop d'envois. Réessayez plus tard." }, { status: 429 });
  }

  const client = await getClientCookie();
  if (!client) return NextResponse.json({ error: "Non identifié" }, { status: 401 });

  const { commandeId, note, commentaire } = await req.json();
  if (!commandeId || !note) {
    return NextResponse.json({ error: "Note et commande requises" }, { status: 400 });
  }
  if (!Number.isFinite(Number(note))) {
    return NextResponse.json({ error: "Note invalide" }, { status: 400 });
  }
  if (commentaire && (typeof commentaire !== "string" || commentaire.length > COMMENTAIRE_MAX)) {
    return NextResponse.json(
      { error: `Commentaire trop long (${COMMENTAIRE_MAX} caractères max)` },
      { status: 400 }
    );
  }

  const commande = await prisma.commande.findUnique({ where: { id: commandeId } });
  if (!commande || commande.clientId !== client.id) {
    return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  }
  if (commande.statut !== "LIVREE") {
    return NextResponse.json(
      { error: "L'avis n'est possible qu'après livraison." },
      { status: 400 }
    );
  }

  const existant = await prisma.avis.findUnique({ where: { commandeId } });
  if (existant) {
    return NextResponse.json({ error: "Avis déjà envoyé pour cette commande." }, { status: 409 });
  }

  const avis = await prisma.avis.create({
    data: {
      clientId: client.id,
      commandeId,
      note: Math.min(5, Math.max(1, Number(note))),
      commentaire: commentaire ?? null,
    },
  });

  revalidatePath("/avis");
  revalidatePath("/");

  return NextResponse.json(avis, { status: 201 });
}
