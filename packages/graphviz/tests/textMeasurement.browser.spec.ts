import { afterEach, describe, expect, it, vi } from "vitest";
import { Graphviz } from "@hpcc-js/wasm-graphviz";
import { TextMeasurer } from "../src/textMeasurement.ts";

afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    Graphviz.unload();
});

describe("host text measurement", () => {
    it("uses a detached canvas when OffscreenCanvas is unavailable", () => {
        vi.stubGlobal("OffscreenCanvas", undefined);
        const measureText = vi.spyOn(CanvasRenderingContext2D.prototype, "measureText");
        const measurer = new TextMeasurer(() => {});
        try {
            expect(measurer.measure("Detached canvas", "Arial", 18, "normal", "normal", "normal")).toBeGreaterThan(0);
            expect(measureText).toHaveBeenCalledWith("Detached canvas");
        } finally {
            measurer.dispose();
        }
    });

    it("rejects invalid font settings instead of reusing a previous font", () => {
        const measurer = new TextMeasurer(() => {});
        try {
            expect(() => measurer.measure("Invalid", "Arial", -18, "normal", "normal", "normal")).toThrow("Invalid Graphviz canvas font");
            expect(measurer.measure("Valid", "serif", 1, "normal", "normal", "normal")).toBeGreaterThan(0);
        } finally {
            measurer.dispose();
        }
    });

    it.each([
        ["My Font 2.0", '"My Font 2.0"'],
        ["3270", '"3270"'],
        ['My "Font"', '"My \\"Font\\""'],
        ["Font\\Name", '"Font\\\\Name"'],
        ["A&B <Font>", '"A&B <Font>"'],
        ["My\nFont", '"My\\a Font"'],
        ['"My\nFont"', '"My\\a Font"'],
        ["'My\r\n\t\fFont', monospace", "'My\\d \\a \\9 \\c Font', monospace"],
        ['"My\\"Font\nName", monospace', '"My\\"Font\\a Name", monospace'],
        ['"Ari\\\nal", monospace', "Arial, monospace"],
        ['"\\41\nrial", monospace', "Arial, monospace"],
        ["Arial;", '"Arial;"'],
        ["宋体", '"宋体"'],
        ["My Font 2.0, monospace", '"My Font 2.0", monospace'],
        ["My Font 2.0, Arial, monospace", '"My Font 2.0", Arial, monospace'],
        ['"My, Font", monospace', '"My, Font", monospace'],
        ["'My, Font', monospace", "'My, Font', monospace"]
    ])("matches canvas and rendered SVG fonts for %s", async (family, cssFamily) => {
        const graphviz = await Graphviz.load();
        using graph = graphviz.read('digraph { a [shape=box, width=0, height=0, margin=0, fontsize=18, label="Font measurement"] }');
        graph.setNodeAttr("a", "fontname", family);
        const output = graph.layout();
        expect(new DOMParser().parseFromString(output, "image/svg+xml").querySelector("parsererror")).toBeNull();
        const container = document.createElement("div");
        container.style.cssText = "position:absolute;left:-10000px;top:0;font-family:sans-serif";
        container.innerHTML = output;
        document.body.append(container);
        try {
            const text = container.querySelector("text")!;
            const node = container.querySelector<SVGPolygonElement>(".node polygon")!;
            const context = document.createElement("canvas").getContext("2d")!;
            context.font = `18px ${cssFamily}`;
            expect(getComputedStyle(text).fontFamily).toBe(context.font.slice("18px ".length));
            const width = text.getComputedTextLength();
            // SVG and canvas round glyph advances slightly differently.
            expect(Math.abs(width - context.measureText("Font measurement").width)).toBeLessThan(0.1);
            expect(Math.abs(node.getBBox().width - width)).toBeLessThan(0.1);
        } finally {
            container.remove();
        }
    });

    for (const fontname of ["Times-Roman", "PingFang SC", "Noto Sans CJK SC", "monospace"]) {
        for (const label of ["abcdefgh", "终端用户(组装)", "终端用户(组装)".repeat(16)]) {
            it(`keeps ${label} inside an HTML table cell with ${fontname} (issue 434)`, async () => {
                await document.fonts.load(`14px "${fontname}"`, label);
                const graphviz = await Graphviz.load();
                const output = graphviz.dot(`digraph G {
                    node [shape=plaintext, fontname="${fontname}"]
                    n [label=<<TABLE BORDER="1" CELLBORDER="1" CELLSPACING="0">
                        <TR><TD>${label}</TD></TR>
                    </TABLE>>]
                }`);
                const container = document.createElement("div");
                container.style.cssText = "position:absolute;left:-10000px;top:0";
                container.innerHTML = output;
                document.body.append(container);
                try {
                    const text = container.querySelector("text")!;
                    const cell = container.querySelector<SVGPolygonElement>(".node polygon:last-of-type")!;
                    expect(text.textContent).toBe(label);
                    const svg = container.querySelector("svg")!;
                    for (const scale of [undefined, 1, 2]) {
                        if (scale !== undefined) {
                            svg.style.width = `${svg.viewBox.baseVal.width * scale}px`;
                            svg.style.height = `${svg.viewBox.baseVal.height * scale}px`;
                        }
                        const textBounds = text.getBBox();
                        const cellBounds = cell.getBBox();
                        expect(textBounds.x).toBeGreaterThanOrEqual(cellBounds.x);
                        expect(textBounds.x + textBounds.width).toBeLessThanOrEqual(cellBounds.x + cellBounds.width);
                        // Default cell padding is two units plus a one-unit border on each side.
                        expect(cellBounds.width - 6).toBeCloseTo(text.getComputedTextLength(), 1);
                    }
                } finally {
                    container.remove();
                }
            });
        }
    }

    it("uses canvas widths in a worker without a DOM", async () => {
        const worker = new Worker(new URL("./worker.browser.ts", import.meta.url), { type: "module" });
        try {
            const width = await new Promise<number>((resolve, reject) => {
                worker.onmessage = event => resolve(event.data);
                worker.onerror = event => reject(new Error(event.message));
                worker.postMessage("measure");
            });
            const context = document.createElement("canvas").getContext("2d")!;
            context.font = "18px Arial";
            const expectedWidth = context.measureText("Worker text").width;
            expect(width).toBeCloseTo(expectedWidth, 2);
        } finally {
            worker.terminate();
        }
    });

    it("preserves whitespace and measures each font size", () => {
        const measurer = new TextMeasurer(() => {});
        try {
            const text = "  Hello   world  ";
            const width = measurer.measure(text, "Arial", 18, "normal", "normal", "normal");
            expect(width).toBeGreaterThan(measurer.measure(text.trim(), "Arial", 18, "normal", "normal", "normal"));
            expect(measurer.measure(text, "Arial", 36, "normal", "normal", "normal")).toBeCloseTo(width * 2, 1);
            expect(measurer.measure("", "Arial", 18, "normal", "normal", "normal")).toBe(0);
        } finally {
            measurer.dispose();
        }
    });

    it("reuses native cached widths across layouts and graph lifetimes", async () => {
        const graphviz = await Graphviz.load();
        const measureText = vi.spyOn(OffscreenCanvasRenderingContext2D.prototype, "measureText");
        const source = 'digraph { a [fontname="Arial", label="  font cache  "] }';
        const svg = graphviz.dot(source);
        const calls = measureText.mock.calls.length;
        expect(calls).toBeGreaterThan(0);
        expect(graphviz.dot(source)).toBe(svg);
        expect(measureText.mock.calls.length).toBe(calls);
        using graph = graphviz.read(source);
        expect(graph.layout()).toContain("font cache");
        expect(measureText.mock.calls.length).toBe(calls);
    });

    it("retains more than 1000 distinct measurements", async () => {
        const graphviz = await Graphviz.load();
        const measureText = vi.spyOn(OffscreenCanvasRenderingContext2D.prototype, "measureText");
        const nodes = Array.from({ length: 1200 }, (_, i) => `n${i} [pos="${i * 50},0!", label="label-${i}"]`).join(";");
        const source = `digraph { node [fontname="Arial"]; ${nodes} }`;
        graphviz.layout(source, "dot_json", "nop2");
        const calls = measureText.mock.calls.length;
        expect(calls).toBeGreaterThanOrEqual(1200);
        graphviz.layout(source, "dot_json", "nop2");
        expect(measureText.mock.calls.length).toBe(calls);
    });

    it("invalidates native cached widths when web fonts finish loading", async () => {
        const graphviz = await Graphviz.load();
        const measureText = vi.spyOn(OffscreenCanvasRenderingContext2D.prototype, "measureText");
        const source = 'digraph { a [fontname="Arial", label="font cache"] }';
        graphviz.dot(source);
        const calls = measureText.mock.calls.length;
        document.fonts.dispatchEvent(new Event("loadingdone"));
        graphviz.dot(source);
        expect(measureText.mock.calls.length).toBeGreaterThan(calls);
    });

    for (const { fontname, label, font, text, fontnames } of [
        { fontname: "Arial", label: '"  Hello   world  "', font: "18px Arial", text: "  Hello   world  ", fontnames: "native" },
        { fontname: "Arial", label: '<<B><I>Styled text</I></B>>', font: "italic bold 18px Arial", text: "Styled text", fontnames: "native" },
        { fontname: "Helvetica-BoldOblique", label: '"Alias text"', font: "oblique bold 18px Helvetica,sans-serif", text: "Alias text", fontnames: "native" },
        { fontname: "Helvetica-Narrow", label: '"Condensed text"', font: "condensed 18px Helvetica,sans-serif", text: "Condensed text", fontnames: "native" },
        { fontname: "AvantGarde-BookOblique", label: '"Book weight"', font: 'oblique 18px "URW Gothic L",sans-serif', text: "Book weight", fontnames: "native" },
        { fontname: "Times-BoldItalic", label: '"SVG alias"', font: "italic bold 18px serif", text: "SVG alias", fontnames: "svg" },
        { fontname: "My Font 2.0", label: '"Punctuated family"', font: '18px "My Font 2.0"', text: "Punctuated family", fontnames: "native" },
        { fontname: "3270", label: '"Numeric family"', font: '18px "3270"', text: "Numeric family", fontnames: "native" },
        { fontname: "My Font 2.0, monospace", label: '"Fallback family"', font: '18px "My Font 2.0",monospace', text: "Fallback family", fontnames: "native" },
        { fontname: "Arial", label: '"Unicode: café 中文 مرحبا"', font: "18px Arial", text: "Unicode: café 中文 مرحبا", fontnames: "native" }
    ]) {
        it(`uses canvas widths in WASM layout for ${fontname}, ${label}`, async () => {
            const graphviz = await Graphviz.load();
            const source = `digraph {
                graph [fontnames="${fontnames}"];
                node [shape=box, width=0, height=0, margin=0, fontsize=18, fontname="${fontname}"];
                a [label=${label}];
            }`;
            const result = JSON.parse(graphviz.layout(source, "json"));
            const context = document.createElement("canvas").getContext("2d")!;
            context.font = font;
            const expectedWidth = context.measureText(text).width;
            expect(Number(result.objects[0].width) * 72).toBeCloseTo(expectedWidth, 2);

            using graph = graphviz.read(source);
            const graphResult = JSON.parse(graph.layout("json"));
            expect(Number(graphResult.objects[0].width) * 72).toBeCloseTo(expectedWidth, 2);
        });
    }
});
