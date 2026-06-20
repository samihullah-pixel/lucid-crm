import { notFound } from "next/navigation";
import type { Metadata, Viewport } from "next";
import { getGuideByToken } from "@/lib/sop";
import { SopGuide } from "@/components/sop/sop-guide";

export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  themeColor: "#080808",
};

export async function generateMetadata(props: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await props.params;
  const guide = await getGuideByToken(token);
  const title = guide
    ? `${guide.procedure.name} · ${guide.site.name}`
    : "Anleitung";

  return {
    title: `Lucid* — ${title}`,
    description: "Reinigungsanleitung Schritt für Schritt — auch offline.",
    manifest: `/sop/${token}/manifest`,
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: guide?.procedure.name ?? "Lucid*",
    },
    icons: {
      apple: "/icons/apple-touch-icon.png",
      icon: "/icons/icon-192.png",
    },
  };
}

export default async function SopPage(props: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await props.params;
  const guide = await getGuideByToken(token);
  if (!guide) notFound();
  return <SopGuide guide={guide} />;
}
