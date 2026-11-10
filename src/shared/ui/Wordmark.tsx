/**
 * EventPro logo lockup. Every surface that shows the brand imports it from here.
 * - `tone="dark"` (ink rail): transparent ticket-E mark plus live text, because the lockup's navy "Event"
 *   disappears on ink.
 * - `tone="light"` (light backgrounds such as login or landing): the transparent lockup. Light backgrounds only.
 * Source artwork and usage notes live in `public/brand/`.
 */
const MARK_SIZE = 36;
// Transparent lockup is 1086x344.
const LOGO_HEIGHT = 40;
const LOGO_WIDTH = Math.round((LOGO_HEIGHT * 1086) / 344);

export function Wordmark({ tone = "dark", className = "" }: { tone?: "dark" | "light"; className?: string }) {
  if (tone === "light") {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- static brand artwork, no optimization needed.
      <img src="/brand/eventpro-logo-transparent.png" alt="EventPro" width={LOGO_WIDTH} height={LOGO_HEIGHT} className={`block h-10 w-auto ${className}`} />
    );
  }

  return (
    <span className={`flex items-center gap-1.5 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- static brand artwork, no optimization needed. */}
      <img src="/brand/eventpro-mark.png" alt="" width={MARK_SIZE} height={MARK_SIZE} className="block h-9 w-9 shrink-0" />
      <span className="text-[1.375rem] font-extrabold italic leading-none tracking-tight">
        <span className="text-ep-pass">Event</span>
        <span className="text-ep-magenta-bright">Pro</span>
      </span>
      <span className="sr-only">EventPro</span>
    </span>
  );
}
