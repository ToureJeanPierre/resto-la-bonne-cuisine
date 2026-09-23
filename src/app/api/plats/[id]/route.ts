import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guards";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const plat = await prisma.plat.findUnique({ where: { id: params.id } });
  if (!plat) return NextResponse.json({ error: "Plat introuvable" }, { status: 404 });
  return NextResponse.json(plat);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireRole("ADMIN");
  if ("error" in guard) return guard.error;

  const body = await req.json();
  const { nom, description, photo, prix, categorie, disponible } = body;

  const plat = await prisma.plat.update({
    where: { id: params.id },
    data: {
      ...(nom !== undefined && { nom }),
      ...(description !== undefined && { description }),
      ...(photo !== undefined && { photo }),
      ...(prix !== undefined && { prix: Number(prix) }),
      ...(categorie !== undefined && { categorie }),
      ...(disponible !== undefined && { disponible }),
    },
  });

  revalidatePath("/menu");
  revalidatePath(`/menu/${params.id}`);
  revalidatePath("/");

  return NextResponse.json(plat);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireRole("ADMIN");
  if ("error" in guard) return guard.error;

  await prisma.plat.delete({ where: { id: params.id } });

  revalidatePath("/menu");
  revalidatePath("/");

  return NextResponse.json({ ok: true });
}
