"use client";

import { useRef, useState } from "react";

export default function ChampPhoto({
  valeur,
  onChange,
}: {
  valeur: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function choisirFichier(e: React.ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    if (!fichier) return;

    setEnvoi(true);
    setErreur(null);
    try {
      const formData = new FormData();
      formData.append("file", fichier);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setErreur(data.error ?? "Envoi impossible.");
        return;
      }
      onChange(data.url);
    } catch {
      setErreur("Envoi impossible. Vérifiez votre connexion.");
    } finally {
      setEnvoi(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <span className="text-sm font-medium text-ink/70">Photo</span>
      <div className="mt-1 flex items-center gap-3">
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gold/10 text-2xl">
          {valeur ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={valeur} alt="Photo du plat" className="h-full w-full object-cover" />
          ) : (
            "🍽️"
          )}
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={envoi}
          className="btn-secondary"
        >
          {envoi ? "Envoi..." : "📷 Ajouter une photo"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={choisirFichier}
          className="hidden"
        />
      </div>
      {erreur && <p className="mt-1 text-sm text-red-700">{erreur}</p>}
    </div>
  );
}
