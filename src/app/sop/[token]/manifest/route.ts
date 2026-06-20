import { getGuideByToken } from "@/lib/sop";

export const dynamic = "force-dynamic";

// Pro-Token-Manifest: "Zum Homescreen" landet direkt auf der richtigen Anleitung.
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ token: string }> }
) {
  const { token } = await ctx.params;
  const guide = await getGuideByToken(token);

  const procName = guide?.procedure.name ?? "Anleitung";
  const siteName = guide?.site.name ?? "";
  const fullName = siteName ? `${procName} · ${siteName}` : procName;

  const manifest = {
    name: `Lucid* — ${fullName}`,
    short_name: procName.slice(0, 20),
    description: "Reinigungsanleitung Schritt für Schritt — auch offline.",
    start_url: `/sop/${token}`,
    scope: `/sop/${token}`,
    display: "standalone",
    orientation: "portrait",
    background_color: "#080808",
    theme_color: "#080808",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };

  return new Response(JSON.stringify(manifest), {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
