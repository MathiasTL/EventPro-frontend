import type { AnchorHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

import { VARIANT_STYLES, type ActionVariant } from "./button";

interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: ActionVariant;
  disabled?: boolean;
  children: ReactNode;
}

const BASE_STYLES =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

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
        className={`${styles} cursor-not-allowed opacity-70`}
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
