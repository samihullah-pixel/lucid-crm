"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE, computeAuthToken } from "@/lib/auth";

export async function login(formData: FormData) {
  const password = String(formData.get("password") ?? "");

  if (password !== process.env.CRM_PASSWORD) {
    redirect("/login?error=1");
  }

  const token = await computeAuthToken(process.env.CRM_AUTH_SECRET || "");
  cookies().set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect("/dashboard");
}

export async function logout() {
  cookies().delete(AUTH_COOKIE);
  redirect("/login");
}
