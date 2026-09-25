import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(cleanup);

Object.defineProperty(window, "requestIdleCallback", {
  writable: true,
  // Idle is always immediately available in jsdom — the deadline timeout is
  // not simulated (tests must not wait for it).
  value: (callback: (deadline: IdleDeadline) => void) =>
    window.setTimeout(
      () => callback({ timeRemaining: () => 50, didTimeout: false } as IdleDeadline),
      0,
    ),
});
Object.defineProperty(window, "cancelIdleCallback", {
  writable: true,
  value: (handle: number) => window.clearTimeout(handle),
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
});

class ResizeObserverMock {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

vi.stubGlobal("ResizeObserver", ResizeObserverMock);
vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) =>
  window.setTimeout(() => callback(performance.now()), 0));
vi.stubGlobal("cancelAnimationFrame", (id: number) => clearTimeout(id));
