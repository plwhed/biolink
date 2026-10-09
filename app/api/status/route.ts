import { NextResponse } from "next/server";
import { collectStatus, type SiteStatus } from "@/lib/status";

export const dynamic = "force-dynamic";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

/**
 * Public site status API.
 *
 * GET /api/status ->
 * {
 *   "status": "ok" | "down",
 *   "cause": null | "Database: Database query failed: ...",
 *   "issues": [...failing components],
 *   "components": [{ name, label, status, message }],
 *   "totalUsers": 123,
 *   "totalViews": 4567,
 *   "uptimeSeconds": 1234,
 *   "responseTimeMs": 12,
 *   "timestamp": "2026-01-01T00:00:00.000Z"
 * }
 */
export async function GET() {
  try {
    const payload = await collectStatus();

    return NextResponse.json(payload, {
      headers: {
        ...CORS_HEADERS,
        "Cache-Control": "public, max-age=10, s-maxage=10",
      },
    });
  } catch (error) {
    const payload: SiteStatus = {
      status: "down",
      cause: `Unexpected error while checking site status: ${errorMessage(error)}`,
      issues: [
        {
          name: "status",
          label: "Status API",
          status: "down",
          message: errorMessage(error),
        },
      ],
      components: [],
      totalUsers: null,
      totalViews: null,
      uptimeSeconds: Math.round(process.uptime()),
      responseTimeMs: 0,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(payload, {
      status: 500,
      headers: { ...CORS_HEADERS, "Cache-Control": "no-store" },
    });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}
