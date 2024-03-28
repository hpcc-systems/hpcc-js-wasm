import{_ as a,c as s,o as t,a2 as e}from"./chunks/framework.cT481euY.js";const g=JSON.parse('{"title":"Class: Expat","description":"","frontmatter":{},"headers":[],"relativePath":"classes/expat.Expat.md","filePath":"classes/expat.Expat.md","lastUpdated":null}'),i={name:"classes/expat.Expat.md"},n=e(`<h1 id="class-expat" tabindex="-1">Class: Expat <a class="header-anchor" href="#class-expat" aria-label="Permalink to &quot;Class: Expat&quot;">​</a></h1><p><a href="/hpcc-js-wasm/modules/expat.html">expat</a>.Expat</p><p>Expat XML parser WASM library, provides a simplified wrapper around the Expat XML Parser library.</p><p>See <a href="https://libexpat.github.io/" target="_blank" rel="noreferrer">libexpat.github.io</a> for c++ details.</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { Expat } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;@hpcc-js/wasm/expat&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> expat</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Expat.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">load</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> xml</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \` </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">\\</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    &lt;root&gt;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &lt;child xxx=&quot;yyy&quot;&gt;content&lt;/child&gt;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    &lt;/root&gt;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> callback</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    startElement</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">tag</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">attrs</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) { console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;start&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, tag, attrs); },</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    endElement</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">tag</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) { console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;end&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, tag); },</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    characterData</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">content</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) { console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;characterData&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, content); }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">};</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">expat.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(xml, callback);</span></span></code></pre></div><h2 id="methods" tabindex="-1">Methods <a class="header-anchor" href="#methods" aria-label="Permalink to &quot;Methods&quot;">​</a></h2><h3 id="load" tabindex="-1">load <a class="header-anchor" href="#load" aria-label="Permalink to &quot;load&quot;">​</a></h3><p>▸ <strong>load</strong>(): <code>Promise</code>&lt;<a href="/hpcc-js-wasm/classes/expat.Expat.html"><code>Expat</code></a>&gt;</p><p>Compiles and instantiates the raw wasm.</p><div class="info custom-block"><p class="custom-block-title">INFO</p><p>In general WebAssembly compilation is disallowed on the main thread if the buffer size is larger than 4KB, hence forcing <code>load</code> to be asynchronous;</p></div><h4 id="returns" tabindex="-1">Returns <a class="header-anchor" href="#returns" aria-label="Permalink to &quot;Returns&quot;">​</a></h4><p><code>Promise</code>&lt;<a href="/hpcc-js-wasm/classes/expat.Expat.html"><code>Expat</code></a>&gt;</p><p>A promise to an instance of the Expat class.</p><h4 id="defined-in" tabindex="-1">Defined in <a class="header-anchor" href="#defined-in" aria-label="Permalink to &quot;Defined in&quot;">​</a></h4><p><a href="https://github.com/hpcc-systems/hpcc-js-wasm/blob/8f763fc/src-ts/expat.ts#L63" target="_blank" rel="noreferrer">expat.ts:63</a></p><hr><h3 id="unload" tabindex="-1">unload <a class="header-anchor" href="#unload" aria-label="Permalink to &quot;unload&quot;">​</a></h3><p>▸ <strong>unload</strong>(): <code>void</code></p><p>Unloades the compiled wasm instance.</p><h4 id="returns-1" tabindex="-1">Returns <a class="header-anchor" href="#returns-1" aria-label="Permalink to &quot;Returns&quot;">​</a></h4><p><code>void</code></p><h4 id="defined-in-1" tabindex="-1">Defined in <a class="header-anchor" href="#defined-in-1" aria-label="Permalink to &quot;Defined in&quot;">​</a></h4><p><a href="https://github.com/hpcc-systems/hpcc-js-wasm/blob/8f763fc/src-ts/expat.ts#L72" target="_blank" rel="noreferrer">expat.ts:72</a></p><hr><h3 id="version" tabindex="-1">version <a class="header-anchor" href="#version" aria-label="Permalink to &quot;version&quot;">​</a></h3><p>▸ <strong>version</strong>(): <code>string</code></p><h4 id="returns-2" tabindex="-1">Returns <a class="header-anchor" href="#returns-2" aria-label="Permalink to &quot;Returns&quot;">​</a></h4><p><code>string</code></p><p>The Expat c++ version</p><h4 id="defined-in-2" tabindex="-1">Defined in <a class="header-anchor" href="#defined-in-2" aria-label="Permalink to &quot;Defined in&quot;">​</a></h4><p><a href="https://github.com/hpcc-systems/hpcc-js-wasm/blob/8f763fc/src-ts/expat.ts#L80" target="_blank" rel="noreferrer">expat.ts:80</a></p><hr><h3 id="parse" tabindex="-1">parse <a class="header-anchor" href="#parse" aria-label="Permalink to &quot;parse&quot;">​</a></h3><p>▸ <strong>parse</strong>(<code>xml</code>, <code>callback</code>): <code>boolean</code></p><p>Parses the XML with suitable callbacks.</p><div class="tip custom-block"><p class="custom-block-title">TIP</p><p>The <em>IParser.characterData</em> callback method can get called several times for a single tag element.</p></div><h4 id="parameters" tabindex="-1">Parameters <a class="header-anchor" href="#parameters" aria-label="Permalink to &quot;Parameters&quot;">​</a></h4><table><thead><tr><th style="text-align:left;">Name</th><th style="text-align:left;">Type</th><th style="text-align:left;">Description</th></tr></thead><tbody><tr><td style="text-align:left;"><code>xml</code></td><td style="text-align:left;"><code>string</code></td><td style="text-align:left;">string containing XML</td></tr><tr><td style="text-align:left;"><code>callback</code></td><td style="text-align:left;"><a href="/hpcc-js-wasm/interfaces/expat.IParser.html"><code>IParser</code></a></td><td style="text-align:left;">Callback interface</td></tr></tbody></table><h4 id="returns-3" tabindex="-1">Returns <a class="header-anchor" href="#returns-3" aria-label="Permalink to &quot;Returns&quot;">​</a></h4><p><code>boolean</code></p><p><code>true</code>|<code>false</code> if the XML parse succeeds.</p><h4 id="defined-in-3" tabindex="-1">Defined in <a class="header-anchor" href="#defined-in-3" aria-label="Permalink to &quot;Defined in&quot;">​</a></h4><p><a href="https://github.com/hpcc-systems/hpcc-js-wasm/blob/8f763fc/src-ts/expat.ts#L95" target="_blank" rel="noreferrer">expat.ts:95</a></p>`,43),l=[n];function h(r,p,o,d,c,k){return t(),s("div",null,l)}const u=a(i,[["render",h]]);export{g as __pageData,u as default};