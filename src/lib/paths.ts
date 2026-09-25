/** Path helpers shared by the shell and navigation components. */

/** "/experience/" → "/experience", "/" → "/", "" → "/" */
export function normalizePath(pathname: string): string {
  const clean = pathname.replace(/\/+$/, "");
  return clean === "" ? "/" : clean;
}

/** "/experience/" → "experience", "/" → "home" */
export function sectionFromPath(pathname: string): string {
  const path = normalizePath(pathname);
  return path === "/" ? "home" : path.slice(1);
}
