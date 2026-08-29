import { Nav } from "./home/Nav";
import { AmbientField } from "./home/AmbientField";
import { Orb } from "./home/Orb";
import { Logo } from "./home/Logo";
import { Reveal } from "./home/Reveal";
import { CtaButton } from "./home/CtaButton";
import { Eyebrow } from "./home/Eyebrow";

const STEPS = [
  {
    n: "01",
    title: "Share your resume",
    body: "Upload your resume as a PDF, or paste a short summary. We read your real experience — not a generic question bank.",
  },
  {
    n: "02",
    title: "Talk through a live interview",
    body: "A voice-based AI interviewer asks questions grounded in what you've actually built, and follows up like a real technical interviewer would.",
  },
  {
    n: "03",
    title: "Get a straight answer",
    body: "Walk away with a clear read on where you're strong, where you're shaky, and what to practice before the interview that counts.",
  },
];

const FAQS = [
  {
    q: "Do I need to prepare anything?",
    a: "No. Bring your resume — as a PDF or a pasted summary — and start talking. The interviewer builds its questions from that.",
  },
  {
    q: "How long does an interview run?",
    a: "Around twenty to thirty minutes, the same as a real first-round technical screen. You can end it whenever you like.",
  },
  {
    q: "Is it actually voice, or a chatbot?",
    a: "Voice, both directions. You speak, it listens, it follows up — no typing, no multiple choice.",
  },
];

export function Home() {
  return (
    <div className="pi-root relative min-h-screen w-full overflow-x-hidden bg-void">
      <AmbientField className="pointer-events-none absolute inset-0 h-full w-full" />
      <div className="relative">
        <Nav />

        {/* Hero — asymmetric split, headline weight 400 at display scale */}
        <section className="mx-auto grid w-full max-w-[1280px] grid-cols-1 items-center gap-[60px] px-[24px] pt-[36px] pb-[120px] sm:px-[36px] lg:grid-cols-[1.15fr_0.85fr] lg:gap-[36px] lg:pt-[60px]">
          <div>
            <div className="pi-fade-up" style={{ animationDelay: "60ms" }}>
              <Eyebrow>Voice-based mock interviews</Eyebrow>
            </div>

            <h1 className="mt-[18px] max-w-[680px] font-ppneuemontreal text-subheading font-normal text-bone-white sm:text-heading-sm lg:text-heading-lg">
              <span className="pi-line">
                <span style={{ animationDelay: "140ms" }}>Practice the</span>
              </span>
              <span className="pi-line">
                <span style={{ animationDelay: "230ms" }}>interview before</span>
              </span>
              <span className="pi-line">
                <span style={{ animationDelay: "320ms" }}>
                  it counts.
                </span>
              </span>
            </h1>

            <p
              className="pi-fade-up mt-[30px] max-w-[480px] font-ppneuemontreal text-body font-extralight text-bone-white"
              style={{ animationDelay: "520ms" }}
            >
              projectinterview reads your resume, then runs a live, voice-based technical interview built around your
              actual experience — no canned question bank, no waiting on a human's calendar.
            </p>

            <div className="pi-fade-up mt-[36px]" style={{ animationDelay: "640ms" }}>
              <CtaButton />
            </div>
          </div>

          <div className="relative flex h-[340px] w-full items-center justify-center sm:h-[440px] lg:h-[560px]">
            <Orb className="max-h-full" density={1.7} />
          </div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="mx-auto grid w-full max-w-[1280px] scroll-mt-[96px] grid-cols-1 gap-[60px] px-[24px] py-[120px] sm:px-[36px] lg:grid-cols-2 lg:gap-[96px]"
        >
          <Reveal>
            <Eyebrow>How it works</Eyebrow>
            <h2 className="mt-[18px] max-w-[540px] font-ppneuemontreal text-heading-sm font-normal text-bone-white lg:text-heading-lg">
              Three steps, one real interview.
            </h2>
          </Reveal>

          <div className="flex flex-col gap-[60px]">
            {STEPS.map((step, i) => (
              <Reveal key={step.n} delay={i * 120}>
                <span className="pi-step-num font-ppneuemontreal text-heading-2xs font-normal text-bone-white">
                  {step.n}
                </span>
                <h3 className="mt-[6px] font-ppneuemontreal text-heading-xs font-normal text-bone-white">
                  {step.title}
                </h3>
                <p className="mt-[12px] max-w-[480px] font-ppneuemontreal text-body font-extralight text-silver-mist">
                  {step.body}
                </p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Why projectinterview — visual left, text right (zigzag rhythm) */}
        <section
          id="why"
          className="mx-auto grid w-full max-w-[1280px] scroll-mt-[96px] grid-cols-1 items-center gap-[60px] px-[24px] py-[120px] sm:px-[36px] lg:grid-cols-2 lg:gap-[96px]"
        >
          <div className="relative order-2 flex h-[300px] w-full items-center justify-center sm:h-[380px] lg:order-1 lg:h-[460px]">
            {/* `shaping` — a dotted outline morphing circle → triangle →
                square: the interviewer reshaping itself around whatever
                you bring it, rather than running you through one fixed mold. */}
            <Orb className="max-h-full" state="solving" density={1.6} speed={0.20} />
          </div>
          <Reveal className="order-1 lg:order-2">
            <Eyebrow>Why projectinterview</Eyebrow>
            <h2 className="mt-[18px] max-w-[540px] font-ppneuemontreal text-heading-sm font-normal text-bone-white lg:text-heading-lg">
              Built on your real work, not a question bank.
            </h2>
            <p className="mt-[30px] max-w-[480px] font-ppneuemontreal text-body font-extralight text-silver-mist">
              Most mock interviews ask the same fifty questions everyone else gets. projectinterview asks about the
              project you shipped last month, the language you actually use, and the gaps a real interviewer would
              probe for — so the practice transfers.
            </p>
          </Reveal>
        </section>

        {/* FAQ */}
        <section
          id="faq"
          className="mx-auto grid w-full max-w-[1280px] scroll-mt-[96px] grid-cols-1 gap-[60px] px-[24px] py-[120px] sm:px-[36px] lg:grid-cols-2 lg:gap-[96px]"
        >
          <Reveal>
            <Eyebrow>FAQ</Eyebrow>
            <h2 className="mt-[18px] max-w-[540px] font-ppneuemontreal text-heading-sm font-normal text-bone-white lg:text-heading-lg">
              Questions, answered.
            </h2>
          </Reveal>

          <div className="flex flex-col gap-[36px]">
            {FAQS.map((faq, i) => (
              <Reveal key={faq.q} delay={i * 120}>
                <h3 className="font-ppneuemontreal text-heading-2xs font-normal text-bone-white">{faq.q}</h3>
                <p className="mt-[12px] max-w-[480px] font-ppneuemontreal text-body font-extralight text-silver-mist">
                  {faq.a}
                </p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Closing CTA — full-width statement at true display scale */}
        <section className="mx-auto w-full max-w-[1280px] px-[24px] py-[120px] text-center sm:px-[36px]">
          <Reveal>
            <h2 className="mx-auto max-w-[900px] font-ppneuemontreal text-heading-sm font-normal text-bone-white lg:text-heading-lg xl:text-display">
              Your next interview starts now.
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <div className="mt-[36px] flex justify-center">
              <CtaButton />
            </div>
          </Reveal>
        </section>

        {/* Footer */}
        <footer className="mx-auto flex w-full max-w-[1280px] flex-col items-center justify-between gap-[24px] px-[24px] py-[60px] sm:flex-row sm:px-[36px]">
          <Logo />
          <p className="font-ppneuemontreal text-caption text-ash-gray">
            &copy; {new Date().getFullYear()} projectinterview. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
