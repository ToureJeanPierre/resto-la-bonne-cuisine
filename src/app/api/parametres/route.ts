import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guards";
import {
  LOGO_PAR_DEFAUT,
  BANNER_PAR_DEFAUT,
  COULEUR_GOLD_PAR_DEFAUT,
  COULEUR_INK_PAR_DEFAUT,
} from "@/lib/branding";

const VALEURS_PAR_DEFAUT = {
  id: "site",
  adresse: "Adresse à préciser, Abidjan",
  telephone: "+225 00 00 00 00",
  horaires: "Tous les jours, 9h — 22h",
  fideliteActive: true,
  logoUrl: LOGO_PAR_DEFAUT,
  bannerUrl: BANNER_PAR_DEFAUT,
  couleurPrimaire: COULEUR_GOLD_PAR_DEFAUT,
  couleurSombre: COULEUR_INK_PAR_DEFAUT,
};

export async function GET() {
  const parametres = await prisma.parametres.findUnique({ where: { id: "site" } });
  return NextResponse.json(
    parametres
      ? {
          ...parametres,
          logoUrl: parametres.logoUrl || LOGO_PAR_DEFAUT,
          bannerUrl: parametres.bannerUrl || BANNER_PAR_DEFAUT,
          couleurPrimaire: parametres.couleurPrimaire || COULEUR_GOLD_PAR_DEFAUT,
          couleurSombre: parametres.couleurSombre || COULEUR_INK_PAR_DEFAUT,
        }
      : VALEURS_PAR_DEFAUT
  );
}

export async function PATCH(req: NextRequest) {
  const guard = await requireRole("ADMIN");
  if ("error" in guard) return guard.error;

  const {
    adresse,
    telephone,
    horaires,
    fideliteActive,
    logoUrl,
    bannerUrl,
    couleurPrimaire,
    couleurSombre,
  } = await req.json();

  const parametres = await prisma.parametres.upsert({
    where: { id: "site" },
    create: {
      id: "site",
      adresse: adresse ?? VALEURS_PAR_DEFAUT.adresse,
      telephone: telephone ?? VALEURS_PAR_DEFAUT.telephone,
      horaires: horaires ?? VALEURS_PAR_DEFAUT.horaires,
      fideliteActive: fideliteActive ?? VALEURS_PAR_DEFAUT.fideliteActive,
      logoUrl: logoUrl || null,
      bannerUrl: bannerUrl || null,
      couleurPrimaire: couleurPrimaire || null,
      couleurSombre: couleurSombre || null,
    },
    update: {
      ...(adresse !== undefined && { adresse }),
      ...(telephone !== undefined && { telephone }),
      ...(horaires !== undefined && { horaires }),
      ...(fideliteActive !== undefined && { fideliteActive: Boolean(fideliteActive) }),
      ...(logoUrl !== undefined && { logoUrl: logoUrl || null }),
      ...(bannerUrl !== undefined && { bannerUrl: bannerUrl || null }),
      ...(couleurPrimaire !== undefined && { couleurPrimaire: couleurPrimaire || null }),
      ...(couleurSombre !== undefined && { couleurSombre: couleurSombre || null }),
    },
  });

  revalidatePath("/");
  revalidateTag("parametres");

  return NextResponse.json(parametres);
}
