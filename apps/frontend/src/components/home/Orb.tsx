import { useEffect, useRef } from "react";
import { MODE_DRAWS, resolvePreset, type OrbState } from "thinking-orbs";

/**
 * A thinking-orbs constellation rendered at section scale. Defaults to the
 * `connecting` state — "a constellation wires itself, packets running the
 * edges" — but takes any of the library's nine states.
 *
 * The shipped <ThinkingOrb> component only accepts size 64 or 20, which would
 * either sit lost inside this column or go blurry when upscaled (its canvas is
 * DPR-capped at 2). So this drives the library's documented power-user surface
 * (`resolvePreset` + `MODE_DRAWS`) onto our own canvas at the real pixel size,
 * which keeps the arcs crisp. In exchange we own the clock, theme, offscreen
 * pausing and reduced-motion handling that the component would have given us.
 *
 * Note the library paints strictly monochrome — every dot and edge goes out as
 * rgba(g,g,g,a) — so this renders white-on-black and cannot take the brand's
 * violet/amber palette.
 */
export function Orb({
  className,
  density = 1,
  // The library's own baked speeds (2-3.7x/sec) were tuned for a 64px chat
  // avatar glimpsed in a corner — stretched across a hero section they read
  // as jittery and pull focus from the copy. Halving is the default here;
  // call sites can still override per instance.
  speed: speedMul = 0.5,
  state = "connecting",
}: {
  className?: string;
  density?: number;
  speed?: number;
  state?: OrbState;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const container = canvas.parentElement!;
    const { mode, speed: baseSpeed, opts } = resolvePreset(state, 64);
    const speed = baseSpeed * speedMul;

    // The preset's counts are baked for a 64px canvas and don't scale with
    // size, so a large orb can come out sparse. The library's own scaleCounts
    // isn't exported from the package root, so `density` only re-tunes the
    // two fields we can safely touch by hand — `nodeN` (web/connecting) and
    // `iconD` (morph/shaping, its outline sampling density). Other states
    // already resolve dense enough at this scale.
    let tuned = opts;
    if (tuned.nodeN) tuned = { ...tuned, nodeN: Math.round(tuned.nodeN * density) };
    if (tuned.iconD) tuned = { ...tuned, iconD: tuned.iconD * density };

    let size = 0;
    let raf = 0;
    let visible = true;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      // The painter assumes a square canvas — inscribe it in the container.
      size = Math.min(container.clientWidth, container.clientHeight);
      canvas!.width = size * dpr;
      canvas!.height = size * dpr;
      canvas!.style.width = `${size}px`;
      canvas!.style.height = `${size}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Paint a frame straight away so the canvas is never blank between
      // layout and the first rAF tick — and so reduced-motion users, who get
      // no loop at all, still see the constellation.
      frame(reduceMotion ? 0 : (performance.now() / 1000) * speed);
    }

    function frame(t: number) {
      ctx!.clearRect(0, 0, size, size);
      // dark = true: light ink, for the void canvas.
      MODE_DRAWS[mode](ctx!, size, t, true, tuned);
    }

    function loop() {
      if (visible) frame((performance.now() / 1000) * speed);
      raf = requestAnimationFrame(loop);
    }

    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    // Match the library's own behaviour: stop burning frames offscreen.
    const viewObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) visible = entry.isIntersecting;
    });
    viewObserver.observe(container);

    if (!reduceMotion) raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      viewObserver.disconnect();
    };
  }, [density, speedMul, state]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
