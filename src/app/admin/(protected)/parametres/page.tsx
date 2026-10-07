"use client";

import { useEffect, useState } from "react";
import ChangerMotDePasse from "@/components/ChangerMotDePasse";
import ChampPhoto from "@/components/ChampPhoto";
import {
  LOGO_PAR_DEFAUT,
  BANNER_PAR_DEFAUT,
  COULEUR_GOLD_PAR_DEFAUT,
  COULEUR_INK_PAR_DEFAUT,
} from "@/lib/branding-defaults";

export default function AdminParametresPage() {
  const [adresse, setAdresse] = useState("");
  const [telephone, setTelephone] = useState("");
  const [horaires, setHoraires] = useState("");
  const [fideliteActive, setFideliteActive] = useState(true);
  const [seuilFidelite, setSeuilFidelite] = useState(5);
  const [logoUrl, setLogoUrl] = useState(LOGO_PAR_DEFAUT);
  const [bannerUrl, setBannerUrl] = useState(BANNER_PAR_DEFAUT);
  const [couleurPrimaire, setCouleurPrimaire] = useState(COULEUR_GOLD_PAR_DEFAUT);
  const [couleurSombre, setCouleurSombre] = useState(COULEUR_INK_PAR_DEFAUT);
  const [chargement, setChargement] = useState(true);
  const [envoi, setEnvoi] = useState(false);
  const [enregistre, setEnregistre] = useState(false);

  useEffect(() => {
    fetch("/api/parametres")
      .then((r) => r.json())
      .then((data) => {
        setAdresse(data.adresse);
        setTelephone(data.telephone);
        setHoraires(data.horaires);
        setFideliteActive(data.fideliteActive ?? true);
        setSeuilFidelite(data.seuilFidelite ?? 5);
        setLogoUrl(data.logoUrl || LOGO_PAR_DEFAUT);
        setBannerUrl(data.bannerUrl || BANNER_PAR_DEFAUT);
        setCouleurPrimaire(data.couleurPrimaire || COULEUR_GOLD_PAR_DEFAUT);
        setCouleurSombre(data.couleurSombre || COULEUR_INK_PAR_DEFAUT);
      })
      .finally(() => setChargement(false));
  }, []);

  async function enregistrer() {
    setEnvoi(true);
    setEnregistre(false);
    await fetch("/api/parametres", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        adresse,
        telephone,
        horaires,
        logoUrl,
        bannerUrl,
        couleurPrimaire,
        couleurSombre,
        seuilFidelite,
      }),
    });
    setEnvoi(false);
    setEnregistre(true);
    // Les couleurs/images sont lues au chargement de la page (layout racine) :
    // on recharge après un court délai pour voir tout de suite le résultat.
    setTimeout(() => window.location.reload(), 800);
  }

  async function basculerFidelite(active: boolean) {
    setFideliteActive(active);
    await fetch("/api/parametres", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fideliteActive: active }),
    });
  }

  if (chargement) return <p className="text-ink/60">Chargement...</p>;

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold">Paramètres</h1>
      <p className="text-sm text-ink/60">
        Ces informations s&apos;affichent en pied de page de l&apos;application, sur
        l&apos;écran d&apos;accueil des clients.
      </p>

      <div className="card space-y-3 p-4">
        <label className="block">
          <span className="text-sm font-medium text-ink/70">Adresse</span>
          <input
            value={adresse}
            onChange={(e) => setAdresse(e.target.value)}
            className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink/70">Téléphone</span>
          <input
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink/70">Horaires</span>
          <input
            value={horaires}
            onChange={(e) => setHoraires(e.target.value)}
            className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </label>
      </div>

      <div className="card space-y-4 p-4">
        <div>
          <p className="font-semibold">🎨 Identité visuelle</p>
          <p className="text-sm text-ink/60">
            Logo, bannière et couleurs du site. Les changements s&apos;appliquent à toute
            l&apos;application dès que tu enregistres, sans rien redéployer.
          </p>
        </div>

        <ChampPhoto
          valeur={logoUrl}
          onChange={setLogoUrl}
          label="Logo"
          texteAlternatif="Logo du restaurant"
          emoji="🏠"
        />

        <ChampPhoto
          valeur={bannerUrl}
          onChange={setBannerUrl}
          label="Bannière (page d'accueil)"
          texteAlternatif="Bannière du restaurant"
          emoji="🖼️"
        />

        <div className="flex gap-4">
          <label className="flex-1">
            <span className="text-sm font-medium text-ink/70">Couleur principale</span>
            <input
              type="color"
              value={couleurPrimaire}
              onChange={(e) => setCouleurPrimaire(e.target.value)}
              className="mt-1 h-10 w-full rounded-lg border border-black/10"
            />
          </label>
          <label className="flex-1">
            <span className="text-sm font-medium text-ink/70">Couleur sombre (texte)</span>
            <input
              type="color"
              value={couleurSombre}
              onChange={(e) => setCouleurSombre(e.target.value)}
              className="mt-1 h-10 w-full rounded-lg border border-black/10"
            />
          </label>
        </div>
      </div>

      <button onClick={enregistrer} disabled={envoi} className="btn-primary w-full">
        {envoi ? "Enregistrement..." : enregistre ? "✅ Enregistré !" : "ENREGISTRER"}
      </button>

      <div className="card flex items-center justify-between p-4">
        <div>
          <p className="font-semibold">🎁 Programme de fidélité</p>
          <p className="text-sm text-ink/60">
            {fideliteActive ? "Actif pour tous les clients" : "Désactivé pour tous les clients"}
          </p>
        </div>
        <button
          onClick={() => basculerFidelite(!fideliteActive)}
          className={`relative h-7 w-12 flex-shrink-0 rounded-full transition ${
            fideliteActive ? "bg-gold" : "bg-black/20"
          }`}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
              fideliteActive ? "left-6" : "left-1"
            }`}
          />
        </button>
      </div>
      <p className="text-xs text-ink/50">
        Tu peux aussi désactiver la fidélité pour un client précis depuis sa fiche dans{" "}
        <span className="font-semibold">Admin → Clients</span>.
      </p>

      <label className="card block space-y-1 p-4">
        <span className="font-semibold">🍽️ Seuil de fidélité</span>
        <p className="text-sm text-ink/60">
          Nombre de repas livrés nécessaires pour obtenir un repas offert.
        </p>
        <input
          type="number"
          min={1}
          value={seuilFidelite}
          onChange={(e) => setSeuilFidelite(Math.max(1, Number(e.target.value) || 1))}
          className="mt-1 w-24 rounded-lg border border-black/10 px-3 py-2"
        />
        <span className="ml-2 text-sm text-ink/60">repas</span>
        <p className="text-xs text-ink/50">
          Enregistré avec le bouton ENREGISTRER plus haut.
        </p>
      </label>

      <ChangerMotDePasse />
    </div>
  );
}
