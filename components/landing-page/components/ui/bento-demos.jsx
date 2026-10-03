"use client";

/*
 * Demo visuals for the features BentoGrid. Real photography (seeded picsum,
 * stable URLs) per the integration guidelines — no div-built fake UI.
 */
const SHOTS = {
  page: 'https://picsum.photos/seed/egirls-page/640/360',
  drag: 'https://picsum.photos/seed/egirls-drag/640/360',
  chart: 'https://picsum.photos/seed/egirls-chart/640/360',
  gate: 'https://picsum.photos/seed/egirls-gate/640/360',
  flair: 'https://picsum.photos/seed/egirls-flair/640/360',
  code: 'https://picsum.photos/seed/egirls-code/640/360',
};

function Shot({ src, alt }) {
  return <img src={src} alt={alt} loading="lazy" />;
}

export function PageDemo() {
  return <Shot src={SHOTS.page} alt="Example egirls.lol profile page" />;
}

export function DragDemo() {
  return <Shot src={SHOTS.drag} alt="Rearranging links by dragging" />;
}

export function AnalyticsDemo() {
  return <Shot src={SHOTS.chart} alt="14-day views and clicks chart" />;
}

export function OverlayDemo() {
  return <Shot src={SHOTS.gate} alt="Click-to-show profile overlay" />;
}

export function BadgesDemo() {
  return <Shot src={SHOTS.flair} alt="Profile badges on display" />;
}

export function CodeDemo() {
  return <Shot src={SHOTS.code} alt="Self-hosting the open source codebase" />;
}
