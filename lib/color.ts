export const colorMap: Record<string, string> = {
  white: "#ffffff",
  black: "#000000",
  emerald: "#10b981",
  blue: "#3b82f6",
  purple: "#a855f7",
  pink: "#ec4899",
  orange: "#f97316",
  red: "#ef4444",
  yellow: "#eab308",
  cyan: "#06b6d4",
};

export function resolveColor(
  value: string | null | undefined,
  fallback: string
) {
  if (!value) return fallback;

  const normalized = value.trim().toLowerCase();

  if (colorMap[normalized]) return colorMap[normalized];

  if (/^#[0-9a-f]{3}$/i.test(normalized)) return normalized;
  if (/^#[0-9a-f]{6}$/i.test(normalized)) return normalized;
  if (/^#[0-9a-f]{8}$/i.test(normalized)) return normalized;
  if (/^(rgb|rgba|hsl|hsla)\(/i.test(normalized)) return value;
  if (normalized === "transparent") return "transparent";

  return fallback;
}

export function withAlpha(color: string, alpha: number) {
  if (/^#[0-9a-f]{6}$/i.test(color)) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  if (/^#[0-9a-f]{3}$/i.test(color)) {
    const r = parseInt(color[1] + color[1], 16);
    const g = parseInt(color[2] + color[2], 16);
    const b = parseInt(color[3] + color[3], 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  if (color === "transparent") return "transparent";

  return `color-mix(in srgb, ${color} ${Math.round(alpha * 100)}%, transparent)`;
}
