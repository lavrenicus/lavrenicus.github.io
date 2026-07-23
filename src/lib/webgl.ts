export function compileShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Unable to create shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  const message = gl.getShaderInfoLog(shader) || "Shader compilation failed";
  gl.deleteShader(shader);
  throw new Error(message);
}

export function createProgram(gl: WebGL2RenderingContext, vertex: string, fragment: string) {
  const program = gl.createProgram();
  if (!program) throw new Error("Unable to create WebGL program");
  const shaders = [
    compileShader(gl, gl.VERTEX_SHADER, vertex),
    compileShader(gl, gl.FRAGMENT_SHADER, fragment),
  ];
  shaders.forEach((shader) => gl.attachShader(program, shader));
  gl.linkProgram(program);
  shaders.forEach((shader) => gl.deleteShader(shader));
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;
  const message = gl.getProgramInfoLog(program) || "Program linking failed";
  gl.deleteProgram(program);
  throw new Error(message);
}

export function resizeCanvas(canvas: HTMLCanvasElement, dpr = window.devicePixelRatio) {
  const ratio = Math.min(dpr, 2);
  const width = Math.round(canvas.clientWidth * ratio);
  const height = Math.round(canvas.clientHeight * ratio);
  if (canvas.width === width && canvas.height === height) return false;
  canvas.width = width;
  canvas.height = height;
  return true;
}

export function disposeProgram(gl: WebGL2RenderingContext, program: WebGLProgram) {
  gl.deleteProgram(program);
}
