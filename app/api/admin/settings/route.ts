import { NextRequest, NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/auth/middleware";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const authError = requireAdminToken(req);
  if (authError) return authError;

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
  const authError = requireAdminToken(request);
  if (authError) return authError;

  const body = await request.json();
  void body;
  // TODO: Upsert admin_settings key-value pairs
  return NextResponse.json({ data: { success: true } });
}
