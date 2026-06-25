import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/lib/storage";
import { auth } from "@/auth";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "파일 크기는 최대 5MB를 초과할 수 없습니다." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    try {
      const url = await uploadFile(
        buffer,
        file.name,
        file.type
      );
      
      return NextResponse.json({ url });
    } catch (err: unknown) {
      if ((err as Error).message === "STORAGE_NOT_CONFIGURED") {
        return NextResponse.json(
          { error: "스토리지 설정이 구성되지 않았습니다. 관리자에게 문의하세요." },
          { status: 503 }
        );
      }
      throw err;
    }
  } catch (error: unknown) {
    console.error("[UPLOAD_ERROR]", error);
    return NextResponse.json(
      { error: "파일 업로드 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
