import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { profiles, users } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();

    if (!username?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { error: "Please fill in every field." },
        { status: 400 }
      );
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json(
        { error: "That email doesn't look right." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, username));

    if (existing) {
      return NextResponse.json(
        { error: "That username is already taken." },
        { status: 409 }
      );
    }

    const [existingEmail] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email));

    if (existingEmail) {
      return NextResponse.json(
        { error: "That email is already registered." },
        { status: 409 }
      );
    }

    const passwordHash = await hash(password, 12);

    const [user] = await db
      .insert(users)
      .values({ username, email, passwordHash })
      .returning({ id: users.id, username: users.username });

    await db.insert(profiles).values({ userId: user.id });

    return NextResponse.json({
      ok: true,
      user: { id: user.id, username: user.username },
    });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
