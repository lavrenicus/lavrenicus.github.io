import { expect, test, vi } from "vitest";
import { compileShader, createProgram, disposeProgram, resizeCanvas } from "./webgl";

function makeGl({ compile = true, link = true } = {}) {
  return {
    VERTEX_SHADER: 1,
    FRAGMENT_SHADER: 2,
    COMPILE_STATUS: 3,
    LINK_STATUS: 4,
    createShader: vi.fn(() => ({})),
    shaderSource: vi.fn(),
    compileShader: vi.fn(),
    getShaderParameter: vi.fn(() => compile),
    getShaderInfoLog: vi.fn(() => "compile error"),
    deleteShader: vi.fn(),
    createProgram: vi.fn(() => ({})),
    attachShader: vi.fn(),
    linkProgram: vi.fn(),
    getProgramParameter: vi.fn(() => link),
    getProgramInfoLog: vi.fn(() => "link error"),
    deleteProgram: vi.fn(),
  } as unknown as WebGL2RenderingContext;
}

test("reports shader compilation errors and releases the shader", () => {
  const gl = makeGl({ compile: false });
  expect(() => compileShader(gl, gl.VERTEX_SHADER, "bad")).toThrow("compile error");
  expect(gl.deleteShader).toHaveBeenCalledOnce();
});

test("links a program and releases intermediate shaders", () => {
  const gl = makeGl();
  const program = createProgram(gl, "vertex", "fragment");
  expect(program).toBeTruthy();
  expect(gl.attachShader).toHaveBeenCalledTimes(2);
  expect(gl.deleteShader).toHaveBeenCalledTimes(2);
});

test("caps DPR while resizing the canvas", () => {
  const canvas = document.createElement("canvas");
  Object.defineProperties(canvas, {
    clientWidth: { value: 200 },
    clientHeight: { value: 100 },
  });
  canvas.width = 0;
  canvas.height = 0;
  expect(resizeCanvas(canvas, 3)).toBe(true);
  expect([canvas.width, canvas.height]).toEqual([300, 150]);
  expect(resizeCanvas(canvas, 3)).toBe(false);
});

test("disposes the linked program", () => {
  const gl = makeGl();
  const program = {} as WebGLProgram;
  disposeProgram(gl, program);
  expect(gl.deleteProgram).toHaveBeenCalledWith(program);
});
