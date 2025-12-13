// Browser test functions that can be used by all bundlers in browser environment
export async function testBase91() {
    try {
        const { Base91 } = await import('@hpcc-js/wasm-base91');

        // Load the WASM module
        const base91 = await Base91.load();

        // Test basic functionality
        const testString = "Hello, World!";
        const testBytes = new TextEncoder().encode(testString);
        const encoded = base91.encode(testBytes);
        const decoded = base91.decode(encoded);
        const decodedString = new TextDecoder().decode(decoded);

        if (decodedString !== testString) {
            throw new Error(`Base91 test failed: expected "${testString}", got "${decodedString}"`);
        }

        console.log('✓ Base91 test passed');
        Base91.unload();
        return true;
    } catch (error) {
        console.error('✗ Base91 test failed:', error.message);
        return false;
    }
}

export async function testGraphviz() {
    try {
        const { Graphviz } = await import('@hpcc-js/wasm-graphviz');

        // Load the WASM module
        const graphviz = await Graphviz.load();

        // Test basic DOT rendering
        const dot = 'digraph { a -> b }';
        const svg = graphviz.layout(dot, "svg");

        if (!svg || typeof svg !== 'string' || !svg.includes('<svg')) {
            throw new Error('Graphviz did not return valid SVG');
        }

        console.log('✓ Graphviz test passed');
        Graphviz.unload();
        return true;
    } catch (error) {
        console.error('✗ Graphviz test failed:', error.message);
        return false;
    }
}

export async function testZstd() {
    try {
        const { Zstd } = await import('@hpcc-js/wasm-zstd');

        // Load the WASM module
        const zstd = await Zstd.load();

        // Test compression and decompression
        const testString = "This is a test string for compression testing.";
        const testBytes = new TextEncoder().encode(testString);

        const compressed = zstd.compress(testBytes);
        const decompressed = zstd.decompress(compressed);
        const decompressedString = new TextDecoder().decode(decompressed);

        if (decompressedString !== testString) {
            throw new Error(`Zstd test failed: expected "${testString}", got "${decompressedString}"`);
        }

        console.log('✓ Zstd test passed');
        Zstd.unload();
        return true;
    } catch (error) {
        console.error('✗ Zstd test failed:', error.message);
        return false;
    }
}

export async function testExpat() {
    try {
        const { Expat } = await import('@hpcc-js/wasm-expat');

        // Load the WASM module
        const expat = await Expat.load();

        // Test XML parsing
        const xml = "<root><child attr=\"value\">content</child></root>";
        let elementCount = 0;
        let parsedContent = "";

        const callback = {
            startElement(tag, attrs) {
                elementCount++;
                if (tag === "child" && attrs.attr === "value") {
                    parsedContent = "found-child";
                }
            },
            endElement(tag) { /* no-op */ },
            characterData(content) {
                if (content.trim() === "content") {
                    parsedContent += "-content";
                }
            }
        };

        const result = expat.parse(xml, callback);

        if (!result || elementCount < 2 || parsedContent !== "found-child-content") {
            throw new Error('Expat parsing failed');
        }

        console.log('✓ Expat test passed');
        Expat.unload();
        return true;
    } catch (error) {
        console.error('✗ Expat test failed:', error.message);
        return false;
    }
}

export async function testDuckDB() {
    try {
        const { DuckDB } = await import('@hpcc-js/wasm-duckdb');

        // Load the WASM module
        const duckdb = await DuckDB.load();

        // Test basic SQL query
        const conn = duckdb.connect();
        const result = conn.query("SELECT 42 as answer");
        const resultStr = result.toString();
        if (!resultStr.includes("42")) {
            throw new Error('DuckDB query did not return expected result');
        }
        conn.close();

        console.log('✓ DuckDB test passed');
        DuckDB.unload();
        return true;
    } catch (error) {
        console.error('✗ DuckDB test failed:', error.message);
        return false;
    }
}

export async function testLlama() {
    try {
        const { Llama } = await import('@hpcc-js/wasm-llama');

        // Load the WASM module
        const llama = await Llama.load();

        // Test version (basic functionality test)
        const version = llama.version();

        if (!version || typeof version !== 'string' || version.length === 0) {
            throw new Error('Llama version check failed');
        }

        console.log('✓ Llama test passed');
        Llama.unload();
        return true;
    } catch (error) {
        console.error('✗ Llama test failed:', error.message);
        return false;
    }
}

export async function runAllTests() {
    console.log('Running bundler compatibility tests in browser...');
    const results = await Promise.all([
        testBase91(),
        testExpat(),
        testGraphviz(),
        testDuckDB(),
        testLlama(),
        testZstd()
    ]);

    const allPassed = results.every(result => result);

    if (allPassed) {
        console.log('\n🎉 All browser tests passed!');
        return true;
    } else {
        console.log('\n❌ Some browser tests failed!');
        return false;
    }
}

// Make functions available globally for browser testing
if (typeof window !== 'undefined') {
    window.testUtils = {
        testBase91,
        testExpat,
        testGraphviz,
        testDuckDB,
        testLlama,
        testZstd,
        runAllTests
    };
}
