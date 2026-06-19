import { headers } from "next/headers";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { PrintButton } from "@/components/sop/print-button";

export const dynamic = "force-dynamic";

export default async function QrPosterPage(props: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await props.params;

  const sp = await prisma.siteProcedure.findUnique({
    where: { qrToken: token },
    include: { site: true, procedure: true },
  });
  if (!sp) notFound();

  const h = await headers();
  const host = h.get("host") ?? "lucid-cleaning.de";
  const proto = h.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const url = `${proto}://${host}/sop/${token}`;

  const qrSvg = await QRCode.toString(url, {
    type: "svg",
    margin: 1,
    color: { dark: "#080808", light: "#ffffff" },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between print:hidden">
        <a
          href={`/sop-procedures/${sp.procedureId}/edit`}
          className="font-sans text-[11px] uppercase tracking-[2px] text-grey hover:text-gold-dark"
        >
          ← Zurück zur Anleitung
        </a>
        <PrintButton />
      </div>

      {/* Poster */}
      <div className="mx-auto w-full max-w-[420px] overflow-hidden rounded-2xl border border-gold/20 bg-white print:max-w-none print:rounded-none print:border-0">
        <div className="bg-black px-8 pb-7 pt-8 text-center text-light">
          <div className="font-serif text-3xl tracking-wide">
            Lucid<span className="text-gold">*</span>
          </div>
          <p className="mt-4 font-sans text-[11px] uppercase tracking-[4px] text-gold">
            {sp.procedure.name}
          </p>
          <h1 className="mt-1 font-serif text-2xl font-light">{sp.site.name}</h1>
        </div>

        <div className="px-8 py-8 text-center">
          <p className="font-sans text-sm font-light tracking-wide text-black/70">
            Mit dem Handy scannen für die
            <br />
            Schritt-für-Schritt-Anleitung
          </p>
          <div
            className="mx-auto mt-6 w-56 [&>svg]:h-full [&>svg]:w-full"
            dangerouslySetInnerHTML={{ __html: qrSvg }}
          />
          <p className="mt-6 font-sans text-[11px] uppercase tracking-[3px] text-grey">
            Kein Login nötig
          </p>
          <p className="mt-2 break-all font-mono text-[10px] text-grey/70">{url}</p>
        </div>
      </div>

      <p className="text-center font-sans text-xs text-grey print:hidden">
        Tipp: laminiert am Depot aufhängen – hält Feuchtigkeit aus.
      </p>
    </div>
  );
}
