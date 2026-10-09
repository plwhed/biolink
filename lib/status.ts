import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { pageViews, users } from "@/lib/schema";

export type ComponentStatus = "operational" | "down";

export type ComponentCheck = {
  name: string;
  label: string;
  status: ComponentStatus;
  message: string;
};

export type SiteStatus = {
  status: "ok" | "down";
  cause: string | null;
  issues: ComponentCheck[];
  components: ComponentCheck[];
  totalUsers: number | null;
  totalViews: number | null;
  uptimeSeconds: number;
  responseTimeMs: number;
  timestamp: string;
};

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

/**
 * Runs every dependency check and returns the public site status payload.
 * `status` is `ok` only when every component reports operational.
 */
export async function collectStatus(): Promise<SiteStatus> {
  const started = Date.now();
  const components: ComponentCheck[] = [];

  let totalUsers: number | null = null;
  let totalViews: number | null = null;

  // 1. Database
  try {
    await db.execute(sql`select 1`);

    const [userCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users);

    const [viewCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(pageViews);

    totalUsers = userCount?.count ?? 0;
    totalViews = viewCount?.count ?? 0;

    components.push({
      name: "database",
      label: "Database",
      status: "operational",
      message: "Database connection is healthy",
    });
  } catch (error) {
    components.push({
      name: "database",
      label: "Database",
      status: "down",
      message: `Database query failed: ${errorMessage(error)}`,
    });
  }

  // 2. Auth / sessions
  if (process.env.JWT_SECRET) {
    components.push({
      name: "auth",
      label: "Authentication",
      status: "operational",
      message: "Session signing secret is configured",
    });
  } else {
    components.push({
      name: "auth",
      label: "Authentication",
      status: "down",
      message:
        "JWT_SECRET is missing — login sessions fall back to an insecure development secret",
    });
  }

  // 3. Upload storage (avatars, backgrounds, custom icons)
  if (process.env.KIM_API_KEY) {
    components.push({
      name: "uploads",
      label: "Uploads",
      status: "operational",
      message: "Upload storage is configured",
    });
  } else {
    components.push({
      name: "uploads",
      label: "Uploads",
      status: "down",
      message:
        "KIM_API_KEY is missing — avatar, background and icon uploads will fail",
    });
  }

  const issues = components.filter((component) => component.status === "down");
  const status: "ok" | "down" = issues.length === 0 ? "ok" : "down";
  const cause =
    issues.length > 0
      ? issues.map((issue) => `${issue.label}: ${issue.message}`).join(" | ")
      : null;

  return {
    status,
    cause,
    issues,
    components,
    totalUsers,
    totalViews,
    uptimeSeconds: Math.round(process.uptime()),
    responseTimeMs: Date.now() - started,
    timestamp: new Date().toISOString(),
  };
}
