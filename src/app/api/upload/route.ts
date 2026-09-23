import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireRole } from "@/lib/guards";

const TAILLE_MAX = 8 * 1024 * 1024; // 8 Mo

export async function POST(req: NextRequest) {
  const guard = await requireRole("ADMIN");
  if ("error" in guard) return guard.error;

  const formData = await req.formData();
  const fichier = formData.get("file");

  if (!(fichier instanceof File)) {
    return NextResponse.json({ error: "Aucune photo reçue." }, { status: 400 });
  }

  if (!fichier.type.startsWith("image/")) {
    return NextResponse.json({ error: "Le fichier doit être une image." }, { status: 400 });
  }

  if (fichier.size > TAILLE_MAX) {
    return NextResponse.json({ error: "L'image est trop lourde (8 Mo maximum)." }, { status: 400 });
  }

  const extension = fichier.name.split(".").pop() || "jpg";
  const nomFichier = `plats/${crypto.randomUUID()}.${extension}`;

  const blob = await put(nomFichier, fichier, { access: "public" });

  return NextResponse.json({ url: blob.url });
}
