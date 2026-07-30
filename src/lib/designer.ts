/** Shared, browser-safe types + canvas rendering for the live shirt designer. */

export type SideKey = "front" | "back";

export type ImageLayer = {
  id: string;
  kind: "image";
  src: string;
  name: string;
  /** Centre position, 0–1 relative to the texture. */
  x: number;
  y: number;
  /** Width as a fraction of the texture width. */
  scale: number;
  rotation: number;
};

export type TextLayer = {
  id: string;
  kind: "text";
  text: string;
  font: string;
  color: string;
  /** Font size as a fraction of the texture width. */
  size: number;
  x: number;
  y: number;
  rotation: number;
};

export type DesignLayer = ImageLayer | TextLayer;

export type DesignState = Record<SideKey, DesignLayer[]>;

export const TEXTURE_SIZE = 1024;

export const GARMENT_COLORS = [
  { label: "White", value: "#f5f7fa" },
  { label: "Black", value: "#15171c" },
  { label: "Navy", value: "#1b2a4a" },
  { label: "Cyan", value: "#12b5cb" },
  { label: "Red", value: "#c0392b" },
  { label: "Forest", value: "#1f6f4a" },
  { label: "Maroon", value: "#6b1f3a" },
  { label: "Grey", value: "#8d949e" },
  { label: "Yellow", value: "#e8c33c" },
] as const;

export const GARMENT_SIZES = ["S", "M", "L", "XL", "XXL"] as const;

export const DESIGN_FONTS = [
  { label: "Orbitron (techno)", value: "Orbitron, sans-serif" },
  { label: "Rajdhani (sport)", value: "Rajdhani, sans-serif" },
  { label: "Impact (bold)", value: "Impact, Haettenschweiler, sans-serif" },
  { label: "Georgia (classic)", value: "Georgia, serif" },
  { label: "Arial (clean)", value: "Arial, Helvetica, sans-serif" },
  { label: "Courier (mono)", value: '"Courier New", monospace' },
] as const;

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export function makeLayerId(): string {
  return Math.random().toString(36).slice(2, 10);
}

const imageCache = new Map<string, HTMLImageElement>();

export function loadImage(src: string): Promise<HTMLImageElement> {
  const cached = imageCache.get(src);
  if (cached?.complete) return Promise.resolve(cached);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = src;
  });
}

/** Paints one garment side (fabric colour + artwork) into a canvas. */
export async function renderSide(
  canvas: HTMLCanvasElement,
  layers: DesignLayer[],
  garmentColor: string,
): Promise<void> {
  const size = TEXTURE_SIZE;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = garmentColor;
  ctx.fillRect(0, 0, size, size);

  for (const layer of layers) {
    ctx.save();
    ctx.translate(layer.x * size, layer.y * size);
    ctx.rotate((layer.rotation * Math.PI) / 180);

    if (layer.kind === "text") {
      ctx.fillStyle = layer.color;
      ctx.font = `700 ${layer.size * size}px ${layer.font}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(layer.text, 0, 0);
    } else {
      try {
        const img = await loadImage(layer.src);
        const w = layer.scale * size;
        const h = (img.naturalHeight / img.naturalWidth) * w;
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
      } catch {
        /* skip unreadable artwork */
      }
    }
    ctx.restore();
  }
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Preview export failed"))),
      "image/png",
      0.92,
    );
  });
}
