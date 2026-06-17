"use client";

import { deleteInspectionTemplate } from "@/actions/inspection-templates";

export function DeleteTemplateButton({ templateId }: { templateId: string }) {
  const action = deleteInspectionTemplate.bind(null, templateId);
  return (
    <form action={action}>
      <button
        type="submit"
        onClick={(e) => {
          if (!confirm("Aufnahmebogen wirklich löschen?")) e.preventDefault();
        }}
        className="font-sans text-[11px] uppercase tracking-wide text-grey hover:text-red-500"
      >
        Löschen
      </button>
    </form>
  );
}
