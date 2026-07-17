export interface ParsedArgs {
    help?: boolean;
    version?: boolean;
    llamaHelp?: boolean;
    model?: string;
    mainArgs: string[];
}

export const HELP_TEXT = `Usage: wasm-llama-cli [options] [llama.cpp options]

Options:
  -m, --model <path-or-url>  Load a GGUF model from the local drive or an HTTP(S)
                             URL. Hugging Face /blob/ URLs are normalized to
                             /resolve/ URLs automatically.
      --llama-help           Show llama.cpp main help
      --version              Show bundled llama.cpp version
  -h, --help                 Show this help message

All other arguments are forwarded to llama.cpp main. If --model is supplied,
the model is loaded into the WASM filesystem and passed to main automatically.
The -- separator is optional; use it only when a llama.cpp argument must be
protected from wrapper option parsing.

Examples:
  wasm-llama-cli -m ./model.gguf -p "Hello" -n 64
  wasm-llama-cli --model https://huggingface.co/user/repo/resolve/main/model.gguf -p "Hello"
  wasm-llama-cli --llama-help

https://github.com/hpcc-systems/hpcc-js-wasm`;

export function parseArgs(args: string[]): ParsedArgs {
    const parsed: ParsedArgs = {
        mainArgs: []
    };

    const readValue = (flag: string, index: number): string => {
        if (index >= args.length) {
            throw new Error(`${flag} option requires a value.`);
        }
        return args[index];
    };

    for (let i = 0; i < args.length; ++i) {
        const token = args[i];

        if (token === "--") {
            parsed.mainArgs.push(...args.slice(i + 1));
            break;
        }

        if (token === "-h" || token === "--help") {
            parsed.help = true;
            continue;
        }

        if (token === "--version") {
            parsed.version = true;
            continue;
        }

        if (token === "--llama-help") {
            parsed.llamaHelp = true;
            continue;
        }

        if (token === "-m") {
            parsed.model = readValue("-m", ++i);
            continue;
        }

        if (token.startsWith("--model=")) {
            parsed.model = token.slice("--model=".length);
            continue;
        }

        if (token === "--model") {
            parsed.model = readValue("--model", ++i);
            continue;
        }

        if (token.startsWith("-m") && token.length > 2) {
            parsed.model = token.slice(2);
            continue;
        }

        parsed.mainArgs.push(token);
    }

    return parsed;
}
