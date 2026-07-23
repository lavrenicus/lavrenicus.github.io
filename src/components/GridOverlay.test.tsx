import { afterEach, expect, test, vi } from "vitest";
import { render } from "@testing-library/react";
import GridOverlay from "./GridOverlay";
import { createProgram, disposeProgram } from "@/lib/webgl";

vi.mock("@/lib/webgl", () => ({
  createProgram: vi.fn(() => ({})),
  disposeProgram: vi.fn(),
  resizeCanvas: vi.fn(),
}));

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

test("renders one static frame and disposes WebGL resources for reduced motion", () => {
  vi.mocked(window.matchMedia).mockReturnValue({
    matches: true,
  } as MediaQueryList);
  const gl = {
    COLOR_BUFFER_BIT: 1,
    TRIANGLES: 4,
    viewport: vi.fn(),
    clear: vi.fn(),
    useProgram: vi.fn(),
    getUniformLocation: vi.fn(() => ({})),
    uniform2f: vi.fn(),
    uniform1f: vi.fn(),
    drawArrays: vi.fn(),
  } as unknown as WebGL2RenderingContext;
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(gl);

  const { unmount } = render(<GridOverlay />);
  expect(createProgram).toHaveBeenCalledWith(
    gl,
    expect.stringContaining("vec2[3]"),
    expect.stringContaining("mix(0.18, 0.85"),
  );
  expect(gl.drawArrays).toHaveBeenCalledOnce();
  unmount();

  expect(disposeProgram).toHaveBeenCalledOnce();
});

test("keeps a canvas fallback when WebGL2 is unavailable", () => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  const { container } = render(<GridOverlay />);
  expect(container.querySelector("canvas")).toHaveClass("wireframe-backdrop");
  expect(createProgram).not.toHaveBeenCalled();
});

test("throttles the backdrop while a game is active", () => {
  vi.mocked(window.matchMedia).mockReturnValue({ matches: false } as MediaQueryList);
  const callbacks: FrameRequestCallback[] = [];
  vi.stubGlobal("requestAnimationFrame", vi.fn((callback: FrameRequestCallback) => {
    callbacks.push(callback);
    return callbacks.length;
  }));
  const gl = {
    COLOR_BUFFER_BIT: 1,
    TRIANGLES: 4,
    viewport: vi.fn(),
    clear: vi.fn(),
    useProgram: vi.fn(),
    getUniformLocation: vi.fn(() => ({})),
    uniform2f: vi.fn(),
    uniform1f: vi.fn(),
    drawArrays: vi.fn(),
  } as unknown as WebGL2RenderingContext;
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(gl);

  const { unmount } = render(<GridOverlay dimmed />);
  callbacks[0](10);
  expect(gl.drawArrays).not.toHaveBeenCalled();
  callbacks[1](34);
  expect(gl.drawArrays).toHaveBeenCalledOnce();
  unmount();
});
