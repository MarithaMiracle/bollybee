import { buildLlmsFullTxt } from "@/lib/llms-content";

export const revalidate = 3600;

export async function GET() {
  const body = await buildLlmsFullTxt();

  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
