import { NextResponse } from "next/server";
import {
  getParametresBranding,
  LOGO_PAR_DEFAUT,
  COULEUR_INK_PAR_DEFAUT,
  typeImageDepuisUrl,
} from "@/lib/branding";

// Route explicite plutôt que la convention de fichier app/manifest.ts :
// cette dernière s'impose globalement dans Next.js et ignore le champ
// "manifest" fixé par les layouts de section (client, admin), ce qui
// empêchait l'admin d'avoir son propre manifest installable. Une route
// normale n'a pas ce problème — chaque section référence la sienne
// explicitement dans son layout.
export async function GET() {
  const parametres = await getParametresBranding();
  const logo = parametres?.logoUrl || LOGO_PAR_DEFAUT;

  const manifest = {
    name: "Restaurant L'Avocatier",
    short_name: "L'Avocatier",
    description:
      "Saveurs d'Afrique, plaisir de partager — commandez le menu du jour et faites-vous livrer.",
    start_url: "/",
    scope: "/",
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
