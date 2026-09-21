import { prisma } from "@/lib/prisma";
import { getClientCookie } from "@/lib/auth";
import MarquerLues from "@/components/MarquerLues";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const client = getClientCookie();
  if (!client) {
    return <p className="p-8 text-center text-ink/60">Aucune notification pour le moment.</p>;
  }

  const notifications = await prisma.notification.findMany({
    where: { clientId: client.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4 p-4">
      <MarquerLues />
      <h1 className="font-display text-2xl font-bold">Notifications</h1>
      {notifications.length === 0 && (
        <p className="text-center text-ink/60">Aucune notification pour le moment.</p>
      )}
      <div className="space-y-2">
        {notifications.map((n) => (
          <div key={n.id} className={`card p-3 text-sm ${!n.lu ? "ring-2 ring-gold/40" : ""}`}>
            <p>{n.message}</p>
            <p className="mt-1 text-xs text-ink/40">
              {new Date(n.createdAt).toLocaleString("fr-FR")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
