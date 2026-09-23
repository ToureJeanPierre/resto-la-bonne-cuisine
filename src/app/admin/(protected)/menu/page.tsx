"use client";

import { useEffect, useState } from "react";
import { formatFCFA } from "@/lib/format";
import type { Plat } from "@/components/PlatCard";
import ChampPhoto from "@/components/ChampPhoto";

const PLAT_VIDE = { nom: "", description: "", prix: "", categorie: "", photo: "" };

export default function AdminMenuPage() {
  const [plats, setPlats] = useState<Plat[]>([]);
  const [formulaireOuvert, setFormulaireOuvert] = useState(false);
  const [enEdition, setEnEdition] = useState<string | null>(null);
  const [form, setForm] = useState(PLAT_VIDE);
  const [chargement, setChargement] = useState(true);

  function charger() {
    fetch("/api/plats?all=1")
      .then((r) => r.json())
      .then(setPlats)
      .finally(() => setChargement(false));
  }

  useEffect(() => {
    charger();
  }, []);

  function ouvrirAjout() {
    setForm(PLAT_VIDE);
    setEnEdition(null);
    setFormulaireOuvert(true);
  }

  function ouvrirEdition(plat: Plat) {
    setForm({
      nom: plat.nom,
      description: plat.description,
      prix: String(plat.prix),
      categorie: plat.categorie ?? "",
      photo: plat.photo ?? "",
    });
    setEnEdition(plat.id);
    setFormulaireOuvert(true);
  }

  async function enregistrer() {
    const payload = {
      nom: form.nom,
      description: form.description,
      prix: Number(form.prix),
      categorie: form.categorie || null,
      photo: form.photo || null,
    };
    if (enEdition) {
      await fetch(`/api/plats/${enEdition}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/plats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setFormulaireOuvert(false);
    charger();
  }

  async function basculerDisponibilite(plat: Plat) {
    await fetch(`/api/plats/${plat.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ disponible: !plat.disponible }),
    });
    charger();
  }

  async function supprimer(plat: Plat) {
    if (!confirm(`Supprimer "${plat.nom}" ? Cette action est définitive.`)) return;
    await fetch(`/api/plats/${plat.id}`, { method: "DELETE" });
    charger();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Menu du jour</h1>
        <button onClick={ouvrirAjout} className="btn-primary">
          + AJOUTER UN PLAT
        </button>
      </div>

      {chargement && <p className="text-ink/60">Chargement...</p>}

      <div className="space-y-3">
        {plats.map((plat) => (
          <div key={plat.id} className="card flex items-center gap-3 p-3">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gold/10 text-2xl">
              {plat.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={plat.photo} alt={plat.nom} className="h-full w-full object-cover" />
              ) : (
                "🍽️"
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{plat.nom}</p>
              <p className="text-sm text-ink/60">{formatFCFA(plat.prix)}</p>
            </div>
            <div className="flex flex-col gap-1">
              <button onClick={() => ouvrirEdition(plat)} className="text-xs font-semibold text-ink/60">
                ✏️ Modifier
              </button>
              <button
                onClick={() => basculerDisponibilite(plat)}
                className={`text-xs font-semibold ${plat.disponible ? "text-red-600" : "text-green-600"}`}
              >
                {plat.disponible ? "🔴 Rendre indisponible" : "🟢 Rendre disponible"}
              </button>
              <button onClick={() => supprimer(plat)} className="text-xs font-semibold text-ink/40">
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>

      {formulaireOuvert && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 sm:rounded-2xl">
            <h2 className="mb-3 font-display text-xl font-bold">
              {enEdition ? "Modifier le plat" : "Ajouter un plat"}
            </h2>
            <div className="space-y-3">
              <ChampPhoto valeur={form.photo} onChange={(v) => setForm({ ...form, photo: v })} />
              <Champ label="Nom" value={form.nom} onChange={(v) => setForm({ ...form, nom: v })} />
              <label className="block">
                <span className="text-sm font-medium text-ink/70">Description</span>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"
                  rows={2}
                />
              </label>
              <Champ label="Prix (FCFA)" value={form.prix} onChange={(v) => setForm({ ...form, prix: v })} type="number" />
              <Champ label="Catégorie" value={form.categorie} onChange={(v) => setForm({ ...form, categorie: v })} />
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setFormulaireOuvert(false)} className="btn-secondary flex-1">
                Annuler
              </button>
              <button onClick={enregistrer} className="btn-primary flex-1">
                ENREGISTRER
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Champ({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink/70">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"
      />
    </label>
  );
}
