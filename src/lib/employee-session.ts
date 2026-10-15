import { cookies } from "next/headers";
import {
  createHmac,
  randomBytes,
  scrypt as scryptCb,
  timingSafeEqual,
} from "crypto";
import { promisify } from "util";
import { prisma } from "@/lib/prisma";

const scrypt = promisify(scryptCb) as (
  password: string,
  salt: Buffer,
  keylen: number
) => Promise<Buffer>;

export const EMPLOYEE_COOKIE = "lucid_emp";
export const EMPLOYEE_SESSION_DAYS = 90;
export const MAX_PIN_ATTEMPTS = 5;
export const PIN_LOCK_MINUTES = 15;

export const PIN_PATTERN = /^\d{4,6}$/;

/** PIN -> "salt:hash" (scrypt, kein Klartext in der Datenbank). */
export async function hashPin(pin: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(pin, salt, 32);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

export async function verifyPin(pin: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = await scrypt(pin, Buffer.from(saltHex, "hex"), expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function secret(): string {
  const s = process.env.CRM_AUTH_SECRET;
  if (!s) throw new Error("CRM_AUTH_SECRET ist nicht gesetzt");
  return s;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

type SessionPayload = { e: string; v: number; x: number };

/** Signierter Cookie-Wert: Mitarbeiter-ID + PIN-Version + Ablaufzeit. */
export function createSessionValue(employeeId: string, pinVersion: number): string {
  const payload: SessionPayload = {
    e: employeeId,
    v: pinVersion,
    x: Date.now() + EMPLOYEE_SESSION_DAYS * 24 * 60 * 60 * 1000,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

function readSessionValue(value: string | undefined): SessionPayload | null {
  if (!value) return null;
  const [body, sig] = value.split(".");
  if (!body || !sig) return null;
  const expected = sign(body);
  if (
    sig.length !== expected.length ||
    !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  ) {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as SessionPayload;
    if (typeof payload.e !== "string" || typeof payload.x !== "number") return null;
    if (payload.x < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Der eingeloggte Mitarbeiter oder null. Prüft bei jedem Aufruf gegen die
 * Datenbank: deaktivierte Mitarbeiter und geänderte PINs sind sofort ausgeloggt.
 */
export async function getCurrentEmployee() {
  const payload = readSessionValue((await cookies()).get(EMPLOYEE_COOKIE)?.value);
  if (!payload) return null;
  const employee = await prisma.employee.findUnique({ where: { id: payload.e } });
  if (!employee || !employee.isActive || !employee.pinHash) return null;
  if (employee.pinVersion !== payload.v) return null;
  return employee;
}

export type CurrentEmployee = NonNullable<Awaited<ReturnType<typeof getCurrentEmployee>>>;

export async function setEmployeeCookie(employeeId: string, pinVersion: number) {
  (await cookies()).set(EMPLOYEE_COOKIE, createSessionValue(employeeId, pinVersion), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: EMPLOYEE_SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function clearEmployeeCookie() {
  (await cookies()).delete(EMPLOYEE_COOKIE);
}

/** Anzeigename ohne vollen Nachnamen ("Anna M.") für die öffentliche Auswahlliste. */
export function shortName(e: { firstName: string; lastName: string }): string {
  const initial = e.lastName.trim().charAt(0);
  return initial ? `${e.firstName} ${initial.toUpperCase()}.` : e.firstName;
}
