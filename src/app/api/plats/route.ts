import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guards";

export async function GET(req: NextRequest) {
  const all = req.nextUrl.searchParams.get("all");
  const plats = await prisma.plat.findMany({
    where: all ? undefined : { disponible: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(plats);
}

export async function POST(req: NextRequest) {
  const guard = await requireRole("ADMIN");
  if ("error" in guard) return guard.error;

  const body = await req.json();
  const { nom, description, photo, prix, categorie, disponible } = body;

  if (!nom || !prix) {
    return NextResponse.json({ error: "Nom et prix requis" }, { status: 400 });
  }

  const plat = await prisma.plat.create({
    data: {
      nom,
      description: description ?? "",
      photo: photo ?? null,
      prix: Number(prix),
      categorie: categorie ?? null,
      disponible: disponible ?? true,
    },
  });

  return NextResponse.json(plat, { status: 201 });
}
