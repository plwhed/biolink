import type { ComponentType } from "react";
import { ValorantWidget } from "./valorant";
import { LanyardWidget } from "./lanyard";
import { WeatherWidget } from "./weather";
import { ClockWidget } from "./clock";
import type { WidgetTileMeta } from "./tile";
import type { WidgetGlass } from "./glass";

export { WidgetTile, WidgetGlyphIcon, type WidgetGlyph, type WidgetTileMeta } from "./tile";

export interface WidgetComponentProps {
  config: Record<string, string>;
  glass?: WidgetGlass | null;
}

export interface WidgetTemplate extends WidgetTileMeta {
  type: string;
  label: string;
  description: string;
  category: string;
  /** Source file inside `components/profile/widgets/`. */
  file: string;
  Component: ComponentType<WidgetComponentProps>;
}

/**
 * Registry of every profile widget.
 *
 * To add a new widget:
 *  1. Create a file next to these (e.g. `spotify.tsx`) exporting a
 *     component shaped like `{ config }: WidgetComponentProps`.
 *  2. Import it here and append an entry to `WIDGET_TEMPLATES`.
 *  3. Add the type to `WIDGET_TYPES` in `lib/widgets.ts`.
 *
 * Profiles render `ProfileWidgets` below the main card; the dashboard
 * Widgets page renders this array for the list, picker and config modals.
 */
export const WIDGET_TEMPLATES: WidgetTemplate[] = [
  {
    type: "valorant",
    label: "Valorant",
    description: "Show your Valorant profile",
    category: "Gaming",
    tileColor: "#FF4655",
    glyph: "valorant",
    file: "valorant.tsx",
    Component: ValorantWidget,
  },
  {
    type: "lanyard",
    label: "Discord",
    description: "Show your Discord profile and status",
    category: "Social",
    tileColor: "#5865F2",
    glyph: "discord",
    file: "lanyard.tsx",
    Component: LanyardWidget,
  },
  {
    type: "weather",
    label: "Weather",
    description: "Show the weather where you live",
    category: "Lifestyle",
    tileColor: "#F59E0B",
    glyph: "weather",
    file: "weather.tsx",
    Component: WeatherWidget,
  },
  {
    type: "clock",
    label: "Clock",
    description: "Show your local time",
    category: "Lifestyle",
    tileColor: "#3B82F6",
    glyph: "clock",
    file: "clock.tsx",
    Component: ClockWidget,
  },
];

/** 2×2 grid rendered under the main profile card, same width as the card. */
export function ProfileWidgets({
  widgets,
  width = 420,
  glass = null,
}: {
  widgets: Array<{ type: string; config: Record<string, string> }>;
  width?: number;
  glass?: WidgetGlass | null;
}) {
  const visible = widgets
    .map((widget) => ({
      widget,
      template: WIDGET_TEMPLATES.find((t) => t.type === widget.type),
    }))
    .filter(
      (entry): entry is { widget: (typeof widgets)[number]; template: WidgetTemplate } =>
        !!entry.template
    )
    .slice(0, 4);

  if (visible.length === 0) return null;

  return (
    <div
      className="grid w-full grid-cols-2 gap-3 [&>*]:min-w-0"
      style={{ width: `${width}px`, maxWidth: "100%" }}
    >
      {visible.map(({ widget, template }) => {
        const Component = template.Component;
        return (
          <Component key={widget.type} config={widget.config} glass={glass} />
        );
      })}
    </div>
  );
}
