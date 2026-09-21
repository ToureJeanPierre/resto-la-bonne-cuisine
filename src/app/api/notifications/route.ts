import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientCookie } from "@/lib/auth";

export async function GET() {
  const client = getClientCookie();
  if (!client) return NextResponse.json([]);

  const notifications = await prisma.notification.findMany({
    where: { clientId: client.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return NextResponse.json(notifications);
}

export async function POST() {
  const client = getClientCookie();
  if (!client) return NextResponse.json({ ok: true });

  await prisma.notification.updateMany({
    where: { clientId: client.id, lu: false },
    data: { lu: true },
  });

  return NextResponse.json({ ok: true });
}
