import { prisma } from "@/lib/prisma";
import PlatCard from "@/components/PlatCard";

// Le menu change rarement seconde par seconde : on le met en cache et on
// l'invalide explicitement (revalidatePath) dès qu'un plat est modifié,
// plutôt que de refaire une requête à la base à chaque visite — ce qui
// compte beaucoup pour les visiteurs loin du serveur.
export const revalidate = 60;

export default async function MenuPage() {
  const plats = await prisma.plat.findMany({
    where: { disponible: true },
    orderBy: { createdAt: "asc" },
  });

  const categories = Array.from(new Set(plats.map((p) => p.categorie ?? "Plats")));

  return (
    <div className="space-y-6 p-4">
      <h1 className="font-display text-2xl font-bold">Menu du jour</h1>

      {plats.length === 0 && (
        <p className="rounded-xl bg-white p-4 text-center text-ink/60 shadow-sm">
          Le menu du jour n&apos;a pas encore été publié.
        </p>
      )}

      {categories.map((categorie) => (
        <div key={categorie}>
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-ink/50">
            {categorie}
          </h2>
          <div className="space-y-3">
            {plats
              .filter((p) => (p.categorie ?? "Plats") === categorie)
              .map((plat) => (
                <PlatCard key={plat.id} plat={plat} />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
