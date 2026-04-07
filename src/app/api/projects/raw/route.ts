import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse(null, { status: 401 });
    }

    const projects = await prisma.rawProject.findMany({
      where: { 
        user_id: session.user.id,
        is_fork: false
      },
      orderBy: { 
        pushed_at: "desc" 
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("GET /api/projects/raw error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
  }
}
