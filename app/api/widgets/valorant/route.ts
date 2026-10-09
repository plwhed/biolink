import { NextResponse } from "next/server";

const cache = new Map<string, { at: number; data: unknown }>();
const TTL_MS = 10 * 60 * 1000;

interface HenrikAccount {
  puuid?: string;
  region?: string;
  account_level?: number;
  name?: string;
  tag?: string;
  card?: { small?: string; large?: string; wide?: string };
}

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const name = (params.get("name") ?? "").trim();
  const tag = (params.get("tag") ?? "").trim();

  if (!name || !tag) {
    return NextResponse.json(
      { error: "Missing Riot ID (name + tag)" },
      { status: 400 }
    );
  }

  const key = `${name.toLowerCase()}#${tag.toLowerCase()}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) {
    return NextResponse.json(hit.data);
  }

  try {
    const res = await fetch(
      `https://api.henrikdev.xyz/valorant/v1/account/${encodeURIComponent(
        name
      )}/${encodeURIComponent(tag)}`,
      {
        headers: { accept: "application/json" },
        signal: AbortSignal.timeout(10000),
      }
    );
    if (res.status === 404) {
      return NextResponse.json(
        { error: "Riot ID not found" },
        { status: 404 }
      );
    }
    if (!res.ok) throw new Error(`Upstream ${res.status}`);

    const body = (await res.json()) as {
      status?: number;
      data?: HenrikAccount;
    };
    const account = body.data;
    if (!account?.puuid) {
      return NextResponse.json(
        { error: "Riot ID not found" },
        { status: 404 }
      );
    }

    const data = {
      name: account.name ?? name,
      tag: account.tag ?? tag,
      level: account.account_level ?? null,
      region: (account.region ?? "").toUpperCase() || null,
      cardImage:
        account.card?.wide ?? account.card?.large ?? account.card?.small ?? null,
    };

    cache.set(key, { at: Date.now(), data });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Valorant widget error:", error);
    return NextResponse.json(
      { error: "Valorant data is unavailable right now" },
      { status: 502 }
    );
  }
}
