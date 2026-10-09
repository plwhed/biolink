import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getWidgets, saveWidgets } from "@/lib/widgets";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ widgets: await getWidgets(session.id) });
}

export async function PUT(req: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { widgets?: unknown };

  try {
    body = (await req.json()) as { widgets?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!Array.isArray(body.widgets)) {
    return NextResponse.json(
      { error: "widgets must be an array" },
      { status: 400 }
    );
  }

  try {
    await saveWidgets(
      session.id,
      body.widgets as Array<{
        type: string;
        enabled?: boolean;
        config?: Record<string, string>;
      }>
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not save widgets" },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true, widgets: await getWidgets(session.id) });
}
