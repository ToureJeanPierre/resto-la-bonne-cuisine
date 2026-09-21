import { redirect } from "next/navigation";
import { getStaffSession } from "@/lib/auth";
import AdminNav from "@/components/AdminNav";

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getStaffSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[#faf8f4]">
      <AdminNav nom={session.nom} />
      <main className="mx-auto max-w-3xl p-4">{children}</main>
    </div>
  );
}
