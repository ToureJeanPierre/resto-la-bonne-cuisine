import type { Metadata } from "next";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import FloatingCartBar from "@/components/FloatingCartBar";

// Fixé ici (plutôt qu'au niveau racine) pour que ce soit bien ce manifest-là
// — et pas un autre défini plus bas, comme celui de l'admin — qui s'applique
// aux pages clientes.
export const metadata: Metadata = {
  manifest: "/manifest.webmanifest",
};

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-lg pb-24">{children}</main>
      <FloatingCartBar />
      <BottomNav />
    </>
  );
}
