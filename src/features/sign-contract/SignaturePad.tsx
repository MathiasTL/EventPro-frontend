"use client";

import { useRef, type PointerEvent } from "react";

import { Button } from "@/shared/ui";

type Props = {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  disabled: boolean;
  hasInk: boolean;
  onInkChange: (value: boolean) => void;
};

function point(event: PointerEvent<HTMLCanvasElement>) {
  const canvas = event.currentTarget;
  const bounds = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - bounds.left) * canvas.width / bounds.width,
    y: (event.clientY - bounds.top) * canvas.height / bounds.height,
  };
}

export function SignaturePad({ canvasRef, disabled, hasInk, onInkChange }: Props) {
  const activePointer = useRef<number | null>(null);
  const previous = useRef<{ x: number; y: number } | null>(null);

  function draw(event: PointerEvent<HTMLCanvasElement>) {
    if (disabled || activePointer.current !== event.pointerId) return;
    const context = event.currentTarget.getContext("2d");
    if (!context) return;
    const next = point(event);
    context.strokeStyle = "#151b32";
    context.fillStyle = context.strokeStyle;
    context.lineWidth = 5;
    context.lineCap = "round";
    context.beginPath();
    if (previous.current) {
      context.moveTo(previous.current.x, previous.current.y);
      context.lineTo(next.x, next.y);
      context.stroke();
    } else {
      context.arc(next.x, next.y, context.lineWidth / 2, 0, Math.PI * 2);
      context.fill();
      onInkChange(true);
    }
    previous.current = next;
  }

  function start(event: PointerEvent<HTMLCanvasElement>) {
    if (disabled || activePointer.current !== null || event.button !== 0) return;
    activePointer.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    draw(event);
  }

  function end(event: PointerEvent<HTMLCanvasElement>) {
    if (activePointer.current !== event.pointerId) return;
    activePointer.current = null;
    previous.current = null;
  }

  function clear() {
    const canvas = canvasRef.current;
    canvas?.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
    onInkChange(false);
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-ep-ink">Dibuja tu firma con el dedo o el ratón</p>
        <Button type="button" variant="ghost" onClick={clear} disabled={disabled || !hasInk}>
          Limpiar firma
        </Button>
      </div>
      <canvas
        ref={canvasRef}
        width={800}
        height={320}
        aria-label="Área para dibujar la firma"
        className="block h-auto w-full touch-none rounded-lg border border-dashed border-ep-line-strong bg-white"
        onPointerDown={start}
        onPointerMove={draw}
        onPointerUp={end}
        onPointerCancel={end}
        onLostPointerCapture={end}
      />
    </div>
  );
}
