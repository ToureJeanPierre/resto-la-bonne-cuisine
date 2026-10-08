import { NextResponse } from "next/server";
import {
  getParametresBranding,
  LOGO_ADMIN,
  COULEUR_INK_PAR_DEFAUT,
  typeImageDepuisUrl,
} from "@/lib/branding";

// Manifest PWA dédié à l'espace admin : installée séparément de
// l'application cliente, avec son propre nom, son propre logo et un
// démarrage direct sur /admin au lieu de la page d'accueil du restaurant.
export async function GET() {
  const parametres = await getParametresBranding();
  const logo = LOGO_ADMIN;

  const manifest = {
    name: "Admin — Restaurant L'Avocatier",
    short_name: "Admin Avocatier",
    description: "Gestion des commandes, du menu et des livraisons du restaurant.",
    start_url: "/admin",
    display: "standalone",
    background_color: "#faf8f4",
    theme_color: parametres?.couleurSombre || COULEUR_INK_PAR_DEFAUT,
    icons: [
      {
        src: logo,
        sizes: "512x512",
        type: typeImageDepuisUrl(logo),
        purpose: "any",
      },
    ],
  };

  return NextResponse.json(manifest, {
    headers: { "Content-Type": "application/manifest+json" },
  });
}
