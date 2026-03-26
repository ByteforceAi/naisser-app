import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  void params.id;
  // TODO: Fetch badges from user_badges where user_id = params.id
  return NextResponse.json({ data: [] });
}
