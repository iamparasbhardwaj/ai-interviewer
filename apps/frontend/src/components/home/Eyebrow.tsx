import type { ReactNode } from "react";

/**
 * Section eyebrow: 14px weight 600 uppercase with 0.35px tracking.
 * Muted grey rather than the spec's amber — the palette is monochrome now,
 * to match the orbs.
 */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="block font-ppneuemontreal text-nav-label font-semibold tracking-[0.35px] text-ash-gray uppercase">
      {children}
    </span>
  );
}
