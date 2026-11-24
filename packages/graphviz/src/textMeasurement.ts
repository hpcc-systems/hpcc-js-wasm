/** @internal Canvas-backed measurements in Graphviz's unscaled coordinate system. */
export class TextMeasurer {
    private readonly _context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
    private readonly _fonts = (globalThis as typeof globalThis & { fonts?: FontFaceSet }).fonts
        ?? (typeof document !== "undefined" ? document.fonts : undefined);

    static available(): boolean {
        return typeof OffscreenCanvas !== "undefined" || typeof document !== "undefined";
    }

    constructor(private readonly _clearCache: () => void) {
        const canvas = typeof OffscreenCanvas !== "undefined"
            ? new OffscreenCanvas(1, 1)
            : document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) {
            throw new Error("Graphviz text measurement requires a Canvas 2D context");
        }
        this._context = context;
        this._fonts?.addEventListener("loadingdone", this._clearCache);
    }

    readonly measure = (text: string, cssFamily: string, size: number, weight: string, style: string, stretch: string): number => {
        // Some PostScript aliases have non-CSS weights (e.g. "book"); SVG ignores these too.
        const cssWeight = /^(normal|bold|[1-9]\d{0,2}|1000)$/.test(weight) ? weight : "normal";
        const font = `${style} ${cssWeight} ${stretch} ${size}px ${cssFamily}`;
        // SVG font sizes use the same numeric units as Graphviz, not CSS pt (which scales by 4/3).
        this._context.font = "1px serif";
        this._context.font = font;
        // Canvas silently ignores invalid fonts; distinguish rejection from a valid 1px serif font.
        if (this._context.font === "1px serif") {
            this._context.font = "2px serif";
            this._context.font = font;
            if (this._context.font === "2px serif") {
                throw new Error(`Invalid Graphviz canvas font: ${font}`);
            }
        }
        const width = this._context.measureText(text).width;
        if (!Number.isFinite(width) || width < 0) {
            throw new Error("Canvas returned an invalid Graphviz text width");
        }
        return width;
    };

    dispose(): void {
        this._fonts?.removeEventListener("loadingdone", this._clearCache);
        this._clearCache();
    }
}
