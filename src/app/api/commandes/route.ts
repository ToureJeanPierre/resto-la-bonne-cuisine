import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guards";
import { getClientCookie, setClientCookie } from "@/lib/auth";
import { getPaymentProvider, MoyenPaiement } from "@/lib/payment";
import { genererCodeSecours } from "@/lib/format";
import { notifier } from "@/lib/fidelite";

type PanierItem = { platId: string; quantite: number };

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    nom,
    telephone,
    items,
    modeLivraison,
    adresseLivraison,
    precisionAdresse,
    moyenPaiement,
    utiliserRecompense,
  }: {
    nom: string;
    telephone: string;
    items: PanierItem[];
    modeLivraison: "LIVRAISON" | "RETRAIT";
    adresseLivraison?: string;
    precisionAdresse?: string;
    moyenPaiement: MoyenPaiement;
    utiliserRecompense?: boolean;
  } = body;

  if (!nom || !telephone || !items?.length || !modeLivraison || !moyenPaiement) {
    return NextResponse.json({ error: "Informations de commande incomplètes" }, { status: 400 });
  }

  if (modeLivraison === "LIVRAISON" && !adresseLivraison) {
    return NextResponse.json({ error: "Adresse de livraison requise" }, { status: 400 });
  }

  const platIds = items.map((i) => i.platId);
  const plats = await prisma.plat.findMany({ where: { id: { in: platIds } } });

  for (const item of items) {
    const plat = plats.find((p) => p.id === item.platId);
    if (!plat) {
      return NextResponse.json({ error: "Un des plats est introuvable" }, { status: 400 });
    }
    if (!plat.disponible) {
      return NextResponse.json(
        { error: `${plat.nom} n'est plus disponible` },
        { status: 400 }
      );
    }
  }

  const sousTotal = items.reduce((sum, item) => {
    const plat = plats.find((p) => p.id === item.platId)!;
    return sum + plat.prix * item.quantite;
  }, 0);

  const client = await prisma.client.upsert({
    where: { telephone },
    create: { nom, telephone, adresse: adresseLivraison ?? null },
    update: { nom, ...(adresseLivraison && { adresse: adresseLivraison }) },
  });

  // §25 Utilisation de la récompense : empêcher qu'une même récompense
  // soit utilisée plusieurs fois — on décrémente ici, sous condition.
  let remisePlatOffert = 0;
  if (utiliserRecompense) {
    const fidelite = await prisma.fidelite.findUnique({ where: { clientId: client.id } });
    if (fidelite && fidelite.recompensesDisponibles > 0) {
      const platMoinsCher = items
        .map((item) => plats.find((p) => p.id === item.platId)!)
        .sort((a, b) => a.prix - b.prix)[0];
      remisePlatOffert = platMoinsCher.prix;
      await prisma.fidelite.update({
        where: { clientId: client.id },
        data: { recompensesDisponibles: { decrement: 1 } },
      });
    }
  }

  // Pas de frais de livraison automatique : la restauratrice les fixe
  // elle-même au cas par cas (jour, distance, client) depuis l'admin.
  // Le retrait n'a jamais de frais, donc rien à confirmer dans ce cas.
  const fraisLivraisonConfirme = modeLivraison === "RETRAIT";
  const total = Math.max(0, sousTotal - remisePlatOffert);

  // Le numéro de commande vient d'un compteur en base incrémenté de façon
  // atomique (UPDATE verrouillé au niveau de la ligne par Postgres) : deux
  // commandes créées au même instant ne peuvent jamais recevoir le même
  // numéro, contrairement à un simple "dernier numéro + 1" en lecture.
  const commande = await prisma.$transaction(async (tx) => {
    const compteur = await tx.compteur.update({
      where: { id: "commande" },
      data: { valeur: { increment: 1 } },
    });

    return tx.commande.create({
      data: {
        numero: compteur.valeur,
        clientId: client.id,
        total,
        fraisLivraison: 0,
        fraisLivraisonConfirme,
        remiseFidelite: remisePlatOffert,
        modeLivraison,
        adresseLivraison: adresseLivraison ?? null,
        precisionAdresse: precisionAdresse ?? null,
        qrCode: randomUUID(),
        codeSecours: genererCodeSecours(),
        details: {
          create: items.map((item) => {
            const plat = plats.find((p) => p.id === item.platId)!;
            return {
              platId: plat.id,
              nomPlat: plat.nom,
              quantite: item.quantite,
              prixUnitaire: plat.prix,
            };
          }),
        },
      },
      include: { details: true },
    });
  });

  const provider = getPaymentProvider(moyenPaiement);
  const resultat = await provider.initier(commande.id, total);

  await prisma.paiement.create({
    data: {
      commandeId: commande.id,
      moyen: moyenPaiement,
      montant: total,
      statut: resultat.statut,
      reference: resultat.reference,
    },
  });

  if (modeLivraison === "LIVRAISON") {
    await prisma.livraison.create({
      data: {
        commandeId: commande.id,
        adresse: adresseLivraison,
      },
    });
  }

  await notifier(client.id, `Commande #${commande.numero} reçue. Merci !`);

  setClientCookie({ id: client.id, nom: client.nom, telephone: client.telephone });

  return NextResponse.json(commande, { status: 201 });
}

const LIMITE_PAR_DEFAUT = 20;

export async function GET(req: NextRequest) {
  const statut = req.nextUrl.searchParams.get("statut");
  const asAdmin = req.nextUrl.searchParams.get("scope") === "admin";

  if (asAdmin) {
    const guard = await requireRole("ADMIN");
    if ("error" in guard) return guard.error;

    const page = Math.max(1, Number(req.nextUrl.searchParams.get("page")) || 1);
    const limit = Math.max(1, Number(req.nextUrl.searchParams.get("limit")) || LIMITE_PAR_DEFAUT);
    const where = statut ? { statut: statut as any } : undefined;

    const [total, commandes] = await Promise.all([
      prisma.commande.count({ where }),
      prisma.commande.findMany({
        where,
        include: { details: true, client: true, paiement: true, livraison: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    return NextResponse.json({ commandes, total, page, limit });
  }

  const client = getClientCookie();
  if (!client) return NextResponse.json([]);

  const commandes = await prisma.commande.findMany({
    where: { clientId: client.id },
    include: { details: true, paiement: true, livraison: true, avis: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(commandes);
}
