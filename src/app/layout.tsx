import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import RegisterSW from "@/components/RegisterSW";

export const metadata: Metadata = {
  title: "Restaurant Kalym",
  description: "Le bon goût, notre passion — commandez le menu du jour et faites-vous livrer.",
  manifest: "/manifest.json",
  icons: {
    icon: "/images/logo.webp",
    apple: "/images/logo.webp",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Restaurant Kalym",
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
