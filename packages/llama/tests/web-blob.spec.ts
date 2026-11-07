import { describe, expect, it, vi } from "vitest";
import { WebBlob } from "../src/web-blob.ts";

function response(body: BodyInit | null, init?: ResponseInit): Response {
    return new Response(body, init);
}

describe("WebBlob", () => {
    it("uses the global fetch implementation and default cache threshold", async () => {
        const url = new URL("https://example.com/small-model.gguf");
        const fetchMock = vi.fn<typeof fetch>()
            .mockResolvedValueOnce(response(null, {
                headers: {
                    "content-length": "8",
                    "content-type": "application/octet-stream",
                    "accept-ranges": "bytes",
                },
            }))
            .mockResolvedValueOnce(response("small"));
        vi.stubGlobal("fetch", fetchMock);
        try {
            const blob = await WebBlob.create(url);

            expect(blob).not.toBeInstanceOf(WebBlob);
            await expect(blob.text()).resolves.toBe("small");
            expect(fetchMock).toHaveBeenCalledTimes(2);
        } finally {
            vi.unstubAllGlobals();
        }
    });

    it("requires a fetch implementation", async () => {
        vi.stubGlobal("fetch", undefined);
        try {
            await expect(WebBlob.create(new URL("https://example.com/model.gguf"))).rejects.toThrow(
                "WebBlob requires globalThis.fetch or a custom fetch implementation"
            );
        } finally {
            vi.unstubAllGlobals();
        }
    });

    it("falls back to downloading the whole blob when range requests are unsupported", async () => {
        const url = new URL("https://example.com/model.gguf");
        const fullBlob = new Blob(["full-content"], { type: "application/octet-stream" });
        const fetchMock = vi.fn<typeof fetch>()
            .mockResolvedValueOnce(response(null, {
                headers: {
                    "content-length": "2048",
                    "content-type": "application/octet-stream",
                    "accept-ranges": "none",
                },
            }))
            .mockResolvedValueOnce(response(fullBlob, {
                headers: {
                    "content-type": "application/octet-stream",
                },
            }));

        const blob = await WebBlob.create(url, { fetch: fetchMock, cacheBelow: 16 });

        expect(blob).toBeInstanceOf(Blob);
        expect(blob).not.toBeInstanceOf(WebBlob);
        await expect(blob.text()).resolves.toBe("full-content");
        expect(fetchMock).toHaveBeenNthCalledWith(1, url, { method: "HEAD" });
        expect(fetchMock).toHaveBeenNthCalledWith(2, url);
    });

    it("downloads small resources even when the server supports ranges", async () => {
        const url = new URL("https://example.com/small-model.gguf");
        const fetchMock = vi.fn<typeof fetch>()
            .mockResolvedValueOnce(response(null, {
                headers: {
                    "content-length": "8",
                    "content-type": "application/gguf",
                    "accept-ranges": "bytes",
                },
            }))
            .mockResolvedValueOnce(response("small"));

        const blob = await WebBlob.create(url, { fetch: fetchMock, cacheBelow: 16 });

        expect(blob).not.toBeInstanceOf(WebBlob);
        await expect(blob.text()).resolves.toBe("small");
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it("returns a ranged WebBlob when range requests are supported", async () => {
        const url = new URL("https://example.com/model.gguf");
        const fetchMock = vi.fn<typeof fetch>()
            .mockResolvedValueOnce(response(null, {
                headers: {
                    "content-length": "4096",
                    "content-type": "application/gguf",
                    "accept-ranges": "bytes",
                },
            }));

        const blob = await WebBlob.create(url, { fetch: fetchMock, cacheBelow: 16 });

        expect(blob).toBeInstanceOf(WebBlob);
        expect(blob.size).toBe(4096);
        expect(blob.type).toBe("application/gguf");
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("uses an empty MIME type when the response omits content-type", async () => {
        const url = new URL("https://example.com/model.gguf");
        const fetchMock = vi.fn<typeof fetch>()
            .mockResolvedValueOnce(response(null, {
                headers: {
                    "content-length": "4096",
                    "accept-ranges": "bytes",
                },
            }));

        const blob = await WebBlob.create(url, { fetch: fetchMock, cacheBelow: 16 });

        expect(blob).toBeInstanceOf(WebBlob);
        expect(blob.type).toBe("");
    });

    it("fetches slices using range headers and clamps the end offset", async () => {
        const url = new URL("https://example.com/model.gguf");
        const fetchMock = vi.fn<typeof fetch>()
            .mockResolvedValueOnce(response("3456", {
                headers: {
                    "content-type": "text/plain",
                },
            }));

        const blob = new WebBlob(url, 2, 8, "text/plain", false, fetchMock);
        const slice = blob.slice(1, 10);

        expect(slice.size).toBe(5);
        await expect(slice.text()).resolves.toBe("3456");
        expect(fetchMock).toHaveBeenCalledWith(url, {
            headers: {
                Range: "bytes=3-7",
            },
        });
    });

    it("fetches the full resource for full blobs", async () => {
        const url = new URL("https://example.com/model.gguf");
        const fetchMock = vi.fn<typeof fetch>()
            .mockResolvedValueOnce(response("abcdef", {
                headers: {
                    "content-type": "text/plain",
                },
            }));

        const blob = new WebBlob(url, 0, 6, "text/plain", true, fetchMock);

        await expect(blob.arrayBuffer()).resolves.toBeInstanceOf(ArrayBuffer);
        expect(fetchMock).toHaveBeenCalledWith(url);
    });

    it("accepts negative slice bounds without throwing", () => {
        const url = new URL("https://example.com/model.gguf");
        const fetchMock = vi.fn<typeof fetch>();
        const blob = new WebBlob(url, 4, 10, "text/plain", false, fetchMock);

        const slice = blob.slice(-2, 3);
        const negativeEnd = blob.slice(1, -2);

        expect(slice).toBeInstanceOf(WebBlob);
        expect(slice.size).toBe(5);
        expect(negativeEnd).toBeInstanceOf(WebBlob);
    });

    it("preserves full-resource fetches for a full slice", async () => {
        const url = new URL("https://example.com/model.gguf");
        const fetchMock = vi.fn<typeof fetch>()
            .mockResolvedValueOnce(response("full"));
        const blob = new WebBlob(url, 0, 4, "text/plain", true, fetchMock);

        await expect(blob.slice().text()).resolves.toBe("full");
        expect(fetchMock).toHaveBeenCalledWith(url);
    });

    it("keeps a full slice range-based when the original blob was partial", async () => {
        const url = new URL("https://example.com/model.gguf");
        const fetchMock = vi.fn<typeof fetch>()
            .mockResolvedValueOnce(response("data"));
        const blob = new WebBlob(url, 0, 4, "text/plain", false, fetchMock);

        await expect(blob.slice().text()).resolves.toBe("data");
        expect(fetchMock).toHaveBeenCalledWith(url, {
            headers: {
                Range: "bytes=0-3",
            },
        });
    });

    it("streams the fetched content", async () => {
        const url = new URL("https://example.com/model.gguf");
        const fetchMock = vi.fn<typeof fetch>()
            .mockResolvedValueOnce(response("streamed", {
                headers: {
                    "content-type": "text/plain",
                },
            }));

        const blob = new WebBlob(url, 0, 8, "text/plain", true, fetchMock);
        const reader = blob.stream().getReader();
        const chunks: Uint8Array[] = [];

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            if (value) chunks.push(value);
        }

        const combined = new Uint8Array(chunks.reduce((sum, chunk) => sum + chunk.length, 0));
        let offset = 0;
        for (const chunk of chunks) {
            combined.set(chunk, offset);
            offset += chunk.length;
        }

        expect(new TextDecoder().decode(combined)).toBe("streamed");
    });

    it("aborts the stream when fetching fails", async () => {
        const url = new URL("https://example.com/model.gguf");
        const fetchMock = vi.fn<typeof fetch>().mockRejectedValueOnce(new Error("boom"));
        const blob = new WebBlob(url, 0, 4, "text/plain", true, fetchMock);

        await expect(blob.stream().getReader().read()).rejects.toThrow("boom");
    });

    it("does not pipe a stream when the response has no body", async () => {
        const url = new URL("https://example.com/model.gguf");
        const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(response(null));
        const blob = new WebBlob(url, 0, 4, "text/plain", true, fetchMock);

        blob.stream();
        await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledWith(url));
        await new Promise(resolve => setTimeout(resolve, 0));
    });
});