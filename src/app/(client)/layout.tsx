import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-lg pb-24">{children}</main>
      <BottomNav />
    </>
  );
}
