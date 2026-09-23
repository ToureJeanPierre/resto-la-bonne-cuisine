import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guards";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireRole("ADMIN");
  if ("error" in guard) return guard.error;

  const { fideliteActive } = await req.json();

  const client = await prisma.client.update({
    where: { id: params.id },
    data: { ...(fideliteActive !== undefined && { fideliteActive: Boolean(fideliteActive) }) },
  });

  return NextResponse.json(client);
}
