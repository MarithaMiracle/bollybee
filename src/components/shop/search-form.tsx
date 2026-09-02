"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchFormProps {
  initialQuery?: string;
  /** Where to submit — defaults to /search */
  actionPath?: string;
  /** Keep category, family, sort, etc. when searching (use on /shop) */
  preserveParams?: boolean;
  className?: string;
}

export function SearchForm({
  initialQuery,
  actionPath = "/search",
  preserveParams = false,
  className,
}: SearchFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(initialQuery || "");

  useEffect(() => {
    setQ(initialQuery || "");
  }, [initialQuery]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();

    if (preserveParams) {
      const params = new URLSearchParams(searchParams.toString());
      if (trimmed) params.set("q", trimmed);
      else params.delete("q");
      params.delete("page");
      const query = params.toString();
      router.push(query ? `${actionPath}?${query}` : actionPath);
      return;
    }

    router.push(trimmed ? `${actionPath}?q=${encodeURIComponent(trimmed)}` : actionPath);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-3 sm:flex-row sm:items-center", className)}
    >
      <Input
        type="search"
        placeholder="Search fragrances…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Search fragrances"
        className="w-full sm:max-w-md"
      />
      <Button type="submit" className="w-full sm:w-auto">
        Search
      </Button>
    </form>
  );
}
