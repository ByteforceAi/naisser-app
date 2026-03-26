import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/auth/middleware";

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  void params.id;
  const session = await requireAuth();
  if (isErrorResponse(session)) return session;

  // TODO: Toggle like with Drizzle (insert or delete from community_likes)
  // Also update community_posts.like_count
  return NextResponse.json({ data: { liked: true, likeCount: 1 } });
}
