import { and, eq } from "drizzle-orm";
import { db, ensureWidgetsSchema } from "@/lib/db";
import { profileWidgets } from "@/lib/schema";
import {
  MAX_WIDGETS,
  WIDGET_TYPES,
  isWidgetType,
  type WidgetInput,
  type WidgetState,
} from "./widget-types";

export { MAX_WIDGETS, WIDGET_TYPES, isWidgetType };
export type { WidgetInput, WidgetState };

function parseConfig(raw: string | null): Record<string, string> {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return Object.fromEntries(
        Object.entries(parsed as Record<string, unknown>)
          .filter(([, v]) => typeof v === "string")
          .map(([k, v]) => [k, v as string])
      );
    }
  } catch {
    // corrupted config → treat as empty
  }
  return {};
}

/** All widget slots for a user (missing types come back disabled). */
export async function getWidgets(userId: number): Promise<WidgetState[]> {
  await ensureWidgetsSchema();

  const rows = await db
    .select()
    .from(profileWidgets)
    .where(eq(profileWidgets.userId, userId));

  const byType = new Map(rows.map((row) => [row.type, row]));

  return WIDGET_TYPES.map((type, index) => {
    const row = byType.get(type);
    return {
      type,
      enabled: row ? row.enabled === 1 : false,
      position: row?.position ?? index,
      config: parseConfig(row?.config ?? null),
    };
  }).sort((a, b) => a.position - b.position);
}

/** Enabled widgets only, in display order — what profiles render. */
export async function getEnabledWidgets(
  userId: number
): Promise<WidgetState[]> {
  const all = await getWidgets(userId);
  return all.filter((widget) => widget.enabled).slice(0, MAX_WIDGETS);
}

/** Replaces the user's widget slots. Unknown types and over-limit enables are rejected. */
export async function saveWidgets(userId: number, widgets: WidgetInput[]) {
  await ensureWidgetsSchema();

  const cleaned = widgets.filter((widget) => isWidgetType(widget.type));

  const enabledCount = cleaned.filter((widget) => widget.enabled).length;
  if (enabledCount > MAX_WIDGETS) {
    throw new Error(`You can enable at most ${MAX_WIDGETS} widgets`);
  }

  const existing = await db
    .select({ type: profileWidgets.type })
    .from(profileWidgets)
    .where(eq(profileWidgets.userId, userId));
  const have = new Set(existing.map((row) => row.type));

  let position = 0;
  for (const widget of WIDGET_TYPES) {
    const input = cleaned.find((item) => item.type === widget);
    const enabled = input?.enabled ?? false;
    const config = input?.config ?? {};

    const stringConfig: Record<string, string> = {};
    for (const [key, value] of Object.entries(config)) {
      if (typeof value === "string" && value.length <= 200) {
        stringConfig[key.slice(0, 40)] = value;
      }
    }

    if (have.has(widget)) {
      await db
        .update(profileWidgets)
        .set({
          enabled: enabled ? 1 : 0,
          position: position++,
          config: JSON.stringify(stringConfig),
        })
        .where(
          and(
            eq(profileWidgets.userId, userId),
            eq(profileWidgets.type, widget)
          )
        );
    } else {
      await db.insert(profileWidgets).values({
        userId,
        type: widget,
        enabled: enabled ? 1 : 0,
        position: position++,
        config: JSON.stringify(stringConfig),
      });
    }
  }
}
