import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // TODO: requireAdmin
  const { instructorId, type, expiresAt } = await request.json();
  void instructorId;
  void type;
  void expiresAt;

  const token = crypto.randomUUID();
  // TODO: Insert into magic_links with Drizzle
  const url = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/profile/${token}`;

  return NextResponse.json(
    { data: { id: "placeholder", token, url, type: type || "edit" } },
    { status: 201 }
  );
}
