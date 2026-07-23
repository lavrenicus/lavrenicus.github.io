"use client";

import { useEffect, useRef } from "react";
import { createProgram, disposeProgram, resizeCanvas } from "@/lib/webgl";

const VERTEX = `#version 300 es
void main() {
  vec2 positions[3] = vec2[3](
    vec2(-1.0, -1.0),
    vec2(3.0, -1.0),
    vec2(-1.0, 3.0)
  );
  gl_Position = vec4(positions[gl_VertexID], 0.0, 1.0);
}`;

const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_intensity;
uniform float u_pulse;
out vec4 color;

mat2 rotate(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution) / min(u_resolution.x, u_resolution.y);
  float aspect = u_resolution.x / u_resolution.y;
  uv.x -= mix(0.3, 1.35, smoothstep(0.8, 1.35, aspect));
  vec3 origin = vec3(0.0, 0.0, 3.0);
  vec3 ray = normalize(vec3(uv, -1.65));
  float radius = 1.24;
  float b = dot(origin, ray);
  float hit = b * b - dot(origin, origin) + radius * radius;
  if (hit < 0.0) { color = vec4(0.0); return; }

  vec3 normal = (origin + ray * (-b - sqrt(hit))) / radius;
  normal.xz *= rotate(u_time * 0.12);
  normal.yz *= rotate(sin(u_time * 0.08) * 0.22);
  float longitude = atan(normal.z, normal.x);
  float latitude = asin(normal.y);
  float meridians = abs(sin(longitude * 12.0));
  float parallels = abs(sin(latitude * 12.0));
  float grid = min(meridians, parallels);

  float spike = hash(vec2(longitude * 46.0, latitude * 46.0) + u_time * 4.0);
  spike = pow(spike, 3.0);
  grid -= spike * u_pulse * 0.55;

  float line = 1.0 - smoothstep(0.0, fwidth(grid) * 2.6, grid);
  float fresnel = pow(1.0 - max(dot(normal, -ray), 0.0), 1.7);
  float alpha = line * (0.32 + fresnel * 0.68) * u_intensity;
  alpha = clamp(alpha + spike * u_pulse * 0.4 * line, 0.0, 1.0);

  vec3 baseColor = vec3(0.0, 0.50, 1.0);
  vec3 pulseColor = vec3(0.25, 1.0, 0.5);
  vec3 finalColor = mix(baseColor, pulseColor, u_pulse);

  color = vec4(finalColor, alpha);
}`;

export default function GridOverlay({
  dimmed = false,
  pulseSignal = 0,
}: {
  dimmed?: boolean;
  pulseSignal?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const pulseStart = useRef<number | null>(null);
  const isFirstPulse = useRef(true);

  useEffect(() => {
    if (isFirstPulse.current) {
      isFirstPulse.current = false;
      return;
    }
    pulseStart.current = performance.now();
  }, [pulseSignal]);

  useEffect(() => {
    const canvas = ref.current;
    const gl = canvas?.getContext("webgl2", { alpha: true, antialias: false });
    if (!canvas || !gl) return;

    let frame = 0;
    let program: WebGLProgram;
    try {
      program = createProgram(gl, VERTEX, FRAGMENT);
    } catch (error) {
      console.error("Wireframe shader failed", error);
      return;
    }

    const resolution = gl.getUniformLocation(program, "u_resolution");
    const time = gl.getUniformLocation(program, "u_time");
    const intensity = gl.getUniformLocation(program, "u_intensity");
    const pulseLoc = gl.getUniformLocation(program, "u_pulse");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const started = performance.now();
    let lastDraw = 0;
    const PULSE_DURATION = 520;

    const draw = (now: number) => {
      resizeCanvas(canvas);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.uniform2f(resolution, canvas.width, canvas.height);
      gl.uniform1f(time, reduced ? 0 : (now - started) / 1000);
      gl.uniform1f(intensity, dimmed ? 0.58 : 0.92);

      let pulse = 0;
      if (pulseStart.current !== null && !reduced) {
        const elapsed = now - pulseStart.current;
        pulse = Math.max(0, 1 - elapsed / PULSE_DURATION);
        if (pulse <= 0) pulseStart.current = null;
      }
      gl.uniform1f(pulseLoc, pulse);

      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const tick = (now: number) => {
      const active = !dimmed || pulseStart.current !== null;
      if (active || now - lastDraw >= 33) {
        draw(now);
        lastDraw = now;
      }
      frame = requestAnimationFrame(tick);
    };
    const visibility = () => {
      cancelAnimationFrame(frame);
      if (!document.hidden && !reduced) frame = requestAnimationFrame(tick);
    };
    const resize = () => draw(performance.now());
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    document.addEventListener("visibilitychange", visibility);
    if (reduced) draw(started);
    else frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      disposeProgram(gl, program);
    };
  }, [dimmed]);

  return <canvas ref={ref} className="wireframe-backdrop" aria-hidden="true" />;
}
