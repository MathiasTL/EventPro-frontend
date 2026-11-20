"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";

export function useReveal<T extends HTMLElement>(): RefObject<T> {
  const ref = useRef<T>(null!);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches || !window.IntersectionObserver) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        element.dataset.revealed = "true";
        observer.disconnect();
      },
      { threshold: 0.15 },
    );

    observer.observe(element);
    element.dataset.reveal = "true";

    return () => {
      observer.disconnect();
      delete element.dataset.reveal;
      delete element.dataset.revealed;
    };
  }, []);

  return ref;
}
