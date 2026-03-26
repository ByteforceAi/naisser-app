import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  // TODO: requireAdmin + fetch all admin_settings
  return NextResponse.json({
    data: {
      google_sheets_webhook_url: "",
      google_sheets_sync_enabled: "false",
      ai_api_key: "",
      ai_provider: "claude",
    },
  });
}

export async function PUT(request: NextRequest) {
  // TODO: requireAdmin
  const body = await request.json();
  void body;
  // TODO: Upsert admin_settings key-value pairs
  return NextResponse.json({ data: { success: true } });
}
