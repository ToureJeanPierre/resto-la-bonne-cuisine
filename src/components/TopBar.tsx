"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { useEffect, useState } from "react";

export default function TopBar() {
  const pathname = usePathname();
  const { nombreArticles } = useCart();
  const [nonLues, setNonLues] = useState(0);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setNonLues(data.filter((n) => !n.lu).length);
      })
      .catch(() => {});
  }, [pathname]);

  if (pathname.startsWith("/admin") || pathname.startsWith("/livreur")) return null;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-black/5 bg-white/95 px-4 py-2.5 backdrop-blur">
      <Link href="/" className="flex items-center gap-2">
        <Image src="/images/logo.webp" alt="La Bonne Cuisine" width={40} height={40} className="rounded-full" />
        <span className="font-display text-lg font-bold leading-tight text-ink">
          La Bonne
          <br />
          Cuisine
        </span>
      </Link>
      <div className="flex items-center gap-3">
        <Link href="/notifications" className="relative rounded-full p-2 text-xl hover:bg-black/5">
          🔔
          {nonLues > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
              {nonLues}
            </span>
          )}
        </Link>
        <Link href="/panier" className="relative rounded-full p-2 text-xl hover:bg-black/5">
          🛒
          {nombreArticles > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-ink">
              {nombreArticles}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
