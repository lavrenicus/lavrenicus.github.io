"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { RUNNER_THEMES } from "@/data/runnerThemes";

/**
 * Background self-running runner (todo §4.2 option Б).
 *
 * The engine itself is the READY, owner-approved preview —
 * public/runner3d-preview.html — embedded as a same-origin iframe
 * (owner order 2026-09-25: use the ready-made file, no re-implementation).
 * The page drives it over a minimal postMessage protocol:
 *
 *   frame → site:  { src: "runner3d", type: "ready", theme }   — engine up,
 *                  parent replies with its current section (sync)
 *   frame → site:  { src: "runner3d", type: "error", message } — surfaced
 *                  through onError (footer status) — no silent failures
 *   site → frame:  { src: "site", type: "theme", key }         — location
 *                  switch (two-set wipe inside the frame)
 *
 * Contract kept from the engine era (Shell depends on it):
 *  - themeKey: section → location; unknown key = explicit onError, the
 *    frame is never told an invalid key (validation at both ends);
 *  - enabled: localStorage toggle — no frame when off;
 *  - startDelayMs: the heavy frame (three.js + FBX model) mounts only
 *    after the grace period — keeps the critical rendering path clean (LCP);
 *  - onError: every frame-side failure reaches the visible status.
 */
export type RunnerBackgroundProps = {
  themeKey: string;
  enabled?: boolean;
  /** Grace period before the frame mounts (ms). 0 = immediate (tests). */
  startDelayMs?: number;
  onError?: (message: string) => void;
};

const START_DELAY_MS = 2600;
const FRAME_SRC = "/runner3d-preview.html?embed=1";

type InboundMessage = {
  src?: string;
  type?: string;
  message?: string;
  theme?: string;
};

export default function RunnerBackground({
  themeKey,
  enabled = true,
  startDelayMs = START_DELAY_MS,
  onError,
}: RunnerBackgroundProps) {
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const themeRef = useRef(themeKey);
  const onErrorRef = useRef(onError);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  // Grace period before mounting the heavy frame (three.js + 25 MB FBX).
  // Disabling unmounts via the render condition — no state write here.
  useEffect(() => {
    if (!enabled) return;
    const handle = window.setTimeout(() => setMounted(true), startDelayMs);
    return () => window.clearTimeout(handle);
  }, [enabled, startDelayMs]);

  const sendTheme = useCallback((key: string) => {
    frameRef.current?.contentWindow?.postMessage(
      { src: "site", type: "theme", key },
      window.location.origin,
    );
  }, []);

  // Protocol: frame ready → sync its location to the page; frame error →
  // visible status. Same-origin and shape checked — everything else ignored.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data as InboundMessage | null;
      if (!data || data.src !== "runner3d") return;
      if (data.type === "ready") sendTheme(themeRef.current);
      else if (data.type === "error") {
        onErrorRef.current?.(data.message ?? "runner background reported an error");
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [sendTheme]);

  // section → location; an unknown key is an explicit error, not a switch
  useEffect(() => {
    themeRef.current = themeKey;
    if (!enabled) return;
    if (!(themeKey in RUNNER_THEMES)) {
      onErrorRef.current?.(`unknown runner theme "${themeKey}" — theme unchanged`);
      return;
    }
    sendTheme(themeKey);
  }, [themeKey, enabled, sendTheme]);

  return (
    <div className="runner-backdrop" data-testid="runner-backdrop" aria-hidden="true">
      {enabled && mounted && (
        <iframe
          ref={frameRef}
          data-testid="runner-frame"
          title="background runner"
          src={FRAME_SRC}
          tabIndex={-1}
        />
      )}
    </div>
  );
}
