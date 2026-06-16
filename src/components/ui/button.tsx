import Link from "next/link";
import { ComponentProps } from "react";

const goldClasses =
  "inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold-dark via-gold-light to-gold px-5 py-2 text-[11px] font-sans font-light uppercase tracking-[3px] text-black transition-shadow hover:shadow-[0_6px_24px_rgba(201,169,110,0.35)]";

export function Button({ className = "", ...props }: ComponentProps<"button">) {
  return <button {...props} className={`${goldClasses} ${className}`} />;
}

export function LinkButton({
  href,
  className = "",
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={`${goldClasses} ${className}`}>
      {children}
    </Link>
  );
}
