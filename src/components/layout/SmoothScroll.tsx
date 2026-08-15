import { useEffect } from "react";
import { destroyLenis, getLenis } from "~/lib/lenis";

/** Boots the Lenis singleton on the client. Renders nothing. */
export function SmoothScroll() {
  useEffect(() => {
    getLenis();
    return () => destroyLenis();
  }, []);

  return null;
}
