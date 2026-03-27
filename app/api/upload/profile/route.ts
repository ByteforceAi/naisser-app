import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/auth/middleware";
import { put } from "@vercel/blob";

export async function POST(request: NextRequest) {
  const session = await requireAuth();
  if (isErrorResponse(session)) return session;

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json(
      { error: "이미지 파일을 선택해주세요." },
      { status: 400 }
    );
  }

  // 파일 크기 제한 (500KB)
  if (file.size > 500 * 1024) {
    return NextResponse.json(
      { error: "이미지 크기는 500KB 이하여야 합니다." },
      { status: 400 }
    );
  }

  // 이미지 타입 검증
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "JPG, PNG, WebP 형식만 지원합니다." },
      { status: 400 }
    );
  }

  try {
    // Vercel Blob에 업로드
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `profiles/${session.user.id}/${Date.now()}.${ext}`;

    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: false,
    });

    return NextResponse.json({ data: { url: blob.url } });
  } catch (error) {
    console.error("[POST /api/upload/profile] Error:", error);

    // BLOB_READ_WRITE_TOKEN이 없을 때 graceful fallback
    if (
      error instanceof Error &&
      error.message.includes("BLOB_READ_WRITE_TOKEN")
    ) {
      return NextResponse.json(
        { error: "이미지 저장소가 설정되지 않았습니다. 관리자에게 문의해주세요." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "이미지 업로드 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
