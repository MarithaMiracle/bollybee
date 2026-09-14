"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { updateHeroAltText, updateHeroImage } from "@/actions/admin-site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface HomepageHeroEditorProps {
  imageUrl: string | null;
  altText: string | null;
}

export function HomepageHeroEditor({ imageUrl, altText }: HomepageHeroEditorProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      const result = await updateHeroImage(formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Hero image updated");
      form.reset();
      router.refresh();
    });
  }

  function handleAltSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateHeroAltText(formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Alt text saved");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6 p-5">
      <div>
        <h2 className="font-display text-lg">Hero image</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Full-bleed background on the homepage. Use a wide landscape photo (about 1600×900 or larger).
          JPEG, PNG, or WebP up to 5MB.
        </p>
      </div>

      <div className="relative aspect-[16/9] max-w-2xl overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={altText || "Current hero image"}
            fill
            className="object-cover object-right"
            sizes="(max-width:768px) 100vw, 672px"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
            No hero image set
          </div>
        )}
      </div>

      <form onSubmit={handleUpload} className="max-w-md space-y-3">
        <div>
          <Label htmlFor="hero-file">Upload new hero image</Label>
          <Input
            id="hero-file"
            name="file"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
            disabled={pending}
          />
        </div>
        <div>
          <Label htmlFor="hero-alt-upload">Alt text</Label>
          <Input
            id="hero-alt-upload"
            name="altText"
            defaultValue={altText ?? ""}
            placeholder="Describe the hero image"
            disabled={pending}
          />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Uploading…" : "Replace hero image"}
        </Button>
      </form>

      {imageUrl ? (
        <form onSubmit={handleAltSave} className="max-w-md space-y-3 border-t border-[var(--border)] pt-6">
          <div>
            <Label htmlFor="hero-alt-only">Update alt text only</Label>
            <Input
              id="hero-alt-only"
              name="altText"
              defaultValue={altText ?? ""}
              placeholder="Describe the hero image"
              disabled={pending}
            />
          </div>
          <Button type="submit" variant="outline" disabled={pending}>
            Save alt text
          </Button>
        </form>
      ) : null}
    </div>
  );
}
