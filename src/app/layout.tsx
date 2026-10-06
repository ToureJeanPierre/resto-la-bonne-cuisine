import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import RegisterSW from "@/components/RegisterSW";

export const metadata: Metadata = {
  title: "Restaurant L'Avocatier",
  description: "Saveurs d'Afrique, plaisir de partager — commandez le menu du jour et faites-vous livrer.",
  manifest: "/manifest.json",
  icons: {
    icon: "/images/logo.webp",
    apple: "/images/logo.webp",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Restaurant L'Avocatier",
  },
};

export const viewport: Viewport = {
  themeColor: "#132C54",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-[#faf8f4] text-ink">
        <CartProvider>
          <RegisterSW />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
