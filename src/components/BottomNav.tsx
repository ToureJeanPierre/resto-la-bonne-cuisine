"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ONGLETS = [
  { href: "/", label: "Accueil", icone: "🏠" },
  { href: "/menu", label: "Menu", icone: "🍽️" },
  { href: "/commandes", label: "Commandes", icone: "📦" },
  { href: "/profil", label: "Profil", icone: "👤" },
];

export default function BottomNav() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin") || pathname.startsWith("/livreur")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-black/10 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-lg items-center justify-around py-2">
        {ONGLETS.map((onglet) => {
          const actif = onglet.href === "/" ? pathname === "/" : pathname.startsWith(onglet.href);
          return (
            <Link
              key={onglet.href}
              href={onglet.href}
              className={`flex flex-col items-center gap-0.5 rounded-xl px-4 py-1.5 text-xs font-medium transition ${
                actif ? "text-gold" : "text-ink/50"
              }`}
            >
              <span className="text-xl">{onglet.icone}</span>
              {onglet.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
