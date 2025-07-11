# Package-Specific Patterns Quick Reference
*Usage patterns and API examples for all WASM packages*

This document provides quick reference patterns for each WASM package in the repository.

## Base91 Package (@hpcc-js/wasm-base91)
**Build time: Fast** | **Memory: Light** | **Dependencies: Minimal**

### Purpose
Base91 encoding/decoding for efficient binary-to-text conversion.

### Common Usage
```typescript
import { Base91 } from "@hpcc-js/wasm-base91";

const base91 = await Base91.load();
const encoded = base91.encode(new Uint8Array([1, 2, 3, 4]));
const decoded = base91.decode(encoded);
```

### Key Methods
- `encode(data: Uint8Array): string` - Encode binary data to Base91 string
- `decode(str: string): Uint8Array` - Decode Base91 string to binary data

## DuckDB Package (@hpcc-js/wasm-duckdb)
**Build time: Slow** | **Memory: Heavy** | **Dependencies: Complex**

### Purpose
Embedded SQL database for data analysis and queries.

### Common Usage
```typescript
import { DuckDB } from "@hpcc-js/wasm-duckdb";

const db = await DuckDB.load();
await db.query("CREATE TABLE users (id INTEGER, name VARCHAR)");
const result = await db.query("SELECT * FROM users");
```

### Key Methods
- `query(sql: string): Promise<QueryResult>` - Execute SQL query
- `insertJSON(table: string, data: object[]): Promise<void>` - Insert JSON data
- `insertCSV(table: string, csv: string): Promise<void>` - Insert CSV data

## Expat Package (@hpcc-js/wasm-expat)
**Build time: Fast** | **Memory: Light** | **Dependencies: Minimal**

### Purpose
Fast XML parsing for processing XML documents.

### Common Usage
```typescript
import { Expat } from "@hpcc-js/wasm-expat";

const expat = await Expat.load();
const result = expat.parse('<root><item>value</item></root>');
```

### Key Methods
- `parse(xml: string): object` - Parse XML string to JavaScript object
- `validate(xml: string): boolean` - Validate XML syntax

## Graphviz Package (@hpcc-js/wasm-graphviz)
**Build time: Medium** | **Memory: Medium** | **Dependencies: Moderate**

### Purpose
Graph visualization using DOT language.

### Common Usage
```typescript
import { Graphviz } from "@hpcc-js/wasm-graphviz";

const graphviz = await Graphviz.load();
const svg = graphviz.dot('digraph G { a -> b }');
```

### Key Methods
- `dot(dot: string): string` - Render using dot engine (hierarchical)
- `neato(dot: string): string` - Render using neato engine (force-directed)
- `layout(dot: string, format: Format, engine: Engine): string` - Full control

### Engine Types
- **dot**: Hierarchical/directed graphs
- **neato**: Undirected graphs, force-directed
- **fdp**: Force-directed with edge lengths
- **circo**: Circular layout
- **twopi**: Radial layout

## Llama Package (@hpcc-js/wasm-llama)
**Build time: Slow** | **Memory: Heavy** | **Dependencies: Complex**

### Purpose
AI model inference using Llama.cpp.

### Common Usage
```typescript
import { Llama } from "@hpcc-js/wasm-llama";

const llama = await Llama.load();
const response = await llama.generate("Hello, how are you?", {
    maxTokens: 100
});
```

### Key Methods
- `loadModel(modelData: Uint8Array): Promise<void>` - Load model
- `generate(prompt: string, options?: GenerateOptions): Promise<string>` - Generate text

## Zstd Package (@hpcc-js/wasm-zstd)
**Build time: Medium** | **Memory: Medium** | **Dependencies: Minimal**

### Purpose
Fast compression and decompression using Zstandard algorithm.

### Common Usage
```typescript
import { Zstd } from "@hpcc-js/wasm-zstd";

const zstd = await Zstd.load();
const compressed = zstd.compress(data);
const decompressed = zstd.decompress(compressed);
```

### Key Methods
- `compress(data: Uint8Array, level?: number): Uint8Array` - Compress data
- `decompress(data: Uint8Array): Uint8Array` - Decompress data

## Meta Package (@hpcc-js/wasm)
**Build time: N/A** | **Memory: N/A** | **Dependencies: All packages**

### Purpose
Backward compatibility package that re-exports all other packages.

### Common Usage
```typescript
// Import specific packages (recommended)
import { Graphviz } from "@hpcc-js/wasm/graphviz";
import { Zstd } from "@hpcc-js/wasm/zstd";

// Or import all (backward compatibility)
import { Graphviz, Zstd } from "@hpcc-js/wasm";
```

## Common Patterns Across All Packages

### Async Loading Pattern
```typescript
// All packages follow this pattern
const library = await LibraryName.load(options?);
```

### Error Handling
```typescript
try {
    const library = await LibraryName.load();
    const result = library.method(input);
} catch (error) {
    console.error("Library error:", error);
}
```

### Version Information
```typescript
const library = await LibraryName.load();
console.log("Version:", library.version());
```

### Memory Management
```typescript
// WASM instances handle memory automatically
// No explicit cleanup required in JavaScript
const library = await LibraryName.load();
// Use library...
// Memory freed when library goes out of scope
```

## Testing Patterns

### Basic Test Structure
```typescript
import { describe, it, expect } from "vitest";
import { LibraryName } from "@hpcc-js/wasm-packagename";

describe("LibraryName", () => {
    it("loads successfully", async () => {
        const lib = await LibraryName.load();
        expect(lib).toBeDefined();
        expect(lib.version()).toBeDefined();
    });

    it("basic functionality", async () => {
        const lib = await LibraryName.load();
        const result = lib.mainMethod("test input");
        expect(result).toBeDefined();
    });
});
```

### Browser vs Node.js Tests
```typescript
// Node.js specific test
import { describe, it, expect } from "vitest";

// Browser specific test (filename: *.browser.spec.ts)
describe("Browser environment", () => {
    it("works in browser", async () => {
        // Browser-specific logic
    });
});
```

## Performance Characteristics

### Loading Time
- **Fastest**: Base91, Expat (< 100ms)
- **Medium**: Zstd, Graphviz (100-500ms)
- **Slowest**: DuckDB, Llama (500ms-2s+, large WASM files)

### Memory Usage
- **Light**: Base91, Expat (< 10MB)
- **Medium**: Zstd, Graphviz (10-50MB)
- **Heavy**: DuckDB, Llama (50MB+)

### Build Complexity
- **Simple**: Base91, Expat, Zstd (minimal dependencies)
- **Moderate**: Graphviz (graphics libraries)  
- **Complex**: DuckDB, Llama (large codebases, many dependencies)

### Use Case Suitability
- **Real-time**: Base91, Zstd, Expat
- **Interactive**: Graphviz
- **Batch processing**: DuckDB, Llama

## Integration Examples

### Compression Pipeline
```typescript
const zstd = await Zstd.load();
const base91 = await Base91.load();

// Compress and encode
const compressed = zstd.compress(data);
const encoded = base91.encode(compressed);

// Decode and decompress
const decoded = base91.decode(encoded);
const decompressed = zstd.decompress(decoded);
```

### Data Visualization
```typescript
const duckdb = await DuckDB.load();
const graphviz = await Graphviz.load();

// Query data
const results = await duckdb.query("SELECT * FROM relationships");

// Generate graph
const dot = generateDotFromResults(results);
const svg = graphviz.dot(dot);
```

### Document Processing
```typescript
const expat = await Expat.load();
const zstd = await Zstd.load();

// Parse and compress
const parsed = expat.parse(xmlDocument);
const serialized = JSON.stringify(parsed);
const compressed = zstd.compress(new TextEncoder().encode(serialized));
```