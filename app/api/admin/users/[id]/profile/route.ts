import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canAccessAdminPanel } from "@/lib/badges";
import { db, ensureProfileSchema } from "@/lib/db";
import { profiles } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!(await canAccessAdminPanel(session))) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;
    const userId = Number(id);
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    await ensureProfileSchema();

    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId));

    return NextResponse.json({
      profile: profile ?? null,
    });
  } catch (error) {
    console.error("Admin fetch profile error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
