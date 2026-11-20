export type FlowStep = {
  id: "chat" | "quote" | "payment" | "contract" | "schedule";
  title: string;
  caption: string;
};

export const FLOW_STEPS = [
  {
    id: "chat",
    title: "El mensaje",
    caption: "El cliente escribe por WhatsApp. El bot muestra el paquete Combo Full Fiesta (Hora Loca + DJ) y reúne los datos del evento.",
  },
  {
    id: "quote",
    title: "La cotización",
    caption: "Servicios y movilidad se calculan con reglas definidas. Google Maps aporta distancia y tiempo; EventPro prepara el total y el adelanto.",
  },
  {
    id: "payment",
    title: "La validación",
    caption: "El cliente envía el comprobante de Yape o Plin. El encargado revisa y valida el adelanto antes de continuar.",
  },
  {
    id: "contract",
    title: "La firma",
    caption: "El contrato PDF llega al celular. El cliente lo revisa y firma con un código OTP; el documento queda asociado al evento.",
  },
  {
    id: "schedule",
    title: "La operación",
    caption: "El evento llega al Cronograma y el adelanto queda registrado para la vista financiera del encargado.",
  },
] as const satisfies readonly FlowStep[];
