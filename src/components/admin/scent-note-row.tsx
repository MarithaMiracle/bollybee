"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteScentNote, updateScentNote } from "@/actions/admin-products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useConfirm } from "@/components/ui/confirm-provider";
import type { ScentNote } from "@/types";

interface ScentNoteRowProps {
  productId: string;
  note: ScentNote;
}

export function ScentNoteRow({ productId, note }: ScentNoteRowProps) {
  const confirm = useConfirm();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateScentNote(
        note.id,
        productId,
        String(fd.get("noteType")),
        String(fd.get("name"))
      );
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Note updated");
      router.refresh();
    });
  }

  async function handleDelete() {
    const ok = await confirm({
      title: "Delete this scent note?",
      description: `"${note.name}" (${note.note_type}) will be removed from this product.`,
      confirmLabel: "Delete note",
      variant: "destructive",
    });
    if (!ok) return;

    startTransition(async () => {
      const result = await deleteScentNote(note.id, productId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Note deleted");
      router.refresh();
    });
  }

  return (
    <li className="rounded-[var(--radius-sm)] border border-[var(--border)] p-3">
      <form onSubmit={handleSave} className="flex flex-wrap items-end gap-2">
        <Select name="noteType" defaultValue={note.note_type} disabled={pending} className="w-28">
          <option value="TOP">Top</option>
          <option value="HEART">Heart</option>
          <option value="BASE">Base</option>
        </Select>
        <Input
          name="name"
          defaultValue={note.name}
          placeholder="Note name"
          required
          disabled={pending}
          className="min-w-[10rem] flex-1"
        />
        <Button type="submit" size="sm" disabled={pending}>
          Save
        </Button>
        <Button type="button" size="sm" variant="destructive" disabled={pending} onClick={handleDelete}>
          Delete
        </Button>
      </form>
    </li>
  );
}
