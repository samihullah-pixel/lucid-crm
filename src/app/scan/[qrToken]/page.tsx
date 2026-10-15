import { notFound } from "next/navigation";
import type { Metadata, Viewport } from "next";
import { prisma } from "@/lib/prisma";
import { employeeLogout } from "@/actions/time-tracking";
import { getCurrentEmployee, shortName } from "@/lib/employee-session";
import { formatTime } from "@/lib/time-entry";
import { ScanShell } from "@/components/scan/scan-shell";
import { PinLogin } from "@/components/scan/pin-login";
import { EndShift, StartShift } from "@/components/scan/shift-controls";

export const dynamic = "force-dynamic";

export const viewport: Viewport = { themeColor: "#141414" };
export const metadata: Metadata = {
  title: "Lucid* – Shift",
  robots: { index: false, follow: false },
};

export default async function ScanPage(props: {
  params: Promise<{ qrToken: string }>;
}) {
  const { qrToken } = await props.params;
  const property = await prisma.property.findUnique({ where: { qrToken } });
  if (!property || !property.isActive) notFound();

  const here = `/scan/${qrToken}`;
  const employee = await getCurrentEmployee();

  if (!employee) {
    const employees = await prisma.employee.findMany({
      where: { isActive: true, pinHash: { not: null } },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    });
    return (
      <ScanShell title={property.name} subtitle="Sign in to start your shift">
        <PinLogin
          redirectTo={here}
          employees={employees.map((e) => ({ id: e.id, name: shortName(e) }))}
        />
      </ScanShell>
    );
  }

  const openEntries = await prisma.timeEntry.findMany({
    where: { employeeId: employee.id, status: "OPEN" },
    orderBy: { startedAt: "desc" },
  });
  const running = openEntries.find((e) => e.propertyId === property.id);
  const logout = employeeLogout.bind(null, here);

  return (
    <ScanShell
      title={property.name}
      subtitle={[property.address, property.city].filter(Boolean).join(", ")}
    >
      <div className="mb-6 flex items-center justify-between font-sans text-sm font-light">
        <span>Signed in as {employee.firstName}</span>
        <form action={logout}>
          <button type="submit" className="text-grey underline underline-offset-4">
            Not you
          </button>
        </form>
      </div>

      {running ? (
        <div className="space-y-6">
          <div className="rounded-lg border border-gold/40 bg-white p-5">
            <p className="font-sans text-[11px] uppercase tracking-[3px] text-grey">
              Shift running
            </p>
            <p className="mt-1 font-serif text-3xl font-light">
              Since {formatTime(running.startedAt)}
            </p>
          </div>
          <EndShift entryId={running.id} />
        </div>
      ) : (
        <StartShift qrToken={qrToken} hasOtherOpenShift={openEntries.length > 0} />
      )}
    </ScanShell>
  );
}
