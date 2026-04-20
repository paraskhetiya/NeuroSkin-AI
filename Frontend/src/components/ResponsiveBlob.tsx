import { Suspense, lazy } from "react";
import { GradientOrb } from "./GradientOrb";

const SkinCellBlob = lazy(() =>
  import("./three/SkinCellBlob").then((m) => ({ default: m.SkinCellBlob })),
);

/**
 * Renders the 3D WebGL blob on every device. The blob itself adapts its
 * geometry/segments and DPR for mobile via `useIsMobile` inside SkinCellBlob,
 * so it stays smooth on phones while keeping the same visual identity.
 * The GradientOrb is only used as the Suspense fallback while the chunk loads.
 */
export function ResponsiveBlob() {
  return (
    <Suspense fallback={<GradientOrb />}>
      <SkinCellBlob />
    </Suspense>
  );
}
