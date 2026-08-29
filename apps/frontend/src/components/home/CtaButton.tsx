import { Link } from "react-router";
import { cn } from "@/lib/utils";

/**
 * The single filled violet pill — the only filled action surface on the site.
 * Spec geometry: #8052ff, 22.5px radius (full pill at ~45px height),
 * 14.4px × 16px padding, 14px weight 600 uppercase with 0.025em tracking.
 */
export function CtaButton({
  children = "Start Interview",
  className,
  to = "/start",
}: {
  children?: React.ReactNode;
  className?: string;
  to?: string;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "pi-cta inline-flex items-center justify-center rounded-full bg-electric-iris",
        "px-[16px] py-[14.4px] font-ppneuemontreal text-nav-label font-semibold text-bone-white uppercase",
        className,
      )}
    >
      {children}
    </Link>
  );
}
