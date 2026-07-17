# Llama Command Line Interface

This package provides a command line interface for the `@hpcc-js/wasm-llama` package. It exposes the bundled llama.cpp `main` function and can load GGUF models from the local drive or from HTTP(S) URLs, including Hugging Face model URLs.

To call `wasm-llama-cli` without installing:

```sh
npx @hpcc-js/wasm-llama-cli [options] [llama.cpp options]
```

To install the global command `wasm-llama-cli` via NPM:

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

All other arguments are forwarded to llama.cpp main. If --model is supplied,
the model is loaded into the WASM filesystem and passed to main automatically.
The -- separator is optional; use it only when a llama.cpp argument must be
protected from wrapper option parsing.
```

Examples:

```sh
wasm-llama-cli -m ./model.gguf --single-turn --no-conversation --log-disable --no-display-prompt -p "Hello" -n 64
wasm-llama-cli --model https://huggingface.co/ggml-org/models/resolve/main/tinyllamas/stories260K.gguf -p "Hello" -n 64
wasm-llama-cli --llama-help
```
