import * as THREE from "three";

/**
 * Procedural sci-fi corridor segment generator.
 * TS port of public/runner/corridor-gen.js (that copy exists solely for the
 * standalone runner3d-preview.html dev page, which loads three via CDN).
 * Keep both files in sync when changing the corridor layout — see
 * runner-generation-pipeline.md.
 *
 * Layered architectural approach:
 * 1. Base Shell (floor + ceiling, textured)
 * 2. Back Wall (the far side of the tube)
 * 3. Archetype Layer (per-location architecture)
 *
 * Archetypes (owner verdict 2026-09-25: "локации одинаковые просто разных
 * цветов — полный отстой"): every theme.key maps to a DISTINCT structural
 * archetype — same shell, different architecture. experience/factory keeps
 * the APPROVED industrial tunnel geometry unchanged. No fallback: an
 * unknown or missing theme.key throws.
 *
 * Floor layer (owner order 2026-09-25: "вещи на полу" — the previous
 * wall-glued density layer was rejected: "не говорил говна на стены
 * понацеплять"): every archetype carries 4-6 objects ON the floor of the
 * back half (z -2.3..-1.55, height <= 0.8, outside the running lane).
 * Grouped into ONE pile per segment (owner plan 2026-09-25: "вещи на полу
 * стоят группами в промежутках между опорами"), not sprinkled.
 * Deterministic (sin-hash, NO Math.random), geometry cache, role tags —
 * the location-switch dissolve arms them.
 *
 * Corridor structure (owner plan 2026-09-25, sanction "Да, план одобрен",
 * modeled after Jetpack Joyride LOCATIONS): addStructure gives every
 * location the readable corridor frame — a dark upper fascia closing the
 * top of the frame with rare lamps, THREE full-segment through-lines
 * (ceiling beam / mid-wall pipe / baseboard + glow), a support arch at
 * every 2nd segment boundary (floor -> ceiling) and a painted road
 * (lane plate + edge lines + center dashes). Every archetype additionally
 * carries ONE big wall object every 4th segment (idx%4==1) INSTEAD of the
 * small wall deco of that segment (plan: "один крупный объект на стену
 * раз в 3–4 сегмента, вместо нынешней мелочи").
 *
 * Foreground (same plan): createForegroundSegment — rare dark silhouettes
 * at z=+3 (the camera side) that pass IN FRONT of the runner; the preview
 * scrolls that layer at 1.3x speed = parallax depth like JJ.
 *
 * Caching (owner order 2026-09-25: "объекты надо закешировать, чтоб они
 * не подгружались долго"): geometry is cached per distinct shape and
 * materials per theme key — a rebuild allocates plain Object3Ds only,
 * nothing is re-uploaded to the GPU and shared resources are never
 * disposed by rebuilds (userData.cached guards).
 *
 * Textures (pipeline stage 3, resumed by owner order 2026-09-24): PNG tiles
 * generated from public/runner/assets/corridor/*.svg by convert_svg_to_png.py
 * (single mechanism: Chrome headless rasterizer). A load failure is logged
 * and surfaced via onError — no substitute textures, no silent drop.
 */
export interface CorridorTheme {
  /** Archetype selector — every location has a distinct structure. */
  key: string;
  floor: number;
  accent: number;
}

export interface CorridorConfig {
  /** Height */
  CH?: number;
  /** Half-width / depth */
  CW?: number;
  /** Segment length */
  SEG?: number;
  /** Texture-load failure surfacing (site wires it to the visible status). */
  onError?: (message: string) => void;
  /** Max anisotropy from the renderer (kills moire shimmer on oblique faces). */
  maxAnisotropy?: number;
}

/** Shared palette materials handed to the archetype builders. */
interface SegmentMats {
  floor: THREE.Material;
  ceil: THREE.Material;
  wall: THREE.Material;
  base: THREE.Material;
  metal: THREE.Material;
  accentDim: THREE.Material;
  accentHot: THREE.Material;
  accentArt: THREE.Material;
}

const TEXTURE_BASE = "/runner/assets/corridor/";

export class CorridorGenerator {
  readonly CH: number;
  readonly CW: number;
  readonly SEG: number;
  private readonly onError?: (message: string) => void;
  private readonly maxAniso: number;
  private readonly loader = new THREE.TextureLoader();
  private readonly floorTex: THREE.Texture;
  private readonly ceilTex: THREE.Texture;
  private readonly wallTex: THREE.Texture;
  // Caches: one geometry per distinct shape, one material set per theme key
  // (owner order 2026-09-25).
  private readonly geoCache = new Map<string, THREE.BufferGeometry>();
  private readonly matCache = new Map<string, SegmentMats>();
  // Foreground silhouette material (createForegroundSegment): FIXED
  // near-black and deliberately WITHOUT a userData.role — the dissolve
  // arms only role-tagged materials, so the shadow frame in front of the
  // runner never morphs when the location changes.
  private readonly silMat: THREE.MeshStandardMaterial;

  constructor(config: CorridorConfig = {}) {
    this.CH = config.CH ?? 4;
    this.CW = config.CW ?? 3;
    this.SEG = config.SEG ?? 2;
    this.onError = config.onError;
    this.maxAniso = config.maxAnisotropy ?? 1;
    this.silMat = new THREE.MeshStandardMaterial({
      color: 0x060608,
      metalness: 0.1,
      roughness: 0.9,
    });
    this.silMat.userData.cached = true;
    // One shared tile per surface type: one tile per world unit of the face.
    this.floorTex = this.loadTile("floor-grate.png", this.SEG, this.CW * 2);
    this.ceilTex = this.loadTile("ceiling-vent.png", this.SEG, this.CW * 2);
    this.wallTex = this.loadTile("wall-tile.png", this.SEG, this.CH);
  }

  private loadTile(file: string, repeatX: number, repeatY: number): THREE.Texture {
    const url = `${TEXTURE_BASE}${file}`;
    const tex = this.loader.load(
      url,
      undefined,
      undefined,
      (err) => {
        const message = `corridor texture failed to load: ${url}`;
        console.error(message, err);
        this.onError?.(message);
      },
    );
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
    tex.anisotropy = this.maxAniso;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  /**
   * Ready-to-use linear palette for a theme — SINGLE source used both by
   * segment materials and by the location-switch dissolve (in-place
   * geometry palette morph, owner spec 2026-09-24).
   */
  themePalette(theme: CorridorTheme): {
    shell: THREE.Color;
    base: THREE.Color;
    metal: THREE.Color;
    accent: THREE.Color;
  } {
    // The PNG maps are dark by design and MULTIPLY the color, so the theme
    // tint is hue-normalized to an HDR boost (brightest channel = 15): the
    // locations keep their palette and the tile detail stays visible under
    // normal light instead of collapsing to black.
    const shell = new THREE.Color(theme.floor);
    const maxChannel = Math.max(shell.r, shell.g, shell.b, 1e-4);
    shell.multiplyScalar(15 / maxChannel);
    return {
      shell,
      base: new THREE.Color(theme.floor),
      metal: new THREE.Color(theme.floor).multiplyScalar(0.55),
      accent: new THREE.Color(theme.accent),
    };
  }

  /**
   * Deterministic 0..1 from an integer seed. NO Math.random: the owner
   * forbade random level deco — every build must be reproducible.
   */
  private hash(n: number): number {
    const v = Math.sin(n * 12.9898) * 43758.5453;
    return v - Math.floor(v);
  }

  // ── geometry cache (one BufferGeometry per distinct shape) ──

  private geo(cacheKey: string, make: () => THREE.BufferGeometry): THREE.BufferGeometry {
    let g = this.geoCache.get(cacheKey);
    if (!g) {
      g = make();
      g.userData.cached = true; // rebuilds must never dispose this
      this.geoCache.set(cacheKey, g);
    }
    return g;
  }

  private box(w: number, h: number, d: number): THREE.BufferGeometry {
    const q = (v: number) => Math.round(v * 1000) / 1000;
    const x = q(w); const y = q(h); const z = q(d);
    return this.geo(`box|${x}|${y}|${z}`, () => new THREE.BoxGeometry(x, y, z));
  }

  private cyl(rTop: number, rBot: number, h: number, seg: number): THREE.BufferGeometry {
    const q = (v: number) => Math.round(v * 1000) / 1000;
    const a = q(rTop); const b = q(rBot); const y = q(h);
    return this.geo(`cyl|${a}|${b}|${y}|${seg}`, () => new THREE.CylinderGeometry(a, b, y, seg));
  }

  private sph(r: number, wSeg: number, hSeg: number): THREE.BufferGeometry {
    const rad = Math.round(r * 1000) / 1000;
    return this.geo(`sph|${rad}|${wSeg}|${hSeg}`, () => new THREE.SphereGeometry(rad, wSeg, hSeg));
  }

  private tor(r: number, tube: number, rSeg: number, tSeg: number): THREE.BufferGeometry {
    const q = (v: number) => Math.round(v * 1000) / 1000;
    const a = q(r); const b = q(tube);
    return this.geo(`tor|${a}|${b}|${rSeg}|${tSeg}`, () => new THREE.TorusGeometry(a, b, rSeg, tSeg));
  }

  /**
   * Deterministic floor slots for the "вещи на полу" layer — GROUPED
   * pile (owner plan 2026-09-25: "вещи на полу стоят группами в
   * промежутках между опорами, не россыпью"): the 4 slots cluster within
   * ~1.1 world units at the segment middle and z tightens to 0.5, so the
   * objects read as one pile aligned with the support-arch rhythm. z
   * stays in the back half so the running lane (z=0) stays clear.
   */
  private floorSlot(idx: number): { x: (i: number) => number; z: (i: number) => number } {
    const j = (this.hash(idx * 53 + 3) - 0.5) * 0.16;
    return {
      x: (i) => 0.55 + i * 0.34 + j,
      z: (i) => -2.18 + this.hash(idx * 37 + i) * 0.5,
    };
  }

  // ── material cache (8 shared materials per theme key) ──

  private materials(theme: CorridorTheme): SegmentMats {
    const cached = this.matCache.get(theme.key);
    if (cached) return cached;

    const pal = this.themePalette(theme);
    const floorMat = new THREE.MeshStandardMaterial({
      color: pal.shell,
      map: this.floorTex,
      metalness: 0.8,
      roughness: 0.2,
    });
    const ceilMat = new THREE.MeshStandardMaterial({
      color: pal.shell,
      map: this.ceilTex,
      metalness: 0.8,
      roughness: 0.2,
    });
    const wallMat = new THREE.MeshStandardMaterial({
      color: pal.shell,
      map: this.wallTex,
      metalness: 0.8,
      roughness: 0.2,
    });
    // Plain shell color for round greebles (cylindrical UVs smear tiles).
    const baseMat = new THREE.MeshStandardMaterial({
      color: pal.base,
      metalness: 0.8,
      roughness: 0.2,
    });

    // Structural metal + three accent intensities: dim strips, hot
    // emissives (windows/screens/stars), moderate art panels.
    const metalMat = new THREE.MeshStandardMaterial({
      color: pal.metal,
      metalness: 0.85,
      roughness: 0.35,
    });
    const accentDimMat = new THREE.MeshStandardMaterial({
      color: pal.accent,
      emissive: pal.accent,
      emissiveIntensity: 0.6,
    });
    const accentHotMat = new THREE.MeshStandardMaterial({
      color: pal.accent,
      emissive: pal.accent,
      emissiveIntensity: 1.6,
    });
    const accentArtMat = new THREE.MeshStandardMaterial({
      color: pal.accent,
      emissive: pal.accent,
      emissiveIntensity: 0.7,
    });
    // Role tags: the location-switch dissolve arms exactly these materials
    // (palette morph ON the geometry — no freeze, no post).
    floorMat.userData.role = "shell";
    ceilMat.userData.role = "shell";
    wallMat.userData.role = "shell";
    baseMat.userData.role = "base";
    metalMat.userData.role = "metal";
    accentDimMat.userData.role = "accent";
    accentHotMat.userData.role = "accent";
    accentArtMat.userData.role = "accent";

    const mats: SegmentMats = {
      floor: floorMat,
      ceil: ceilMat,
      wall: wallMat,
      base: baseMat,
      metal: metalMat,
      accentDim: accentDimMat,
      accentHot: accentHotMat,
      accentArt: accentArtMat,
    };
    for (const m of Object.values(mats)) m.userData.cached = true;
    this.matCache.set(theme.key, mats);
    return mats;
  }

  /**
   * Creates a detailed segment based on the current theme.
   * @param theme The current theme configuration (must carry key)
   * @param offsetX The X position offset for the segment
   */
  createDetailedSegment(theme: CorridorTheme, offsetX: number): THREE.Group {
    const group = new THREE.Group();

    // Cached resources: rebuilds allocate plain Object3Ds only.
    const mats = this.materials(theme);
    // Segment index along the loop (offsets are multiples of SEG)
    const idx = Math.round(offsetX / this.SEG);

    // Shared structure for every location: textured shell + back wall,
    // then the SANCTIONED corridor frame (fascia, through-lines,
    // support arches, painted road).
    this.addBaseShell(group, mats);
    this.addBackWall(group, mats);
    this.addStructure(group, mats, idx);

    // Archetype dispatch — explicit, no substitute path.
    switch (theme.key) {
      case "experience": this.addFactory(group, mats, idx); break;
      case "home": this.addCity(group, mats, idx); break;
      case "games": this.addArcade(group, mats, idx); break;
      case "assets": this.addGallery(group, mats, idx); break;
      case "tech": this.addTerminal(group, mats, idx); break;
      case "about": this.addBlueprint(group, mats, idx); break;
      case "links": this.addStars(group, mats, idx); break;
      default:
        throw new Error(
          `corridor-gen: no archetype for theme key "${theme.key}" — explicit failure, no fallback`,
        );
    }

    group.position.x = offsetX;
    return group;
  }

  private addBaseShell(group: THREE.Group, mats: SegmentMats): void {
    const floor = new THREE.Mesh(this.box(this.SEG, 0.1, this.CW * 2), mats.floor);
    floor.position.set(this.SEG / 2, 0, 0);
    group.add(floor);

    const ceil = new THREE.Mesh(this.box(this.SEG, 0.1, this.CW * 2), mats.ceil);
    ceil.position.set(this.SEG / 2, this.CH, 0);
    group.add(ceil);

    // NOTE: no cross wall at segment starts — those half-depth blades were
    // the "лишние перегородки" (owner verdict): the tube stays continuous;
    // the proper back wall is added in the panel layer.
  }

  private addBackWall(group: THREE.Group, mats: SegmentMats): void {
    // Far side back wall only (z=-CW); camera side stays open (side view).
    const sideWall = new THREE.Mesh(this.box(this.SEG, this.CH, 0.2), mats.wall);
    sideWall.position.set(this.SEG / 2, this.CH / 2, -this.CW);
    group.add(sideWall);
  }

  /**
   * Shared CORRIDOR frame for EVERY location (owner plan 2026-09-25,
   * sanction "Да, план одобрен" — Jetpack Joyride-style readable
   * side-view corridor):
   *  1. upper fascia — dark slab closing the top of the frame (the black
   *     void above the wall was the "не похоже на корридор" top edge),
   *     with a rare lamp every 4th segment;
   *  2. THREE through-lines spanning the FULL segment (no seam shows):
   *     ceiling beam at the wall top, mid-wall pipe, baseboard + glow;
   *  3. support arch floor->ceiling at every 2nd segment boundary —
   *     the corridor reads as a run of пролёты;
   *  4. painted road — lane plate flush with the floor + edge lines +
   *     center dashes, so the running lane reads as a path.
   * All pieces go through the geo cache and use the role-tagged cached
   * materials — the location-switch dissolve arms them.
   */
  private addStructure(group: THREE.Group, mats: SegmentMats, idx: number): void {
    const m4 = ((idx % 4) + 4) % 4;

    // 1. upper fascia (dark slab above the wall — was black void).
    const fascia = new THREE.Mesh(this.box(this.SEG, 2.7, 0.2), mats.metal);
    fascia.position.set(this.SEG / 2, 5.35, -this.CW);
    group.add(fascia);
    if (m4 === 0) {
      // rare ceiling lamp at the wall/ceiling junction
      const lamp = new THREE.Mesh(this.box(0.7, 0.12, 0.24), mats.accentHot);
      lamp.position.set(this.SEG / 2, 4.05, -this.CW + 0.18);
      group.add(lamp);
    }

    // 2a. ceiling beam along the wall top (through-line).
    const beam = new THREE.Mesh(this.box(this.SEG, 0.26, 0.3), mats.metal);
    beam.position.set(this.SEG / 2, 3.87, -this.CW + 0.15);
    group.add(beam);

    // 2b. mid-wall pipe (through-line): passes IN FRONT of the wall
    // deco, BEHIND the big wall objects and BEHIND the support arches.
    const wallPipe = new THREE.Mesh(this.cyl(0.09, 0.09, this.SEG, 8), mats.metal);
    wallPipe.rotation.z = Math.PI / 2;
    wallPipe.position.set(this.SEG / 2, 2.15, -2.72);
    group.add(wallPipe);

    // 2c. baseboard + glow line (through-line at the wall base).
    const plinth = new THREE.Mesh(this.box(this.SEG, 0.3, 0.24), mats.metal);
    plinth.position.set(this.SEG / 2, 0.15, -this.CW + 0.15);
    group.add(plinth);
    const plinthGlow = new THREE.Mesh(this.box(this.SEG, 0.03, 0.04), mats.accentDim);
    plinthGlow.position.set(this.SEG / 2, 0.315, -this.CW + 0.28);
    group.add(plinthGlow);

    // 3. support arch at every 2nd segment boundary (floor -> ceiling),
    // sitting ON the segment edge so the lane center stays open.
    if (Math.abs(idx % 2) === 0) {
      const arch = new THREE.Mesh(this.box(0.4, this.CH, 0.3), mats.metal);
      arch.position.set(0.03, this.CH / 2, -2.6);
      group.add(arch);
    }

    // 4. painted road: lane plate flush with the floor + edge lines +
    // one center dash per segment (3 Hz at world speed — no strobe).
    const road = new THREE.Mesh(this.box(this.SEG, 0.03, 2.0), mats.metal);
    road.position.set(this.SEG / 2, 0.04, 0);
    group.add(road);
    for (const z of [-1.0, 1.0]) {
      const edge = new THREE.Mesh(this.box(this.SEG, 0.02, 0.05), mats.accentDim);
      edge.position.set(this.SEG / 2, 0.057, z);
      group.add(edge);
    }
    const dash = new THREE.Mesh(this.box(0.9, 0.02, 0.06), mats.accentDim);
    dash.position.set(this.SEG / 2, 0.057, 0);
    group.add(dash);
  }

  // ── experience · factory — base rhythm is the APPROVED industrial
  // tunnel (guide strip, pipes, conduit); the SHARED support arch comes
  // from addStructure — factory only keeps its approved cap on top of
  // it; floor layer below was added by owner order 2026-09-25.
  private addFactory(group: THREE.Group, mats: SegmentMats, idx: number): void {
    const big = ((idx % 4) + 4) % 4 === 1;
    // Tunnel-rib cap: the column itself is the shared support arch
    // (addStructure, same 2-segment rhythm) — cap rides on top of it.
    if (Math.abs(idx % 2) === 0) {
      const cap = new THREE.Mesh(this.box(0.5, 0.3, 1.0), mats.metal);
      cap.position.set(0.03, this.CH - 0.15, -2.6);
      group.add(cap);
    }

    // Single dim guide strip — now mounted on the beam face (the
    // shared ceiling through-line occupies the wall top).
    const strip = new THREE.Mesh(this.box(this.SEG, 0.05, 0.08), mats.accentDim);
    strip.position.set(this.SEG / 2, this.CH - 0.06, -2.67);
    group.add(strip);

    // Fixed ceiling pipes: continuous tunnel runs at deterministic z —
    // nothing on the running lane.
    for (const z of [-1.6, -1.05]) {
      const pipe = new THREE.Mesh(this.cyl(0.07, 0.07, this.SEG, 8), mats.base);
      pipe.rotation.z = Math.PI / 2;
      pipe.position.set(this.SEG / 2, this.CH - 0.22, z);
      group.add(pipe);
    }

    // Thin accent conduit, fixed offset
    const conduit = new THREE.Mesh(this.cyl(0.04, 0.04, this.SEG, 6), mats.accentDim);
    conduit.rotation.z = Math.PI / 2;
    conduit.position.set(this.SEG / 2, this.CH - 0.4, -0.55);
    group.add(conduit);

    // ── big wall object (plan: один крупный объект раз в 4 сегмента,
    // вместо мелочи) — blast door with hot frame edges ──
    if (big) {
      const door = new THREE.Mesh(this.box(1.1, 3.05, 0.3), mats.metal);
      door.position.set(this.SEG / 2, 1.625, -2.75);
      group.add(door);
      for (const dx of [0.47, 1.53]) {
        const edge = new THREE.Mesh(this.box(0.07, 3.05, 0.07), mats.accentHot);
        edge.position.set(dx, 1.625, -2.585);
        group.add(edge);
      }
      const lintel = new THREE.Mesh(this.box(0.5, 0.1, 0.1), mats.accentHot);
      lintel.position.set(this.SEG / 2, 3.28, -2.585);
      group.add(lintel);
    }

    // ── floor layer (owner order 2026-09-25: "вещи на полу") ──
    const s = this.floorSlot(idx);
    if (Math.abs(idx % 2) !== 0) {
      // crate stack
      const crate = new THREE.Mesh(this.box(0.5, 0.45, 0.5), mats.base);
      crate.position.set(s.x(0), 0.275, s.z(0));
      group.add(crate);
      const crate2 = new THREE.Mesh(this.box(0.32, 0.28, 0.32), mats.metal);
      crate2.position.set(s.x(0) + 0.04, 0.64, s.z(0) - 0.03);
      group.add(crate2);
      const pallet = new THREE.Mesh(this.box(0.6, 0.08, 0.45), mats.base);
      pallet.position.set(s.x(1), 0.09, s.z(1));
      group.add(pallet);
    } else {
      // barrel
      const barrel = new THREE.Mesh(this.cyl(0.2, 0.2, 0.55, 10), mats.metal);
      barrel.position.set(s.x(1), 0.325, s.z(1));
      group.add(barrel);
      const pallet = new THREE.Mesh(this.box(0.6, 0.08, 0.45), mats.base);
      pallet.position.set(s.x(0), 0.09, s.z(0));
      group.add(pallet);
    }
    // cable spool (flange + core)
    const spoolF = new THREE.Mesh(this.cyl(0.26, 0.26, 0.06, 12), mats.base);
    spoolF.position.set(s.x(2), 0.08, s.z(2));
    group.add(spoolF);
    const spoolC = new THREE.Mesh(this.cyl(0.13, 0.13, 0.3, 10), mats.metal);
    spoolC.position.set(s.x(2), 0.26, s.z(2));
    group.add(spoolC);
    // coiled cable lying on the floor
    const coil = new THREE.Mesh(this.tor(0.18, 0.05, 8, 20), mats.base);
    coil.rotation.x = Math.PI / 2;
    coil.position.set(s.x(3), 0.1, s.z(3));
    group.add(coil);
  }

  // ── home · neon city — street facades: sidewalk curb, lit window grid
  // (deterministic lit/unlit), neon signs; every 4th segment swaps the
  // small deco for ONE big shopfront (plan), floor layer below.
  private addCity(group: THREE.Group, mats: SegmentMats, idx: number): void {
    const big = ((idx % 4) + 4) % 4 === 1;
    const curb = new THREE.Mesh(this.box(this.SEG, 0.2, 0.4), mats.metal);
    curb.position.set(this.SEG / 2, 0.1, -2.75);
    group.add(curb);
    const curbLine = new THREE.Mesh(this.box(this.SEG, 0.04, 0.04), mats.accentDim);
    curbLine.position.set(this.SEG / 2, 0.22, -2.6);
    group.add(curbLine);

    if (big) {
      // ── big wall object (plan: крупный объект вместо мелочи) —
      // lit shopfront: frame + glowing glass + center mullion ──
      const sfFrame = new THREE.Mesh(this.box(1.6, 2.0, 0.3), mats.metal);
      sfFrame.position.set(this.SEG / 2, 1.4, -2.75);
      group.add(sfFrame);
      const sfGlass = new THREE.Mesh(this.box(1.4, 1.8, 0.06), mats.accentHot);
      sfGlass.position.set(this.SEG / 2, 1.4, -2.6);
      group.add(sfGlass);
      const mullion = new THREE.Mesh(this.box(0.07, 1.8, 0.07), mats.metal);
      mullion.position.set(this.SEG / 2, 1.4, -2.56);
      group.add(mullion);
    } else {
      // Two window rows (approved 19/20 layout)
      for (const y of [1.3, 2.7]) {
        for (let c = 0; c < 4; c++) {
          const x = [0.35, 0.85, 1.35, 1.85][c];
          const lit = (c + idx) % 3 !== 0;
          const win = new THREE.Mesh(
            this.box(0.3, 0.5, 0.06),
            lit ? mats.accentHot : mats.metal,
          );
          win.position.set(x, y, -2.87);
          group.add(win);
        }
      }

      // Neon signs above the windows (odd: vertical, even: horizontal;
      // vertical lowered to y=3.25 to clear the beam).
      if (Math.abs(idx % 2) === 0) {
        const sign = new THREE.Mesh(this.box(0.7, 0.3, 0.05), mats.accentHot);
        sign.position.set(this.SEG / 2, 3.3, -2.85);
        group.add(sign);
      } else {
        const sign = new THREE.Mesh(this.box(0.2, 0.7, 0.05), mats.accentHot);
        sign.position.set(this.SEG / 2, 3.25, -2.85);
        group.add(sign);
      }
    }

    // ── floor layer (owner order 2026-09-25: "вещи на полу") ──
    const s = this.floorSlot(idx);
    if (Math.abs(idx % 2) !== 0) {
      // dumpster + lid
      const dump = new THREE.Mesh(this.box(0.55, 0.45, 0.45), mats.metal);
      dump.position.set(s.x(0), 0.275, s.z(0));
      group.add(dump);
      const lid = new THREE.Mesh(this.box(0.6, 0.07, 0.5), mats.base);
      lid.position.set(s.x(0), 0.54, s.z(0));
      group.add(lid);
    } else {
      // cardboard boxes
      const box1 = new THREE.Mesh(this.box(0.35, 0.3, 0.35), mats.base);
      box1.position.set(s.x(0), 0.2, s.z(0));
      group.add(box1);
      const box2 = new THREE.Mesh(this.box(0.26, 0.22, 0.26), mats.base);
      box2.position.set(s.x(0) + 0.1, 0.46, s.z(0) - 0.05);
      group.add(box2);
    }
    // flattened cardboard on the floor
    const flat = new THREE.Mesh(this.box(0.3, 0.04, 0.24), mats.base);
    flat.position.set(s.x(1), 0.07, s.z(1));
    group.add(flat);
    // trash bags (squashed spheres)
    const bag1 = new THREE.Mesh(this.sph(0.15, 8, 6), mats.metal);
    bag1.scale.set(1, 0.7, 1);
    bag1.position.set(s.x(2), 0.16, s.z(2));
    group.add(bag1);
    const bag2 = new THREE.Mesh(this.sph(0.11, 8, 6), mats.base);
    bag2.scale.set(1, 0.75, 1);
    bag2.position.set(s.x(3), 0.13, s.z(3));
    group.add(bag2);
  }

  // ── games · arcade — cabinet rows with emissive screens + marquees,
  // neon tubes; every 4th segment adds ONE giant wall screen (plan),
  // floor layer below.
  private addArcade(group: THREE.Group, mats: SegmentMats, idx: number): void {
    const big = ((idx % 4) + 4) % 4 === 1;
    const wide = Math.abs(idx % 2) !== 0;
    const bodies = wide ? [1.0] : [0.55, 1.45];
    for (const x of bodies) {
      const body = new THREE.Mesh(this.box(wide ? 0.9 : 0.5, 1.05, 0.4), mats.metal);
      body.position.set(x, 0.525, -2.62);
      group.add(body);
      const screen = new THREE.Mesh(this.box(wide ? 0.7 : 0.36, 0.34, 0.04), mats.accentHot);
      screen.position.set(x, 0.72, -2.4);
      group.add(screen);
      const marquee = new THREE.Mesh(this.box(wide ? 0.8 : 0.44, 0.09, 0.04), mats.accentHot);
      marquee.position.set(x, 1.09, -2.4);
      group.add(marquee);
    }
    for (const z of [-1.5, -0.9]) {
      const tube = new THREE.Mesh(this.cyl(0.05, 0.05, this.SEG, 8), mats.accentDim);
      tube.rotation.z = Math.PI / 2;
      tube.position.set(this.SEG / 2, this.CH - 0.1, z);
      group.add(tube);
    }

    // ── big wall object (plan: крупный объект вместо мелочи) —
    // boss monitor: bezel + glowing screen + edge glow rails ──
    if (big) {
      const bezel = new THREE.Mesh(this.box(1.6, 1.9, 0.28), mats.metal);
      bezel.position.set(this.SEG / 2, 2.3, -2.76);
      group.add(bezel);
      const inner = new THREE.Mesh(this.box(1.4, 1.7, 0.06), mats.accentHot);
      inner.position.set(this.SEG / 2, 2.3, -2.6);
      group.add(inner);
      for (const dx of [0.27, 1.73]) {
        const glow = new THREE.Mesh(this.box(0.05, 1.9, 0.05), mats.accentDim);
        glow.position.set(dx, 2.3, -2.58);
        group.add(glow);
      }
    }

    // ── floor layer (owner order 2026-09-25: "вещи на полу") ──
    const s = this.floorSlot(idx);
    // token stack (two glowing coins)
    const coin1 = new THREE.Mesh(this.cyl(0.17, 0.17, 0.07, 14), mats.accentHot);
    coin1.position.set(s.x(0), 0.085, s.z(0));
    group.add(coin1);
    const coin2 = new THREE.Mesh(this.cyl(0.15, 0.15, 0.06, 14), mats.accentHot);
    coin2.position.set(s.x(0) + 0.05, 0.15, s.z(0) + 0.03);
    group.add(coin2);
    // game boxes leaning against each other
    const gb1 = new THREE.Mesh(this.box(0.3, 0.45, 0.12), mats.accentArt);
    gb1.position.set(s.x(1), 0.275, s.z(1));
    gb1.rotation.z = 0.12;
    group.add(gb1);
    const gb2 = new THREE.Mesh(this.box(0.26, 0.34, 0.1), mats.base);
    gb2.position.set(s.x(1) + 0.14, 0.22, s.z(1) + 0.06);
    gb2.rotation.z = -0.15;
    group.add(gb2);
    // glowing floor tiles — aligned with the pile slots (grouped look)
    for (let k = 0; k < 3; k++) {
      const tile = new THREE.Mesh(this.box(0.2, 0.03, 0.2), mats.accentDim);
      tile.position.set(s.x(k), 0.065, s.z(2));
      group.add(tile);
    }
  }

  // ── assets · gallery — framed art (even) vs pedestals + sculpture
  // (odd), spotlights; every 4th segment ONE grand painting replaces the
  // small deco (plan), floor layer below. Paintings hang BELOW the
  // mid-wall pipe through-line (y <= 2.025 vs pipe 2.06). NO tunnel ribs.
  private addGallery(group: THREE.Group, mats: SegmentMats, idx: number): void {
    const big = ((idx % 4) + 4) % 4 === 1;
    if (big) {
      // ── big wall object (plan: крупный объект вместо мелочи) —
      // grand painting; the pedestal exhibit of the odd segment
      // stands in FRONT of its lower half (real gallery layering) ──
      const frame = new THREE.Mesh(this.box(1.7, 1.1, 0.07), mats.metal);
      frame.position.set(this.SEG / 2, 1.45, -2.86);
      group.add(frame);
      const art = new THREE.Mesh(this.box(1.55, 0.95, 0.04), mats.accentArt);
      art.position.set(this.SEG / 2, 1.45, -2.83);
      group.add(art);
      const pedestal = new THREE.Mesh(this.box(0.5, 0.85, 0.4), mats.base);
      pedestal.position.set(this.SEG / 2, 0.425, -2.5);
      group.add(pedestal);
      const plate = new THREE.Mesh(this.box(0.56, 0.05, 0.46), mats.metal);
      plate.position.set(this.SEG / 2, 0.875, -2.5);
      group.add(plate);
      const sculpture = new THREE.Mesh(this.sph(0.17, 12, 10), mats.accentArt);
      sculpture.position.set(this.SEG / 2, 1.07, -2.5);
      group.add(sculpture);
    } else if (Math.abs(idx % 2) === 0) {
      const frame = new THREE.Mesh(this.box(1.2, 0.95, 0.07), mats.metal);
      frame.position.set(this.SEG / 2, 1.55, -2.86);
      group.add(frame);
      const art = new THREE.Mesh(this.box(1.04, 0.79, 0.04), mats.accentArt);
      art.position.set(this.SEG / 2, 1.55, -2.83);
      group.add(art);
    } else {
      const pedestal = new THREE.Mesh(this.box(0.5, 0.85, 0.4), mats.base);
      pedestal.position.set(this.SEG / 2, 0.425, -2.5);
      group.add(pedestal);
      const plate = new THREE.Mesh(this.box(0.56, 0.05, 0.46), mats.metal);
      plate.position.set(this.SEG / 2, 0.875, -2.5);
      group.add(plate);
      const sculpture = new THREE.Mesh(this.sph(0.17, 12, 10), mats.accentArt);
      sculpture.position.set(this.SEG / 2, 1.07, -2.5);
      group.add(sculpture);
    }
    const spot = new THREE.Mesh(this.box(0.14, 0.1, 0.14), mats.accentHot);
    spot.position.set(this.SEG / 2, this.CH - 0.05, -2.3);
    group.add(spot);

    // ── floor layer (owner order 2026-09-25: "вещи на полу") ──
    const s = this.floorSlot(idx);
    if (Math.abs(idx % 2) === 0) {
      // exhibition crate + label
      const crate = new THREE.Mesh(this.box(0.5, 0.4, 0.45), mats.base);
      crate.position.set(s.x(0), 0.25, s.z(0));
      group.add(crate);
      const label = new THREE.Mesh(this.box(0.18, 0.1, 0.02), mats.accentArt);
      label.position.set(s.x(0), 0.3, s.z(0) + 0.235);
      group.add(label);
      // paint bucket
      const bucket = new THREE.Mesh(this.cyl(0.12, 0.1, 0.22, 10), mats.metal);
      bucket.position.set(s.x(2), 0.16, s.z(2));
      group.add(bucket);
    } else {
      // stanchions with a rope
      const x0 = s.x(0); const z0 = s.z(0);
      const x1 = s.x(1); const z1 = s.z(1);
      for (const p of [[x0, z0], [x1, z1]]) {
        const post = new THREE.Mesh(this.cyl(0.045, 0.045, 0.5, 8), mats.metal);
        post.position.set(p[0], 0.3, p[1]);
        group.add(post);
        const base = new THREE.Mesh(this.cyl(0.13, 0.13, 0.05, 10), mats.base);
        base.position.set(p[0], 0.075, p[1]);
        group.add(base);
      }
      const dx = x1 - x0; const dz = z1 - z0;
      const rope = new THREE.Mesh(
        this.box(Math.hypot(dx, dz) + 0.1, 0.03, 0.03),
        mats.accentDim,
      );
      rope.position.set((x0 + x1) / 2, 0.5, (z0 + z1) / 2);
      rope.rotation.y = Math.atan2(-dz, dx);
      group.add(rope);
    }
  }

  // ── tech · code space — terminal grid (3 wall lines each way), data
  // bars, packet dots, floor layer below.
  private addTerminal(group: THREE.Group, mats: SegmentMats, idx: number): void {
    for (const x of [0.4, 1.0, 1.6]) {
      const v = new THREE.Mesh(this.box(0.02, this.CH, 0.03), mats.accentDim);
      v.position.set(x, this.CH / 2, -2.88);
      group.add(v);
    }
    for (const y of [1.2, 2.4, 3.6]) {
      const hline = new THREE.Mesh(this.box(this.SEG, 0.02, 0.03), mats.accentDim);
      hline.position.set(this.SEG / 2, y, -2.88);
      group.add(hline);
    }
    const m3 = ((idx % 3) + 3) % 3;
    const big = ((idx % 4) + 4) % 4 === 1;
    if (big) {
      // ── big wall object (plan: крупный объект вместо мелочи) —
      // server rack tower with LED grid + edge rails ──
      const rack = new THREE.Mesh(this.box(0.9, 3.0, 0.3), mats.metal);
      rack.position.set(this.SEG / 2, 1.55, -2.75);
      group.add(rack);
      for (const dx of [0.58, 1.42]) {
        const rail = new THREE.Mesh(this.box(0.05, 3.0, 0.05), mats.accentDim);
        rail.position.set(dx, 1.55, -2.58);
        group.add(rail);
      }
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 3; col++) {
          const led = new THREE.Mesh(this.box(0.12, 0.05, 0.04), mats.accentHot);
          led.position.set(0.72 + col * 0.28, 0.55 + row * 0.5, -2.58);
          group.add(led);
        }
      }
    } else {
      const barH = 0.9 + m3 * 0.55;
      const bar = new THREE.Mesh(this.box(0.18, barH, 0.05), mats.accentHot);
      bar.position.set([0.4, 1.0, 1.6][m3], 0.4 + barH / 2, -2.85);
      group.add(bar);
      for (let k = 0; k < 3; k++) {
        const dot = new THREE.Mesh(this.box(0.07, 0.07, 0.04), mats.accentHot);
        const lane = (((idx + k) % 3) + 3) % 3;
        dot.position.set(
          [0.4, 1.0, 1.6][lane],
          0.55 + this.hash(idx * 7 + k * 13) * 3.0,
          -2.86,
        );
        group.add(dot);
      }
    }

    // ── floor layer (owner order 2026-09-25: "вещи на полу") ──
    const s = this.floorSlot(idx);
    // server crate with LED strips
    const srv = new THREE.Mesh(this.box(0.45, 0.5, 0.4), mats.metal);
    srv.position.set(s.x(0), 0.3, s.z(0));
    group.add(srv);
    for (const ly of [0.2, 0.42]) {
      const led = new THREE.Mesh(this.box(0.3, 0.03, 0.02), mats.accentDim);
      led.position.set(s.x(0), ly, s.z(0) + 0.21);
      group.add(led);
    }
    // cable spool (flange + core)
    const spoolF = new THREE.Mesh(this.cyl(0.24, 0.24, 0.06, 12), mats.base);
    spoolF.position.set(s.x(1), 0.08, s.z(1));
    group.add(spoolF);
    const spoolC = new THREE.Mesh(this.cyl(0.12, 0.12, 0.28, 10), mats.metal);
    spoolC.position.set(s.x(1), 0.25, s.z(1));
    group.add(spoolC);
    // toolbox + label
    const tbox = new THREE.Mesh(this.box(0.35, 0.18, 0.2), mats.base);
    tbox.position.set(s.x(2), 0.14, s.z(2));
    group.add(tbox);
    const tlabel = new THREE.Mesh(this.box(0.2, 0.05, 0.02), mats.accentArt);
    tlabel.position.set(s.x(2), 0.17, s.z(2) + 0.11);
    group.add(tlabel);
    // cable coil lying on the floor
    const coil = new THREE.Mesh(this.tor(0.16, 0.045, 8, 20), mats.accentDim);
    coil.rotation.x = Math.PI / 2;
    coil.position.set(s.x(3), 0.095, s.z(3));
    group.add(coil);
  }

  // ── about · blueprint — wireframe drafting: wall grid, floor rails,
  // corner marks, bulkhead rings every 4th segment; every 4th segment
  // ONE drafted elevation replaces the small deco (plan), floor below.
  private addBlueprint(group: THREE.Group, mats: SegmentMats, idx: number): void {
    const big = ((idx % 4) + 4) % 4 === 1;
    for (const x of [0.5, 1.0, 1.5]) {
      const v = new THREE.Mesh(this.box(0.015, this.CH, 0.02), mats.accentDim);
      v.position.set(x, this.CH / 2, -2.88);
      group.add(v);
      // dimension tick — shortened to z -2.1..-1.3, clear of both
      // the floor rails and the painted-road edge line
      const tick = new THREE.Mesh(this.box(0.015, 0.02, 0.8), mats.accentDim);
      tick.position.set(x, 0.06, -1.7);
      group.add(tick);
    }
    for (const y of [1, 2, 3]) {
      const hline = new THREE.Mesh(this.box(this.SEG, 0.015, 0.02), mats.accentDim);
      hline.position.set(this.SEG / 2, y, -2.88);
      group.add(hline);
    }
    // floor rails — moved OUT of the road zone (edge line sits z=-1.0)
    for (const z of [-2.35, -1.25]) {
      const rail = new THREE.Mesh(this.box(this.SEG, 0.02, 0.02), mats.accentDim);
      rail.position.set(this.SEG / 2, 0.06, z);
      group.add(rail);
    }
    if (Math.abs(idx % 2) === 0) {
      // corner marks lowered (3.8 -> 3.45) to clear the beam
      const cornerH = new THREE.Mesh(this.box(0.5, 0.03, 0.03), mats.accentHot);
      cornerH.position.set(0.35, 3.45, -2.86);
      group.add(cornerH);
      const cornerV = new THREE.Mesh(this.box(0.03, 0.5, 0.03), mats.accentHot);
      cornerV.position.set(0.12, 3.21, -2.86);
      group.add(cornerV);
    }
    // Bulkhead wireframe ring at the segment boundary
    if (Math.abs(idx % 4) === 0) {
      const edge = new THREE.Mesh(this.box(0.03, this.CH, 0.03), mats.accentHot);
      edge.position.set(0.05, this.CH / 2, -2.88);
      group.add(edge);
      const top = new THREE.Mesh(this.box(0.03, 0.03, this.CW * 2 - 1), mats.accentDim);
      top.position.set(0.05, this.CH - 0.05, -0.5);
      group.add(top);
      const bottom = new THREE.Mesh(this.box(0.03, 0.03, this.CW * 2 - 1), mats.accentDim);
      bottom.position.set(0.05, 0.06, -0.5);
      group.add(bottom);
    }

    // ── big wall object (plan: крупный объект вместо мелочи) —
    // drafted elevation: wireframe frame + accent cross, the wall
    // grid stays visible BEHIND it ──
    if (big) {
      const mk = (w: number, h: number) => new THREE.Mesh(this.box(w, h, 0.04), mats.accentDim);
      const rectTop = mk(1.6, 0.04);
      rectTop.position.set(1.0, 2.5, -2.87);
      group.add(rectTop);
      const rectBot = mk(1.6, 0.04);
      rectBot.position.set(1.0, 1.2, -2.87);
      group.add(rectBot);
      const rectL = mk(0.04, 1.34);
      rectL.position.set(0.22, 1.85, -2.87);
      group.add(rectL);
      const rectR = mk(0.04, 1.34);
      rectR.position.set(1.78, 1.85, -2.87);
      group.add(rectR);
      const crossH = new THREE.Mesh(this.box(1.8, 0.02, 0.02), mats.accentHot);
      crossH.position.set(1.0, 1.85, -2.83);
      group.add(crossH);
      const crossV = new THREE.Mesh(this.box(0.02, 1.5, 0.02), mats.accentHot);
      crossV.position.set(1.0, 1.85, -2.83);
      group.add(crossV);
    }

    // ── floor layer (owner order 2026-09-25: "вещи на полу") ──
    const s = this.floorSlot(idx);
    // rolled drawings (two horizontal rolls + strap)
    const rollA = new THREE.Mesh(this.cyl(0.13, 0.13, 0.55, 10), mats.base);
    rollA.rotation.z = Math.PI / 2;
    rollA.position.set(s.x(0), 0.18, s.z(0));
    group.add(rollA);
    const rollB = new THREE.Mesh(this.cyl(0.13, 0.13, 0.55, 10), mats.accentArt);
    rollB.rotation.z = Math.PI / 2;
    rollB.position.set(s.x(0), 0.44, s.z(0));
    group.add(rollB);
    const strap = new THREE.Mesh(this.box(0.07, 0.56, 0.3), mats.metal);
    strap.position.set(s.x(0), 0.31, s.z(0));
    group.add(strap);
    // stack of plan sheets
    for (let k = 0; k < 3; k++) {
      const sheet = new THREE.Mesh(
        this.box(0.4, 0.03, 0.3),
        k === 1 ? mats.accentArt : mats.base,
      );
      sheet.position.set(s.x(2), 0.065 + k * 0.03, s.z(2));
      group.add(sheet);
    }
    // ruler block
    const ruler = new THREE.Mesh(this.box(0.65, 0.06, 0.1), mats.accentDim);
    ruler.position.set(s.x(3), 0.08, s.z(3));
    ruler.rotation.y = 0.3;
    group.add(ruler);
  }

  // ── links · constellation — sparse star points linked by thin lines;
  // emptiness stays the identity; every 4th segment ONE constellation
  // plate replaces the scattered cluster (plan), floor layer below;
  // positions come from the deterministic hash.
  private addStars(group: THREE.Group, mats: SegmentMats, idx: number): void {
    const big = ((idx % 4) + 4) % 4 === 1;
    if (big) {
      // ── big wall object (plan: крупный объект вместо мелочи) —
      // constellation plate mounted on the wall; the mid-wall pipe
      // through-line passes IN FRONT of it. Star y-bands avoid the
      // pipe band (2.06..2.24). ──
      const plate = new THREE.Mesh(this.box(1.5, 1.1, 0.14), mats.base);
      plate.position.set(1.0, 2.1, -2.885);
      group.add(plate);
      const pts: THREE.Vector3[] = [];
      for (let k = 0; k < 5; k++) {
        const seed = idx * 41 + k * 7;
        const y = k < 3
          ? 1.65 + this.hash(seed + 2) * 0.25
          : 2.38 + this.hash(seed + 2) * 0.22;
        const p = new THREE.Vector3(
          0.4 + this.hash(seed + 1) * 1.2,
          y,
          -2.8,
        );
        pts.push(p);
        const star = new THREE.Mesh(
          this.sph(0.05 + this.hash(seed + 3) * 0.04, 8, 6),
          mats.accentHot,
        );
        star.position.copy(p);
        group.add(star);
      }
      for (let k = 0; k + 1 < pts.length; k++) {
        const a = pts[k];
        const dir = pts[k + 1].clone().sub(a);
        const len = dir.length();
        const link = new THREE.Mesh(this.cyl(0.01, 0.01, len, 4), mats.accentDim);
        link.position.copy(a).addScaledVector(dir, 0.5);
        link.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
        group.add(link);
      }
    } else {
      const pts: THREE.Vector3[] = [];
      for (let k = 0; k < 4; k++) {
        const seed = idx * 41 + k * 7;
        const p = new THREE.Vector3(
          0.2 + this.hash(seed + 1) * 1.6,
          0.6 + this.hash(seed + 2) * 3.0,
          -2.85 + this.hash(seed + 4) * 0.1,
        );
        const r = 0.03 + this.hash(seed + 3) * 0.04;
        pts.push(p);
        const star = new THREE.Mesh(this.sph(r, 8, 6), mats.accentHot);
        star.position.copy(p);
        group.add(star);
      }
      for (let k = 0; k + 1 < pts.length; k++) {
        const a = pts[k];
        const dir = pts[k + 1].clone().sub(a);
        const len = dir.length();
        const link = new THREE.Mesh(this.cyl(0.01, 0.01, len, 4), mats.accentDim);
        link.position.copy(a).addScaledVector(dir, 0.5);
        link.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
        group.add(link);
      }
    }

    // ── floor layer (owner order 2026-09-25: "вещи на полу") ──
    const s = this.floorSlot(idx);
    // meteor stones
    const rock1 = new THREE.Mesh(this.sph(0.16, 7, 5), mats.metal);
    rock1.scale.set(1, 0.75, 1);
    rock1.position.set(s.x(0), 0.17, s.z(0));
    group.add(rock1);
    const rock2 = new THREE.Mesh(this.sph(0.11, 7, 5), mats.base);
    rock2.scale.set(1, 0.8, 1);
    rock2.position.set(s.x(1), 0.14, s.z(1));
    group.add(rock2);
    // glowing shards
    for (let k = 0; k < 2; k++) {
      const shard = new THREE.Mesh(this.box(0.09, 0.3, 0.09), mats.accentHot);
      shard.rotation.z = k === 0 ? 0.28 : -0.22;
      shard.position.set(s.x(2 + k), 0.16, s.z(2 + k));
      group.add(shard);
    }
  }

  /**
   * Foreground parallax layer (owner plan 2026-09-25, sanction "Да,
   * план одобрен": "редкие тёмные силуэты опор/труб идут перед
   * персонажем (параллакс, как в JJ)"). One 8-world-unit chunk with a
   * hash-picked variant: dark floor-to-frame post (55%) / top pipe
   * silhouette (25%) / empty gap (20%) — rare by design. Everything
   * sits at z=+3, the CAMERA side, so it passes in front of the runner.
   * Uses the FIXED near-black silMat (cached, NO theme role): the
   * silhouette layer is the shadow frame of the shot, not location
   * content — the location-switch dissolve deliberately skips it.
   * Deterministic: no Math.random.
   */
  createForegroundSegment(offsetX: number): THREE.Group {
    const group = new THREE.Group();
    const idx = Math.round(offsetX / 8);
    const v = this.hash(idx * 23 + 5);
    const x = 1.5 + this.hash(idx * 17 + 1) * 5;
    if (v < 0.55) {
      // floor-to-frame-edge post (spans y -2..7 — covers the frame
      // at z=+3, camera-visible band is roughly y -2..6)
      const post = new THREE.Mesh(this.box(0.6, 9, 0.6), this.silMat);
      post.position.set(x, 2.5, 3);
      group.add(post);
    } else if (v < 0.8) {
      // top pipe silhouette crossing the upper frame
      const pipe = new THREE.Mesh(this.cyl(0.22, 0.22, 8, 8), this.silMat);
      pipe.rotation.z = Math.PI / 2;
      pipe.position.set(4, 5.6, 3);
      group.add(pipe);
    }
    group.position.x = offsetX;
    return group;
  }
}
