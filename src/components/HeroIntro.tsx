import { useEffect, useRef } from "react";
import { gsap, SplitText } from "~/lib/gsap";
import { getLenis } from "~/lib/lenis";

const SESSION_KEY = "hero-intro-played";

/**
 * Hero section + entrance animation: a single ink stroke draws itself across
 * the screen, then wipes away left-to-right to reveal the title/subtitle
 * underneath (SplitText char/line reveal, timed to overlap the wipe).
 * Plays once per session; respects prefers-reduced-motion.
 */
export function HeroIntro() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const strokeRef = useRef<SVGPathElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    const stroke = strokeRef.current;
    const title = titleRef.current;
    const subtitle = subtitleRef.current;
    if (!overlay || !stroke || !title || !subtitle) return;

    const titleSplit = new SplitText(title, { type: "chars", mask: "chars" });
    const subtitleSplit = new SplitText(subtitle, { type: "lines", mask: "lines" });

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const alreadyPlayed = sessionStorage.getItem(SESSION_KEY) === "1";

    if (reduceMotion || alreadyPlayed) {
      gsap.set(overlay, { display: "none" });
      gsap.set(titleSplit.chars, { yPercent: 0, autoAlpha: 1 });
      gsap.set(subtitleSplit.lines, { yPercent: 0, autoAlpha: 1 });
      return () => {
        titleSplit.revert();
        subtitleSplit.revert();
      };
    }

    sessionStorage.setItem(SESSION_KEY, "1");

    const length = stroke.getTotalLength();
    gsap.set(stroke, { strokeDasharray: length, strokeDashoffset: length });
    gsap.set(overlay, { clipPath: "inset(0% 0% 0% 0%)" });
    gsap.set(titleSplit.chars, { yPercent: 120, autoAlpha: 0 });
    gsap.set(subtitleSplit.lines, { yPercent: 100, autoAlpha: 0 });

    const lenis = getLenis();
    lenis?.stop();

    const tl = gsap.timeline({
      onComplete: () => {
        lenis?.start();
        gsap.set(overlay, { display: "none" });
      },
    });

    tl.to(stroke, { strokeDashoffset: 0, duration: 0.9, ease: "power2.inOut" })
      .to(
        overlay,
        { clipPath: "inset(0% 0% 0% 100%)", duration: 0.9, ease: "expo.inOut" },
        "-=0.15",
      )
      .to(
        titleSplit.chars,
        { yPercent: 0, autoAlpha: 1, duration: 0.7, stagger: 0.02, ease: "expo.out" },
        "-=0.55",
      )
      .to(
        subtitleSplit.lines,
        { yPercent: 0, autoAlpha: 1, duration: 0.6, stagger: 0.05, ease: "expo.out" },
        "-=0.35",
      );

    return () => {
      tl.kill();
      lenis?.start();
      titleSplit.revert();
      subtitleSplit.revert();
    };
  }, []);

  return (
    <>
      <div
        ref={overlayRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-ink"
      >
        <svg
          className="h-16 w-[min(90vw,640px)] sm:h-20"
          viewBox="0 0 800 100"
          preserveAspectRatio="xMidYMid meet"
          fill="none"
          aria-hidden="true"
          role="presentation"
        >
          <path
            ref={strokeRef}
            d="M8,50 C160,15 260,85 400,48 C540,10 620,88 792,45"
            stroke="var(--color-clay)"
            strokeWidth="8"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <h1 ref={titleRef} className="text-4xl font-semibold sm:text-6xl">
        Tom B.
      </h1>
      <p ref={subtitleRef} className="mt-4 text-lg text-taupe">
        Développeur backend.
      </p>
    </>
  );
}
