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
    } catch (err: any) {
      if (err.message === "STORAGE_NOT_CONFIGURED") {
        // [Zero-Config Fallback] Supabase 설정이 없는 경우 Base64 데이터 스트림으로 반환
        // 이를 통해 로컬 환경에서 설정 없이도 UI 및 미리보기 기능을 즉시 테스트할 수 있습니다.
        const base64 = buffer.toString("base64");
        const dataUrl = `data:${file.type};base64,${base64}`;
        
        return NextResponse.json({ 
          url: dataUrl, 
          isLocal: true,
          message: "⚠️ Supabase 설정이 없어 로컬 미리보기(Base64)용으로 처리되었습니다." 
        });
      }
      throw err;
    }
  } catch (error: any) {
    console.error("[UPLOAD_ERROR]", error);
    return NextResponse.json(
      { error: "파일 업로드 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
