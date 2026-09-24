"use client";

import { useRef, useState } from "react";

const LARGEUR_MAX = 1280;
const QUALITE_JPEG = 0.8;

// Redimensionne et recompresse l'image côté téléphone avant l'envoi : les
// photos prises directement avec l'appareil peuvent peser plusieurs Mo,
// ce qui ralentit l'upload et gonfle le stockage. En cas d'échec (format
// non supporté par le navigateur, etc.), on retombe sur le fichier original.
async function compresser(fichier: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(fichier);
    const ratio = Math.min(1, LARGEUR_MAX / bitmap.width);
    const largeur = Math.round(bitmap.width * ratio);
    const hauteur = Math.round(bitmap.height * ratio);

    const canvas = document.createElement("canvas");
    canvas.width = largeur;
    canvas.height = hauteur;
    const ctx = canvas.getContext("2d");
    if (!ctx) return fichier;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, largeur, hauteur);
    ctx.drawImage(bitmap, 0, 0, largeur, hauteur);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", QUALITE_JPEG)
    );
    if (!blob || blob.size >= fichier.size) return fichier;

    const nom = fichier.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], nom, { type: "image/jpeg" });
  } catch {
    return fichier;
  }
}

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
      const fichierCompresse = await compresser(fichier);
      const formData = new FormData();
      formData.append("file", fichierCompresse);
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
