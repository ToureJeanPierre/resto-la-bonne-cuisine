import { NextResponse } from "next/server";
import { clearStaffSession } from "@/lib/auth";

export async function POST() {
  clearStaffSession();
  return NextResponse.json({ ok: true });
}
