/* Minimal `cn` (classnames join) for shadcn-style components.
 * The full `clsx` + `tailwind-merge` pair is unnecessary here since this
 * project uses vanilla CSS (no Tailwind class conflicts to resolve). */
export function cn(...inputs) {
  const out = [];
  const push = v => {
    if (!v) return;
    if (typeof v === 'string' || typeof v === 'number') out.push(String(v));
    else if (Array.isArray(v)) v.forEach(push);
    else if (typeof v === 'object') {
      for (const k of Object.keys(v)) if (v[k]) out.push(k);
    }
  };
  inputs.forEach(push);
  return out.join(' ');
}

export default cn;
