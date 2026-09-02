import { cn } from "@/lib/utils";

/** Shared horizontal bounds — must match the navbar inner wrapper. */
export const siteContainerClassName = "mx-auto w-full max-w-7xl px-4 md:px-8";

type SiteContainerProps = {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "header";
};

export function SiteContainer({
  children,
  className,
  as: Component = "div",
}: SiteContainerProps) {
  return (
    <Component className={cn(siteContainerClassName, className)}>
      {children}
    </Component>
  );
}
