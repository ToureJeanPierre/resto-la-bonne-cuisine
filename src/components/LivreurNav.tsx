"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function LivreurNav({ nom }: { nom: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function deconnecter() {
    await fetch("/api/auth/staff/logout", { method: "POST" });
    router.push("/livreur/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 border-b border-black/10 bg-white">
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <p className="font-display text-lg font-bold">Mes livraisons</p>
          <p className="text-xs text-ink/50">{nom}</p>
        </div>
        <button onClick={deconnecter} className="text-sm font-semibold text-ink/50">
          Déconnexion
        </button>
      </div>
      <nav className="flex gap-2 px-4 pb-2">
        <Link
          href="/livreur"
          className={`rounded-full px-3 py-1.5 text-sm font-medium ${
            pathname === "/livreur" ? "bg-gold text-ink" : "bg-black/5 text-ink/60"
          }`}
        >
          📦 Mes livraisons
        </Link>
        <Link
          href="/livreur/scan"
          className={`rounded-full px-3 py-1.5 text-sm font-medium ${
            pathname === "/livreur/scan" ? "bg-gold text-ink" : "bg-black/5 text-ink/60"
          }`}
        >
          📷 Scanner
        </Link>
      </nav>
    </header>
  );
}
