import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guards";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireRole("ADMIN");
  if ("error" in guard) return guard.error;

  const { masque } = await req.json();
  const avis = await prisma.avis.update({
    where: { id: params.id },
    data: { masque: Boolean(masque) },
  });

  revalidatePath("/avis");
  revalidatePath("/");

  return NextResponse.json(avis);
}
