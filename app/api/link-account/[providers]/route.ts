import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  try {
    const { userId } = await request.json();
    if (!userId) {
      console.log("[link-account route] Missing userId => 400");
      return NextResponse.json({ error: "No se proporcionó userId" }, { status: 400 });
    }
    console.log("[link-account route] Upserting provider =", params.provider, "for userId =", userId);

    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: params.provider,
          providerAccountId: userId,
        },
      },
      update: {},
      create: {
        userId: userId,
        provider: params.provider,
        providerAccountId: userId,
        type: "oauth",
      },
    });
    console.log("[link-account route] Upsert success");
    return NextResponse.json({ message: "Cuenta vinculada correctamente" });
  } catch (error: any) {
    console.error("[link-account route] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
