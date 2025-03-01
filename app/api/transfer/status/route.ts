import { getTransferStatus } from "@/lib/transferStatus";
import { NextResponse } from "next/server";

export async function GET() {
  const encoder = new TextEncoder();
  let interval: any;

  const stream = new ReadableStream({
    start(controller) {
      interval = setInterval(() => {
        const status = getTransferStatus();
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(status)}\n\n`));
      }, 2000);
    },
    cancel() {
      clearInterval(interval);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
