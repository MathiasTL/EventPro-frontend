/**
 * EventPro logo lockup (credential E mark + EVENTPRO wordmark). Every surface that shows the brand imports it
 * from here. `tone="dark"` is for the ink rail; `tone="light"` for pass-white backgrounds.
 * The source SVGs and their construction notes live in `public/brand/`.
 */
const SOURCES = {
  dark: "/brand/logo-wordmark-dark.svg",
  light: "/brand/logo-wordmark-light.svg",
} as const;

// Lockup viewBox is 268x56; 36px tall keeps it above the 168px minimum width.
const HEIGHT = 36;
const WIDTH = Math.round((268 / 56) * HEIGHT);

export function Wordmark({ tone = "dark", className = "" }: { tone?: keyof typeof SOURCES; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- a static SVG needs no image optimization.
    <img src={SOURCES[tone]} alt="EventPro" width={WIDTH} height={HEIGHT} className={`block h-9 w-auto ${className}`} />
  );
}
