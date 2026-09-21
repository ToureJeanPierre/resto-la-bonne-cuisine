import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientCookie } from "@/lib/auth";

export async function GET() {
  const client = getClientCookie();
  if (!client) return NextResponse.json({ credits: 0, recompensesDisponibles: 0 });

  const fidelite = await prisma.fidelite.findUnique({ where: { clientId: client.id } });

  return NextResponse.json(fidelite ?? { credits: 0, recompensesDisponibles: 0 });
}
