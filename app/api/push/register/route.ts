import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

/**
 * POST /api/push/register
 * body: { subscription: PushSubscription }
 *
 * 유저의 푸시 구독 정보를 서버에 저장
 * FCM 또는 Web Push Protocol 사용
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: "로그인 필요" }, { status: 401 });

  try {
    const { subscription } = await req.json();
    const userId = (session.user as { id?: string }).id;

    // TODO: DB에 push_subscriptions 테이블 INSERT
    // await db.insert(schema.pushSubscriptions).values({
    //   userId,
    //   endpoint: subscription.endpoint,
    //   keys: JSON.stringify(subscription.keys),
    //   createdAt: new Date(),
    // });

    return NextResponse.json({ data: { success: true } });
  } catch {
    return NextResponse.json({ error: "등록 실패" }, { status: 500 });
  }
}
