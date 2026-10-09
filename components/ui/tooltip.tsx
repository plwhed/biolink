import type { CSSProperties, ReactNode } from "react";

export type TooltipPlacement = "top" | "bottom";

/**
 * Hover tooltip that matches the profile UID tooltip.
 * Colors are fully customizable per element (see lib/profile-layout.ts).
 * Pass `count` for a template-style count pill next to (or instead of) the label.
 */
export default function Tooltip({
  label,
  count,
  placement = "top",
  background,
  border,
  color,
  className,
  style,
  children,
}: {
  label?: ReactNode;
  count?: ReactNode;
  placement?: TooltipPlacement;
  background?: string;
  border?: string;
  color?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <span
      className={`ptip ptip-${placement}${className ? ` ${className}` : ""}`}
      style={style}
    >
      {children}

      <span
        className="ptip-bubble"
        style={{
          backgroundColor: background,
          borderColor: border,
          color,
        }}
      >
        {label != null && label !== "" ? (
          <span className="ptip-label">{label}</span>
        ) : null}
        {count !== undefined && count !== null ? (
          <span className="ptip-count">{count}</span>
        ) : null}
      </span>
    </span>
  );
}
