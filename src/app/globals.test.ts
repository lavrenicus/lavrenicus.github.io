import { readFileSync } from "node:fs";
import { expect, test } from "vitest";

const css = readFileSync("src/app/globals.css", "utf8");

test("renders opaque glass with blur and highlights", () => {
  expect(css).toMatch(/\.glass-shell[\s\S]*rgb\(8 11 18 \/ 0\.88\)[\s\S]*-webkit-backdrop-filter: blur\(22px\)/);
  expect(css).toContain(".glass-shell::before,\n.glass-card::before");
  expect(css).toContain("rgb(255 255 255 / 0.8)");
});

test("scales section typography from mobile", () => {
  expect(css).toContain("padding: clamp(1rem, 3vw, 2.5rem)");
  expect(css).toContain("font-size: clamp(1.8rem, 9vw, 4.25rem)");
});
