"use client";

const TRUST_ITEMS = [
  "Long-lasting",
  "Imported Oils",
  "Nationwide Delivery",
  "Secure Paystack Payments",
] as const;

/** Repeat enough times that one segment always fills the viewport */
const SEGMENT_REPEATS = 6;

function TrustSegment({ hidden }: { hidden?: boolean }) {
  return (
    <div className="trust-marquee-segment" aria-hidden={hidden}>
      {Array.from({ length: SEGMENT_REPEATS }).map((_, rep) =>
        TRUST_ITEMS.map((item) => (
          <span key={`${rep}-${item}`} className="trust-marquee-item">
            {item}
            <span className="trust-marquee-separator" aria-hidden>
              ·
            </span>
          </span>
        ))
      )}
    </div>
  );
}

export function TrustMarquee() {
  return (
    <div className="relative overflow-hidden bg-black py-3.5">
      <div className="trust-marquee-track">
        <TrustSegment />
        <TrustSegment hidden />
      </div>
    </div>
  );
}
