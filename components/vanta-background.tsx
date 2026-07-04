"use client";

import { useCallback, useEffect, useRef } from "react";

declare global {
  interface Window {
    THREE: unknown;
    VANTA: {
      NET: (opts: Record<string, unknown>) => { destroy: () => void };
    };
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

function getVantaParams(isMobile: boolean) {
  if (isMobile) {
    return { points: 5, maxDistance: 14, spacing: 28 };
  }
  return { points: 10, maxDistance: 22, spacing: 18 };
}

export function VantaBackground() {
  const elRef = useRef<HTMLDivElement>(null);
  const effectRef = useRef<{ destroy: () => void } | null>(null);
  const scriptsLoaded = useRef(false);

  const spawnEffect = useCallback(() => {
    if (!elRef.current || !window.VANTA) return;
    effectRef.current?.destroy();
    effectRef.current = null;
    const { points, maxDistance, spacing } = getVantaParams(window.innerWidth < 768);
    effectRef.current = window.VANTA.NET({
      el: elRef.current,
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200,
      minWidth: 200,
      scale: 1.0,
      scaleMobile: 1.0,
      color: 0x5c5fe8,
      backgroundColor: 0x0c0e18,
      points,
      maxDistance,
      spacing,
      showDots: true,
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!scriptsLoaded.current) {
        await loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"
        );
        await loadScript(
          "https://cdn.jsdelivr.net/npm/vanta@0.5.24/dist/vanta.net.min.js"
        );
        scriptsLoaded.current = true;
      }
      if (cancelled) return;
      spawnEffect();
    }

    init();

    // 横竖屏切换时重建
    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (!cancelled) spawnEffect();
      }, 300);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      effectRef.current?.destroy();
      effectRef.current = null;
    };
  }, [spawnEffect]);

  return (
    <div
      ref={elRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
