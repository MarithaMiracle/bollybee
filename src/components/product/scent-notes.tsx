import type { ScentNote } from "@/types";

interface ScentNotesDisplayProps {
  notes: ScentNote[];
}

const NOTE_LABELS = { TOP: "Top", HEART: "Heart", BASE: "Base" } as const;

export function ScentNotesDisplay({ notes }: ScentNotesDisplayProps) {
  const grouped = (["TOP", "HEART", "BASE"] as const).map((type) => ({
    type,
    label: NOTE_LABELS[type],
    items: notes.filter((n) => n.note_type === type).sort((a, b) => a.sort_order - b.sort_order),
  }));

  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {grouped.map(
        ({ type, label, items }) =>
          items.length > 0 && (
            <div key={type} className="border-t border-[var(--border)] pt-4">
              <p className="mb-3 text-[10px] uppercase tracking-[0.24em] text-[var(--muted)]">
                {label} Notes
              </p>
              <ul className="space-y-1">
                {items.map((note) => (
                  <li key={note.id} className="break-words font-display text-base text-[var(--plum)] sm:text-lg">
                    {note.name}
                  </li>
                ))}
              </ul>
            </div>
          )
      )}
    </div>
  );
}
