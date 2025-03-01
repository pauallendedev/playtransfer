// app/api/accounts/[provider]/route.ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: { provider: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  await prisma.account.deleteMany({
    where: {
      userId: session.userId,
      provider: params.provider,
    },
  });

  return new Response("OK");
}
