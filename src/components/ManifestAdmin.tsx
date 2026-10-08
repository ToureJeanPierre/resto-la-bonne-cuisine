"use client";

import { useEffect } from "react";

// Next.js ne permet pas de façon fiable de changer le <link rel="manifest">
// racine depuis un layout imbriqué (le champ "manifest" de generateMetadata
// n'y est pas répercuté, contrairement à "title" par exemple). On corrige
// donc le lien directement dans le DOM une fois la page chargée — c'est ce
// lien-là que le navigateur lit au moment où on clique sur "Installer
// l'application", donc ça suffit pour que l'espace admin s'installe
// séparément de l'application cliente.
export default function ManifestAdmin() {
  useEffect(() => {
    const lien = document.querySelector('link[rel="manifest"]');
    if (lien) lien.setAttribute("href", "/admin/manifest.webmanifest");
  }, []);

  return null;
}
