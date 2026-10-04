import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { links } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.redirect(new URL("/", url.origin));
  }

  const [link] = await db
    .select({ url: links.url })
    .from(links)
    .where(eq(links.id, id));

  if (!link) {
    return NextResponse.redirect(new URL("/", url.origin));
  }

  db.update(links)
    .set({ clicks: sql`${links.clicks} + 1` })
    .where(eq(links.id, id))
    .execute();

  return NextResponse.redirect(link.url);
}
