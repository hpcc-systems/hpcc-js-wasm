# Zstandard interoperability fixtures

These fixtures are produced with the native `zstd` CLI so package tests do not require Homebrew or a system `zstd` binary at CI runtime.

## Tooling

- CLI: `zstd` command line interface 64-bits **v1.5.2** (Yann Collet)
- Host package WASM Zstd version under test: **1.5.7** (API-compatible frames)

## Generation commands

```sh
printf 'hello\n' > hello.txt
zstd -f -19 -o hello-known.zst hello.txt

dd if=/dev/zero bs=1048576 count=4 | zstd -19 -o zeros-4mib-unknown.zst
```

## Fixtures

| File | Content size in frame | Original | Notes |
|------|----------------------|----------|-------|
| `hello-known.zst` | **known** (6 bytes) | `hello\n` | SHA-256 original `5891b5b522d5df086d0ff0b110fbd9d21bb4fc7163af34d08286a2e846f6be03`; fixture `9b5481636cdd471c94464ed3d51ce02382420f6ae338ef23ed52a30404307dad` |
| `zeros-4mib-unknown.zst` | **unknown** (stdin stream) | 4 MiB of `0x00` | Original SHA-256 `bb9f8df61474d25e71fa00722318cd387396ca1736605e1248821cc0de3d3af8`; fixture `3c17143095913c59509b19ea66d9803ed52ca0d9be0f9908f48e90fd9d74ccf3`; compressed size 146 B |

Regenerate with the commands above when updating fixtures; do not require a system `zstd` for routine CI.
