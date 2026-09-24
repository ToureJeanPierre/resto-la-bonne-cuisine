import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "dev-secret-change-in-production-please"
);

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
    .sign(secret);

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
    const { payload } = await jwtVerify(token, secret);
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

export function setClientCookie(client: ClientIdentity) {
  cookies().set(CLIENT_COOKIE, JSON.stringify(client), {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export function getClientCookie(): ClientIdentity | null {
  const raw = cookies().get(CLIENT_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
