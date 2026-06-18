import { createSite } from "@/actions/sites";
import { SiteForm } from "@/components/forms/site-form";

export default function NewSitePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-light text-black">Neuer Standort</h1>
        <p className="font-sans text-sm font-light text-grey">
          Einsatzort mit Schichten anlegen.
        </p>
      </div>
      <SiteForm action={createSite} />
    </div>
  );
}
