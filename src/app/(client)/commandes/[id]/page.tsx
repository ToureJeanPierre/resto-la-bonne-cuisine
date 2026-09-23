import QRCode from "qrcode";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getClientCookie } from "@/lib/auth";
import { formatFCFA } from "@/lib/format";
import {
  StatutCommande,
  LABELS_MOYEN_PAIEMENT,
  MoyenPaiementType,
} from "@/lib/constants";
import AnnulerCommande from "@/components/AnnulerCommande";
import AvisForm from "@/components/AvisForm";

export const dynamic = "force-dynamic";

export default async function CommandeDetailPage({ params }: { params: { id: string } }) {
  const [commande, parametres] = await Promise.all([
    prisma.commande.findUnique({
      where: { id: params.id },
      include: { details: true, paiement: true, livraison: true, avis: true, client: true },
    }),
    prisma.parametres.findUnique({ where: { id: "site" }, select: { telephone: true } }),
  ]);
  if (!commande) notFound();

  const client = getClientCookie();
  if (!client || client.id !== commande.clientId) {
    return <p className="p-8 text-center text-ink/60">Commande introuvable.</p>;
  }

  const qrDataUrl =
    commande.modeLivraison === "LIVRAISON" && commande.statut !== "LIVREE" && commande.statut !== "ANNULEE"
      ? await QRCode.toDataURL(commande.qrCode, { width: 220, margin: 1 })
      : null;

  const statut = commande.statut as StatutCommande;

  return (
    <div className="space-y-5 p-4">
      <div>
        <h1 className="font-display text-2xl font-bold">Commande #{commande.numero}</h1>
        <p className="text-sm text-ink/60">
          {new Date(commande.createdAt).toLocaleString("fr-FR")}
        </p>
      </div>

      {statut === "ANNULEE" ? (
        <div className="card p-4 text-center text-red-700">❌ Commande annulée</div>
      ) : statut === "LIVREE" ? (
        <div className="card p-4 text-center text-green-700">
          ✅ Commande livrée. Bon appétit !
        </div>
      ) : (
        <div className="card p-4 text-center">
          <p className="font-semibold text-green-700">✅ Commande enregistrée avec succès</p>
          <p className="mt-1 text-sm text-ink/60">
            {commande.modeLivraison === "LIVRAISON"
              ? "Elle sera livrée sous peu."
              : "Elle sera prête à récupérer sous peu."}
          </p>
        </div>
      )}

      {qrDataUrl && (
        <div className="card flex flex-col items-center gap-2 p-4">
          <p className="font-semibold">Présentez ce QR Code au livreur</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrDataUrl} alt="QR Code de livraison" className="h-48 w-48" />
          <p className="text-sm text-ink/60">
            Code de secours : <span className="font-mono font-bold">{commande.codeSecours}</span>
          </p>
        </div>
      )}

      <div className="card space-y-2 p-4">
        <p className="font-semibold">Articles</p>
        {commande.details.map((d) => (
          <div key={d.id} className="flex justify-between text-sm">
            <span>
              {d.nomPlat} ×{d.quantite}
            </span>
            <span>{formatFCFA(d.prixUnitaire * d.quantite)}</span>
          </div>
        ))}
        {commande.modeLivraison === "LIVRAISON" && commande.fraisLivraisonConfirme && (
          <div className="flex justify-between text-sm">
            <span>Livraison</span>
            <span>{formatFCFA(commande.fraisLivraison)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-black/10 pt-2 font-bold">
          <span>Total</span>
          <span>{formatFCFA(commande.total)}</span>
        </div>
      </div>

      <div className="card space-y-1 p-4 text-sm text-ink/70">
        <p>
          Mode : {commande.modeLivraison === "LIVRAISON" ? "Livraison" : "Retrait"}
          {commande.adresseLivraison && ` — ${commande.adresseLivraison}`}
        </p>
        {commande.paiement && (
          <p>
            Paiement : {LABELS_MOYEN_PAIEMENT[commande.paiement.moyen as MoyenPaiementType]} —{" "}
            {commande.paiement.statut}
          </p>
        )}
      </div>

      {["RECUE", "CONFIRMEE"].includes(statut) && <AnnulerCommande commandeId={commande.id} />}

      {["EN_PREPARATION", "PRETE", "EN_LIVRAISON"].includes(statut) && parametres?.telephone && (
        <p className="text-center text-xs text-ink/50">
          Besoin de modifier ou d&apos;annuler cette commande ?{" "}
          <a href={`tel:${parametres.telephone.replace(/[^+\d]/g, "")}`} className="underline">
            Appelez-nous au {parametres.telephone}
          </a>
        </p>
      )}

      {statut === "LIVREE" && !commande.avis && <AvisForm commandeId={commande.id} />}
      {commande.avis && (
        <div className="card p-4 text-sm text-ink/70">
          Vous avez déjà noté cette commande : {"⭐".repeat(commande.avis.note)}
        </div>
      )}
    </div>
  );
}
