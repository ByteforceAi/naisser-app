import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/auth/middleware";

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

  // TODO: Vercel Blob에 업로드
  // import { put } from "@vercel/blob";
  // const blob = await put(`profiles/${session.user.id}/${file.name}`, file, { access: "public" });
  // return NextResponse.json({ data: { url: blob.url } });

  return NextResponse.json({
    data: { url: `https://placeholder.vercel-storage.com/${file.name}` },
  });
}
