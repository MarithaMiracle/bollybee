"use client";

import { useId, useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ACCEPT = "image/jpeg,image/png,image/webp";
const ACCEPT_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024;

interface ImageDropzoneProps {
  disabled?: boolean;
  label?: string;
  hint?: string;
  className?: string;
  /** Called with a validated image file */
  onFile: (file: File) => void;
}

export function assertAllowedImage(file: File): string | null {
  if (!ACCEPT_TYPES.has(file.type)) return "Only JPEG, PNG, and WebP allowed";
  if (file.size > MAX_BYTES) return "File must be under 5MB";
  return null;
}

export function ImageDropzone({
  disabled,
  label = "Drop an image here, or click to browse",
  hint = "JPEG, PNG, or WebP · max 5MB",
  className,
  onFile,
}: ImageDropzoneProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file || disabled) return;

    const error = assertAllowedImage(file);
    if (error) {
      toast.error(error);
      setFileName(null);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setFileName(file.name);
    onFile(file);
  }

  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={inputId}
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!disabled) setDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-1 rounded-[var(--radius)] border border-dashed px-4 py-6 text-center transition-colors",
          dragging
            ? "border-[var(--plum)] bg-[var(--blush)]/40"
            : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--plum)]/50",
          disabled && "pointer-events-none opacity-50"
        )}
      >
        <span className="text-sm font-medium text-[var(--foreground)]">{label}</span>
        <span className="text-xs text-[var(--muted-foreground)]">{hint}</span>
        {fileName ? (
          <span className="mt-1 max-w-full truncate text-xs text-[var(--plum)]">{fileName}</span>
        ) : null}
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={ACCEPT}
          disabled={disabled}
          className="sr-only"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </label>
    </div>
  );
}
