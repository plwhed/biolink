import { NextResponse } from "next/server";

const cache = new Map<string, { at: number; data: unknown }>();
const TTL_MS = 60 * 1000;

interface LanyardActivity {
  name?: string;
  type?: number;
  state?: string;
  details?: string;
}

interface LanyardResponse {
  success?: boolean;
  data?: {
    discord_user?: {
      username?: string;
      global_name?: string;
      avatar?: string;
    };
    discord_status?: string;
    activities?: LanyardActivity[];
    listening_to_spotify?: boolean;
    spotify?: { song?: string; artist?: string };
  };
  error?: { message?: string };
}

function pickActivity(activities: LanyardActivity[] | undefined) {
  if (!activities?.length) return null;
  // Prefer real activities over Custom Status (type 4).
  const main =
    activities.find((a) => a.type !== 4 && a.type !== 2) ??
    activities.find((a) => a.type === 2) ??
    null;
  if (!main) return null;
  return {
    name: main.name ?? "Something",
    detail: main.details ?? main.state ?? null,
  };
}

export async function GET(req: Request) {
  const discordId = (new URL(req.url).searchParams.get("discordId") ?? "").trim();

  if (!discordId || !/^\d{5,25}$/.test(discordId)) {
    return NextResponse.json({ error: "Invalid Discord ID" }, { status: 400 });
  }

  const hit = cache.get(discordId);
  if (hit && Date.now() - hit.at < TTL_MS) {
    return NextResponse.json(hit.data);
  }

  try {
    const res = await fetch(`https://api.lanyard.rest/v1/users/${discordId}`, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`Upstream ${res.status}`);

    const body = (await res.json()) as LanyardResponse;
    if (!body.success || !body.data) {
      return NextResponse.json(
        { error: body.error?.message ?? "Discord user not found" },
        { status: 404 }
      );
    }

    const discordUser = body.data.discord_user ?? {};
    const avatar = discordUser.avatar
      ? `https://cdn.discordapp.com/avatars/${discordId}/${discordUser.avatar}.png?size=128`
      : null;

    const data = {
      username:
        discordUser.global_name ?? discordUser.username ?? "Unknown",
      avatar,
      status: body.data.discord_status ?? "offline",
      activity: pickActivity(body.data.activities),
      spotify: body.data.listening_to_spotify
        ? {
            song: body.data.spotify?.song ?? null,
            artist: body.data.spotify?.artist ?? null,
          }
        : null,
    };

    cache.set(discordId, { at: Date.now(), data });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Lanyard widget error:", error);
    return NextResponse.json(
      { error: "Discord presence is unavailable right now" },
      { status: 502 }
    );
  }
}
