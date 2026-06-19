import { notFound } from "next/navigation";
import { getGuideByToken } from "@/lib/sop";
import { SopGuide } from "@/components/sop/sop-guide";

export const dynamic = "force-dynamic";

export default async function SopPage(props: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await props.params;
  const guide = await getGuideByToken(token);
  if (!guide) notFound();
  return <SopGuide guide={guide} />;
}
