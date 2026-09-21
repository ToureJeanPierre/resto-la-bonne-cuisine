import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guards";
import { getClientCookie, setClientCookie } from "@/lib/auth";
import { getPaymentProvider, MoyenPaiement } from "@/lib/payment";
import { genererCodeSecours } from "@/lib/format";
import { notifier } from "@/lib/fidelite";

type PanierItem = { platId: string; quantite: number };

const FRAIS_LIVRAISON = 500;

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
  const fraisLivraison = modeLivraison === "LIVRAISON" ? FRAIS_LIVRAISON : 0;

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

  const total = Math.max(0, sousTotal + fraisLivraison - remisePlatOffert);

  const dernierNumero = await prisma.commande.findFirst({
    orderBy: { numero: "desc" },
    select: { numero: true },
  });
  const numero = (dernierNumero?.numero ?? 1000) + 1;

  const commande = await prisma.commande.create({
    data: {
      numero,
      clientId: client.id,
      total,
      fraisLivraison,
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

export async function GET(req: NextRequest) {
  const statut = req.nextUrl.searchParams.get("statut");
  const asAdmin = req.nextUrl.searchParams.get("scope") === "admin";

  if (asAdmin) {
    const guard = await requireRole("ADMIN");
    if ("error" in guard) return guard.error;

    const commandes = await prisma.commande.findMany({
      where: statut ? { statut: statut as any } : undefined,
      include: { details: true, client: true, paiement: true, livraison: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(commandes);
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
