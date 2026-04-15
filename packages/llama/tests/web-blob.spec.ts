import { describe, expect, it, vi } from "vitest";
import { WebBlob } from "../src/web-blob.ts";

function response(body: BodyInit | null, init?: ResponseInit): Response {
    return new Response(body, init);
}

describe("WebBlob", () => {
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

        expect(slice).toBeInstanceOf(WebBlob);
        expect(slice.size).toBe(5);
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
});