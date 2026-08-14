import { Canvas } from "@react-three/fiber";
import { ClientOnly } from "@tanstack/react-router";
import { useReducedMotion } from "~/hooks/useReducedMotion";
import { useWebglSupported } from "~/hooks/useWebglSupported";
import { InkScene, type InkSceneProps } from "./InkScene";

// Screen-space noise at native Retina density doesn't read as sharper —
// it just burns battery. Applied to the whole canvas via Canvas' `dpr`
// prop, so it caps every render target the pipeline allocates in one place.
const MAX_PIXEL_RATIO = 1.75;

/**
 * The sumi-e ink background. Purely decorative: absent under
 * prefers-reduced-motion, absent without WebGL, and server-rendered as
 * nothing at all — bare paper is a legitimate look, not a broken one.
 */
export function InkBackground(props: InkSceneProps) {
  return (
    <ClientOnly fallback={null}>
      <InkBackgroundClient {...props} />
    </ClientOnly>
  );
}

function InkBackgroundClient(props: InkSceneProps) {
  const reducedMotion = useReducedMotion();
  const webglSupported = useWebglSupported();

  if (reducedMotion || !webglSupported) return null;

  return (
    <Canvas
      className="pointer-events-none !fixed inset-0 -z-10"
      dpr={[1, MAX_PIXEL_RATIO]}
      gl={{ alpha: true, antialias: false }}
    >
      <InkScene {...props} />
    </Canvas>
  );
}
