import { NextResponse } from "next/server";
import { getStaffSession, SessionPayload } from "@/lib/auth";

export async function requireRole(
  role: "ADMIN" | "LIVREUR"
): Promise<{ session: SessionPayload } | { error: NextResponse }> {
  const session = await getStaffSession();
  if (!session || session.role !== role) {
    return {
      error: NextResponse.json({ error: "Non autorisé" }, { status: 401 }),
    };
  }
  return { session };
}
