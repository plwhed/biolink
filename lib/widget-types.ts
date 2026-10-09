/**
 * Widget catalog types. Pure data — safe to import from client components.
 * (DB helpers live in `./widgets`, which pulls in the DB driver and must
 * never be bundled for the browser.)
 */

export const WIDGET_TYPES = ["valorant", "lanyard", "weather", "clock"] as const;

export type WidgetType = (typeof WIDGET_TYPES)[number];

export const MAX_WIDGETS = 4;

export interface WidgetState {
  type: string;
  enabled: boolean;
  position: number;
  config: Record<string, string>;
}

export interface WidgetInput {
  type: string;
  enabled?: boolean;
  config?: Record<string, string>;
}

export function isWidgetType(value: unknown): value is WidgetType {
  return (
    typeof value === "string" &&
    (WIDGET_TYPES as readonly string[]).includes(value)
  );
}
