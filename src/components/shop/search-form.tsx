"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SearchForm({ initialQuery }: { initialQuery?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery || "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex gap-2">
      <Input
        type="search"
        placeholder="Search fragrances…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Search fragrances"
        className="max-w-md"
      />
      <Button type="submit">Search</Button>
    </form>
  );
}
