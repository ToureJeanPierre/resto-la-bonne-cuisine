"use client";

const STORAGE_KEY = "lbc_favoris";

export function lireFavoris(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function basculerFavori(platId: string): string[] {
  const favoris = lireFavoris();
  const nouveaux = favoris.includes(platId)
    ? favoris.filter((id) => id !== platId)
    : [...favoris, platId];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nouveaux));
  return nouveaux;
}
