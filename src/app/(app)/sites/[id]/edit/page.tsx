import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateSite } from "@/actions/sites";
import { SiteForm } from "@/components/forms/site-form";

export default async function EditSitePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const site = await prisma.site.findUnique({
    where: { id: params.id },
    include: { shifts: { orderBy: { sortOrder: "asc" } } },
  });

  if (!site) notFound();

  const action = updateSite.bind(null, site.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-light text-black">{site.name}</h1>
        <p className="font-sans text-sm font-light text-grey">
          Standort und Schichten bearbeiten.
        </p>
      </div>
      <SiteForm action={action} site={site} />
    </div>
  );
}
