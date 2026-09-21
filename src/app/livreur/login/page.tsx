import StaffLoginForm from "@/components/StaffLoginForm";

export default function LivreurLoginPage() {
  return <StaffLoginForm expectedRole="LIVREUR" redirectTo="/livreur" titre="Espace livreur" />;
}
