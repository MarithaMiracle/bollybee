import { cn } from "@/lib/utils";

interface AdminCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}

export function AdminCard({ children, className, padding = true }: AdminCardProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-white shadow-sm",
        padding && "p-0",
        className
      )}
    >
      {children}
    </div>
  );
}

export function AdminEmpty({ message }: { message: string }) {
  return (
    <p className="px-6 py-12 text-center text-sm text-[var(--muted-foreground)]">{message}</p>
  );
}
