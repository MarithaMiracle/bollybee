import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export interface SiteAsset {
  key: string;
  image_url: string;
  alt_text: string | null;
}

export async function getSiteContent(key: string): Promise<SiteAsset | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_content")
    .select("key, image_url, alt_text")
    .eq("key", key)
    .maybeSingle();
  return data;
}

export async function getHeroContent() {
  return getSiteContent("hero");
}
