import StaffLoginForm from "@/components/StaffLoginForm";

export default function AdminLoginPage() {
  return <StaffLoginForm expectedRole="ADMIN" redirectTo="/admin" titre="Espace restauratrice" />;
}
