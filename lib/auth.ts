import { jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "fallback-dev-secret-change-me"
);

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) return null;

  let payload: JWTPayload;

  try {
    ({ payload } = await jwtVerify(token, secret));
  } catch {
    return null;
  }

  if (typeof payload.sub !== "string") return null;

  const userId = Number(payload.sub);

  if (!Number.isInteger(userId) || userId < 1) return null;

  const [user] = await db
    .select({
      id: users.id,
      username: users.username,
    })
    .from(users)
    .where(eq(users.id, userId));

  if (!user) return null;

  return {
    id: user.id,
    username: user.username,
  };
}