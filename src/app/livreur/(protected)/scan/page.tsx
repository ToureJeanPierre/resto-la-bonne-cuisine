"use client";

import { useEffect, useRef, useState } from "react";

type Resultat = { ok: boolean; message: string };

export default function ScannerPage() {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [scanActif, setScanActif] = useState(false);
  const [code, setCode] = useState("");
  const [resultat, setResultat] = useState<Resultat | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const instanceRef = useRef<any>(null);

  async function valider(valeur: string, type: "qr" | "code") {
    setEnvoi(true);
    setResultat(null);
    try {
      const res = await fetch("/api/livraisons/valider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valeur, type }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResultat({ ok: false, message: data.error ?? "Validation impossible." });
      } else {
        setResultat({ ok: true, message: `Commande #${data.numero} livrée avec succès !` });
      }
    } catch {
      setResultat({ ok: false, message: "Erreur réseau. Réessayez." });
    } finally {
      setEnvoi(false);
    }
  }

  async function demarrerScan() {
    setScanActif(true);
    const { Html5Qrcode } = await import("html5-qrcode");
    const instance = new Html5Qrcode("lecteur-qr");
    instanceRef.current = instance;
    try {
      await instance.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 220 },
        async (texte) => {
          await instance.stop();
          setScanActif(false);
          valider(texte, "qr");
        },
        () => {}
      );
    } catch {
      setResultat({ ok: false, message: "Impossible d'accéder à la caméra." });
      setScanActif(false);
    }
  }

  useEffect(() => {
    return () => {
      instanceRef.current?.stop().catch(() => {});
    };
  }, []);

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-bold">Valider une livraison</h1>

      <div className="card space-y-3 p-4">
        <p className="font-semibold">📷 Scanner le QR Code</p>
        {!scanActif ? (
          <button onClick={demarrerScan} className="btn-primary w-full">
            Démarrer le scan
          </button>
        ) : (
          <div id="lecteur-qr" ref={scannerRef} className="mx-auto w-full max-w-xs" />
        )}
      </div>

      <div className="card space-y-3 p-4">
        <p className="font-semibold">🔢 Code de secours</p>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Ex: 5832"
          className="w-full rounded-lg border border-black/10 px-3 py-2 text-center text-lg tracking-widest"
        />
        <button
          onClick={() => valider(code, "code")}
          disabled={envoi || !code}
          className="btn-secondary w-full"
        >
          Valider avec le code
        </button>
      </div>

      {resultat && (
        <div
          className={`card p-4 text-center font-semibold ${
            resultat.ok ? "text-green-700" : "text-red-700"
          }`}
        >
          {resultat.ok ? "✅ " : "❌ "}
          {resultat.message}
        </div>
      )}
    </div>
  );
}
