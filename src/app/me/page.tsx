import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { employeeLogout } from "@/actions/time-tracking";
import { getCurrentEmployee, shortName } from "@/lib/employee-session";
import {
  berlinMonthStart,
  formatDate,
  formatDuration,
  formatTime,
  minutesBetween,
} from "@/lib/time-entry";
import { ScanShell } from "@/components/scan/scan-shell";
import { PinLogin } from "@/components/scan/pin-login";

export const dynamic = "force-dynamic";

export const viewport: Viewport = { themeColor: "#141414" };
export const metadata: Metadata = {
  title: "Lucid* – My hours",
  robots: { index: false, follow: false },
};

function parseMonth(value: string | undefined) {
  const m = /^(\d{4})-(\d{2})$/.exec(value ?? "");
  const now = new Date();
  const year = m ? Number(m[1]) : now.getFullYear();
  const month = m ? Number(m[2]) : now.getMonth() + 1;
  return { year, month: Math.min(12, Math.max(1, month)) };
}

function monthKey(year: number, month: number) {
  const d = new Date(year, month - 1, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default async function MePage(props: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month: monthParam } = await props.searchParams;
  const employee = await getCurrentEmployee();

  if (!employee) {
    const employees = await prisma.employee.findMany({
      where: { isActive: true, pinHash: { not: null } },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    });
    return (
      <ScanShell title="My hours" subtitle="Sign in to see your times">
        <PinLogin
          redirectTo="/me"
          employees={employees.map((e) => ({ id: e.id, name: shortName(e) }))}
        />
      </ScanShell>
    );
  }

  const { year, month } = parseMonth(monthParam);
  const from = berlinMonthStart(year, month);
  const to = berlinMonthStart(year, month + 1);

  const entries = await prisma.timeEntry.findMany({
    where: { employeeId: employee.id, startedAt: { gte: from, lt: to } },
    include: { property: { select: { name: true } } },
    orderBy: { startedAt: "desc" },
  });

  const totalMinutes = entries.reduce(
    (sum, e) => sum + (e.endedAt ? minutesBetween(e.startedAt, e.endedAt) : 0),
    0
  );
  const label = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(
    new Date(year, month - 1, 1)
  );
  const logout = employeeLogout.bind(null, "/me");

  return (
    <ScanShell title="My hours" subtitle={`${employee.firstName} ${employee.lastName}`}>
      <div className="mb-5 flex items-center justify-between font-sans text-sm">
        <Link href={`/me?month=${monthKey(year, month - 1)}`} className="py-2 pr-4 text-gold-dark">
          Previous
        </Link>
        <span className="font-light">{label}</span>
        <Link href={`/me?month=${monthKey(year, month + 1)}`} className="py-2 pl-4 text-gold-dark">
          Next
        </Link>
      </div>

      <div className="mb-5 rounded-lg border border-gold/40 bg-white p-5">
        <p className="font-sans text-[11px] uppercase tracking-[3px] text-grey">Total</p>
        <p className="mt-1 font-serif text-3xl font-light">{formatDuration(totalMinutes)}</p>
      </div>

      {entries.length === 0 ? (
        <p className="font-sans text-base font-light text-grey">No shifts in this month.</p>
      ) : (
        <ul className="space-y-2">
          {entries.map((e) => (
            <li key={e.id} className="rounded-lg border border-black/10 bg-white p-4">
              <div className="flex items-baseline justify-between">
                <span className="font-sans text-base">{e.property.name}</span>
                <span className="font-sans text-sm font-light text-grey">
                  {formatDate(e.startedAt)}
                </span>
              </div>
              <div className="mt-1 flex items-baseline justify-between font-sans text-sm font-light">
                <span>
                  {formatTime(e.startedAt)} – {e.endedAt ? formatTime(e.endedAt) : "running"}
                </span>
                <span>{e.endedAt ? formatDuration(minutesBetween(e.startedAt, e.endedAt)) : ""}</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form action={logout} className="mt-8 text-center">
        <button type="submit" className="font-sans text-sm text-grey underline underline-offset-4">
          Sign out
        </button>
      </form>
    </ScanShell>
  );
}
