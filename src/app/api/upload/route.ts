import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/lib/storage";
import { auth } from "@/auth";
import { apiError, routeError } from "@/lib/api/errors";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return apiError("UNAUTHORIZED", 401);
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return apiError("NO_FILE", 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return apiError("FILE_TOO_LARGE", 400);
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
        return apiError("STORAGE_NOT_CONFIGURED", 503);
      }
      throw err;
    }
  } catch (error: unknown) {
    return routeError("/api/upload", "POST", error);
  }
}
