import { useEffect, useRef } from "react";
import { gsap } from "~/lib/gsap";
import { scrollStore } from "~/store/scroll";

/**
 * The page's ambient backdrop, three ink-derived layers stacked behind
 * everything else:
 *
 *   1. a handful of blurred blobs drifting and bleeding into one another
 *      (canvas, multiply blend) — suminagashi, ink dropped on water
 *   2. a scatter of motes drifting slowly downward, like ink settling
 *   3. a single brush stroke along the right edge that draws itself in
 *      as the page scrolls — the kakemono unscrolling
 *
 * Driven off the same GSAP ticker as Lenis (see lib/lenis.ts) so every
 * moving thing on the page shares one clock. Reads scroll progress via
 * scrollStore.getState() inside the loop rather than subscribing with a
 * hook, same rationale as store/scroll.ts: this runs every frame and a
 * subscription would mean a React re-render 60x/sec for a canvas that
 * doesn't use React to draw anyway.
 *
 * Mount once, high in the tree (see RootLayout), same as InkCursor.
 */
export function InkField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokeRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const strokeEl = strokeRef.current;
    if (!canvas || !strokeEl) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canHover = window.matchMedia("(pointer: fine)").matches;

    const styles = getComputedStyle(document.documentElement);
    const readColor = (name: string, fallback: string) =>
      styles.getPropertyValue(name).trim() || fallback;
    const clay = readColor("--color-clay", "#e0afa0");
    const taupe = readColor("--color-taupe", "#8a817c");
    const stone = readColor("--color-stone", "#bcb8b1");
    const ink = readColor("--color-ink", "#463f3a");

    const length = strokeEl.getTotalLength();
    strokeEl.style.strokeDasharray = `${length}`;

    const updateStroke = () => {
      const { progress } = scrollStore.getState();
      strokeEl.style.strokeDashoffset = `${length * (1 - progress)}`;
    };

    interface Blob {
      x: number;
      y: number;
      r: number;
      vx: number;
      vy: number;
      phase: number;
      color: string;
      alpha: number;
    }
    const blobs: Blob[] = Array.from({ length: 5 }, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.22 + Math.random() * 0.18,
      vx: (Math.random() - 0.5) * 0.00006,
      vy: (Math.random() - 0.5) * 0.00006,
      phase: Math.random() * Math.PI * 2,
      color: [clay, taupe, stone][i % 3],
      alpha: 0.34 + Math.random() * 0.14,
    }));

    interface Mote {
      x: number;
      y: number;
      r: number;
      speed: number;
      sway: number;
    }
    const motes: Mote[] = Array.from({ length: 14 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 1 + Math.random() * 1.6,
      speed: 0.00004 + Math.random() * 0.00003,
      sway: Math.random() * Math.PI * 2,
    }));

    let w = 0;
    let h = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth * dpr;
      h = canvas.clientHeight * dpr;
      canvas.width = w;
      canvas.height = h;
    };
    resize();
    window.addEventListener("resize", resize);

    let pointer = { x: 0.5, y: 0.5, active: false };
    const onMove = (e: PointerEvent) => {
      pointer = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
        active: true,
      };
    };
    const onLeave = () => {
      pointer.active = false;
    };
    if (canHover && !reduceMotion) {
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerleave", onLeave);
    }

    const renderInk = (time: number) => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "multiply";
      for (const b of blobs) {
        b.x += b.vx + Math.sin(time * 0.15 + b.phase) * 0.00004;
        b.y += b.vy + Math.cos(time * 0.12 + b.phase) * 0.00004;
        if (b.x < -0.25) b.x = 1.25;
        if (b.x > 1.25) b.x = -0.25;
        if (b.y < -0.25) b.y = 1.25;
        if (b.y > 1.25) b.y = -0.25;

        let bx = b.x;
        let by = b.y;
        if (pointer.active) {
          const dx = b.x - pointer.x;
          const dy = b.y - pointer.y;
          const dist = Math.hypot(dx, dy) || 1;
          if (dist < 0.22) {
            const push = (0.22 - dist) * 0.5;
            bx += (dx / dist) * push;
            by += (dy / dist) * push;
          }
        }

        const grad = ctx.createRadialGradient(bx * w, by * h, 0, bx * w, by * h, b.r * w);
        grad.addColorStop(0, hexToRgba(b.color, b.alpha));
        grad.addColorStop(1, hexToRgba(b.color, 0));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(bx * w, by * h, b.r * w, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
      for (const m of motes) {
        m.y += m.speed;
        if (m.y > 1.08) {
          m.y = -0.05;
          m.x = Math.random();
        }
        const swayX = Math.sin(time * 0.4 + m.sway) * 0.01;
        ctx.beginPath();
        ctx.fillStyle = hexToRgba(ink, 0.26);
        ctx.arc((m.x + swayX) * w, m.y * h, m.r * (w / 900), 0, Math.PI * 2);
        ctx.fill();
      }
    };

    if (reduceMotion) {
      renderInk(0);
      updateStroke();
      const unsubscribe = scrollStore.subscribe(updateStroke);
      return () => {
        window.removeEventListener("resize", resize);
        unsubscribe();
      };
    }

    strokeEl.style.strokeDashoffset = `${length}`;

    const tick = (time: number) => {
      renderInk(time);
      updateStroke();
    };
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("resize", resize);
      if (canHover) {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerleave", onLeave);
      }
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full blur-xl" />
      <svg
        aria-hidden="true"
        className="absolute inset-y-0 right-6 h-full w-2 sm:right-10"
        viewBox="0 0 2 1000"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          ref={strokeRef}
          d="M1 20 C0.4 120, 1.6 240, 1 360 C0.4 480, 1.6 600, 1 720 C0.4 840, 1.6 920, 1 980"
          stroke="var(--color-ink)"
          strokeOpacity={0.35}
          strokeWidth={1.4}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const bigint = parseInt(full, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
