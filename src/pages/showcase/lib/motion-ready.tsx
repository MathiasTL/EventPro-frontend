"use client";

import { useEffect } from "react";

export function MotionReady() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".showcase");
    if (!root) return;

    root.dataset.motion = "ready";
    return () => {
      delete root.dataset.motion;
    };
  }, []);

  return null;
}
