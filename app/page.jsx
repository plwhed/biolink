"use client";

import { useEffect, useRef, useState } from 'react'
import { AtSign, GripVertical, BarChart3, Layers, BadgeCheck, Code2 } from 'lucide-react'
import BlurText from '@/components/landing-page/bits/BlurText.jsx'
import Magnet from '@/components/landing-page/bits/Magnet.jsx'
import ClickSpark from '@/components/landing-page/bits/ClickSpark.jsx'
import StarBorder from '@/components/landing-page/bits/StarBorder.jsx'
import { Marquee } from '@/components/landing-page/bits/Marquee.jsx'
import { BorderBeam } from '@/components/landing-page/bits/BorderBeam.jsx'
import { BentoGrid, BentoCard } from '@/components/landing-page/components/ui/bento-grid.jsx'
import {
  PageDemo,
  DragDemo,
  AnalyticsDemo,
  OverlayDemo,
  BadgesDemo,
  CodeDemo,
} from '@/components/landing-page/components/ui/bento-demos.jsx'
import { LiquidGlassAccordion } from '@/components/landing-page/components/ui/liquid-glass-accordion.jsx'

const RM = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const HEADLINE = ['One', 'link', 'for', 'your', 'entire', 'universe.']
const SUBLINE = [
  'egirls.lol', 'gives', 'you', 'a', 'public', 'profile', 'at', '/yourname',
  'with', 'avatar,', 'socials,', 'custom', 'buttons,', 'badges', 'and', 'click', 'analytics.',
]
const LOGOS = [
  { src: '/logos/discord.png', alt: 'Discord' },
  { src: '/logos/reddit.png', alt: 'Reddit' },
  { src: '/logos/twitter.png', alt: 'Twitter' },
  { src: '/logos/youtube.svg', alt: 'YouTube' },
  { src: '/logos/twitch.svg', alt: 'Twitch' },
  { src: '/logos/valorant.svg', alt: 'Valorant' },
  { src: '/logos/tiktok.svg', alt: 'TikTok' },
  { src: '/logos/instagram.svg', alt: 'Instagram' },
]
const QUOTES = [
  { q: 'My Discord finally has one link. Setup took less time than my coffee.', by: '@hana · streamer' },
  { q: 'The click stats told me my bio link was dead. Fixed it in a minute.', by: '@milo · creator' },
  { q: 'Badges plus overlay make my page feel like mine, not a template.', by: '@rin · artist' },
]
const FEATURES = [
  { title: 'Your page in seconds', desc: 'Avatar, socials, buttons and badges live at egirls.lol/you. No code, no setup screens, no waiting.', icon: 'page', span: 2, demo: 'page' },
  { title: 'Arrange anything', desc: 'Grab any row and drop it where it belongs. Layouts, blur and overlays come along for free.', icon: 'drag', span: 1, demo: 'drag' },
  { title: 'Know what converts', desc: 'Every view and click lands on a live 14-day chart, per link. Kill what flops, boost what pops.', icon: 'chart', span: 1, demo: 'chart' },
  { title: 'Gate your page', desc: 'A click-to-show overlay with custom text, background blur slider and even a custom cursor.', icon: 'gate', span: 1, demo: 'gate' },
  { title: 'Wear your flair', desc: 'Creator, verified and custom badges with hover tooltips. Tiny pills, loud credibility.', icon: 'flair', span: 2, demo: 'flair' },
  { title: 'Yours, forever', desc: 'MIT-licensed Next.js plus Postgres. Self-host it, fork it, or send a PR on GitHub.', icon: 'code', span: 1, demo: 'code' },
]
const FEATURE_ICONS = {
  page: <AtSign />,
  drag: <GripVertical />,
  chart: <BarChart3 />,
  gate: <Layers />,
  flair: <BadgeCheck />,
  code: <Code2 />,
}
const FEATURE_DEMOS = {
  page: <PageDemo />,
  drag: <DragDemo />,
  chart: <AnalyticsDemo />,
  gate: <OverlayDemo />,
  flair: <BadgesDemo />,
  code: <CodeDemo />,
}
const FAQS = [
  {
    id: 'free',
    title: 'Is egirls.lol really free?',
    content: 'Yes. Every feature on this page is free with no paid tier hiding behind it. The project is open source, so the price stays exactly where it is.',
  },
  {
    id: 'claim',
    title: 'How do I claim a username?',
    content: 'Type the name you want into the claim bar at the top of this page and hit Claim it. If it is still free, the register page opens with your name already filled in.',
  },
  {
    id: 'code',
    title: 'Do I need to know how to code?',
    content: 'No. Everything is point, click and drag. Pick an avatar, paste your links, reorder them, and your page is live.',
  },
  {
    id: 'content',
    title: 'What can I put on my page?',
    content: 'An avatar, social links for six platforms, unlimited custom buttons, badges, a background image, and a click-to-show overlay for gating content.',
  },
  {
    id: 'stats',
    title: 'How do the click stats work?',
    content: 'Every button on your page counts views and clicks automatically. The dashboard rolls them into a 14-day chart so you can see which links actually convert.',
  },
  {
    id: 'delete',
    title: 'Can I delete my page later?',
    content: 'Anytime, from the dashboard, in one click. Your username goes back into the pool for someone else to claim.',
  },
]
const GITHUB = 'https://github.com/plwhed/egirls.lol'

/* ---------- tiny WebGL plasma glow (raw WebGL, no dependencies) ---------- */
const FRAG = `
precision mediump float;
uniform vec2 u_res;
uniform float u_t;
uniform vec2 u_m;
uniform float u_seed;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7) + u_seed)) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++){ v += a * noise(p); p *= 2.03; a *= 0.5; }
  return v;
}
void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  float t = u_t * 0.25;
  float n = fbm(uv * 2.2 + vec2(t, -t * 0.7) + u_seed);
  float n2 = fbm(uv * 3.7 - vec2(t * 0.6, t * 0.4) + 4.7);
  float d = length(uv + (u_m - 0.5) * 0.35);
  float glow = smoothstep(0.9, 0.0, d);
  float v = smoothstep(0.35, 0.85, n * 0.65 + n2 * 0.35) * glow;
  vec3 deep = vec3(0.32, 0.05, 0.14);
  vec3 bright = vec3(1.00, 0.55, 0.76);
  vec3 col = mix(deep, bright, v) * (v + 0.08 * glow);
  float alpha = clamp(v * 1.4 + glow * 0.12, 0.0, 1.0) * 0.85;
  gl_FragColor = vec4(col * alpha, alpha);
}`;

function GLGlow({ className, seed = 1 }) {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const gl = canvas.getContext('webgl', { alpha: true, antialias: false, depth: false, stencil: false })
    if (!gl) return
    const compile = (t, src) => {
      const sh = gl.createShader(t)
      gl.shaderSource(sh, src)
      gl.compileShader(sh)
      return sh
    }
    const pr = gl.createProgram()
    gl.attachShader(pr, compile(gl.VERTEX_SHADER, 'attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }'))
    gl.attachShader(pr, compile(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(pr)
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return
    gl.useProgram(pr)
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(pr, 'p')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const uT = gl.getUniformLocation(pr, 'u_t')
    const uR = gl.getUniformLocation(pr, 'u_res')
    const uM = gl.getUniformLocation(pr, 'u_m')
    gl.uniform1f(gl.getUniformLocation(pr, 'u_seed'), seed)
    const mouse = { x: 0.5, y: 0.5 }
    const onMove = (e) => {
      const r = canvas.getBoundingClientRect()
      mouse.x = (e.clientX - r.left) / Math.max(1, r.width)
      mouse.y = 1 - (e.clientY - r.top) / Math.max(1, r.height)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    const SIZE = 192
    const t0 = performance.now()
    let raf = 0
    let visible = true
    const frame = () => {
      raf = requestAnimationFrame(frame)
      if (!visible) return
      const h = Math.max(1, Math.round((SIZE * canvas.clientHeight) / Math.max(1, canvas.clientWidth)))
      if (canvas.width !== SIZE || canvas.height !== h) {
        canvas.width = SIZE
        canvas.height = h
      }
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform1f(uT, (performance.now() - t0) / 1000)
      gl.uniform2f(uR, canvas.width, canvas.height)
      gl.uniform2f(uM, mouse.x, mouse.y)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
    const io = new IntersectionObserver((en) => { visible = en[0].isIntersecting })
    io.observe(canvas)
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
    }
  }, [seed])
  return <canvas ref={ref} className={'gl ' + (className || '')} aria-hidden="true" />
}

/* Particle field reads parallax from a ref — no re-renders, no restarts. */
function Particles({ pxRef }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf = 0
    let w = 0
    let h = 0
    const DPR = Math.min(window.devicePixelRatio || 1, 2)
    const N = 120
    const dots = Array.from({ length: N }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.6 + Math.random() * 1.8,
      s: 0.00015 + Math.random() * 0.0007,
      o: 0.15 + Math.random() * 0.55,
      pink: Math.random() > 0.55,
      tw: Math.random() * Math.PI * 2,
    }))
    const cur = { x: 0, y: 0 }

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect()
      w = Math.max(1, rect.width)
      h = Math.max(1, rect.height)
      canvas.width = w * DPR
      canvas.height = h * DPR
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const tick = () => {
      const t = pxRef.current
      cur.x += (t.x - cur.x) * 0.04
      cur.y += (t.y - cur.y) * 0.04
      const root = document.documentElement
      root.style.setProperty('--px', cur.x.toFixed(4))
      root.style.setProperty('--py', cur.y.toFixed(4))

      ctx.clearRect(0, 0, w, h)
      for (const d of dots) {
        d.y -= d.s
        d.tw += 0.02
        if (d.y < -0.02) {
          d.y = 1.02
          d.x = Math.random()
        }
        const flicker = 0.7 + 0.3 * Math.sin(d.tw)
        const x = d.x * w + cur.x * 26 * d.r * 0.5
        const y = d.y * h + cur.y * 20 * d.r * 0.5
        ctx.beginPath()
        ctx.arc(x, y, d.r, 0, Math.PI * 2)
        ctx.fillStyle = d.pink
          ? `rgba(244, 114, 182, ${(d.o * flicker).toFixed(3)})`
          : `rgba(255, 255, 255, ${(d.o * 0.8 * flicker).toFixed(3)})`
        ctx.fill()
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [pxRef])

  return <canvas ref={ref} className="particles-canvas" aria-hidden="true" />
}

/* Depth (px) of each layer inside the flight. Camera travels 0 → last depth. */
const STEP = 1500
const DEPTHS = [0, STEP, STEP * 2, STEP * 3, STEP * 4, STEP * 5]

export default function App() {
  const [loaded, setLoaded] = useState(false)
  const [shotOk, setShotOk] = useState(true)
  const [name, setName] = useState('')
  const pxRef = useRef({ x: 0, y: 0 })
  const tiltRef = useRef(null)
  const journeyRef = useRef(null)
  const layerRefs = useRef([])

  useEffect(() => {
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => setLoaded(true))
    )
    return () => cancelAnimationFrame(raf)
  }, [])

  /* Mouse parallax — writes into a ref only, zero re-renders. */
  useEffect(() => {
    const onMove = (e) => {
      pxRef.current.x = e.clientX / window.innerWidth - 0.5
      pxRef.current.y = e.clientY / window.innerHeight - 0.5
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  /* Z-flight: scroll sets the camera target; a continuous rAF loop eases
     the real camera toward it every frame — plus mouse sway for true depth. */
  useEffect(() => {
    const journey = journeyRef.current
    const root = document.documentElement
    const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const maxC = DEPTHS[DEPTHS.length - 1]
    let cT = 0
    let cS = 0
    let raf = 0

    const paint = (c) => {
      const mx = pxRef.current.x
      const my = pxRef.current.y
      layerRefs.current.forEach((el, i) => {
        if (!el) return
        const z = DEPTHS[i] - c
        // Wide sharp "reading plateau": fully opaque + tack-sharp near
        // the front, gentle fade only when far away or passing behind.
        let o = 1
        if (z > 700 || z < -2600) o = 0
        else if (z > 350) o = 1 - (z - 350) / 350
        else if (z < -1600) o = 1 - (-1600 - z) / 1000
        o = Math.max(0, Math.min(1, o))
        const az = Math.abs(z)
        const blur = az <= 300 ? 0 : Math.min(10, (az - 300) / 160)
        // Mouse sway scales with depth: near layers swim, front stays put.
        const sx = Math.max(-60, Math.min(60, -mx * z * 0.05))
        const sy = -z * 0.04 - my * z * 0.02
        el.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, ${z.toFixed(1)}px)`
        el.style.opacity = o.toFixed(3)
        el.style.filter = blur < 0.4 ? 'none' : `blur(${blur.toFixed(1)}px)`
        el.style.pointerEvents = Math.abs(z) < 500 ? 'auto' : 'none'
      })
    }

    const measure = () => {
      const total = Math.max(1, journey.offsetHeight - window.innerHeight)
      const p = Math.min(1, Math.max(0, -journey.getBoundingClientRect().top / total))
      cT = p * maxC
      root.style.setProperty('--jp', p.toFixed(3))
      if (RM) {
        cS = cT
        paint(cS)
      }
    }

    const loop = () => {
      raf = requestAnimationFrame(loop)
      cS += (cT - cS) * 0.18
      if (Math.abs(cT - cS) < 0.4) cS = cT
      paint(cS)
    }

    measure()
    window.addEventListener('scroll', measure, { passive: true })
    window.addEventListener('resize', measure)
    if (!RM) raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', measure)
      window.removeEventListener('resize', measure)
    }
  }, [])

  const claim = (e) => {
    e.preventDefault()
    const u = name.trim().replace(/^@+/, '')
    window.location.href = '/register' + (u ? '?username=' + encodeURIComponent(u) : '')
  }

  const onTilt = (e) => {
    const el = tiltRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const rx = ((e.clientY - r.top) / r.height - 0.5) * -7
    const ry = ((e.clientX - r.left) / r.width - 0.5) * 9
    el.style.transform = `perspective(1200px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`
  }
  const resetTilt = () => {
    if (tiltRef.current) tiltRef.current.style.transform = ''
  }

  return (
    <div className={`page ${loaded ? 'loaded' : ''}`}>
      {/* Background — orbs, particles, grid */}
      <div className="bg" aria-hidden="true">
        <div className="bg-particles">
          <Particles pxRef={pxRef} />
        </div>
        <div className="orb orb-a" />
        <div className="orb orb-b" />
        <div className="bg-grid" />
        <div className="vignette" />
        <div className="grain" />
      </div>

      {/* The flight: sticky viewport, scroll moves the camera forward */}
      <div className="journey" ref={journeyRef}>
        <div className="stage">
          {/* 1 — full-screen copy with a curved username claim bar */}
          <div
            className="layer layer-copy"
            ref={(el) => { layerRefs.current[0] = el }}
          >
            <h1 className="h1" aria-label={HEADLINE.join(' ')}>
              {HEADLINE.map((w, i) => (
                <BlurText
                  key={'w' + i}
                  as="span"
                  text={w}
                  delay={0}
                  startDelay={1350 + i * 60}
                  stepDuration={0.35}
                  direction="bottom"
                  segmentClassName={i === HEADLINE.length - 1 ? 'seg-accent' : ''}
                  className="w-wrap blur-wrap"
                />
              ))}
            </h1>
            <p className="sub" aria-label={SUBLINE.join(' ')}>
              <BlurText
                as="span"
                text={SUBLINE.join(' ')}
                delay={35}
                startDelay={1600}
                stepDuration={0.35}
                direction="bottom"
                className="sub-blur"
              />
            </p>
            <form id="claim" className="claim reveal-cta" onSubmit={claim}>
              <span className="claim-prefix">egirls.lol/</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="yourname"
                maxLength={24}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck="false"
                aria-label="Choose your username"
              />
              <button className="btn primary" type="submit">
                <span className="btn-inner">Claim it</span>
                <span className="btn-arrow">→</span>
              </button>
            </form>
          </div>

          {/* 2 — logo strip plus rotating creator quotes */}
          <div
            className="layer layer-marquee"
            ref={(el) => { layerRefs.current[1] = el }}
          >
            <div className="marquee reveal-logos">
              <Marquee pauseOnHover repeat={2} style={{ '--mq-duration': '26s', '--mq-gap': '40px' }}>
                {LOGOS.map((l, i) => (
                  <span
                    key={i}
                    className="marquee-logo"
                    role="img"
                    aria-label={l.alt}
                    style={{ maskImage: 'url(' + l.src + ')', WebkitMaskImage: 'url(' + l.src + ')' }}
                  />
                ))}
              </Marquee>
            </div>
            <div className="quotes" aria-hidden="true">
              {QUOTES.map((t, i) => (
                <div key={i} className="quote">
                  <q>{t.q}</q>
                  <span>{t.by}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3 — dashboard with travelling light beam */}
          <div
            className="layer layer-dash"
            ref={(el) => { layerRefs.current[2] = el }}
          >
            <div className="dash-glow" aria-hidden="true" />
            <GLGlow className="gl-dash" seed={1} />
            <div
              className="dash-frame"
              ref={tiltRef}
              onMouseMove={onTilt}
              onMouseLeave={resetTilt}
            >
              {shotOk && (
                <img
                  className="dash-img"
                  src="/dash.png"
                  onError={() => setShotOk(false)}
                  alt="egirls.lol dashboard preview"
                  loading="lazy"
                />
              )}
              <div className="dash-shine" aria-hidden="true" />
              {!RM && (
                <BorderBeam size={130} duration={5.5} colorFrom="#F9A8D4" colorTo="#F472B6" />
              )}
            </div>
          </div>

          {/* 4 — features bento grid */}
          <div
            className="layer"
            ref={(el) => { layerRefs.current[3] = el }}
          >
            <p className="layer-kicker">Everything included</p>
            <BentoGrid>
              {FEATURES.map(f => (
                <BentoCard
                  key={f.title}
                  title={f.title}
                  description={f.desc}
                  icon={FEATURE_ICONS[f.icon]}
                  colSpan={f.span}
                >
                  {FEATURE_DEMOS[f.demo]}
                </BentoCard>
              ))}
            </BentoGrid>
          </div>

          {/* 5 — FAQ accordion */}
          <div
            className="layer"
            ref={(el) => { layerRefs.current[4] = el }}
          >
            <h2 className="faq-h">Questions, answered.</h2>
            <LiquidGlassAccordion
              items={FAQS}
              defaultOpen={['free']}
            />
          </div>

          {/* 6 — footer lands in front to close the flight */}
          <div
            className="layer"
            ref={(el) => { layerRefs.current[5] = el }}
          >
            <div className="foot-final">
              <GLGlow className="gl-foot" seed={7} />
              <span className="ff-dot" aria-hidden="true" />
              <h2>Your universe,<br /><em>one link.</em></h2>
              <p>Free to start · open source forever.</p>
              <Magnet magnetStrength={3} padding={60} disabled={RM}>
                <ClickSpark sparkColor="#F472B6" sparkCount={12} sparkRadius={26}>
                  <StarBorder
                    as="a"
                    href="#claim"
                    color="#F472B6"
                    backgroundColor="#0C0E0B"
                    textColor="#FAFAF9"
                    borderColor="#2E2E33"
                    speed="5s"
                    className="foot-star"
                  >
                    <span className="foot-star-label">Claim it <span className="btn-arrow">→</span></span>
                  </StarBorder>
                </ClickSpark>
              </Magnet>
              <span className="ff-small">© 2026 egirls.lol · MIT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}