export interface ParsedArgs {
    layout?: string;
    format?: string;
    neatoNoOp?: string;
    invertY?: boolean;
    version?: boolean;
    help?: boolean;
    positional: string[];
}

export const HELP_TEXT = `Usage: dot-wasm [options] fileOrDot

Options:
  -K, --layout <engine>      Set layout engine (circo | dot | fdp | sfdp | neato |
                             osage | patchwork | twopi | nop | nop2). Default: dot
  -T, --format <format>      Set output format (svg | dot | json | dot_json |
                             xdot_json | plain | plain-ext). Default: svg
  -n, --neato-no-op <flag>   Set neato no-op flag (only valid with -K neato)
  -y, --invert-y             Invert Y axis in plain/plain-ext formats
  -v                         Echo GraphViz version
  -h, --help                 Show this help message

Examples:
  dot-wasm -K neato -T xdot ./input.dot

https://github.com/hpcc-systems/hpcc-js-wasm`;

export function parseArgs(args: string[]): ParsedArgs {
    const parsed: ParsedArgs = {
        positional: []
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
            parsed.positional.push(...args.slice(i + 1));
            break;
        }

        if (token.startsWith("--")) {
            const [rawName, maybeValue] = token.slice(2).split("=", 2);
            i = handleOption(parsed, rawName, maybeValue ?? null, i, readValue);
            continue;
        }

        if (token.startsWith("-") && token.length > 1) {
            i = handleShortFlags(parsed, token.slice(1), i, readValue);
            continue;
        }

        parsed.positional.push(token);
    }

    return parsed;
}

function handleOption(parsed: ParsedArgs, name: string, value: string | null, currentIndex: number, readValue: (flag: string, index: number) => string): number {
    switch (name) {
        case "layout":
            parsed.layout = value ?? readValue("--layout", ++currentIndex);
            return currentIndex;
        case "format":
            parsed.format = value ?? readValue("--format", ++currentIndex);
            return currentIndex;
        case "neato-no-op":
            parsed.neatoNoOp = value ?? readValue("--neato-no-op", ++currentIndex);
            return currentIndex;
        case "invert-y":
            parsed.invertY = true;
            return currentIndex;
        case "help":
            parsed.help = true;
            return currentIndex;
        case "version":
            parsed.version = true;
            return currentIndex;
        default:
            throw new Error(`Unknown option --${name}`);
    }
}

function handleShortFlags(parsed: ParsedArgs, flags: string, currentIndex: number, readValue: (flag: string, index: number) => string): number {
    for (let j = 0; j < flags.length; ++j) {
        const flag = flags[j];
        switch (flag) {
            case "K": {
                const remaining = flags.slice(j + 1);
                if (remaining) {
                    parsed.layout = remaining;
                    return currentIndex;
                }
                parsed.layout = readValue("-K", ++currentIndex);
                return currentIndex;
            }
            case "T": {
                const remaining = flags.slice(j + 1);
                if (remaining) {
                    parsed.format = remaining;
                    return currentIndex;
                }
                parsed.format = readValue("-T", ++currentIndex);
                return currentIndex;
            }
            case "n": {
                const remaining = flags.slice(j + 1);
                if (remaining) {
                    parsed.neatoNoOp = remaining;
                    return currentIndex;
                }
                parsed.neatoNoOp = readValue("-n", ++currentIndex);
                return currentIndex;
            }
            case "y":
                parsed.invertY = true;
                break;
            case "v":
                parsed.version = true;
                break;
            case "h":
                parsed.help = true;
                break;
            default:
                throw new Error(`Unknown option -${flag}`);
        }
    }

    return currentIndex;
}
