"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type CartItem = {
  platId: string;
  nom: string;
  prix: number;
  photo: string | null;
  quantite: number;
};

type CartContextType = {
  items: CartItem[];
  ajouter: (plat: Omit<CartItem, "quantite">) => void;
  retirer: (platId: string) => void;
  changerQuantite: (platId: string, quantite: number) => void;
  vider: () => void;
  sousTotal: number;
  nombreArticles: number;
};

const CartContext = createContext<CartContextType | null>(null);
const STORAGE_KEY = "lbc_panier";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items, hydrated]);

  function ajouter(plat: Omit<CartItem, "quantite">) {
    setItems((prev) => {
      const existant = prev.find((i) => i.platId === plat.platId);
      if (existant) {
        return prev.map((i) =>
          i.platId === plat.platId ? { ...i, quantite: i.quantite + 1 } : i
        );
      }
      return [...prev, { ...plat, quantite: 1 }];
    });
  }

  function retirer(platId: string) {
    setItems((prev) => prev.filter((i) => i.platId !== platId));
  }

  function changerQuantite(platId: string, quantite: number) {
    if (quantite <= 0) return retirer(platId);
    setItems((prev) => prev.map((i) => (i.platId === platId ? { ...i, quantite } : i)));
  }

  function vider() {
    setItems([]);
  }

  const sousTotal = items.reduce((sum, i) => sum + i.prix * i.quantite, 0);
  const nombreArticles = items.reduce((sum, i) => sum + i.quantite, 0);

  return (
    <CartContext.Provider
      value={{ items, ajouter, retirer, changerQuantite, vider, sousTotal, nombreArticles }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart doit être utilisé dans un CartProvider");
  return ctx;
}
