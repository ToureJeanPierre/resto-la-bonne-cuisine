"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const LIENS = [
  { href: "/admin", label: "Tableau de bord", icone: "📊" },
  { href: "/admin/menu", label: "Menu du jour", icone: "🍽️" },
  { href: "/admin/commandes", label: "Commandes", icone: "📋" },
  { href: "/admin/livraisons", label: "Livraisons", icone: "🚚" },
  { href: "/admin/livreurs", label: "Livreurs", icone: "🏍️" },
  { href: "/admin/clients", label: "Clients", icone: "👥" },
  { href: "/admin/avis", label: "Avis", icone: "⭐" },
  { href: "/admin/statistiques", label: "Statistiques", icone: "📈" },
  { href: "/admin/corbeille", label: "Corbeille", icone: "🗑️" },
  { href: "/admin/parametres", label: "Paramètres", icone: "⚙️" },
];

const INTERVALLE_SONDAGE = 15000;

// Deux petits bips (comme une alerte de caisse) joués avec l'API Web Audio :
// pas besoin d'un fichier son à héberger, et ça marche dès que le
// navigateur a déjà interagi avec la page (clic, navigation...).
function jouerAlerte() {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new Ctx();
    [0, 0.18].forEach((delai) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      const debut = ctx.currentTime + delai;
      gain.gain.setValueAtTime(0.35, debut);
      gain.gain.exponentialRampToValueAtTime(0.001, debut + 0.35);
      osc.start(debut);
      osc.stop(debut + 0.35);
    });
  } catch {
    // Audio bloqué par le navigateur (pas encore d'interaction) : tant pis,
    // la pastille reste visible de toute façon.
  }
}

export default function AdminNav({ nom }: { nom: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [nouvellesCommandes, setNouvellesCommandes] = useState(0);
  const dernierTotal = useRef<number | null>(null);

  useEffect(() => {
    function verifier() {
      fetch("/api/commandes?scope=admin&statut=RECUE&limit=1")
        .then((r) => r.json())
        .then((data) => {
          const total = data.total ?? 0;
          if (dernierTotal.current !== null && total > dernierTotal.current) {
            jouerAlerte();
          }
          dernierTotal.current = total;
          setNouvellesCommandes(total);
        })
        .catch(() => {});
    }
    verifier();
    const intervalle = setInterval(verifier, INTERVALLE_SONDAGE);
    return () => clearInterval(intervalle);
  }, []);

  async function deconnecter() {
    await fetch("/api/auth/staff/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 border-b border-black/10 bg-white">
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <p className="font-display text-lg font-bold">Restaurant L&apos;Avocatier</p>
          <p className="text-xs text-ink/50">Bonjour, {nom}</p>
        </div>
        <button onClick={deconnecter} className="text-sm font-semibold text-ink/50">
          Déconnexion
        </button>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-2 pb-2">
        {LIENS.map((lien) => {
          const actif = lien.href === "/admin" ? pathname === "/admin" : pathname.startsWith(lien.href);
          return (
            <Link
              key={lien.href}
              href={lien.href}
              className={`relative flex flex-shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium ${
                actif ? "bg-gold text-ink" : "bg-black/5 text-ink/60"
              }`}
            >
              {lien.icone} {lien.label}
              {lien.href === "/admin/commandes" && nouvellesCommandes > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white">
                  {nouvellesCommandes}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
