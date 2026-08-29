// Ambient background field: sparse outlined triangles drifting behind the
// page content. Monochrome, to sit under the thinking-orbs constellations
// without competing — the orbs paint strictly grayscale, so anything
// chromatic back here would read as a second, unrelated visual language.

/**
 * Ink values echo the orbs' depth shading: a few near-bright glyphs among
 * mostly dim ones. Weighted dark deliberately — white reads far hotter on
 * black than the old chromatic palette did, and this field drifts over body
 * copy, so it has to stay atmosphere rather than debris.
 */
export const AMBIENT_INKS = ["#ffffff", "#9a9a9a", "#6b6b6b", "#6b6b6b"] as const;

export type Particle = {
  x: number; // normalized 0-1 within the field bounds
  y: number;
  size: number;
  rotation: number;
  spin: number;
  ink: string;
  phase: number;
  amplitude: number;
  speed: number;
  delay: number; // 0-1 stagger position in the fade-in
};

// Deterministic PRNG so re-renders (e.g. resize) don't reshuffle the field.
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export function generateAmbientField(count: number, seed = 42): Particle[] {
  const rand = mulberry32(seed);
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: rand(),
      y: rand(),
      size: 3 + rand() * 5,
      rotation: rand() * Math.PI * 2,
      spin: (rand() - 0.5) * 0.2,
      ink: AMBIENT_INKS[Math.floor(rand() * AMBIENT_INKS.length)]!,
      phase: rand() * Math.PI * 2,
      amplitude: 4 + rand() * 8,
      speed: 0.15 + rand() * 0.25,
      delay: rand(),
    });
  }
  return particles;
}

function drawTriangle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  rotation: number,
  ink: string,
  alpha: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.beginPath();
  for (let i = 0; i < 3; i++) {
    const angle = (Math.PI * 2 * i) / 3 - Math.PI / 2;
    if (i === 0) ctx.moveTo(Math.cos(angle) * size, Math.sin(angle) * size);
    else ctx.lineTo(Math.cos(angle) * size, Math.sin(angle) * size);
  }
  ctx.closePath();
  ctx.strokeStyle = ink;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.restore();
}

export function renderAmbientField(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  width: number,
  height: number,
  time: number,
  baseAlpha: number,
  animate: boolean,
  progress = 1,
) {
  ctx.clearRect(0, 0, width, height);

  for (const p of particles) {
    // Each particle consumes its own slice of the fade-in timeline.
    const span = 1 - p.delay * 0.55;
    const gate = Math.min(1, Math.max(0, (progress - p.delay * 0.55) / span));
    if (gate <= 0) continue;
    const eased = easeOutCubic(gate);

    let px = p.x * width;
    let py = p.y * height;
    if (animate) {
      const t = time * p.speed + p.phase;
      px += Math.sin(t) * p.amplitude;
      py += Math.cos(t * 0.8) * p.amplitude;
    }

    const rotation = animate ? p.rotation + time * p.spin : p.rotation;
    drawTriangle(ctx, px, py, p.size, rotation, p.ink, baseAlpha * eased);
  }
}
