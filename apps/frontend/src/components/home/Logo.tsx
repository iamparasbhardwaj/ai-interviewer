import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-[8px]", className)}>
      {/* Flat Electric Iris — the gradient's teal stop was the only other hue
          left once the palette went monochrome, so the mark is solid now. */}
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M11 1.5 L20.5 18.5 L7 20.5 L1.5 10 Z" fill="#8052ff" />
      </svg>
      <span className="font-ppneuemontreal text-nav-label font-semibold text-bone-white">projectinterview</span>
    </div>
  );
}
