import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/push/send
 * body: { userId, title, body, url?, tag? }
 *
 * 특정 유저에게 푸시 알림 전송
 * 서버 내부에서 호출 (좋아요, 댓글, 의뢰 등 이벤트 시)
 *
 * TODO: web-push 패키지 또는 FCM HTTP v1 API 연동
 */
export async function POST(req: NextRequest) {
  try {
    const { userId, title, body, url, tag } = await req.json();

    // TODO: DB에서 해당 유저의 push subscription 조회
    // const subs = await db.query.pushSubscriptions.findMany({ where: eq(schema.pushSubscriptions.userId, userId) });

    // TODO: 각 subscription에 대해 웹 푸시 전송
    // for (const sub of subs) {
    //   await webpush.sendNotification(JSON.parse(sub.keys), JSON.stringify({ title, body, url, tag }));
    // }

    console.log(`[push/send] to=${userId} title=${title}`);
    return NextResponse.json({ data: { success: true } });
  } catch {
    return NextResponse.json({ error: "전송 실패" }, { status: 500 });
  }
}
