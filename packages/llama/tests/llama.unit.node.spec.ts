import { beforeEach, describe, expect, it, vi } from "vitest";

const { loadMock, resetMock } = vi.hoisted(() => ({
    loadMock: vi.fn(),
    resetMock: vi.fn(),
}));

vi.mock("../../../build/packages/llama/llamalib.wasm", () => ({
    default: loadMock,
    reset: resetMock,
}));

import { Llama } from "../src/llama.ts";

class FakeVectorString {
    values: string[] = [];

    push_back(value: string) {
        this.values.push(value);
    }

    get(index: number) {
        return this.values[index];
    }

    delete() {
    }
}

describe("Llama unit", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("loads and unloads through the wasm module hooks", async () => {
        const fakeModule = {
            FS_createDataFile: vi.fn(),
            FS_unlink: vi.fn(),
            VectorString: FakeVectorString,
            embedding: vi.fn(),
            main: vi.fn(),
        };
        loadMock.mockResolvedValueOnce(fakeModule);

        const llama = await Llama.load();

        expect(llama).toBeInstanceOf(Llama);
        expect(loadMock).toHaveBeenCalledTimes(1);

        Llama.unload();
        expect(resetMock).toHaveBeenCalledTimes(1);
    });

    it("logs file creation and embedding failures, then reads redirected output", () => {
        const createFileError = new Error("create failed");
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => { });
        const readFile = vi.fn((fileName: string) => {
            if (fileName === "error.txt") {
                return "redirected stderr";
            }
            throw new Error("missing output");
        });
        const fakeModule = {
            FS_createDataFile: vi.fn(() => {
                throw createFileError;
            }),
            FS_unlink: vi.fn(),
            FS: {
                readFile,
            },
            VectorString: FakeVectorString,
            embedding: vi.fn((_args: FakeVectorString, result: FakeVectorString) => {
                result.values = ["", "embedding stderr"];
                return 1;
            }),
            main: vi.fn(),
        };

        const llama = new (Llama as any)(fakeModule) as Llama;
        const embeddings = llama.embedding("hello", Uint8Array.from([1, 2, 3]));

        expect(embeddings).toEqual([]);
        expect(fakeModule.embedding).toHaveBeenCalledTimes(1);
        expect(fakeModule.FS_unlink).toHaveBeenCalledWith("/embeddingModel.gguf");
        expect(readFile).toHaveBeenCalledWith("error.txt", { encoding: "utf8" });
        expect(readFile).toHaveBeenCalledWith("output.txt", { encoding: "utf8" });
        expect(consoleError).toHaveBeenCalledWith(createFileError);
        expect(consoleError).toHaveBeenCalledWith(expect.any(Error));
        expect(consoleError).toHaveBeenCalledWith("redirected stderr");

        consoleError.mockRestore();
    });

    it("parses successful embedding output", () => {
        const fakeModule = {
            FS_createDataFile: vi.fn(),
            FS_unlink: vi.fn(),
            VectorString: FakeVectorString,
            embedding: vi.fn((args: FakeVectorString, result: FakeVectorString) => {
                expect(args.values).toContain("array");
                result.values = ["[[0.25, 0.5]]"];
                return 0;
            }),
            main: vi.fn(),
        };
        const llama = new (Llama as any)(fakeModule) as Llama;

        expect(llama.embedding("hello", Uint8Array.from([1, 2, 3]))).toEqual([[0.25, 0.5]]);
        expect(fakeModule.FS_createDataFile).toHaveBeenCalledOnce();
        expect(fakeModule.FS_unlink).toHaveBeenCalledWith("/embeddingModel.gguf");
    });

    it("mounts a model and returns stdout and stderr from main", () => {
        const fakeModule = {
            FS_createDataFile: vi.fn(),
            FS_unlink: vi.fn(),
            VectorString: FakeVectorString,
            embedding: vi.fn(),
            main: vi.fn((args: FakeVectorString, result: FakeVectorString) => {
                result.values = ["main stdout", "main stderr"];
                expect(args.values).toEqual(["-m", "/mainModel.gguf", "--help"]);
                return 0;
            }),
        };

        const llama = new (Llama as any)(fakeModule) as Llama;
        const result = llama.main(["--help"], Uint8Array.from([1, 2, 3]));

        expect(result).toEqual({
            exitCode: 0,
            stdout: "main stdout",
            stderr: "main stderr",
        });
        expect(fakeModule.FS_createDataFile).toHaveBeenCalledWith("/", "mainModel.gguf", expect.any(Uint8Array), true, false, false);
        expect(fakeModule.FS_unlink).toHaveBeenCalledWith("/mainModel.gguf");
    });

    it("continues running main when mounting a model fails", () => {
        const createFileError = new Error("create failed");
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => { });
        const fakeModule = {
            FS_createDataFile: vi.fn(() => {
                throw createFileError;
            }),
            FS_unlink: vi.fn(),
            VectorString: FakeVectorString,
            embedding: vi.fn(),
            main: vi.fn((args: FakeVectorString, result: FakeVectorString) => {
                result.values = ["main stdout", ""];
                expect(args.values).toEqual(["-m", "/mainModel.gguf", "--help"]);
                return 0;
            }),
        };

        const llama = new (Llama as any)(fakeModule) as Llama;
        const result = llama.main(["--help"], Uint8Array.from([1, 2, 3]));

        expect(result).toEqual({
            exitCode: 0,
            stdout: "main stdout",
            stderr: "",
        });
        expect(consoleError).toHaveBeenCalledWith(createFileError);
        expect(fakeModule.FS_unlink).not.toHaveBeenCalled();

        consoleError.mockRestore();
    });

    it("does not remount a model already named in the llama arguments", () => {
        for (const flag of ["-m", "--model"]) {
            const fakeModule = {
                FS_createDataFile: vi.fn(),
                FS_unlink: vi.fn(),
                VectorString: FakeVectorString,
                embedding: vi.fn(),
                main: vi.fn((_args: FakeVectorString, result: FakeVectorString) => {
                    result.values = ["", ""];
                    return 0;
                }),
            };
            const llama = new (Llama as any)(fakeModule) as Llama;

            llama.main([flag, "existing.gguf"], Uint8Array.from([1, 2, 3]));

            expect(fakeModule.FS_createDataFile).not.toHaveBeenCalled();
            expect(fakeModule.FS_unlink).not.toHaveBeenCalled();
        }
    });

    it("builds a one-shot conversation command for chat", () => {
        const fakeModule = {
            FS_createDataFile: vi.fn(),
            FS_unlink: vi.fn(),
            VectorString: FakeVectorString,
            embedding: vi.fn(),
            main: vi.fn((args: FakeVectorString, result: FakeVectorString) => {
                result.values = ["assistant reply", ""];
                expect(args.values).toEqual([
                    "-m",
                    "/mainModel.gguf",
                    "--log-disable",
                    "--single-turn",
                    "-p",
                    "hello",
                    "--system-prompt",
                    "You are concise.",
                    "--jinja",
                    "--chat-template",
                    "chatml",
                    "--conversation",
                    "--temp",
                    "0.2",
                ]);
                return 0;
            }),
        };

        const llama = new (Llama as any)(fakeModule) as Llama;
        const reply = llama.chat("hello", Uint8Array.from([1, 2, 3]), {
            systemPrompt: "You are concise.",
            jinja: true,
            chatTemplate: "chatml",
            args: ["--temp", "0.2"],
        });

        expect(reply).toBe("assistant reply");
    });

    it("returns an empty reply and logs redirected output when chat fails", () => {
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => { });
        const readFile = vi.fn(() => "redirected output");
        const fakeModule = {
            FS_createDataFile: vi.fn(),
            FS_unlink: vi.fn(),
            FS: { readFile },
            VectorString: FakeVectorString,
            embedding: vi.fn(),
            main: vi.fn((_args: FakeVectorString, result: FakeVectorString) => {
                result.values = ["", ""];
                return 1;
            }),
        };

        const llama = new (Llama as any)(fakeModule) as Llama;
        const reply = llama.chat("hello", Uint8Array.from([1, 2, 3]), { conversation: false });

        expect(reply).toBe("");
        expect(consoleError).toHaveBeenCalledWith(expect.objectContaining({ message: "llama.chat failed" }));
        expect(consoleError).toHaveBeenCalledWith("redirected output");
        expect(readFile).toHaveBeenCalledTimes(2);
        expect(fakeModule.FS_unlink).toHaveBeenCalledWith("/mainModel.gguf");

        consoleError.mockRestore();
    });

    it("logs the native error when a chat session fails", () => {
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => { });
        const fakeModule = {
            FS_createDataFile: vi.fn(),
            FS_unlink: vi.fn(),
            VectorString: FakeVectorString,
            embedding: vi.fn(),
            main: vi.fn((_args: FakeVectorString, result: FakeVectorString) => {
                result.values = ["", "native chat failure"];
                return 1;
            }),
        };
        const llama = new (Llama as any)(fakeModule) as Llama;
        const session = llama.createChatSession(Uint8Array.from([1]));

        expect(session.send("hello")).toBe("");
        expect(consoleError).toHaveBeenCalledWith(expect.objectContaining({ message: "native chat failure" }));

        consoleError.mockRestore();
    });

    it("keeps multi-turn chat history in a session", () => {
        const fakeModule = {
            FS_createDataFile: vi.fn(),
            FS_unlink: vi.fn(),
            VectorString: FakeVectorString,
            embedding: vi.fn(),
            main: vi
                .fn()
                .mockImplementationOnce((args: FakeVectorString, result: FakeVectorString) => {
                    result.values = ["Hi there.", ""];
                    expect(args.values).toEqual([
                        "-m",
                        "/mainModel.gguf",
                        "--log-disable",
                        "--no-conversation",
                        "--no-display-prompt",
                        "-p",
                        "System: You are concise.\n\nUser: hello\n\nAssistant:",
                        "--temp",
                        "0.2",
                    ]);
                    return 0;
                })
                .mockImplementationOnce((args: FakeVectorString, result: FakeVectorString) => {
                    result.values = ["I am well.", ""];
                    expect(args.values).toEqual([
                        "-m",
                        "/mainModel.gguf",
                        "--log-disable",
                        "--no-conversation",
                        "--no-display-prompt",
                        "-p",
                        "System: You are concise.\n\nUser: hello\n\nAssistant: Hi there.\n\nUser: how are you?\n\nAssistant:",
                        "--temp",
                        "0.2",
                    ]);
                    return 0;
                }),
        };

        const llama = new (Llama as any)(fakeModule) as Llama;
        const session = llama.createChatSession(Uint8Array.from([1, 2, 3]), {
            systemPrompt: "You are concise.",
            args: ["--temp", "0.2"],
        });

        expect(session.send("hello")).toBe("Hi there.");
        expect(session.send("how are you?")).toBe("I am well.");
        expect(session.history()).toEqual([
            { role: "system", content: "You are concise." },
            { role: "user", content: "hello" },
            { role: "assistant", content: "Hi there." },
            { role: "user", content: "how are you?" },
            { role: "assistant", content: "I am well." },
        ]);
    });

    it("resets a chat session back to its initial messages", () => {
        const fakeModule = {
            FS_createDataFile: vi.fn(),
            FS_unlink: vi.fn(),
            VectorString: FakeVectorString,
            embedding: vi.fn(),
            main: vi.fn((args: FakeVectorString, result: FakeVectorString) => {
                result.values = ["assistant reply", ""];
                expect(args.values).toEqual([
                    "-m",
                    "/mainModel.gguf",
                    "--log-disable",
                    "--no-conversation",
                    "--no-display-prompt",
                    "-p",
                    "System: Preserve this.\n\nUser: hello\n\nAssistant:",
                ]);
                return 0;
            }),
        };

        const llama = new (Llama as any)(fakeModule) as Llama;
        const session = llama.createChatSession(Uint8Array.from([1, 2, 3]), {
            systemPrompt: "Preserve this.",
        });

        session.send("hello");
        session.reset();

        expect(session.history()).toEqual([
            { role: "system", content: "Preserve this." },
        ]);
    });

    it("uses a custom prompt builder when provided", () => {
        const fakeModule = {
            FS_createDataFile: vi.fn(),
            FS_unlink: vi.fn(),
            VectorString: FakeVectorString,
            embedding: vi.fn(),
            main: vi.fn((args: FakeVectorString, result: FakeVectorString) => {
                result.values = ["templated reply", ""];
                expect(args.values).toEqual([
                    "-m",
                    "/mainModel.gguf",
                    "--log-disable",
                    "--no-conversation",
                    "--no-display-prompt",
                    "-p",
                    "templated::system=You are concise.|user=hello",
                ]);
                return 0;
            }),
        };

        const llama = new (Llama as any)(fakeModule) as Llama;
        const promptBuilder = vi.fn((messages: { role: string; content: string }[]) => {
            return `templated::${messages.map(message => `${message.role}=${message.content}`).join("|")}`;
        });
        const session = llama.createChatSession(Uint8Array.from([1, 2, 3]), {
            systemPrompt: "You are concise.",
            promptBuilder,
        });

        expect(session.send("hello")).toBe("templated reply");
        expect(promptBuilder).toHaveBeenCalledWith([
            { role: "system", content: "You are concise." },
            { role: "user", content: "hello" },
        ]);
    });

    it("starts a chat session from provided messages without a system prompt", () => {
        const fakeModule = {
            FS_createDataFile: vi.fn(),
            FS_unlink: vi.fn(),
            VectorString: FakeVectorString,
            embedding: vi.fn(),
            main: vi.fn((args: FakeVectorString, result: FakeVectorString) => {
                result.values = ["reply", ""];
                expect(args.values).toContain("User: saved message\n\nUser: new message\n\nAssistant:");
                return 0;
            }),
        };
        const llama = new (Llama as any)(fakeModule) as Llama;
        const session = llama.createChatSession(Uint8Array.from([1]), {
            messages: [{ role: "user", content: "saved message" }],
        });

        expect(session.history()).toEqual([{ role: "user", content: "saved message" }]);
        expect(session.send("new message")).toBe("reply");
    });

    it("extracts the latest assistant reply from echoed chat output", () => {
        const fakeModule = {
            FS_createDataFile: vi.fn(),
            FS_unlink: vi.fn(),
            VectorString: FakeVectorString,
            embedding: vi.fn(),
            main: vi.fn((args: FakeVectorString, result: FakeVectorString) => {
                result.values = [
                    "<|im_start|>system\nYou are concise.<|im_end|>\n<|im_start|>user\nhello<|im_end|>\n<|im_start|>assistant\nHi there.<|im_end|>\n<|im_start|>user\nignored",
                    "",
                ];
                expect(args.values).toEqual([
                    "-m",
                    "/mainModel.gguf",
                    "--log-disable",
                    "--no-conversation",
                    "--no-display-prompt",
                    "-p",
                    "templated prompt",
                ]);
                return 0;
            }),
        };

        const llama = new (Llama as any)(fakeModule) as Llama;
        const session = llama.createChatSession(Uint8Array.from([1, 2, 3]), {
            promptBuilder: () => "templated prompt",
        });

        expect(session.send("hello")).toBe("Hi there.");
        expect(session.history()).toEqual([
            { role: "user", content: "hello" },
            { role: "assistant", content: "Hi there." },
        ]);
    });

    it("clamps thread args when worker primitives are unavailable", () => {
        const fakeModule = {
            FS_createDataFile: vi.fn(),
            FS_unlink: vi.fn(),
            VectorString: FakeVectorString,
            embedding: vi.fn(),
            main: vi.fn((args: FakeVectorString, result: FakeVectorString) => {
                result.values = ["main stdout", ""];
                expect(args.values).toEqual([
                    "-m",
                    "/mainModel.gguf",
                    "--threads",
                    "1",
                    "--threads-batch",
                    "1",
                    "--help",
                ]);
                return 0;
            }),
        };

        const llama = new (Llama as any)(fakeModule) as Llama;
        const result = llama.main(["--threads", "4", "--threads-batch", "8", "--help"], Uint8Array.from([1, 2, 3]));

        expect(result.exitCode).toBe(0);
    });

    it("preserves invalid or single-thread values when worker primitives are unavailable", () => {
        const fakeModule = {
            FS_createDataFile: vi.fn(),
            FS_unlink: vi.fn(),
            VectorString: FakeVectorString,
            embedding: vi.fn(),
            main: vi.fn((args: FakeVectorString, result: FakeVectorString) => {
                result.values = ["", ""];
                expect(args.values).toEqual([
                    "--threads",
                    "invalid",
                    "--threads-batch",
                    "1",
                ]);
                return 0;
            }),
        };
        const llama = new (Llama as any)(fakeModule) as Llama;

        expect(llama.main(["--threads", "invalid", "--threads-batch", "1"]).exitCode).toBe(0);
    });
});