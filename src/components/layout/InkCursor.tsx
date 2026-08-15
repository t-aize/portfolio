import { useEffect, useRef } from "react";
import { gsap } from "~/lib/gsap";

/**
 * The page's one moving mark: a soft ink aura that trails the pointer,
 * lagging lazily behind it, and draws inward around anything hoverable —
 * space contracting around a point of attention. Mouse-only, and off
 * entirely under reduced motion.
 */
export function InkCursor() {
  const auraRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const aura = auraRef.current;
    if (!aura) return;

    const canHover = window.matchMedia("(pointer: fine)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!canHover || reduceMotion) return;

    gsap.set(aura, { xPercent: -50, yPercent: -50, autoAlpha: 0, scale: 1 });

    const setX = gsap.quickTo(aura, "x", { duration: 0.9, ease: "power3" });
    const setY = gsap.quickTo(aura, "y", { duration: 0.9, ease: "power3" });

    const onMove = (e: PointerEvent) => {
      gsap.set(aura, { autoAlpha: 1 });
      setX(e.clientX);
      setY(e.clientY);
    };
    const onOver = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("[data-cursor='hover']")) {
        gsap.to(aura, { scale: 0.35, duration: 0.6, ease: "power3.out" });
      }
    };
    const onOut = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("[data-cursor='hover']")) {
        gsap.to(aura, { scale: 1, duration: 0.6, ease: "power3.out" });
      }
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerover", onOver);
    window.addEventListener("pointerout", onOut);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerout", onOut);
    };
  }, []);

  return (
    <div
      ref={auraRef}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-0 h-56 w-56 rounded-full bg-radial from-clay to-50% to-transparent opacity-50 mix-blend-multiply blur-2xl"
    />
  );
}
