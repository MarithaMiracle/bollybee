"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
};

type ConfirmContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({ title: "" });
  const resolveRef = useRef<(value: boolean) => void>(() => {});

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  function finish(result: boolean) {
    setOpen(false);
    resolveRef.current(result);
  }

  const isDestructive = options.variant === "destructive";

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <Dialog.Root
        open={open}
        onOpenChange={(next) => {
          if (!next) finish(false);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/45 backdrop-blur-[2px]" />
          <Dialog.Content
            className={cn(
              "brand-panel-xl fixed left-1/2 top-1/2 z-[101] w-[calc(100%-2rem)] max-w-md max-h-[min(90dvh,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto",
              "bg-[var(--background)] p-6 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.35)] outline-none md:p-8"
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <Dialog.Title className="font-display text-xl text-[var(--foreground)] sm:text-2xl">
                {options.title}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="inline-flex min-h-10 min-w-10 shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] text-[var(--muted-foreground)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--plum)]"
                  aria-label="Close dialog"
                >
                  <X className="h-5 w-5" />
                </button>
              </Dialog.Close>
            </div>
            {options.description && (
              <Dialog.Description className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
                {options.description}
              </Dialog.Description>
            )}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => finish(false)}
                className="sm:min-w-[100px]"
              >
                {options.cancelLabel ?? "Cancel"}
              </Button>
              <Button
                type="button"
                variant={isDestructive ? "destructive" : "accent"}
                onClick={() => finish(true)}
                className="sm:min-w-[100px]"
              >
                {options.confirmLabel ?? "Confirm"}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useConfirm must be used within ConfirmProvider");
  }
  return ctx.confirm;
}
