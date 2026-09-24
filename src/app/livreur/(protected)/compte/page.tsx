import ChangerMotDePasse from "@/components/ChangerMotDePasse";

export default function LivreurComptePage() {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold">Mon compte</h1>
      <ChangerMotDePasse />
    </div>
  );
}
