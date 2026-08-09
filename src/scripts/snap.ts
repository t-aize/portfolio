import { lenis } from "./lenis";

/**
 * One wheel tick moves exactly one section, in either direction — down
 * from Hero lands on Work, up from anywhere in Work returns to Hero.
 * Desktop/trackpad only (see `canHover` gate in hero.ts for the same
 * reasoning): touch scrolling is already direct enough on mobile that
 * hijacking it risks feeling janky rather than fast.
 */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

if (!reduceMotion && canHover) {
  const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-snap-section]"));

  if (sections.length > 1) {
    let isSnapping = false;

    const snapTo = (target: number) => {
      isSnapping = true;
      const duration = 1.1;

      // `lock: true` stops Lenis's own wheel handling from fighting this
      // animation — without it, wheel events keep feeding Lenis's normal
      // scroll physics mid-flight, the animation never settles, onComplete
      // never fires, and isSnapping is stuck true (nothing else responds
      // until a page refresh). The timeout below is just a backstop in
      // case onComplete is ever skipped for some other reason.
      lenis.scrollTo(target, {
        duration,
        lock: true,
        easing: (t: number) => 1 - (1 - t) ** 3,
        onComplete: () => {
          isSnapping = false;
        },
      });
      setTimeout(
        () => {
          isSnapping = false;
        },
        duration * 1000 + 200,
      );
    };

    window.addEventListener(
      "wheel",
      (event) => {
        if (isSnapping) {
          event.preventDefault();
          return;
        }

        // Clamped to the document's actual max scroll: if a section's own
        // content isn't tall enough to push its top all the way to the
        // viewport's top edge, Lenis silently caps scrollTo there too — so
        // comparing against the raw offsetTop would leave `y` forever short
        // of `tops[i]`, currentIndex stuck at the wrong section, and the
        // opposite direction never firing.
        const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        const tops = sections.map((section) => Math.min(section.offsetTop, maxScroll));
        const y = lenis.scroll;
        let currentIndex = 0;
        for (let i = 0; i < tops.length; i++) {
          if (y >= tops[i]! - 1) currentIndex = i;
        }

        if (event.deltaY > 0) {
          const nextTop = tops[currentIndex + 1];
          if (nextTop !== undefined) {
            event.preventDefault();
            snapTo(nextTop);
          }
        } else if (event.deltaY < 0) {
          const prevTop = tops[currentIndex - 1];
          if (currentIndex > 0 && prevTop !== undefined) {
            event.preventDefault();
            snapTo(prevTop);
          }
        }
      },
      { passive: false },
    );
  }
}
