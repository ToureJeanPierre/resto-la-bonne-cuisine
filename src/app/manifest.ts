import { MetadataRoute } from "next";
import {
  getParametresBranding,
  LOGO_PAR_DEFAUT,
  COULEUR_INK_PAR_DEFAUT,
  typeImageDepuisUrl,
} from "@/lib/branding";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const parametres = await getParametresBranding();
  const logo = parametres?.logoUrl || LOGO_PAR_DEFAUT;

  return {
    name: "Restaurant L'Avocatier",
    short_name: "L'Avocatier",
    description:
      "Saveurs d'Afrique, plaisir de partager — commandez le menu du jour et faites-vous livrer.",
    start_url: "/",
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
}
