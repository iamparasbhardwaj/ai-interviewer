import { Link } from "react-router";
import { Logo } from "./Logo";
import { CtaButton } from "./CtaButton";

const LINKS = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Why projectinterview", href: "#why" },
  { label: "FAQ", href: "#faq" },
];

/**
 * `minimal` strips the section links and the CTA — used on /start, where the
 * in-page anchors point at sections that don't exist and the CTA would just
 * link to the page you're already on. Leaves the logo as the way back home.
 */
export function Nav({ minimal = false }: { minimal?: boolean }) {
  return (
    // Sticky on pure black with no border and no backdrop blur, per spec — the
    // void behind it means there's no seam to hide.
    <header className="sticky top-0 z-50 bg-void">
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-[18px] px-[24px] py-[24px] sm:px-[36px]">
        <Link to="/" aria-label="projectinterview — home" className="shrink-0">
          <Logo className="pi-fade-up" />
        </Link>

        {!minimal && (
          <>
            <nav className="hidden items-center gap-[36px] md:flex">
              {LINKS.map((link, i) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="pi-navlink pi-fade-up font-ppneuemontreal text-nav-label font-semibold text-ash-gray uppercase transition-colors hover:text-bone-white"
                  style={{ animationDelay: `${80 + i * 60}ms` }}
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <CtaButton className="pi-fade-up shrink-0 max-sm:px-[12px] max-sm:py-[11px]" />
          </>
        )}
      </div>
    </header>
  );
}
