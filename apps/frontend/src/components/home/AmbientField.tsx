import { useEffect, useRef } from "react";
import { generateAmbientField, renderAmbientField, type Particle } from "./particles";

const FADE_IN_MS = 2600;

/**
 * Sparse, low-opacity monochrome triangles scattered across the full page
 * behind all content — atmospheric depth that doesn't compete with the
 * constellation orbs. Fades up on load and drifts gently.
 */
export function AmbientField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const container = canvas.parentElement!;
    let width = 0;
    let height = 0;
    let raf = 0;
    const startedAt = performance.now();

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = container.clientWidth;
      height = container.clientHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round((width * height) / 24000);
      particlesRef.current = generateAmbientField(Math.max(30, Math.min(count, 140)));
      if (reduceMotion) {
        renderAmbientField(ctx!, particlesRef.current, width, height, 0, 0.22, false);
      }
    }

    function draw(now: number) {
      const progress = Math.min(1, (now - startedAt) / FADE_IN_MS);
      renderAmbientField(ctx!, particlesRef.current, width, height, now / 1000, 0.22, true, progress);
      raf = requestAnimationFrame(draw);
    }

    resize();
    if (!reduceMotion) raf = requestAnimationFrame(draw);

    const observer = new ResizeObserver(resize);
    observer.observe(container);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
