import { Suspense } from "react";
import TrackOrderContent from "./track-order-content";

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center">Loading…</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
