import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.json();
  void body.message;

  // TODO: requireAdmin check via cookie

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Simulated streaming response
        // In production, replace with actual Anthropic/OpenAI API call
        const response = `안녕하세요! 현재 나이써 플랫폼에는 총 127명의 강사가 등록되어 있습니다.\n\n**이번 주 현황:**\n- 신규 강사: 15명\n- 활동중: 68명\n- 가장 인기 주제: AI디지털, 환경&생태\n\n무엇이 더 궁금하신가요?`;

        const words = response.split("");

        for (let i = 0; i < words.length; i++) {
          const chunk = words[i];
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`)
          );
          // Simulate typing delay
          await new Promise((r) => setTimeout(r, 15));
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ text: "\n\n오류가 발생했습니다." })}\n\n`
          )
        );
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } finally {
        controller.close();
      }
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
