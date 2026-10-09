import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";

export type WidgetGlyph = "valorant" | "discord" | "weather" | "clock";

/** White glyph drawn on a widget's colored tile. */
export function WidgetGlyphIcon({ glyph }: { glyph: WidgetGlyph }) {
  if (glyph === "discord") {
    return <FontAwesomeIcon icon={faDiscord} className="h-1/2 w-1/2" />;
  }
  if (glyph === "valorant") {
    return (
      <span aria-hidden="true" className="text-[1.1em] font-black leading-none">
        V
      </span>
    );
  }
  if (glyph === "weather") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        className="h-1/2 w-1/2"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5 5l1.7 1.7M17.3 17.3L19 19M19 5l-1.7 1.7M6.7 17.3L5 19" />
      </svg>
    );
  }
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      className="h-1/2 w-1/2"
    >
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

export interface WidgetTileMeta {
  tileColor: string;
  glyph: WidgetGlyph;
  label: string;
}

/** Colored tile with the widget's glyph (dashboard list + picker + cards). */
export function WidgetTile({
  template,
  size = "h-12 w-12",
  rounded = "rounded-2xl",
}: {
  template: WidgetTileMeta;
  size?: string;
  rounded?: string;
}) {
  return (
    <span
      aria-hidden="true"
      title={template.label}
      className={`flex shrink-0 items-center justify-center text-xl text-white ${size} ${rounded}`}
      style={{ backgroundColor: template.tileColor }}
    >
      <WidgetGlyphIcon glyph={template.glyph} />
    </span>
  );
}

/**
 * Frosted copy of the page background, clipped to the card — the same
 * treatment as the main card, so widgets frost identically on photos.
 * Content must sit in a `relative z-10` wrapper above it.
 */
export function WidgetFrost({
  glass,
  radius = 20,
}: {
  glass: { blur: number; bgUrl: string | null } | null | undefined;
  radius?: number;
}) {
  if (!glass?.bgUrl || glass.blur <= 0) return null;
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      style={{ borderRadius: `${radius}px` }}
    >
      <div
        className="absolute bg-cover bg-center"
        style={{
          inset: `${-(glass.blur * 1.5 + 12)}px`,
          backgroundImage: `url(${glass.bgUrl})`,
          filter: `blur(${glass.blur}px) saturate(185%) brightness(1.06)`,
        }}
      />
    </div>
  );
}
