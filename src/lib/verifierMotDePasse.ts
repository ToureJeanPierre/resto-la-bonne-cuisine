import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getStaffSession } from "@/lib/auth";

// Revérifie le mot de passe de l'admin actuellement connecté — utilisé pour
// confirmer une suppression définitive (données de la corbeille), un geste
// irréversible qui mérite une confirmation de plus qu'un simple clic.
export async function verifierMotDePasseAdmin(motDePasse: string): Promise<boolean> {
  const session = await getStaffSession();
  if (!session) return false;

  const utilisateur = await prisma.utilisateur.findUnique({ where: { id: session.sub } });
  if (!utilisateur) return false;

  return bcrypt.compare(motDePasse, utilisateur.motDePasse);
}
