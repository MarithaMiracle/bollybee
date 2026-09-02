import * as React from "react";
import { cn } from "@/lib/utils";

export const selectClassName =
  "flex h-11 w-full cursor-pointer rounded-[var(--radius)] border border-[var(--border)] bg-white px-4 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]/30 disabled:cursor-not-allowed disabled:opacity-50";

const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select className={cn(selectClassName, className)} ref={ref} {...props} />
));
Select.displayName = "Select";

export { Select };
