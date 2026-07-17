# @hpcc-js/wasm-llama-cli

This package provides a command line interface for the `@hpcc-js/wasm-llama` package.
It exposes the bundled llama.cpp `main` function and can load GGUF models from the local drive or from HTTP(S) URLs, including Hugging Face model URLs.

To call `@hpcc-js/wasm-llama-cli` without installing:

```sh
npx @hpcc-js/wasm-llama-cli [options] [llama.cpp options]
```

To install as a global command via NPM:

```sh
npm install --global @hpcc-js/wasm-llama-cli
```

Usage:

```sh
Usage: wasm-llama-cli [options] [llama.cpp options]

Options:
  -m, --model <path-or-url>  Load a GGUF model from the local drive or an HTTP(S)
                             URL. Hugging Face /blob/ URLs are normalized to
                             /resolve/ URLs automatically.
      --llama-help           Show llama.cpp main help
      --version              Show bundled llama.cpp version
  -h, --help                 Show this help message
```

Examples:

```sh
wasm-llama-cli -m ./model.gguf -p "Hello" -n 64
wasm-llama-cli --model https://huggingface.co/user/repo/resolve/main/model.gguf -p "Hello" -n 64
wasm-llama-cli --llama-help
```

All arguments other than the wrapper options above are forwarded to llama.cpp `main` unchanged. If `--model` is supplied, the model is loaded into the WASM filesystem and passed to `main` automatically. The `--` separator is optional; use it only when a llama.cpp argument must be protected from wrapper option parsing.
