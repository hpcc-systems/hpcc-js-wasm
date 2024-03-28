import{_ as t,c as e,o as a,a2 as o}from"./chunks/framework.cT481euY.js";const u=JSON.parse('{"title":"Class: Graphviz","description":"","frontmatter":{},"headers":[],"relativePath":"classes/graphviz.Graphviz.md","filePath":"classes/graphviz.Graphviz.md","lastUpdated":null}'),r={name:"classes/graphviz.Graphviz.md"},d=o(`<h1 id="class-graphviz" tabindex="-1">Class: Graphviz <a class="header-anchor" href="#class-graphviz" aria-label="Permalink to &quot;Class: Graphviz&quot;">​</a></h1><p><a href="/hpcc-js-wasm/modules/graphviz.html">graphviz</a>.Graphviz</p><p>The Graphviz layout algorithms take descriptions of graphs in a simple text language, and make diagrams in useful formats, such as images and SVG for web pages or display in an interactive graph browser.</p><p>Graphviz has many useful features for concrete diagrams, such as options for colors, fonts, tabular node layouts, line styles, hyperlinks, and custom shapes.</p><p>See <a href="https://graphviz.org/" target="_blank" rel="noreferrer">graphviz.org</a> for more details.</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { Graphviz } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;@hpcc-js/wasm/graphviz&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> graphviz</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Graphviz.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">load</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> dot</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;digraph G { Hello -&gt; World }&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> svg</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> graphviz.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">dot</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(dot);</span></span></code></pre></div><h3 id="online-demos" tabindex="-1">Online Demos <a class="header-anchor" href="#online-demos" aria-label="Permalink to &quot;Online Demos&quot;">​</a></h3><ul><li><a href="https://raw.githack.com/hpcc-systems/hpcc-js-wasm/trunk/index.html" target="_blank" rel="noreferrer">https://raw.githack.com/hpcc-systems/hpcc-js-wasm/trunk/index.html</a></li><li><a href="https://observablehq.com/@gordonsmith/graphviz" target="_blank" rel="noreferrer">https://observablehq.com/@gordonsmith/graphviz</a></li></ul><h2 id="methods" tabindex="-1">Methods <a class="header-anchor" href="#methods" aria-label="Permalink to &quot;Methods&quot;">​</a></h2><h3 id="load" tabindex="-1">load <a class="header-anchor" href="#load" aria-label="Permalink to &quot;load&quot;">​</a></h3><p>▸ <strong>load</strong>(): <code>Promise</code>&lt;<a href="/hpcc-js-wasm/classes/graphviz.Graphviz.html"><code>Graphviz</code></a>&gt;</p><p>Compiles and instantiates the raw wasm.</p><div class="info custom-block"><p class="custom-block-title">INFO</p><p>In general WebAssembly compilation is disallowed on the main thread if the buffer size is larger than 4KB, hence forcing <code>load</code> to be asynchronous;</p></div><h4 id="returns" tabindex="-1">Returns <a class="header-anchor" href="#returns" aria-label="Permalink to &quot;Returns&quot;">​</a></h4><p><code>Promise</code>&lt;<a href="/hpcc-js-wasm/classes/graphviz.Graphviz.html"><code>Graphviz</code></a>&gt;</p><p>A promise to an instance of the Graphviz class.</p><h4 id="defined-in" tabindex="-1">Defined in <a class="header-anchor" href="#defined-in" aria-label="Permalink to &quot;Defined in&quot;">​</a></h4><p><a href="https://github.com/hpcc-systems/hpcc-js-wasm/blob/8f763fc/src-ts/graphviz.ts#L107" target="_blank" rel="noreferrer">graphviz.ts:107</a></p><hr><h3 id="unload" tabindex="-1">unload <a class="header-anchor" href="#unload" aria-label="Permalink to &quot;unload&quot;">​</a></h3><p>▸ <strong>unload</strong>(): <code>void</code></p><p>Unloades the compiled wasm instance.</p><h4 id="returns-1" tabindex="-1">Returns <a class="header-anchor" href="#returns-1" aria-label="Permalink to &quot;Returns&quot;">​</a></h4><p><code>void</code></p><h4 id="defined-in-1" tabindex="-1">Defined in <a class="header-anchor" href="#defined-in-1" aria-label="Permalink to &quot;Defined in&quot;">​</a></h4><p><a href="https://github.com/hpcc-systems/hpcc-js-wasm/blob/8f763fc/src-ts/graphviz.ts#L116" target="_blank" rel="noreferrer">graphviz.ts:116</a></p><hr><h3 id="version" tabindex="-1">version <a class="header-anchor" href="#version" aria-label="Permalink to &quot;version&quot;">​</a></h3><p>▸ <strong>version</strong>(): <code>string</code></p><h4 id="returns-2" tabindex="-1">Returns <a class="header-anchor" href="#returns-2" aria-label="Permalink to &quot;Returns&quot;">​</a></h4><p><code>string</code></p><p>The Graphviz c++ version</p><h4 id="defined-in-2" tabindex="-1">Defined in <a class="header-anchor" href="#defined-in-2" aria-label="Permalink to &quot;Defined in&quot;">​</a></h4><p><a href="https://github.com/hpcc-systems/hpcc-js-wasm/blob/8f763fc/src-ts/graphviz.ts#L123" target="_blank" rel="noreferrer">graphviz.ts:123</a></p><hr><h3 id="layout" tabindex="-1">layout <a class="header-anchor" href="#layout" aria-label="Permalink to &quot;layout&quot;">​</a></h3><p>▸ <strong>layout</strong>(<code>dotSource</code>, <code>outputFormat?</code>, <code>layoutEngine?</code>, <code>options?</code>): <code>string</code></p><p>Performs layout for the supplied <em>dotSource</em>, see <a href="https://graphviz.gitlab.io/doc/info/lang.html" target="_blank" rel="noreferrer">The DOT Language</a> for specification.</p><h4 id="parameters" tabindex="-1">Parameters <a class="header-anchor" href="#parameters" aria-label="Permalink to &quot;Parameters&quot;">​</a></h4><table><thead><tr><th style="text-align:left;">Name</th><th style="text-align:left;">Type</th><th style="text-align:left;">Default value</th><th style="text-align:left;">Description</th></tr></thead><tbody><tr><td style="text-align:left;"><code>dotSource</code></td><td style="text-align:left;"><code>string</code></td><td style="text-align:left;"><code>undefined</code></td><td style="text-align:left;">Required - graph definition in <a href="https://graphviz.gitlab.io/doc/info/lang.html" target="_blank" rel="noreferrer">DOT</a> language</td></tr><tr><td style="text-align:left;"><code>outputFormat</code></td><td style="text-align:left;"><a href="/hpcc-js-wasm/modules/graphviz.html#format"><code>Format</code></a></td><td style="text-align:left;"><code>&quot;svg&quot;</code></td><td style="text-align:left;">The format of the result.</td></tr><tr><td style="text-align:left;"><code>layoutEngine</code></td><td style="text-align:left;"><a href="/hpcc-js-wasm/modules/graphviz.html#engine"><code>Engine</code></a></td><td style="text-align:left;"><code>&quot;dot&quot;</code></td><td style="text-align:left;">The type of layout to perform.</td></tr><tr><td style="text-align:left;"><code>options?</code></td><td style="text-align:left;"><a href="/hpcc-js-wasm/interfaces/graphviz.Options.html"><code>Options</code></a></td><td style="text-align:left;"><code>undefined</code></td><td style="text-align:left;">Advanced Options for images, files, yInvert and nop.</td></tr></tbody></table><h4 id="returns-3" tabindex="-1">Returns <a class="header-anchor" href="#returns-3" aria-label="Permalink to &quot;Returns&quot;">​</a></h4><p><code>string</code></p><p>A string containing the calculated layout in the format specified by <code>outputFormat</code></p><h4 id="defined-in-3" tabindex="-1">Defined in <a class="header-anchor" href="#defined-in-3" aria-label="Permalink to &quot;Defined in&quot;">​</a></h4><p><a href="https://github.com/hpcc-systems/hpcc-js-wasm/blob/8f763fc/src-ts/graphviz.ts#L136" target="_blank" rel="noreferrer">graphviz.ts:136</a></p><hr><h3 id="acyclic" tabindex="-1">acyclic <a class="header-anchor" href="#acyclic" aria-label="Permalink to &quot;acyclic&quot;">​</a></h3><p>▸ <strong>acyclic</strong>(<code>dotSource</code>, <code>doWrite?</code>, <code>verbose?</code>): <code>Object</code></p><p>acyclic is a filter that takes a directed graph as input and outputs a copy of the graph with sufficient edges reversed to make the graph acyclic. The reversed edge inherits all of the attributes of the original edge. The optional file argument specifies where the input graph is stored; by default.</p><h4 id="parameters-1" tabindex="-1">Parameters <a class="header-anchor" href="#parameters-1" aria-label="Permalink to &quot;Parameters&quot;">​</a></h4><table><thead><tr><th style="text-align:left;">Name</th><th style="text-align:left;">Type</th><th style="text-align:left;">Default value</th><th style="text-align:left;">Description</th></tr></thead><tbody><tr><td style="text-align:left;"><code>dotSource</code></td><td style="text-align:left;"><code>string</code></td><td style="text-align:left;"><code>undefined</code></td><td style="text-align:left;">Required - graph definition in <a href="https://graphviz.gitlab.io/doc/info/lang.html" target="_blank" rel="noreferrer">DOT</a> language</td></tr><tr><td style="text-align:left;"><code>doWrite</code></td><td style="text-align:left;"><code>boolean</code></td><td style="text-align:left;"><code>false</code></td><td style="text-align:left;">Enable output is produced, though the return value will indicate whether the graph is acyclic or not.</td></tr><tr><td style="text-align:left;"><code>verbose</code></td><td style="text-align:left;"><code>boolean</code></td><td style="text-align:left;"><code>false</code></td><td style="text-align:left;">Print information about whether the file is acyclic, has a cycle or is undirected.</td></tr></tbody></table><h4 id="returns-4" tabindex="-1">Returns <a class="header-anchor" href="#returns-4" aria-label="Permalink to &quot;Returns&quot;">​</a></h4><p><code>Object</code></p><p><code>{ acyclic: boolean, num_rev: number, outFile: string }</code> <code>acyclic</code> will be true if a cycle was found, <code>num_rev</code> will contain the number of reversed edges and <code>outFile</code> will (optionally) contain the output.</p><table><thead><tr><th style="text-align:left;">Name</th><th style="text-align:left;">Type</th></tr></thead><tbody><tr><td style="text-align:left;"><code>acyclic</code></td><td style="text-align:left;"><code>boolean</code></td></tr><tr><td style="text-align:left;"><code>num_rev</code></td><td style="text-align:left;"><code>number</code></td></tr><tr><td style="text-align:left;"><code>outFile</code></td><td style="text-align:left;"><code>string</code></td></tr></tbody></table><h4 id="defined-in-4" tabindex="-1">Defined in <a class="header-anchor" href="#defined-in-4" aria-label="Permalink to &quot;Defined in&quot;">​</a></h4><p><a href="https://github.com/hpcc-systems/hpcc-js-wasm/blob/8f763fc/src-ts/graphviz.ts#L167" target="_blank" rel="noreferrer">graphviz.ts:167</a></p><hr><h3 id="tred" tabindex="-1">tred <a class="header-anchor" href="#tred" aria-label="Permalink to &quot;tred&quot;">​</a></h3><p>▸ <strong>tred</strong>(<code>dotSource</code>, <code>verbose?</code>, <code>printRemovedEdges?</code>): <code>Object</code></p><p>tred computes the transitive reduction of directed graphs, and prints the resulting graphs to standard output. This removes edges implied by transitivity. Nodes and subgraphs are not otherwise affected. The ‘‘meaning’’ and validity of the reduced graphs is application dependent. tred is particularly useful as a preprocessor to dot to reduce clutter in dense layouts. Undirected graphs are silently ignored.</p><h4 id="parameters-2" tabindex="-1">Parameters <a class="header-anchor" href="#parameters-2" aria-label="Permalink to &quot;Parameters&quot;">​</a></h4><table><thead><tr><th style="text-align:left;">Name</th><th style="text-align:left;">Type</th><th style="text-align:left;">Default value</th><th style="text-align:left;">Description</th></tr></thead><tbody><tr><td style="text-align:left;"><code>dotSource</code></td><td style="text-align:left;"><code>string</code></td><td style="text-align:left;"><code>undefined</code></td><td style="text-align:left;">Required - graph definition in <a href="https://graphviz.gitlab.io/doc/info/lang.html" target="_blank" rel="noreferrer">DOT</a> language</td></tr><tr><td style="text-align:left;"><code>verbose</code></td><td style="text-align:left;"><code>boolean</code></td><td style="text-align:left;"><code>false</code></td><td style="text-align:left;">Print additional information.</td></tr><tr><td style="text-align:left;"><code>printRemovedEdges</code></td><td style="text-align:left;"><code>boolean</code></td><td style="text-align:left;"><code>false</code></td><td style="text-align:left;">Print information about removed edges.</td></tr></tbody></table><h4 id="returns-5" tabindex="-1">Returns <a class="header-anchor" href="#returns-5" aria-label="Permalink to &quot;Returns&quot;">​</a></h4><p><code>Object</code></p><p><code>{ out: string, err: string }</code>.</p><table><thead><tr><th style="text-align:left;">Name</th><th style="text-align:left;">Type</th></tr></thead><tbody><tr><td style="text-align:left;"><code>out</code></td><td style="text-align:left;"><code>string</code></td></tr><tr><td style="text-align:left;"><code>err</code></td><td style="text-align:left;"><code>string</code></td></tr></tbody></table><h4 id="defined-in-5" tabindex="-1">Defined in <a class="header-anchor" href="#defined-in-5" aria-label="Permalink to &quot;Defined in&quot;">​</a></h4><p><a href="https://github.com/hpcc-systems/hpcc-js-wasm/blob/8f763fc/src-ts/graphviz.ts#L201" target="_blank" rel="noreferrer">graphviz.ts:201</a></p><hr><h3 id="unflatten" tabindex="-1">unflatten <a class="header-anchor" href="#unflatten" aria-label="Permalink to &quot;unflatten&quot;">​</a></h3><p>▸ <strong>unflatten</strong>(<code>dotSource</code>, <code>maxMinlen?</code>, <code>do_fans?</code>, <code>chainLimit?</code>): <code>string</code></p><p>unflatten is a preprocessor to dot that is used to improve the aspect ratio of graphs having many leaves or disconnected nodes. The usual layout for such a graph is generally very wide or tall. unflatten inserts invisible edges or adjusts the minlen on edges to improve layout compaction.</p><h4 id="parameters-3" tabindex="-1">Parameters <a class="header-anchor" href="#parameters-3" aria-label="Permalink to &quot;Parameters&quot;">​</a></h4><table><thead><tr><th style="text-align:left;">Name</th><th style="text-align:left;">Type</th><th style="text-align:left;">Default value</th><th style="text-align:left;">Description</th></tr></thead><tbody><tr><td style="text-align:left;"><code>dotSource</code></td><td style="text-align:left;"><code>string</code></td><td style="text-align:left;"><code>undefined</code></td><td style="text-align:left;">Required - graph definition in <a href="https://graphviz.gitlab.io/doc/info/lang.html" target="_blank" rel="noreferrer">DOT</a> language</td></tr><tr><td style="text-align:left;"><code>maxMinlen</code></td><td style="text-align:left;"><code>number</code></td><td style="text-align:left;"><code>0</code></td><td style="text-align:left;">The minimum length of leaf edges is staggered between 1 and len (a small integer).</td></tr><tr><td style="text-align:left;"><code>do_fans</code></td><td style="text-align:left;"><code>boolean</code></td><td style="text-align:left;"><code>false</code></td><td style="text-align:left;">Enables the staggering of the -maxMinlen option to fanout nodes whose indegree and outdegree are both 1. This helps with structures such as a -&gt; {w x y } -&gt; b. This option only works if the -maxMinlen flag is set.</td></tr><tr><td style="text-align:left;"><code>chainLimit</code></td><td style="text-align:left;"><code>number</code></td><td style="text-align:left;"><code>0</code></td><td style="text-align:left;">Form disconnected nodes into chains of up to len nodes.</td></tr></tbody></table><h4 id="returns-6" tabindex="-1">Returns <a class="header-anchor" href="#returns-6" aria-label="Permalink to &quot;Returns&quot;">​</a></h4><p><code>string</code></p><p>A string containing the &quot;unflattened&quot; dotSource.</p><h4 id="defined-in-6" tabindex="-1">Defined in <a class="header-anchor" href="#defined-in-6" aria-label="Permalink to &quot;Defined in&quot;">​</a></h4><p><a href="https://github.com/hpcc-systems/hpcc-js-wasm/blob/8f763fc/src-ts/graphviz.ts#L235" target="_blank" rel="noreferrer">graphviz.ts:235</a></p><hr><h3 id="circo" tabindex="-1">circo <a class="header-anchor" href="#circo" aria-label="Permalink to &quot;circo&quot;">​</a></h3><p>▸ <strong>circo</strong>(<code>dotSource</code>, <code>outputFormat?</code>, <code>options?</code>): <code>string</code></p><p>Convenience function that performs the <strong>circo</strong> layout, is equivalent to <code>layout(dotSource, outputFormat, &quot;circo&quot;);</code>.</p><h4 id="parameters-4" tabindex="-1">Parameters <a class="header-anchor" href="#parameters-4" aria-label="Permalink to &quot;Parameters&quot;">​</a></h4><table><thead><tr><th style="text-align:left;">Name</th><th style="text-align:left;">Type</th><th style="text-align:left;">Default value</th><th style="text-align:left;">Description</th></tr></thead><tbody><tr><td style="text-align:left;"><code>dotSource</code></td><td style="text-align:left;"><code>string</code></td><td style="text-align:left;"><code>undefined</code></td><td style="text-align:left;">Required - graph definition in <a href="https://graphviz.gitlab.io/doc/info/lang.html" target="_blank" rel="noreferrer">DOT</a> language</td></tr><tr><td style="text-align:left;"><code>outputFormat</code></td><td style="text-align:left;"><a href="/hpcc-js-wasm/modules/graphviz.html#format"><code>Format</code></a></td><td style="text-align:left;"><code>&quot;svg&quot;</code></td><td style="text-align:left;">The format of the result.</td></tr><tr><td style="text-align:left;"><code>options?</code></td><td style="text-align:left;"><a href="/hpcc-js-wasm/interfaces/graphviz.Options.html"><code>Options</code></a></td><td style="text-align:left;"><code>undefined</code></td><td style="text-align:left;">Advanced Options for images, files, yInvert and nop.</td></tr></tbody></table><h4 id="returns-7" tabindex="-1">Returns <a class="header-anchor" href="#returns-7" aria-label="Permalink to &quot;Returns&quot;">​</a></h4><p><code>string</code></p><p>A string containing the calculated layout in the format specified by <code>outputFormat</code></p><h4 id="defined-in-7" tabindex="-1">Defined in <a class="header-anchor" href="#defined-in-7" aria-label="Permalink to &quot;Defined in&quot;">​</a></h4><p><a href="https://github.com/hpcc-systems/hpcc-js-wasm/blob/8f763fc/src-ts/graphviz.ts#L265" target="_blank" rel="noreferrer">graphviz.ts:265</a></p><hr><h3 id="dot" tabindex="-1">dot <a class="header-anchor" href="#dot" aria-label="Permalink to &quot;dot&quot;">​</a></h3><p>▸ <strong>dot</strong>(<code>dotSource</code>, <code>outputFormat?</code>, <code>options?</code>): <code>string</code></p><p>Convenience function that performs the <strong>dot</strong> layout, is equivalent to <code>layout(dotSource, outputFormat, &quot;dot&quot;);</code>.</p><h4 id="parameters-5" tabindex="-1">Parameters <a class="header-anchor" href="#parameters-5" aria-label="Permalink to &quot;Parameters&quot;">​</a></h4><table><thead><tr><th style="text-align:left;">Name</th><th style="text-align:left;">Type</th><th style="text-align:left;">Default value</th><th style="text-align:left;">Description</th></tr></thead><tbody><tr><td style="text-align:left;"><code>dotSource</code></td><td style="text-align:left;"><code>string</code></td><td style="text-align:left;"><code>undefined</code></td><td style="text-align:left;">Required - graph definition in <a href="https://graphviz.gitlab.io/doc/info/lang.html" target="_blank" rel="noreferrer">DOT</a> language</td></tr><tr><td style="text-align:left;"><code>outputFormat</code></td><td style="text-align:left;"><a href="/hpcc-js-wasm/modules/graphviz.html#format"><code>Format</code></a></td><td style="text-align:left;"><code>&quot;svg&quot;</code></td><td style="text-align:left;">The format of the result.</td></tr><tr><td style="text-align:left;"><code>options?</code></td><td style="text-align:left;"><a href="/hpcc-js-wasm/interfaces/graphviz.Options.html"><code>Options</code></a></td><td style="text-align:left;"><code>undefined</code></td><td style="text-align:left;">Advanced Options for images, files, yInvert and nop.</td></tr></tbody></table><h4 id="returns-8" tabindex="-1">Returns <a class="header-anchor" href="#returns-8" aria-label="Permalink to &quot;Returns&quot;">​</a></h4><p><code>string</code></p><p>A string containing the calculated layout in the format specified by <code>outputFormat</code></p><h4 id="defined-in-8" tabindex="-1">Defined in <a class="header-anchor" href="#defined-in-8" aria-label="Permalink to &quot;Defined in&quot;">​</a></h4><p><a href="https://github.com/hpcc-systems/hpcc-js-wasm/blob/8f763fc/src-ts/graphviz.ts#L277" target="_blank" rel="noreferrer">graphviz.ts:277</a></p><hr><h3 id="fdp" tabindex="-1">fdp <a class="header-anchor" href="#fdp" aria-label="Permalink to &quot;fdp&quot;">​</a></h3><p>▸ <strong>fdp</strong>(<code>dotSource</code>, <code>outputFormat?</code>, <code>options?</code>): <code>string</code></p><p>Convenience function that performs the <strong>fdp</strong> layout, is equivalent to <code>layout(dotSource, outputFormat, &quot;fdp&quot;);</code>.</p><h4 id="parameters-6" tabindex="-1">Parameters <a class="header-anchor" href="#parameters-6" aria-label="Permalink to &quot;Parameters&quot;">​</a></h4><table><thead><tr><th style="text-align:left;">Name</th><th style="text-align:left;">Type</th><th style="text-align:left;">Default value</th><th style="text-align:left;">Description</th></tr></thead><tbody><tr><td style="text-align:left;"><code>dotSource</code></td><td style="text-align:left;"><code>string</code></td><td style="text-align:left;"><code>undefined</code></td><td style="text-align:left;">Required - graph definition in <a href="https://graphviz.gitlab.io/doc/info/lang.html" target="_blank" rel="noreferrer">DOT</a> language</td></tr><tr><td style="text-align:left;"><code>outputFormat</code></td><td style="text-align:left;"><a href="/hpcc-js-wasm/modules/graphviz.html#format"><code>Format</code></a></td><td style="text-align:left;"><code>&quot;svg&quot;</code></td><td style="text-align:left;">The format of the result.</td></tr><tr><td style="text-align:left;"><code>options?</code></td><td style="text-align:left;"><a href="/hpcc-js-wasm/interfaces/graphviz.Options.html"><code>Options</code></a></td><td style="text-align:left;"><code>undefined</code></td><td style="text-align:left;">Advanced Options for images, files, yInvert and nop.</td></tr></tbody></table><h4 id="returns-9" tabindex="-1">Returns <a class="header-anchor" href="#returns-9" aria-label="Permalink to &quot;Returns&quot;">​</a></h4><p><code>string</code></p><p>A string containing the calculated layout in the format specified by <code>outputFormat</code></p><h4 id="defined-in-9" tabindex="-1">Defined in <a class="header-anchor" href="#defined-in-9" aria-label="Permalink to &quot;Defined in&quot;">​</a></h4><p><a href="https://github.com/hpcc-systems/hpcc-js-wasm/blob/8f763fc/src-ts/graphviz.ts#L289" target="_blank" rel="noreferrer">graphviz.ts:289</a></p><hr><h3 id="sfdp" tabindex="-1">sfdp <a class="header-anchor" href="#sfdp" aria-label="Permalink to &quot;sfdp&quot;">​</a></h3><p>▸ <strong>sfdp</strong>(<code>dotSource</code>, <code>outputFormat?</code>, <code>options?</code>): <code>string</code></p><p>Convenience function that performs the <strong>sfdp</strong> layout, is equivalent to <code>layout(dotSource, outputFormat, &quot;sfdp&quot;);</code>.</p><h4 id="parameters-7" tabindex="-1">Parameters <a class="header-anchor" href="#parameters-7" aria-label="Permalink to &quot;Parameters&quot;">​</a></h4><table><thead><tr><th style="text-align:left;">Name</th><th style="text-align:left;">Type</th><th style="text-align:left;">Default value</th><th style="text-align:left;">Description</th></tr></thead><tbody><tr><td style="text-align:left;"><code>dotSource</code></td><td style="text-align:left;"><code>string</code></td><td style="text-align:left;"><code>undefined</code></td><td style="text-align:left;">Required - graph definition in <a href="https://graphviz.gitlab.io/doc/info/lang.html" target="_blank" rel="noreferrer">DOT</a> language</td></tr><tr><td style="text-align:left;"><code>outputFormat</code></td><td style="text-align:left;"><a href="/hpcc-js-wasm/modules/graphviz.html#format"><code>Format</code></a></td><td style="text-align:left;"><code>&quot;svg&quot;</code></td><td style="text-align:left;">The format of the result.</td></tr><tr><td style="text-align:left;"><code>options?</code></td><td style="text-align:left;"><a href="/hpcc-js-wasm/interfaces/graphviz.Options.html"><code>Options</code></a></td><td style="text-align:left;"><code>undefined</code></td><td style="text-align:left;">Advanced Options for images, files, yInvert and nop.</td></tr></tbody></table><h4 id="returns-10" tabindex="-1">Returns <a class="header-anchor" href="#returns-10" aria-label="Permalink to &quot;Returns&quot;">​</a></h4><p><code>string</code></p><p>A string containing the calculated layout in the format specified by <code>outputFormat</code></p><h4 id="defined-in-10" tabindex="-1">Defined in <a class="header-anchor" href="#defined-in-10" aria-label="Permalink to &quot;Defined in&quot;">​</a></h4><p><a href="https://github.com/hpcc-systems/hpcc-js-wasm/blob/8f763fc/src-ts/graphviz.ts#L301" target="_blank" rel="noreferrer">graphviz.ts:301</a></p><hr><h3 id="neato" tabindex="-1">neato <a class="header-anchor" href="#neato" aria-label="Permalink to &quot;neato&quot;">​</a></h3><p>▸ <strong>neato</strong>(<code>dotSource</code>, <code>outputFormat?</code>, <code>options?</code>): <code>string</code></p><p>Convenience function that performs the <strong>neato</strong> layout, is equivalent to <code>layout(dotSource, outputFormat, &quot;neato&quot;);</code>.</p><h4 id="parameters-8" tabindex="-1">Parameters <a class="header-anchor" href="#parameters-8" aria-label="Permalink to &quot;Parameters&quot;">​</a></h4><table><thead><tr><th style="text-align:left;">Name</th><th style="text-align:left;">Type</th><th style="text-align:left;">Default value</th><th style="text-align:left;">Description</th></tr></thead><tbody><tr><td style="text-align:left;"><code>dotSource</code></td><td style="text-align:left;"><code>string</code></td><td style="text-align:left;"><code>undefined</code></td><td style="text-align:left;">Required - graph definition in <a href="https://graphviz.gitlab.io/doc/info/lang.html" target="_blank" rel="noreferrer">DOT</a> language</td></tr><tr><td style="text-align:left;"><code>outputFormat</code></td><td style="text-align:left;"><a href="/hpcc-js-wasm/modules/graphviz.html#format"><code>Format</code></a></td><td style="text-align:left;"><code>&quot;svg&quot;</code></td><td style="text-align:left;">The format of the result.</td></tr><tr><td style="text-align:left;"><code>options?</code></td><td style="text-align:left;"><a href="/hpcc-js-wasm/interfaces/graphviz.Options.html"><code>Options</code></a></td><td style="text-align:left;"><code>undefined</code></td><td style="text-align:left;">Advanced Options for images, files, yInvert and nop.</td></tr></tbody></table><h4 id="returns-11" tabindex="-1">Returns <a class="header-anchor" href="#returns-11" aria-label="Permalink to &quot;Returns&quot;">​</a></h4><p><code>string</code></p><p>A string containing the calculated layout in the format specified by <code>outputFormat</code></p><h4 id="defined-in-11" tabindex="-1">Defined in <a class="header-anchor" href="#defined-in-11" aria-label="Permalink to &quot;Defined in&quot;">​</a></h4><p><a href="https://github.com/hpcc-systems/hpcc-js-wasm/blob/8f763fc/src-ts/graphviz.ts#L313" target="_blank" rel="noreferrer">graphviz.ts:313</a></p><hr><h3 id="osage" tabindex="-1">osage <a class="header-anchor" href="#osage" aria-label="Permalink to &quot;osage&quot;">​</a></h3><p>▸ <strong>osage</strong>(<code>dotSource</code>, <code>outputFormat?</code>, <code>options?</code>): <code>string</code></p><p>Convenience function that performs the <strong>osage</strong> layout, is equivalent to <code>layout(dotSource, outputFormat, &quot;osage&quot;);</code>.</p><h4 id="parameters-9" tabindex="-1">Parameters <a class="header-anchor" href="#parameters-9" aria-label="Permalink to &quot;Parameters&quot;">​</a></h4><table><thead><tr><th style="text-align:left;">Name</th><th style="text-align:left;">Type</th><th style="text-align:left;">Default value</th><th style="text-align:left;">Description</th></tr></thead><tbody><tr><td style="text-align:left;"><code>dotSource</code></td><td style="text-align:left;"><code>string</code></td><td style="text-align:left;"><code>undefined</code></td><td style="text-align:left;">Required - graph definition in <a href="https://graphviz.gitlab.io/doc/info/lang.html" target="_blank" rel="noreferrer">DOT</a> language</td></tr><tr><td style="text-align:left;"><code>outputFormat</code></td><td style="text-align:left;"><a href="/hpcc-js-wasm/modules/graphviz.html#format"><code>Format</code></a></td><td style="text-align:left;"><code>&quot;svg&quot;</code></td><td style="text-align:left;">The format of the result.</td></tr><tr><td style="text-align:left;"><code>options?</code></td><td style="text-align:left;"><a href="/hpcc-js-wasm/interfaces/graphviz.Options.html"><code>Options</code></a></td><td style="text-align:left;"><code>undefined</code></td><td style="text-align:left;">Advanced Options for images, files, yInvert and nop.</td></tr></tbody></table><h4 id="returns-12" tabindex="-1">Returns <a class="header-anchor" href="#returns-12" aria-label="Permalink to &quot;Returns&quot;">​</a></h4><p><code>string</code></p><p>A string containing the calculated layout in the format specified by <code>outputFormat</code></p><h4 id="defined-in-12" tabindex="-1">Defined in <a class="header-anchor" href="#defined-in-12" aria-label="Permalink to &quot;Defined in&quot;">​</a></h4><p><a href="https://github.com/hpcc-systems/hpcc-js-wasm/blob/8f763fc/src-ts/graphviz.ts#L325" target="_blank" rel="noreferrer">graphviz.ts:325</a></p><hr><h3 id="patchwork" tabindex="-1">patchwork <a class="header-anchor" href="#patchwork" aria-label="Permalink to &quot;patchwork&quot;">​</a></h3><p>▸ <strong>patchwork</strong>(<code>dotSource</code>, <code>outputFormat?</code>, <code>options?</code>): <code>string</code></p><p>Convenience function that performs the <strong>patchwork</strong> layout, is equivalent to <code>layout(dotSource, outputFormat, &quot;patchwork&quot;);</code>.</p><h4 id="parameters-10" tabindex="-1">Parameters <a class="header-anchor" href="#parameters-10" aria-label="Permalink to &quot;Parameters&quot;">​</a></h4><table><thead><tr><th style="text-align:left;">Name</th><th style="text-align:left;">Type</th><th style="text-align:left;">Default value</th><th style="text-align:left;">Description</th></tr></thead><tbody><tr><td style="text-align:left;"><code>dotSource</code></td><td style="text-align:left;"><code>string</code></td><td style="text-align:left;"><code>undefined</code></td><td style="text-align:left;">Required - graph definition in <a href="https://graphviz.gitlab.io/doc/info/lang.html" target="_blank" rel="noreferrer">DOT</a> language</td></tr><tr><td style="text-align:left;"><code>outputFormat</code></td><td style="text-align:left;"><a href="/hpcc-js-wasm/modules/graphviz.html#format"><code>Format</code></a></td><td style="text-align:left;"><code>&quot;svg&quot;</code></td><td style="text-align:left;">The format of the result.</td></tr><tr><td style="text-align:left;"><code>options?</code></td><td style="text-align:left;"><a href="/hpcc-js-wasm/interfaces/graphviz.Options.html"><code>Options</code></a></td><td style="text-align:left;"><code>undefined</code></td><td style="text-align:left;">Advanced Options for images, files, yInvert and nop.</td></tr></tbody></table><h4 id="returns-13" tabindex="-1">Returns <a class="header-anchor" href="#returns-13" aria-label="Permalink to &quot;Returns&quot;">​</a></h4><p><code>string</code></p><p>A string containing the calculated layout in the format specified by <code>outputFormat</code></p><h4 id="defined-in-13" tabindex="-1">Defined in <a class="header-anchor" href="#defined-in-13" aria-label="Permalink to &quot;Defined in&quot;">​</a></h4><p><a href="https://github.com/hpcc-systems/hpcc-js-wasm/blob/8f763fc/src-ts/graphviz.ts#L337" target="_blank" rel="noreferrer">graphviz.ts:337</a></p><hr><h3 id="twopi" tabindex="-1">twopi <a class="header-anchor" href="#twopi" aria-label="Permalink to &quot;twopi&quot;">​</a></h3><p>▸ <strong>twopi</strong>(<code>dotSource</code>, <code>outputFormat?</code>, <code>options?</code>): <code>string</code></p><p>Convenience function that performs the <strong>twopi</strong> layout, is equivalent to <code>layout(dotSource, outputFormat, &quot;twopi&quot;);</code>.</p><h4 id="parameters-11" tabindex="-1">Parameters <a class="header-anchor" href="#parameters-11" aria-label="Permalink to &quot;Parameters&quot;">​</a></h4><table><thead><tr><th style="text-align:left;">Name</th><th style="text-align:left;">Type</th><th style="text-align:left;">Default value</th><th style="text-align:left;">Description</th></tr></thead><tbody><tr><td style="text-align:left;"><code>dotSource</code></td><td style="text-align:left;"><code>string</code></td><td style="text-align:left;"><code>undefined</code></td><td style="text-align:left;">Required - graph definition in <a href="https://graphviz.gitlab.io/doc/info/lang.html" target="_blank" rel="noreferrer">DOT</a> language</td></tr><tr><td style="text-align:left;"><code>outputFormat</code></td><td style="text-align:left;"><a href="/hpcc-js-wasm/modules/graphviz.html#format"><code>Format</code></a></td><td style="text-align:left;"><code>&quot;svg&quot;</code></td><td style="text-align:left;">The format of the result.</td></tr><tr><td style="text-align:left;"><code>options?</code></td><td style="text-align:left;"><a href="/hpcc-js-wasm/interfaces/graphviz.Options.html"><code>Options</code></a></td><td style="text-align:left;"><code>undefined</code></td><td style="text-align:left;">Advanced Options for images, files, yInvert and nop.</td></tr></tbody></table><h4 id="returns-14" tabindex="-1">Returns <a class="header-anchor" href="#returns-14" aria-label="Permalink to &quot;Returns&quot;">​</a></h4><p><code>string</code></p><p>A string containing the calculated layout in the format specified by <code>outputFormat</code></p><h4 id="defined-in-14" tabindex="-1">Defined in <a class="header-anchor" href="#defined-in-14" aria-label="Permalink to &quot;Defined in&quot;">​</a></h4><p><a href="https://github.com/hpcc-systems/hpcc-js-wasm/blob/8f763fc/src-ts/graphviz.ts#L349" target="_blank" rel="noreferrer">graphviz.ts:349</a></p><hr><h3 id="nop" tabindex="-1">nop <a class="header-anchor" href="#nop" aria-label="Permalink to &quot;nop&quot;">​</a></h3><p>▸ <strong>nop</strong>(<code>dotSource</code>): <code>string</code></p><p>Convenience function that performs the <strong>nop</strong> layout, is equivalent to <code>layout(dotSource, &quot;dot&quot;, &quot;nop&quot;);</code>.</p><h4 id="parameters-12" tabindex="-1">Parameters <a class="header-anchor" href="#parameters-12" aria-label="Permalink to &quot;Parameters&quot;">​</a></h4><table><thead><tr><th style="text-align:left;">Name</th><th style="text-align:left;">Type</th><th style="text-align:left;">Description</th></tr></thead><tbody><tr><td style="text-align:left;"><code>dotSource</code></td><td style="text-align:left;"><code>string</code></td><td style="text-align:left;">Required - graph definition in <a href="https://graphviz.gitlab.io/doc/info/lang.html" target="_blank" rel="noreferrer">DOT</a> language</td></tr></tbody></table><h4 id="returns-15" tabindex="-1">Returns <a class="header-anchor" href="#returns-15" aria-label="Permalink to &quot;Returns&quot;">​</a></h4><p><code>string</code></p><p>A string containing the &quot;pretty printed&quot; dotSource.</p><h4 id="defined-in-15" tabindex="-1">Defined in <a class="header-anchor" href="#defined-in-15" aria-label="Permalink to &quot;Defined in&quot;">​</a></h4><p><a href="https://github.com/hpcc-systems/hpcc-js-wasm/blob/8f763fc/src-ts/graphviz.ts#L359" target="_blank" rel="noreferrer">graphviz.ts:359</a></p><hr><h3 id="nop2" tabindex="-1">nop2 <a class="header-anchor" href="#nop2" aria-label="Permalink to &quot;nop2&quot;">​</a></h3><p>▸ <strong>nop2</strong>(<code>dotSource</code>): <code>string</code></p><p>Convenience function that performs the <strong>nop2</strong> layout, is equivalent to <code>layout(dotSource, &quot;dot&quot;, &quot;nop2&quot;);</code>.</p><h4 id="parameters-13" tabindex="-1">Parameters <a class="header-anchor" href="#parameters-13" aria-label="Permalink to &quot;Parameters&quot;">​</a></h4><table><thead><tr><th style="text-align:left;">Name</th><th style="text-align:left;">Type</th><th style="text-align:left;">Description</th></tr></thead><tbody><tr><td style="text-align:left;"><code>dotSource</code></td><td style="text-align:left;"><code>string</code></td><td style="text-align:left;">Required - graph definition in <a href="https://graphviz.gitlab.io/doc/info/lang.html" target="_blank" rel="noreferrer">DOT</a> language</td></tr></tbody></table><h4 id="returns-16" tabindex="-1">Returns <a class="header-anchor" href="#returns-16" aria-label="Permalink to &quot;Returns&quot;">​</a></h4><p><code>string</code></p><p>A string containing the &quot;pretty printed&quot; dotSource.</p><h4 id="defined-in-16" tabindex="-1">Defined in <a class="header-anchor" href="#defined-in-16" aria-label="Permalink to &quot;Defined in&quot;">​</a></h4><p><a href="https://github.com/hpcc-systems/hpcc-js-wasm/blob/8f763fc/src-ts/graphviz.ts#L369" target="_blank" rel="noreferrer">graphviz.ts:369</a></p>`,190),l=[d];function i(n,s,c,h,p,f){return a(),e("div",null,l)}const m=t(r,[["render",i]]);export{u as __pageData,m as default};