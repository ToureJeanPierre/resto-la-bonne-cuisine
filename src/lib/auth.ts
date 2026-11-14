import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

// Pas de repli silencieux sur un secret public connu de tous (visible dans
// l'historique Git) : sans JWT_SECRET, on lève une erreur explicite au
// moment de signer/vérifier une session plutôt que de signer avec une
// valeur que n'importe qui peut lire sur GitHub et s'en servir pour
// fabriquer un faux jeton admin.
function getSecret(): Uint8Array {
  const valeur = process.env.JWT_SECRET;
  if (!valeur) {
    throw new Error(
      "JWT_SECRET n'est pas défini. Ajoute cette variable d'environnement (une longue chaîne aléatoire) avant de pouvoir se connecter."
    );
  }
  return new TextEncoder().encode(valeur);
}

export type SessionPayload = {
  sub: string;
  role: "ADMIN" | "LIVREUR";
  nom: string;
  ver: number;
};

const STAFF_COOKIE = "lbc_staff_session";
const CLIENT_COOKIE = "lbc_client";

export async function createStaffSession(payload: SessionPayload) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret());

  cookies().set(STAFF_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getStaffSession(): Promise<SessionPayload | null> {
  const token = cookies().get(STAFF_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const session = payload as unknown as SessionPayload;

    // Revérifié à chaque requête (pas seulement à la connexion) : un compte
    // désactivé ou dont le mot de passe vient de changer perd l'accès tout
    // de suite, même s'il avait déjà une session ouverte dans le navigateur.
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: session.sub },
      select: { actif: true, sessionVersion: true },
    });
    if (!utilisateur || !utilisateur.actif || utilisateur.sessionVersion !== session.ver) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export function clearStaffSession() {
  cookies().delete(STAFF_COOKIE);
}

export type ClientIdentity = { id: string; nom: string; telephone: string };

// Signé (comme la session staff) plutôt que du JSON brut : un client ne
// peut plus modifier son propre cookie (via les outils de développement du
// navigateur) pour se faire passer pour un autre et lire ses commandes,
// son adresse ou son historique de fidélité.
export async function setClientCookie(client: ClientIdentity) {
  const token = await new SignJWT({ ...client })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("365d")
    .sign(getSecret());

  cookies().set(CLIENT_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function getClientCookie(): Promise<ClientIdentity | null> {
  const token = cookies().get(CLIENT_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as ClientIdentity;
  } catch {
    return null;
  }
}
