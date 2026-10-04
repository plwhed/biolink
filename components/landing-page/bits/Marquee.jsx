"use client";

/*
 * Marquee — Magic UI (magicuidesign/magicui, MIT).
 * Same component contract as the registry source
 * (repeat / reverse / pauseOnHover / vertical / --duration / --gap),
 * re-skinned from Tailwind utilities to our vanilla-CSS classes
 * (.mqr / .mqr-row in bits.css). No dependency on `cn` or theming.
 */
export function Marquee({
  className = '',
  reverse = false,
  pauseOnHover = false,
  vertical = false,
  repeat = 4,
  children,
  ...props
}) {
  return (
    <div
      {...props}
      className={`mqr ${vertical ? 'mqr-col' : ''} ${pauseOnHover ? 'mqr-pause' : ''} ${className}`}
    >
      {Array(repeat)
        .fill(0)
        .map((_, i) => (
          <div key={i} className={`mqr-row ${reverse ? 'mqr-rev' : ''}${vertical ? ' mqr-row-col' : ''}`}>
            {children}
          </div>
        ))}
    </div>
  );
}
