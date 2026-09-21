import { redirect } from "next/navigation";
import { getStaffSession } from "@/lib/auth";
import LivreurNav from "@/components/LivreurNav";

export default async function LivreurProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getStaffSession();
  if (!session || session.role !== "LIVREUR") {
    redirect("/livreur/login");
  }

  return (
    <div className="min-h-screen bg-[#faf8f4]">
      <LivreurNav nom={session.nom} />
      <main className="mx-auto max-w-lg p-4">{children}</main>
    </div>
  );
}
