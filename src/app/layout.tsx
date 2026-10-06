import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import RegisterSW from "@/components/RegisterSW";
import { ajusterCouleur } from "@/lib/couleurs";
import {
  getParametresBranding,
  LOGO_PAR_DEFAUT,
  COULEUR_GOLD_PAR_DEFAUT,
  COULEUR_INK_PAR_DEFAUT,
} from "@/lib/branding";

export async function generateMetadata(): Promise<Metadata> {
  const parametres = await getParametresBranding();
  const logo = parametres?.logoUrl || LOGO_PAR_DEFAUT;

  return {
    title: "Restaurant L'Avocatier",
    description:
      "Saveurs d'Afrique, plaisir de partager — commandez le menu du jour et faites-vous livrer.",
    manifest: "/manifest.webmanifest",
    icons: {
      icon: logo,
      apple: logo,
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "Restaurant L'Avocatier",
    },
  };
}

export async function generateViewport(): Promise<Viewport> {
  const parametres = await getParametresBranding();

  return {
    themeColor: parametres?.couleurSombre || COULEUR_INK_PAR_DEFAUT,
    width: "device-width",
    initialScale: 1,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const parametres = await getParametresBranding();
  const gold = parametres?.couleurPrimaire || COULEUR_GOLD_PAR_DEFAUT;
  const ink = parametres?.couleurSombre || COULEUR_INK_PAR_DEFAUT;

  const variablesCouleurs = {
    "--color-gold": gold,
    "--color-gold-light": ajusterCouleur(gold, 0.22),
    "--color-gold-dark": ajusterCouleur(gold, -0.22),
    "--color-ink": ink,
  } as React.CSSProperties;

  return (
    <html lang="fr" style={variablesCouleurs}>
      <body className="min-h-screen bg-[#faf8f4] text-ink">
        <CartProvider>
          <RegisterSW />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
