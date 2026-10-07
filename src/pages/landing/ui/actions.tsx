import { ButtonLink } from "@/shared/ui";
import { LOGIN_URL, buildWhatsAppUrl } from "@/shared/config";

interface IngresarActionProps {
  variant?: "primary" | "inverse";
  className?: string;
}

export function IngresarAction({
  variant = "primary",
  className,
}: IngresarActionProps) {
  return (
    <ButtonLink href={LOGIN_URL} variant={variant} className={className}>
      Ingresar al panel
    </ButtonLink>
  );
}

export function WhatsAppAction({ className }: { className?: string }) {
  const url = buildWhatsAppUrl();

  // Sin número configurado el CTA queda inerte en vez de apuntar a un enlace roto.
  if (!url) {
    return (
      <ButtonLink variant="whatsapp" disabled className={className}>
        Cotizar por WhatsApp
      </ButtonLink>
    );
  }

  return (
    <ButtonLink
      href={url}
      variant="whatsapp"
      target="_blank"
      rel="noreferrer"
      className={className}
    >
      Cotizar por WhatsApp
    </ButtonLink>
  );
}
