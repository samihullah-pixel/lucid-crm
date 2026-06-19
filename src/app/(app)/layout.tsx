import { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { IntroSplash } from "@/components/intro-splash";

export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <IntroSplash />
      <AppShell>{children}</AppShell>
    </>
  );
}
