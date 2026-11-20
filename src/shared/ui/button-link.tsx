import type { AnchorHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

type LinkVariant = "primary" | "ghost" | "whatsapp" | "inverse" | "gradient" | "ghost-inverse";

interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: LinkVariant;
  disabled?: boolean;
  children: ReactNode;
}

const BASE_STYLES =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-base font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ep-magenta";

const VARIANT_STYLES: Record<LinkVariant, string> = {
  primary: "bg-ep-magenta text-ep-pass hover:bg-ep-violet",
  ghost: "border border-ep-line-strong bg-ep-pass text-ep-ink hover:bg-ep-wash",
  whatsapp: "bg-ep-whatsapp text-ep-whatsapp-ink hover:brightness-95",
  inverse: "bg-ep-pass text-ep-ink hover:bg-ep-wash",
  gradient: "bg-[image:var(--ep-brand-gradient)] text-ep-pass hover:brightness-110",
  "ghost-inverse": "border border-ep-rail-text bg-transparent text-ep-pass hover:bg-ep-ink-2",
};

export function ButtonLink({
  variant = "primary",
  disabled = false,
  className,
  children,
  href,
  ...rest
}: ButtonLinkProps) {
  const styles = `${BASE_STYLES} ${VARIANT_STYLES[variant]} ${className ?? ""}`;

  if (disabled || !href) {
    return (
      <span
        aria-disabled="true"
        className={`${styles} cursor-not-allowed opacity-60`}
      >
        {children}
      </span>
    );
  }

  return (
    <Link href={href} className={styles} {...rest}>
      {children}
    </Link>
  );
}
