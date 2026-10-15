import { regenerateQrToken } from "@/actions/properties";
import { DeleteButton } from "@/components/ui/delete-button";
import { appBaseUrl } from "@/lib/email";

/** Scan-Link des Objekts. Das Token ist zufällig und enthält keinen lesbaren Namen. */
export function QrTokenPanel({ propertyId, qrToken }: { propertyId: string; qrToken: string | null }) {
  const regenerate = regenerateQrToken.bind(null, propertyId);

  return (
    <div className="border border-gold/20 bg-white p-6">
      <p className="font-sans text-[11px] uppercase tracking-[3px] text-gold-dark">Scan-Link</p>
      {qrToken ? (
        <>
          <a
            href={`/scan/${qrToken}`}
            target="_blank"
            rel="noreferrer"
            className="mt-2 block break-all font-sans text-sm text-black underline underline-offset-4"
          >
            {appBaseUrl()}/scan/{qrToken}
          </a>
          <p className="mt-2 font-sans text-xs font-light text-grey">
            Dieser Link steckt im QR-Code. Wurde der Code abfotografiert, erzeuge ein neues Token. Der alte Code funktioniert dann nicht mehr.
          </p>
        </>
      ) : (
        <p className="mt-2 font-sans text-sm font-light text-grey">Noch kein Token vorhanden.</p>
      )}
      <div className="mt-4 font-sans text-[11px] uppercase tracking-wide">
        <DeleteButton
          action={regenerate}
          label={qrToken ? "Token neu erzeugen" : "Token erzeugen"}
          confirm="Neues Token erzeugen? Bereits gedruckte QR-Codes dieses Objekts funktionieren danach nicht mehr."
          successMessage="Neues Token erzeugt"
        />
      </div>
    </div>
  );
}
