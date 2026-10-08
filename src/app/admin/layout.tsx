import type { Metadata } from "next";
import { getParametresBranding, LOGO_PAR_DEFAUT } from "@/lib/branding";
import ManifestAdmin from "@/components/ManifestAdmin";

// Englobe /admin/login ET /admin/(protected)/* : une identité PWA distincte
// de l'application cliente, pour que "installer" depuis l'espace admin
// pose une icône séparée qui s'ouvre directement sur /admin.
export async function generateMetadata(): Promise<Metadata> {
  const parametres = await getParametresBranding();
  const logo = parametres?.logoUrl || LOGO_PAR_DEFAUT;

  return {
    title: "Admin — Restaurant L'Avocatier",
    manifest: "/admin/manifest.webmanifest",
    icons: {
      icon: logo,
      apple: logo,
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "Admin Avocatier",
    },
  };
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ManifestAdmin />
      {children}
    </>
  );
}
