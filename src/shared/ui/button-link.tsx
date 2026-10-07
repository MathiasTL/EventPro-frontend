import type { AnchorHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

type LinkVariant = "primary" | "ghost" | "whatsapp" | "inverse";

interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: LinkVariant;
  disabled?: boolean;
  children: ReactNode;
}

// Mismas proporciones y estados que `Button` de shared/ui, para que los CTA de
// la landing y los botones del panel se vean como una sola familia.
const BASE_STYLES =
  "inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

const VARIANT_STYLES: Record<LinkVariant, string> = {
  primary: "bg-violet-700 text-white hover:bg-violet-800",
  ghost: "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50",
  whatsapp: "bg-whatsapp text-whatsapp-ink hover:brightness-95",
  inverse: "bg-white text-violet-800 hover:bg-violet-50",
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
