import { NextResponse } from "next/server";
import {
  castVote,
  getFeedback,
  getVoterIp,
  isFeedbackKind,
} from "@/lib/feedback";

export async function GET(req: Request) {
  const userId = Number(new URL(req.url).searchParams.get("userId"));

  if (!Number.isInteger(userId) || userId < 1) {
    return NextResponse.json({ error: "Invalid user" }, { status: 400 });
  }

  const ip = await getVoterIp();
  return NextResponse.json(await getFeedback(userId, ip));
}

export async function POST(req: Request) {
  let body: { userId?: unknown; kind?: unknown };

  try {
    body = (await req.json()) as { userId?: unknown; kind?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const userId = Number(body.userId);

  if (!Number.isInteger(userId) || userId < 1 || !isFeedbackKind(body.kind)) {
    return NextResponse.json({ error: "Invalid vote" }, { status: 400 });
  }

  try {
    const ip = await getVoterIp();
    const state = await castVote(userId, ip, body.kind);
    return NextResponse.json({ ok: true, ...state });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not save vote";
    const status = message === "Profile not found" ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
