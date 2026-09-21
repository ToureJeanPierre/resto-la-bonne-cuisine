import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "dev-secret-change-in-production-please"
);

export type SessionPayload = {
  sub: string;
  role: "ADMIN" | "LIVREUR";
  nom: string;
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
    return payload as unknown as SessionPayload;
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
