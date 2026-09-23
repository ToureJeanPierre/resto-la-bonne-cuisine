"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const LIENS = [
  { href: "/admin", label: "Tableau de bord", icone: "📊" },
  { href: "/admin/menu", label: "Menu du jour", icone: "🍽️" },
  { href: "/admin/commandes", label: "Commandes", icone: "📋" },
  { href: "/admin/livraisons", label: "Livraisons", icone: "🚚" },
  { href: "/admin/clients", label: "Clients", icone: "👥" },
  { href: "/admin/avis", label: "Avis", icone: "⭐" },
  { href: "/admin/parametres", label: "Paramètres", icone: "⚙️" },
];

export default function AdminNav({ nom }: { nom: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function deconnecter() {
    await fetch("/api/auth/staff/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 border-b border-black/10 bg-white">
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <p className="font-display text-lg font-bold">Restaurant Kalym</p>
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
              className={`flex flex-shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium ${
                actif ? "bg-gold text-ink" : "bg-black/5 text-ink/60"
              }`}
            >
              {lien.icone} {lien.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
