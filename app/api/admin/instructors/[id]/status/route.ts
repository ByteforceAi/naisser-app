import { NextRequest, NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/auth/middleware";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = requireAdminToken(request);
  if (authError) return authError;

  const { status } = await request.json();
  const validStatuses = ["new", "contacted", "active", "inactive"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "유효하지 않은 상태입니다." }, { status: 400 });
  }
  void params.id;
  // TODO: Update instructor status with Drizzle
  return NextResponse.json({ data: { id: params.id, status } });
}
