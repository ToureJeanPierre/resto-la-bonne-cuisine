import { prisma } from "@/lib/prisma";

export const revalidate = 60;

export default async function AvisPage() {
  const avis = await prisma.avis.findMany({
    where: { masque: false },
    include: { client: { select: { nom: true } } },
    orderBy: { createdAt: "desc" },
  });

  const moyenne = avis.length > 0 ? avis.reduce((s, a) => s + a.note, 0) / avis.length : null;

  return (
    <div className="space-y-4 p-4">
      <h1 className="font-display text-2xl font-bold">Avis clients</h1>

      {moyenne && (
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold text-gold-dark">⭐ {moyenne.toFixed(1)} / 5</p>
          <p className="text-sm text-ink/60">{avis.length} avis</p>
        </div>
      )}

      {avis.length === 0 && <p className="text-center text-ink/60">Aucun avis pour le moment.</p>}

      <div className="space-y-2">
        {avis.map((a) => (
          <div key={a.id} className="card p-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{a.client.nom}</span>
              <span>{"⭐".repeat(a.note)}</span>
            </div>
            {a.commentaire && <p className="mt-1 text-sm text-ink/70">{a.commentaire}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
