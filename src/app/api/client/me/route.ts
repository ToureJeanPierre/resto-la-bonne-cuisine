import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientCookie } from "@/lib/auth";

export async function GET() {
  const client = getClientCookie();
  if (!client) return NextResponse.json(null);

  const donnees = await prisma.client.findUnique({
    where: { id: client.id },
    select: { nom: true, telephone: true, adresse: true },
  });

  return NextResponse.json(donnees);
}
