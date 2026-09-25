import { describe, expect, test, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import RunnerBackground from "./RunnerBackground";

const frame = () => screen.getByTestId("runner-frame") as HTMLIFrameElement;

const frameMessage = (origin: string, data: unknown) =>
  new MessageEvent("message", { origin, data: data as Record<string, unknown> });

describe("RunnerBackground", () => {
  test("mounts the ready preview frame after the delay", async () => {
    render(<RunnerBackground themeKey="home" startDelayMs={0} />);
    await waitFor(() => expect(frame()).toBeInTheDocument());
    expect(frame().getAttribute("src")).toBe("/runner3d-preview.html?embed=1");
    expect(frame().getAttribute("tabindex")).toBe("-1"); // not in the tab order
  });

  test("enabled=false renders no frame", () => {
    render(<RunnerBackground themeKey="home" enabled={false} startDelayMs={0} />);
    expect(screen.queryByTestId("runner-frame")).toBeNull();
  });

  test("the frame waits out startDelayMs (critical path stays clean)", () => {
    render(<RunnerBackground themeKey="home" startDelayMs={60_000} />);
    expect(screen.queryByTestId("runner-frame")).toBeNull();
  });

  test("frame ready → the current section is posted to the frame", async () => {
    render(<RunnerBackground themeKey="games" startDelayMs={0} />);
    await waitFor(() => expect(frame()).toBeInTheDocument());
    const post = vi.spyOn(frame().contentWindow!, "postMessage");
    act(() => {
      window.dispatchEvent(
        frameMessage(window.location.origin, {
          src: "runner3d",
          type: "ready",
          theme: "home",
        }),
      );
    });
    expect(post).toHaveBeenCalledWith(
      { src: "site", type: "theme", key: "games" },
      window.location.origin,
    );
  });

  test("frame error → surfaced through onError (visible status)", async () => {
    const onError = vi.fn();
    render(<RunnerBackground themeKey="home" startDelayMs={0} onError={onError} />);
    await waitFor(() => expect(frame()).toBeInTheDocument());
    act(() => {
      window.dispatchEvent(
        frameMessage(window.location.origin, {
          src: "runner3d",
          type: "error",
          message: "Lavr.fbx failed to load — see console",
        }),
      );
    });
    expect(onError).toHaveBeenCalledWith("Lavr.fbx failed to load — see console");
  });

  test("unknown theme → explicit onError, nothing posted to the frame", async () => {
    const onError = vi.fn();
    const { rerender } = render(
      <RunnerBackground themeKey="home" startDelayMs={0} onError={onError} />,
    );
    await waitFor(() => expect(frame()).toBeInTheDocument());
    const post = vi.spyOn(frame().contentWindow!, "postMessage");
    rerender(
      <RunnerBackground themeKey="does-not-exist" startDelayMs={0} onError={onError} />,
    );
    expect(onError).toHaveBeenCalledWith(
      expect.stringContaining('unknown runner theme "does-not-exist"'),
    );
    expect(post).not.toHaveBeenCalled();
  });

  test("foreign-origin and foreign-shape messages are ignored", async () => {
    const onError = vi.fn();
    render(<RunnerBackground themeKey="home" startDelayMs={0} onError={onError} />);
    await waitFor(() => expect(frame()).toBeInTheDocument());
    const post = vi.spyOn(frame().contentWindow!, "postMessage");
    act(() => {
      window.dispatchEvent(
        frameMessage("https://evil.example", {
          src: "runner3d",
          type: "error",
          message: "spoofed",
        }),
      );
      window.dispatchEvent(
        frameMessage(window.location.origin, {
          src: "other-frame",
          type: "error",
          message: "not ours",
        }),
      );
    });
    expect(onError).not.toHaveBeenCalled();
    expect(post).not.toHaveBeenCalled();
  });
});
