"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { formatFCFA } from "@/lib/format";

export default function FloatingCartBar() {
  const { items, nombreArticles, sousTotal } = useCart();
  const router = useRouter();
  const pathname = usePathname();

  const cache = items.length === 0 || pathname === "/panier" || pathname === "/checkout";
  if (cache) return null;

  return (
    <button
      onClick={() => router.push("/panier")}
      className="fixed inset-x-4 z-40 flex items-center justify-between rounded-full bg-ink px-5 py-3.5 text-white shadow-lg transition active:scale-[0.98]"
      style={{ bottom: "calc(4.5rem + env(safe-area-inset-bottom))" }}
    >
      <span className="flex items-center gap-2 font-semibold">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold text-sm text-ink">
          {nombreArticles}
        </span>
        {formatFCFA(sousTotal)}
      </span>
      <span className="font-bold text-gold-light">Voir mon panier →</span>
    </button>
  );
}
