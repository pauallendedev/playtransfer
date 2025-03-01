import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      console.log("[verify-password] Missing email or password => 400");
      return NextResponse.json({ error: "Faltan credenciales" }, { status: 400 });
    }
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user || !user.password) {
      console.log("[verify-password] User not found or no password => 401");
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      console.log("[verify-password] Password mismatch => 401");
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }
    console.log("[verify-password] Credenciales correctas => userId =", user.id);
    return NextResponse.json({ userId: user.id });
  } catch (error: any) {
    console.error("[verify-password] Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
