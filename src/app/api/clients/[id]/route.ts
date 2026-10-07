import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guards";
import { verifierMotDePasseAdmin } from "@/lib/verifierMotDePasse";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireRole("ADMIN");
  if ("error" in guard) return guard.error;

  const { fideliteActive, supprimeLe } = await req.json();

  const client = await prisma.client.update({
    where: { id: params.id },
    data: {
      ...(fideliteActive !== undefined && { fideliteActive: Boolean(fideliteActive) }),
      ...(supprimeLe !== undefined && { supprimeLe: supprimeLe ? new Date() : null }),
    },
  });

  return NextResponse.json(client);
}

// Suppression définitive (depuis la corbeille uniquement) : le client doit
// déjà être à la corbeille, et le mot de passe admin est revérifié pour
// confirmer ce geste irréversible. Les commandes, avis, favoris et crédits
// fidélité du client partent avec lui (onDelete: Cascade sur le schéma).
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireRole("ADMIN");
  if ("error" in guard) return guard.error;

  const { motDePasse } = await req.json();
  if (!motDePasse || !(await verifierMotDePasseAdmin(motDePasse))) {
    return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
  }

  const client = await prisma.client.findUnique({ where: { id: params.id } });
  if (!client) return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
  if (!client.supprimeLe) {
    return NextResponse.json(
      { error: "Ce client doit d'abord être mis à la corbeille" },
      { status: 400 }
    );
  }

  await prisma.client.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}
