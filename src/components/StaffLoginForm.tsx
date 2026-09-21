"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StaffLoginForm({
  expectedRole,
  redirectTo,
  titre,
}: {
  expectedRole: "ADMIN" | "LIVREUR";
  redirectTo: string;
  titre: string;
}) {
  const router = useRouter();
  const [telephone, setTelephone] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  async function connecter() {
    setEnvoi(true);
    setErreur(null);
    const res = await fetch("/api/auth/staff/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telephone, motDePasse }),
    });
    const data = await res.json();
    if (!res.ok) {
      setErreur(data.error ?? "Connexion impossible.");
      setEnvoi(false);
      return;
    }
    if (data.role !== expectedRole) {
      setErreur("Ce compte n'a pas accès à cet espace.");
      setEnvoi(false);
      return;
    }
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div className="mx-auto mt-16 max-w-sm space-y-4 p-4">
      <h1 className="text-center font-display text-2xl font-bold">{titre}</h1>
      <div className="card space-y-3 p-4">
        <label className="block">
          <span className="text-sm font-medium text-ink/70">Téléphone</span>
          <input
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink/70">Mot de passe</span>
          <input
            type="password"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2"
            onKeyDown={(e) => e.key === "Enter" && connecter()}
          />
        </label>
        {erreur && <p className="text-sm text-red-700">{erreur}</p>}
        <button onClick={connecter} disabled={envoi} className="btn-primary w-full">
          {envoi ? "Connexion..." : "Se connecter"}
        </button>
      </div>
    </div>
  );
}
