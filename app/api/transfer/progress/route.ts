export const GET = async (request: Request) => {
    const { searchParams } = new URL(request.url);
    const playlists = searchParams.get("playlists");
  
    if (!playlists) {
      return new Response(JSON.stringify({ error: "No se proporcionaron playlists" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  
    const playlistIds = playlists.split(",");
    const progress: Record<string, number> = {};
    playlistIds.forEach((id) => (progress[id] = 0));
    const encoder = new TextEncoder();
  
    const stream = new ReadableStream({
      start(controller) {
        const interval = setInterval(() => {
          let allComplete = true;
          for (const id of playlistIds) {
            if (progress[id] < 100) {
              progress[id] += Math.floor(Math.random() * 10) + 5;
              if (progress[id] > 100) progress[id] = 100;
              allComplete = false;
            }
            const eventData = {
              playlistId: id,
              progress: progress[id],
              status: progress[id] === 100 ? "Completado" : "Procesando...",
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(eventData)}\n\n`));
          }
          if (allComplete) {
            controller.enqueue(encoder.encode(`event: complete\ndata: ${JSON.stringify({ message: "Transferencia completada" })}\n\n`));
            clearInterval(interval);
            controller.close();
          }
        }, 1000);
  
        return () => clearInterval(interval);
      },
    });
  
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  };
  