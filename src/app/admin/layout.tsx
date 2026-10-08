import type { Metadata } from "next";
import { LOGO_ADMIN } from "@/lib/branding";

// Englobe /admin/login ET /admin/(protected)/* : une identité PWA distincte
// de l'application cliente, pour que "installer" depuis l'espace admin
// pose une icône séparée (logo propre à l'admin) qui s'ouvre directement
// sur /admin.
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Admin — Restaurant L'Avocatier",
    manifest: "/admin/manifest.webmanifest",
    icons: {
      icon: LOGO_ADMIN,
      apple: LOGO_ADMIN,
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "Admin Avocatier",
    },
  };
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
