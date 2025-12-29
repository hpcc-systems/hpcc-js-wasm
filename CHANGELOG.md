# Mono Repo Note:

_This repository was converted to a mono repo as off `@hpcc-js/wasm v2.19.0` and the @hpcc-js/wasm [changelog](packages/wasm/CHANGELOG.md) is now maintained in the `packages/wasm` folder, see:  [packages/wasm/CHANGELOG.md](packages/wasm/CHANGELOG.md)._

_This changelog is now a summary of all changes across all packages in the mono repo under the private name of `@hpcc-js/wasm-root`._

# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [4.3.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/wasm-root-v4.2.0...wasm-root-v4.3.0) (2025-12-29)


### Features

* add semaphore support and extend DuckDB tests for linked extensions ([e17f929](https://github.com/hpcc-systems/hpcc-js-wasm/commit/e17f9296f0ac2ad458b873109e90b324bd618561))
* bump duckdb and use our own wrappers ([53a950d](https://github.com/hpcc-systems/hpcc-js-wasm/commit/53a950d2c7f0f80edb31ec7d19dcd4297a6a0346))
* enable  -msimd128 for all packages ([29e7f3e](https://github.com/hpcc-systems/hpcc-js-wasm/commit/29e7f3e481f3cc628d41aa604620c777902b7116))
* make vcpkg a submodule ([6fb0c32](https://github.com/hpcc-systems/hpcc-js-wasm/commit/6fb0c32dfdf254ab41999cc17ca234363fb597f0))
* refactor build and build duckdb from source files ([e1d11f5](https://github.com/hpcc-systems/hpcc-js-wasm/commit/e1d11f57ba7934dad9193301edbc2056126cdb84))
* switch to embind instead of idl ([08829d2](https://github.com/hpcc-systems/hpcc-js-wasm/commit/08829d2820860d087fb77f853da89834d98fc213))


### Bug Fixes

* add binary caching to github runners ([a20ee17](https://github.com/hpcc-systems/hpcc-js-wasm/commit/a20ee17c73f073763d08f40b149e91b0cde53d9a))

## [4.2.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/wasm-root-v4.1.0...wasm-root-v4.2.0) (2025-12-11)


### Features

* bump versions ([#341](https://github.com/hpcc-systems/hpcc-js-wasm/issues/341)) ([57116a4](https://github.com/hpcc-systems/hpcc-js-wasm/commit/57116a407c47332d996d3da508cc70ffe068fce0))
* update graphviz version to 14.1.0 and bump related dependencies ([#343](https://github.com/hpcc-systems/hpcc-js-wasm/issues/343)) ([b86776d](https://github.com/hpcc-systems/hpcc-js-wasm/commit/b86776d225511311fb73d2cc969c2e5db5034604))


### Bug Fixes

* @hpcc-js/wasm does not include sub-package types ([#344](https://github.com/hpcc-systems/hpcc-js-wasm/issues/344)) ([38b0c51](https://github.com/hpcc-systems/hpcc-js-wasm/commit/38b0c51070ea979e9d26d593473d3b180bb357e5)), closes [#340](https://github.com/hpcc-systems/hpcc-js-wasm/issues/340)
* update macOS version in CI matrix to include macos-15 ([#345](https://github.com/hpcc-systems/hpcc-js-wasm/issues/345)) ([c1191b2](https://github.com/hpcc-systems/hpcc-js-wasm/commit/c1191b26363c7cca3cf2288020ab4afd10c541d9))

## [4.1.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/wasm-root-v4.0.0...wasm-root-v4.1.0) (2025-11-23)


### Features

* bump versions ([#335](https://github.com/hpcc-systems/hpcc-js-wasm/issues/335)) ([aeb395b](https://github.com/hpcc-systems/hpcc-js-wasm/commit/aeb395b6dc2c4683361c1093102721a34a204803))

## [4.0.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/wasm-root-v3.13.0...wasm-root-v4.0.0) (2025-10-20)


### ⚠ BREAKING CHANGES

* Refactor public interfaces to follow common pattern Start using sfx-wasm bundler

### Features

* Add acyclic and tred support ([eeab5db](https://github.com/hpcc-systems/hpcc-js-wasm/commit/eeab5db414e1a6bc535995a68d37aecbaf549f50))
* Add acyclic and tred support ([dc1dd27](https://github.com/hpcc-systems/hpcc-js-wasm/commit/dc1dd2761f97e959498984bef7815f3cfe3ac565)), closes [#210](https://github.com/hpcc-systems/hpcc-js-wasm/issues/210)
* Add additional options to CLI ([43f2a78](https://github.com/hpcc-systems/hpcc-js-wasm/commit/43f2a78cf390872dc2e035cf10ff75705d475225))
* Add additional options to CLI ([b05598b](https://github.com/hpcc-systems/hpcc-js-wasm/commit/b05598b134296c67b1895725f72a4f0bec6cc64f)), closes [#98](https://github.com/hpcc-systems/hpcc-js-wasm/issues/98)
* Add Base91 wasm ([18dd2cc](https://github.com/hpcc-systems/hpcc-js-wasm/commit/18dd2cc6584a4104aa5fe639e80e7523e10581a8))
* Add Base91 wasm ([7063b76](https://github.com/hpcc-systems/hpcc-js-wasm/commit/7063b76de652272912d47981e4584431d3eae8e0))
* Add Command Line Interface ([120fe68](https://github.com/hpcc-systems/hpcc-js-wasm/commit/120fe68f98a216630f48819836c127f4e9dba6ba))
* Add Command Line Interface ([caa0b11](https://github.com/hpcc-systems/hpcc-js-wasm/commit/caa0b119100a3fa915cedd9bc4ed567fc16b2f2a))
* Add DuckDB Support ([a56bb05](https://github.com/hpcc-systems/hpcc-js-wasm/commit/a56bb055282c8c8110249b6b6f74664a8be08a9f))
* Add DuckDB Support ([005adf6](https://github.com/hpcc-systems/hpcc-js-wasm/commit/005adf6fc8785eaf5e466caaca0921af5ffe97db))
* Add llama.cpp web assembly support ([9b802ae](https://github.com/hpcc-systems/hpcc-js-wasm/commit/9b802ae0481f1f9cca3197c9398fc1d1b35fe33b))
* Add llama.cpp web assembly support ([5602a88](https://github.com/hpcc-systems/hpcc-js-wasm/commit/5602a8889df432345d1370ce4dba919262ce6c34))
* Add nop and nop2 layout options ([9833b37](https://github.com/hpcc-systems/hpcc-js-wasm/commit/9833b372b88aa22b6ffcf6263da46d76d695463a))
* Add nop and nop2 layout options ([f71c4f1](https://github.com/hpcc-systems/hpcc-js-wasm/commit/f71c4f121105a872a02129c6d9c8d63f5d23317f))
* Add self extracting wasm "sfx-graphviz" ([a99f2d3](https://github.com/hpcc-systems/hpcc-js-wasm/commit/a99f2d341494930173ad2390e93e6d8033ca3bb4))
* Add self extracting wasm "sfx-graphviz" ([2bc80f8](https://github.com/hpcc-systems/hpcc-js-wasm/commit/2bc80f860f9ac7f358a94bc5d356ebe635737fd3))
* Add support for Node JS ([1fef565](https://github.com/hpcc-systems/hpcc-js-wasm/commit/1fef565a9ce7c2651092da2cf4ba26fc721785ab))
* Add support for Node JS ([d558687](https://github.com/hpcc-systems/hpcc-js-wasm/commit/d558687cca672df2fe8715b17da65025c7f96b2a))
* Add support for the `canon` output format ([66bc3bb](https://github.com/hpcc-systems/hpcc-js-wasm/commit/66bc3bb7f3d8b7b207766e80230fb86973db99e8))
* Add svg_inline to GraphViz Format type ([0ce48b1](https://github.com/hpcc-systems/hpcc-js-wasm/commit/0ce48b1db994f54c93203be5a98fc80502dfeb87))
* Add unflatten method ([7667231](https://github.com/hpcc-systems/hpcc-js-wasm/commit/76672311b9016cd78433e2749cf80dd227043fbb))
* Add unflatten method ([2844a16](https://github.com/hpcc-systems/hpcc-js-wasm/commit/2844a16a21f74fa789ec086d849a01a77bd59fb2)), closes [#149](https://github.com/hpcc-systems/hpcc-js-wasm/issues/149)
* Add unload method to mirror load ([9adf1f7](https://github.com/hpcc-systems/hpcc-js-wasm/commit/9adf1f760ce084a754be0dc184bd8047cb44e81a))
* Add Zstandard wasm ([f5a17a2](https://github.com/hpcc-systems/hpcc-js-wasm/commit/f5a17a21c9101dc8b4a6126c3d8f146fd863d5ae))
* Add Zstandard wasm ([6672890](https://github.com/hpcc-systems/hpcc-js-wasm/commit/6672890b2afb30a32fdd182fa04f404c7d71b7f6))
* Bump DuckDB version to 1.1.3 ([f8662ef](https://github.com/hpcc-systems/hpcc-js-wasm/commit/f8662efecb0a0934a63d5a78e4a0c0e1038c8a7b))
* Bump DuckDB version to 1.1.3 ([33d08e2](https://github.com/hpcc-systems/hpcc-js-wasm/commit/33d08e26736f71b58d109163bb9c885512c852f2))
* Bump GraphViz and emsdk versions ([25aa1cc](https://github.com/hpcc-systems/hpcc-js-wasm/commit/25aa1cce7b038afc32a69f07cd6f3d4e1325b37f))
* Bump GraphViz and Expat versions ([68aaa1e](https://github.com/hpcc-systems/hpcc-js-wasm/commit/68aaa1e5f68f0ed8ba410a831e787f7ad224cbb3))
* Bump GraphViz and Expat versions ([763ed49](https://github.com/hpcc-systems/hpcc-js-wasm/commit/763ed49200f959991aeaf94fe47ca0f70111fbb6))
* Bump Graphviz to 13.0.0 ([56597d4](https://github.com/hpcc-systems/hpcc-js-wasm/commit/56597d4a26c6b8821d39082582eb19c8deeca748))
* Bump Graphviz to 13.0.0 ([af2ff8c](https://github.com/hpcc-systems/hpcc-js-wasm/commit/af2ff8c1870e8edd74f9324b881da33e0e5cabe0))
* Bump GraphViz to 6.0.0 ([2059bdf](https://github.com/hpcc-systems/hpcc-js-wasm/commit/2059bdfc3f6df911daa87467be79ff213424069c))
* Bump GraphViz to 7.0.5 ([63474b1](https://github.com/hpcc-systems/hpcc-js-wasm/commit/63474b19807965e709177407ee1809c003a87cb7))
* Bump GraphViz to 7.0.5 ([cf656ad](https://github.com/hpcc-systems/hpcc-js-wasm/commit/cf656adfbe6405e5538c6ccde92348caee79d947))
* Bump Graphviz Version ([dcbfa91](https://github.com/hpcc-systems/hpcc-js-wasm/commit/dcbfa91845ef01f2202b2f4d2d47bc6464412d34))
* Bump graphviz version to 12.2.0 ([7c276d3](https://github.com/hpcc-systems/hpcc-js-wasm/commit/7c276d366df1c872ada57026006b144b03adf8cb))
* Bump graphviz version to 12.2.0 ([0427987](https://github.com/hpcc-systems/hpcc-js-wasm/commit/0427987a317f478ef02f4101034728135d38732d))
* Bump GraphViz version to 6.0.2 ([e320650](https://github.com/hpcc-systems/hpcc-js-wasm/commit/e320650307765aee5829e95a1350f67d9e5f4e81))
* Bump GraphViz version to 6.0.2 ([c5a8032](https://github.com/hpcc-systems/hpcc-js-wasm/commit/c5a803254bc375da677b6788cc091cad07ca5f41))
* bump version ([77a00c9](https://github.com/hpcc-systems/hpcc-js-wasm/commit/77a00c9b5b4a08cc06522fd5e0fda1db7431d4ec))
* Bump versions ([a557b2e](https://github.com/hpcc-systems/hpcc-js-wasm/commit/a557b2eb8042f12d4bc78f0a2b9cbcc508c9e26f))
* Bump versions ([b19c6c7](https://github.com/hpcc-systems/hpcc-js-wasm/commit/b19c6c70d7fb1a0da16bcd61cb519db89ed322dd))
* Bump versions ([dac0326](https://github.com/hpcc-systems/hpcc-js-wasm/commit/dac032608c36ef27eb5b2a09e7b4e3e4d5f2c79a))
* Bump versions ([93b90e2](https://github.com/hpcc-systems/hpcc-js-wasm/commit/93b90e223d1233b44a7b5cb55130b08cd3c28179))
* Bump versions ([9e83548](https://github.com/hpcc-systems/hpcc-js-wasm/commit/9e83548aab6215d737cae5ae2124fb982e184d1f))
* Bump versions ([2ae7438](https://github.com/hpcc-systems/hpcc-js-wasm/commit/2ae7438aa992b26044b43f7ee71753ff57b7c9e6))
* Bump versions ([5a9386d](https://github.com/hpcc-systems/hpcc-js-wasm/commit/5a9386d2f71a8131cda0f1515401f254194141e1))
* Bump versions ([4850b76](https://github.com/hpcc-systems/hpcc-js-wasm/commit/4850b761d72c2dbc395a7fac1a05abcedc267bd5))
* Bump versions ([8c330c2](https://github.com/hpcc-systems/hpcc-js-wasm/commit/8c330c246d42c8f17942d717ffd4116925b12aec))
* Bump versions ([69b3eff](https://github.com/hpcc-systems/hpcc-js-wasm/commit/69b3eff4360b08f8bdf46e068ecbbfeba2f2e6b7))
* Bump versions ([149fb90](https://github.com/hpcc-systems/hpcc-js-wasm/commit/149fb9066653b8ff7ecec463e3dcfcf70add23d0))
* Bump versions ([f85a87c](https://github.com/hpcc-systems/hpcc-js-wasm/commit/f85a87cb93182a7388fb072aa3ddc0f2bdd7c495))
* Bump versions ([83b8ba3](https://github.com/hpcc-systems/hpcc-js-wasm/commit/83b8ba335363cb164da46f97c08cdd6b4d5e1132))
* Bump versions ([e303d91](https://github.com/hpcc-systems/hpcc-js-wasm/commit/e303d91e0c87c2a7f52be4c5220786ba16718424))
* Bump Versions ([7c3a202](https://github.com/hpcc-systems/hpcc-js-wasm/commit/7c3a20273dd321db6aa4a947b8402d67cc32dcd8))
* Bump Versions ([33b44f2](https://github.com/hpcc-systems/hpcc-js-wasm/commit/33b44f2d70f8e0de1d83bee2e2af008deecde273))
* Bump Versions ([9172492](https://github.com/hpcc-systems/hpcc-js-wasm/commit/91724922b873db4416bd025a2c16b8b43fe496d5))
* Bump Versions ([208783e](https://github.com/hpcc-systems/hpcc-js-wasm/commit/208783e61c86cd5f9c01931793c3334732bbaed0))
* Bump Versions ([081c69f](https://github.com/hpcc-systems/hpcc-js-wasm/commit/081c69fd271c785fcb1004692234a5ee3ef5eced))
* Bump Versions ([f0d0abe](https://github.com/hpcc-systems/hpcc-js-wasm/commit/f0d0abe4e69e68cff5a4424f7ded9e0fa935df09))
* Bump Versions ([5302a3b](https://github.com/hpcc-systems/hpcc-js-wasm/commit/5302a3b66fba6973b12329b86769a1c08c3c8eed))
* Bump Versions ([bbaa76b](https://github.com/hpcc-systems/hpcc-js-wasm/commit/bbaa76b93c70d255b795621281cf866912968f8e))
* Bump Versions ([377d85b](https://github.com/hpcc-systems/hpcc-js-wasm/commit/377d85b9da166c32e296e1453c87de421cb8d11b))
* Bump Versions ([566abac](https://github.com/hpcc-systems/hpcc-js-wasm/commit/566abac4874076d7136f2e7dfc108ca4d709a1c6))
* Bump Versions ([88a6aed](https://github.com/hpcc-systems/hpcc-js-wasm/commit/88a6aed30d2895b7d6cf9091454fa9ea6b8d8b49))
* Bump Versions ([6d88561](https://github.com/hpcc-systems/hpcc-js-wasm/commit/6d88561256df70d981175a3efc8791478b0a967e))
* Bump Versions ([0388aee](https://github.com/hpcc-systems/hpcc-js-wasm/commit/0388aeeb9338986f7e0979266652ea99389eacc4))
* Bump Versions ([c8ed7da](https://github.com/hpcc-systems/hpcc-js-wasm/commit/c8ed7da79d7a63265aa0a5c60706a818b04054be))
* Bump Versions ([7257952](https://github.com/hpcc-systems/hpcc-js-wasm/commit/725795271d46e18f2970034fe021ecdb28d6de2e))
* Bump Versions ([fe9580a](https://github.com/hpcc-systems/hpcc-js-wasm/commit/fe9580ad8bdb4b1c984d1d65dd5eed445dc7438d))
* Bump Versions ([014a93f](https://github.com/hpcc-systems/hpcc-js-wasm/commit/014a93f95924d37afa18da481b8fd91601c8b6b4))
* Bump Versions ([1d5be7d](https://github.com/hpcc-systems/hpcc-js-wasm/commit/1d5be7d33c85d51feac5f90ea4db07a5dd44db1d))
* Bump Versions ([ad87bc2](https://github.com/hpcc-systems/hpcc-js-wasm/commit/ad87bc261ec44500da41cbed287c494f78894cd3))
* Bump Versions ([abe5230](https://github.com/hpcc-systems/hpcc-js-wasm/commit/abe52305ccf04f5853c83553bd956fd4b5e33b7d))
* Bump Versions ([#241](https://github.com/hpcc-systems/hpcc-js-wasm/issues/241)) ([fccd582](https://github.com/hpcc-systems/hpcc-js-wasm/commit/fccd58255035da8f1755809dcb29c4b4736443a4))
* bump versions ([#330](https://github.com/hpcc-systems/hpcc-js-wasm/issues/330)) ([4ed68e3](https://github.com/hpcc-systems/hpcc-js-wasm/commit/4ed68e341bb8feb9ad27dbb60046f4f8e9f4f935))
* Bump versions to latest ([88f9614](https://github.com/hpcc-systems/hpcc-js-wasm/commit/88f9614df826d4c2ef0f16ba9e44322c332ea421))
* Bump versions to latest ([ee76b82](https://github.com/hpcc-systems/hpcc-js-wasm/commit/ee76b8255505ab62afba07340679b45496c7b163))
* Bump versions to latest ([0348cf3](https://github.com/hpcc-systems/hpcc-js-wasm/commit/0348cf398ccc471ba32af21ab07cdf5f24bb332b))
* Bump versions to latest ([b412b82](https://github.com/hpcc-systems/hpcc-js-wasm/commit/b412b82e48133886bb192dca48e1ee539d3bbd60))
* Common up Node.js and Browser module code ([48a6aff](https://github.com/hpcc-systems/hpcc-js-wasm/commit/48a6affd1139eff106a34694778c7ebb5d542e98))
* Convert to monorepo ([a84bb3e](https://github.com/hpcc-systems/hpcc-js-wasm/commit/a84bb3ee08063bd81d056dcd94c0a6fd174d224e))
* Convert to monorepo ([5e20bbd](https://github.com/hpcc-systems/hpcc-js-wasm/commit/5e20bbdaa32a4ae304e79cabe22a9bf1a38a482b))
* GraphViz 7.1.0 ([97c896f](https://github.com/hpcc-systems/hpcc-js-wasm/commit/97c896f0d075f88ecdd8faa3fb56950e42332d2e))
* GraphViz 7.1.0 ([2b4d9df](https://github.com/hpcc-systems/hpcc-js-wasm/commit/2b4d9dff9344263e47200464ec25f84926ca8439))
* **graphviz:** Bump c++ versions ([7d4c9d6](https://github.com/hpcc-systems/hpcc-js-wasm/commit/7d4c9d6b52dba939fc670b9a7bcc3178ea4e3e06))
* **graphviz:** Bump c++ versions ([a4eaf51](https://github.com/hpcc-systems/hpcc-js-wasm/commit/a4eaf51cb57e51671856f9e73c1129a3de4a5ad3))
* **graphviz:** Bump version to 2.44.1 ([dd8fa47](https://github.com/hpcc-systems/hpcc-js-wasm/commit/dd8fa475bc48db4c2dd7495aa87f793b78eace87))
* **graphviz:** Bump version to 2.44.1 ([e07624b](https://github.com/hpcc-systems/hpcc-js-wasm/commit/e07624b56d54004d3b3de5bc9ee60ad399b13daa))
* **graphviz:** Bump version to 2.47.0 ([ee4b344](https://github.com/hpcc-systems/hpcc-js-wasm/commit/ee4b3440544c53ca1102387fed2fc336835dddec))
* **graphviz:** Bump version to 2.47.0 ([d4157aa](https://github.com/hpcc-systems/hpcc-js-wasm/commit/d4157aaa2f97fd43467baa4d61854f9028a3f3d9))
* **graphviz:** Bump version to 2.47.1 ([0e09496](https://github.com/hpcc-systems/hpcc-js-wasm/commit/0e09496a79c324c4e3e76233482c2293c5736fd8))
* **graphviz:** Bump version to 2.47.1 ([0d542c6](https://github.com/hpcc-systems/hpcc-js-wasm/commit/0d542c6e7d3715a040da3ba4c78ce4650abfbe60))
* Include individual bundles ([00e139f](https://github.com/hpcc-systems/hpcc-js-wasm/commit/00e139f2afcae4d7fd2ca07c413db09a4aa5b745))
* Include individual bundles ([949c02f](https://github.com/hpcc-systems/hpcc-js-wasm/commit/949c02f4e60b61b5e793b756481dfe3aab83dd3d))
* **sfdp:** Add SFDP support ([cd13ab2](https://github.com/hpcc-systems/hpcc-js-wasm/commit/cd13ab2e370fb968adbe1ba1144cf22ce033d86a))
* **sfdp:** Add SFDP support ([c829af0](https://github.com/hpcc-systems/hpcc-js-wasm/commit/c829af08073959d458c972edf37380b2f17a7572))
* Switch default to ESM Modules ([066d11d](https://github.com/hpcc-systems/hpcc-js-wasm/commit/066d11d4bbc66219bc803d0f7b094a6ecd921902))
* Switch default to ESM Modules ([02a4e0f](https://github.com/hpcc-systems/hpcc-js-wasm/commit/02a4e0f30a547bcf2d5472f2b49d5e51b3438e51))
* update graphviz to 14.0.1 ([b06cbe2](https://github.com/hpcc-systems/hpcc-js-wasm/commit/b06cbe2c6a8e97a3c75b5046a7775124e80cd7cc))
* Version Bump ([3f4d3c3](https://github.com/hpcc-systems/hpcc-js-wasm/commit/3f4d3c3dbd124d61f4ab74c6bbad48a8c484a9a8))
* Version Bump ([513bd22](https://github.com/hpcc-systems/hpcc-js-wasm/commit/513bd2249efad32d04d93bb55836fda1a9d22385))
* **wasmBinary:** Allow pre-fetching of wasmBinary ([0dc61a9](https://github.com/hpcc-systems/hpcc-js-wasm/commit/0dc61a90dd411c30c9d7c2916a95c84ba13fc19a))
* **wasmBinary:** Allow pre-fetching of wasmBinary ([c86bdd0](https://github.com/hpcc-systems/hpcc-js-wasm/commit/c86bdd0db2211d265e4337fd5640e908819125fe)), closes [#53](https://github.com/hpcc-systems/hpcc-js-wasm/issues/53)


### Bug Fixes

* __filename and es6 modules ([3d80a39](https://github.com/hpcc-systems/hpcc-js-wasm/commit/3d80a391779a3464ed8d7d0844293fa3eecf0df8))
* __filename runtime error ([969f62d](https://github.com/hpcc-systems/hpcc-js-wasm/commit/969f62dc0178b637f44718d2099ff921cd4fc6cf))
* "Last error" contains corrupt string ([cc69093](https://github.com/hpcc-systems/hpcc-js-wasm/commit/cc6909316c7f52f2e5cd7205d682ef8c5b1db1d2)), closes [#59](https://github.com/hpcc-systems/hpcc-js-wasm/issues/59)
* Add -y option for publish ([841bddb](https://github.com/hpcc-systems/hpcc-js-wasm/commit/841bddb38ff4a349bb9ee22661e16ad0f5029c02))
* Add -y option for publish ([7cc8bd6](https://github.com/hpcc-systems/hpcc-js-wasm/commit/7cc8bd60ede5bcbb00a193cd398c23f547e64a8f))
* Add cli to "files" section ([189ba5a](https://github.com/hpcc-systems/hpcc-js-wasm/commit/189ba5a1ac0b83be3c47af30fef369913409cbe9))
* Add index.js for type resolution ([c370257](https://github.com/hpcc-systems/hpcc-js-wasm/commit/c370257c9ee4a5ab7e233359007ea24ec465b35f))
* Add missing DuckDB to wasm package ([697de13](https://github.com/hpcc-systems/hpcc-js-wasm/commit/697de1370c10388f36863aed8c1e9ed83949a0f9))
* Add missing DuckDB to wasm package ([7f45a67](https://github.com/hpcc-systems/hpcc-js-wasm/commit/7f45a675d97c31c4b3cd3adca912c24d114c9019)), closes [#257](https://github.com/hpcc-systems/hpcc-js-wasm/issues/257)
* Add missing export StackElement ([d786b2a](https://github.com/hpcc-systems/hpcc-js-wasm/commit/d786b2abffdafec9bf6b46b214a42d1704aeecfd))
* Add web worker unit test ([ac4aed0](https://github.com/hpcc-systems/hpcc-js-wasm/commit/ac4aed04a0631ac1d80ec848b84ac95d4e6bad51))
* Add web worker unit test ([f12f5e2](https://github.com/hpcc-systems/hpcc-js-wasm/commit/f12f5e2035db5c9ea59690802f8c68169720687a))
* **build:** Force scripts to have \n line endings ([04e07ae](https://github.com/hpcc-systems/hpcc-js-wasm/commit/04e07ae5ef12531216ffc7f1a4fa6554e09a4b34))
* bump esbuild deps ([a679d13](https://github.com/hpcc-systems/hpcc-js-wasm/commit/a679d131e089654b2b7dd15233896d36974f5544))
* bump versions ([2b2f904](https://github.com/hpcc-systems/hpcc-js-wasm/commit/2b2f9048079ac4aeaa2801ee3ca3f966b43ff8e1))
* Bundle yargs into cli.js ([92dc2ba](https://github.com/hpcc-systems/hpcc-js-wasm/commit/92dc2ba0440204687f590f0b05047140c7e1d3cf))
* Clean up publish action ([#244](https://github.com/hpcc-systems/hpcc-js-wasm/issues/244)) ([fccd582](https://github.com/hpcc-systems/hpcc-js-wasm/commit/fccd58255035da8f1755809dcb29c4b4736443a4))
* Convert JSDelivr purge to ESM ([5712eb7](https://github.com/hpcc-systems/hpcc-js-wasm/commit/5712eb7d97321ccb8b6791c75e7c27770ef33bfa))
* Convert local import to be dynamic ([74dee9d](https://github.com/hpcc-systems/hpcc-js-wasm/commit/74dee9df6979e5e76f062b7d20d921fd14bb1679))
* Convert local import to be dynamic ([af11237](https://github.com/hpcc-systems/hpcc-js-wasm/commit/af112372546e8ae13502cbe6311f895d42552ef0))
* Dock path typo ([9b217c8](https://github.com/hpcc-systems/hpcc-js-wasm/commit/9b217c870486f5afe2ff7523adb8db0e94e5aa0f))
* Docs failing to generate ([5e6cf94](https://github.com/hpcc-systems/hpcc-js-wasm/commit/5e6cf94e7dcbcd961932aa8c3aabe1b93cf21c4f))
* Docs not building and deploying ([2d5e89c](https://github.com/hpcc-systems/hpcc-js-wasm/commit/2d5e89c8163c87a4441583664d7f8587d49708bd))
* Documentaion contains invalid links ([65c3c4e](https://github.com/hpcc-systems/hpcc-js-wasm/commit/65c3c4e953d5ebc9f387715f80b11cdc455bdd10)), closes [#226](https://github.com/hpcc-systems/hpcc-js-wasm/issues/226)
* Documentaion contains invalid links ([225c175](https://github.com/hpcc-systems/hpcc-js-wasm/commit/225c1750acda45bf0d835ef9437f27f1114e6bf1)), closes [#226](https://github.com/hpcc-systems/hpcc-js-wasm/issues/226)
* Env detection fails in next.js ([7889083](https://github.com/hpcc-systems/hpcc-js-wasm/commit/7889083f629b31bed03ffd1add51dbb23bba81b2))
* Error handling using GraphvizSync() layout ([0667815](https://github.com/hpcc-systems/hpcc-js-wasm/commit/0667815844ef96b2fa289bee380b2648e4d931b1))
* Error handling using GraphvizSync() layout ([4ce3545](https://github.com/hpcc-systems/hpcc-js-wasm/commit/4ce3545afe65c2923121b558635da94ac339f015)), closes [#125](https://github.com/hpcc-systems/hpcc-js-wasm/issues/125)
* Exclude sourcemaps from node_modules ([a7772b3](https://github.com/hpcc-systems/hpcc-js-wasm/commit/a7772b37befdc534893d3c80d0f0d2066230474d))
* Expose specific node/browser packages ([cb36fac](https://github.com/hpcc-systems/hpcc-js-wasm/commit/cb36fac7107b1b5ad1cffe383eaf7a6146aed6ed)), closes [#115](https://github.com/hpcc-systems/hpcc-js-wasm/issues/115)
* Fix load cache II ([98f2fcd](https://github.com/hpcc-systems/hpcc-js-wasm/commit/98f2fcd2b810f4cb2329f3e235995adcc21b27a4))
* Force pre-relase to true on "next" release. ([c28b76a](https://github.com/hpcc-systems/hpcc-js-wasm/commit/c28b76ad374bea21c9dac2965700a011922c6d25))
* Global install missing yargs ([a767e79](https://github.com/hpcc-systems/hpcc-js-wasm/commit/a767e79a859be857a03efe740e59c348fda9ff8e))
* Graphviz not including html table support ([#252](https://github.com/hpcc-systems/hpcc-js-wasm/issues/252)) ([11fd7e7](https://github.com/hpcc-systems/hpcc-js-wasm/commit/11fd7e7d20b2b8fa7a0d3832775aedb4cd7e9bd3))
* Graphviz targetting wrong platform ([f5e992c](https://github.com/hpcc-systems/hpcc-js-wasm/commit/f5e992ce34d49b7db75ce6ac14a4bd43cacb2045))
* **graphviz:** Add additional exports for Graphviz params ([105323c](https://github.com/hpcc-systems/hpcc-js-wasm/commit/105323c9781fb39539b3c0106777dff0c04d95ed))
* **graphviz:** Add additional exports for Graphviz params ([9d96281](https://github.com/hpcc-systems/hpcc-js-wasm/commit/9d96281d591f19297cb5b59c9f61d00779b6062b)), closes [#92](https://github.com/hpcc-systems/hpcc-js-wasm/issues/92)
* **graphviz:** Add missing options (and defaults) ([13cd0cd](https://github.com/hpcc-systems/hpcc-js-wasm/commit/13cd0cd391093ff4156f6f20bd58e16d158d4270))
* **graphviz:** Add missing options (and defaults) ([f14588b](https://github.com/hpcc-systems/hpcc-js-wasm/commit/f14588bbf197bdccd346f259d7980a945f58c891))
* Improve "require" and "commonjs" support ([82fb0f8](https://github.com/hpcc-systems/hpcc-js-wasm/commit/82fb0f8c3135398a0a1caa19ac3c674cf4081011))
* Improve "require" and "commonjs" support ([15e1ace](https://github.com/hpcc-systems/hpcc-js-wasm/commit/15e1ace5edae7f94714e547a3ac20e0e17cd6b0c))
* Improve default wasmFolder heuristic ([d85ddac](https://github.com/hpcc-systems/hpcc-js-wasm/commit/d85ddacabad89dc266c3ab9f5bf28a6f9288488f))
* Internal source maps can cause warnings in hosting packages ([1a113ae](https://github.com/hpcc-systems/hpcc-js-wasm/commit/1a113ae0aa86377ce56b16caebd576e1712384b9))
* Legacy browser loading fails (UMD) ([1a4388a](https://github.com/hpcc-systems/hpcc-js-wasm/commit/1a4388aaba18d6956c7b544238bacdb5b27226f3)), closes [#228](https://github.com/hpcc-systems/hpcc-js-wasm/issues/228)
* Limit dependabot.yml to only bump security issues ([b41a764](https://github.com/hpcc-systems/hpcc-js-wasm/commit/b41a764f8027e976d76ad7ba84003697929ba52c))
* Lint should not be run on push ([5cc054b](https://github.com/hpcc-systems/hpcc-js-wasm/commit/5cc054b45c8b350aad6825769f982461f1ff5201))
* move esbuild into packages ([03f0587](https://github.com/hpcc-systems/hpcc-js-wasm/commit/03f0587c56a54f4819c78c143a4c4755bdb96ee0))
* Ossar tests failing with new eslint file format ([8cee8d8](https://github.com/hpcc-systems/hpcc-js-wasm/commit/8cee8d8d78556624208dc4ef201ae10d2bce016a))
* Ossar tests failing with new eslint file format ([1e753a3](https://github.com/hpcc-systems/hpcc-js-wasm/commit/1e753a3c05604bef98e5719d609cb72fa06d25fc))
* **package:** main points to non existant package ([0128401](https://github.com/hpcc-systems/hpcc-js-wasm/commit/01284016fa5f8296677800f35921dcef671e96a4)), closes [#114](https://github.com/hpcc-systems/hpcc-js-wasm/issues/114)
* **publish:** Auto releasing fails in GH Action ([dbdde6a](https://github.com/hpcc-systems/hpcc-js-wasm/commit/dbdde6a18bac5a745389371393d2d5ba001c2bef))
* **publish:** Auto releasing fails in GH Action ([6af6f60](https://github.com/hpcc-systems/hpcc-js-wasm/commit/6af6f60ae24d62afa5a39e4d8980b91c56c0d06a))
* Raw git demo fails ([69ec4d5](https://github.com/hpcc-systems/hpcc-js-wasm/commit/69ec4d54b9e9cb2e52b30662fba49d7f266723d8))
* Release Please fails to publish ([#246](https://github.com/hpcc-systems/hpcc-js-wasm/issues/246)) ([fccd582](https://github.com/hpcc-systems/hpcc-js-wasm/commit/fccd58255035da8f1755809dcb29c4b4736443a4))
* Release Please Publish ([#250](https://github.com/hpcc-systems/hpcc-js-wasm/issues/250)) ([ca67fa1](https://github.com/hpcc-systems/hpcc-js-wasm/commit/ca67fa1a7a36650f7e3406db624c12965a3e514c))
* Remove "eval" code ([16b7f92](https://github.com/hpcc-systems/hpcc-js-wasm/commit/16b7f925052c52b04b45daef3ba2ba6671512f7d))
* Remove "eval" code ([4d5a0ee](https://github.com/hpcc-systems/hpcc-js-wasm/commit/4d5a0ee8a9331dceb38bfc49028ecc2ab684f470)), closes [#56](https://github.com/hpcc-systems/hpcc-js-wasm/issues/56)
* remove findWasmBinary from bundles ([1fc05ec](https://github.com/hpcc-systems/hpcc-js-wasm/commit/1fc05ec2e5c4b6e82fa1e96bd80bb6ed7865be09))
* Rename version method for 2.x ([13639ad](https://github.com/hpcc-systems/hpcc-js-wasm/commit/13639ad20f002c5d80ec579eb02e85104a585458))
* Revert to es5 code generation ([e29f5f4](https://github.com/hpcc-systems/hpcc-js-wasm/commit/e29f5f4aa479f98e0e27b0f95cec2e9bee2d9be7))
* Rollback merging of NodeJS and Web builds ([7c2c294](https://github.com/hpcc-systems/hpcc-js-wasm/commit/7c2c29441792a78db5fd7af8326072ae4cb6a6eb))
* Rollback wasmFolder heuristics ([4f3d380](https://github.com/hpcc-systems/hpcc-js-wasm/commit/4f3d380a57e25faecbcbddda6431a3df0c575d02))
* **security:** Bump versions for latest security updates ([ebb70e2](https://github.com/hpcc-systems/hpcc-js-wasm/commit/ebb70e24571fb1cc181a337873d2e694a5e069e4))
* **security:** Bump versions for latest security updates ([caf6f1f](https://github.com/hpcc-systems/hpcc-js-wasm/commit/caf6f1f55f4fd7742014060510f7d0f12f160561))
* Separate NodeJS module from Browser module ([541cb2c](https://github.com/hpcc-systems/hpcc-js-wasm/commit/541cb2c6ee0e71213f14d03accf64b974d95c343))
* Separate NodeJS module from Browser module ([932dba5](https://github.com/hpcc-systems/hpcc-js-wasm/commit/932dba54c8d261b4dc78abcea3ea0e80ed614964))
* Site generation was failing ([c64cd0f](https://github.com/hpcc-systems/hpcc-js-wasm/commit/c64cd0f714d5cab69dd90a829eb59b74333363fd))
* Sync cmake files ([9229493](https://github.com/hpcc-systems/hpcc-js-wasm/commit/92294936e3ca434f914a0649f45f74f1614f13f8))
* sync package-lock.json ([a1dce44](https://github.com/hpcc-systems/hpcc-js-wasm/commit/a1dce44c981bada35a51df711733158aa13cb9ad))
* Tag pre-release npm publish CI command ([3785a32](https://github.com/hpcc-systems/hpcc-js-wasm/commit/3785a320237cff13901a1072c1e13f564dad4149))
* Test asset should fail ([175325d](https://github.com/hpcc-systems/hpcc-js-wasm/commit/175325dfb9500dbe95d91c3b4f5da395ae51749d))
* **test:** Add helloworld.html example ([7a0257a](https://github.com/hpcc-systems/hpcc-js-wasm/commit/7a0257a89b7c1e2cc78de2dc21e63198ad84dccb))
* Typo in package.json ([cbf98b0](https://github.com/hpcc-systems/hpcc-js-wasm/commit/cbf98b08ecd769aa36c68392c48a195f3ae88f0b))
* Typo in readme.md ([29298f8](https://github.com/hpcc-systems/hpcc-js-wasm/commit/29298f85a7279aa0c933677784c36bfd2e80e65a))
* Typo in readme.md ([8ab6955](https://github.com/hpcc-systems/hpcc-js-wasm/commit/8ab6955a6c3026e4bcabdf650f16b4c47eefcfb8))
* UMD files were not backward compatible ([11fd7e7](https://github.com/hpcc-systems/hpcc-js-wasm/commit/11fd7e7d20b2b8fa7a0d3832775aedb4cd7e9bd3))
* umd loading not working 100% ([04632f8](https://github.com/hpcc-systems/hpcc-js-wasm/commit/04632f86a2f57482a7c3e903b37de978c9a0f1ec))
* Update docker build ([25e7410](https://github.com/hpcc-systems/hpcc-js-wasm/commit/25e7410ced8285e917128086d41ad685811b5e15))
* Update test/demo pages to work with es6 ([6fd8498](https://github.com/hpcc-systems/hpcc-js-wasm/commit/6fd84989259d9518656e43a46410a5095692bd5e))
* Update test/demo pages to work with es6 ([70e0528](https://github.com/hpcc-systems/hpcc-js-wasm/commit/70e0528d3b4412b78e320d511859f5c655a4030d)), closes [#146](https://github.com/hpcc-systems/hpcc-js-wasm/issues/146)
* vitepress failing to build docs ([d179a54](https://github.com/hpcc-systems/hpcc-js-wasm/commit/d179a548c2cbdc059774797cdd0ce8fa11ff1fdd))
* was defaulting to Debug build ([2f31c48](https://github.com/hpcc-systems/hpcc-js-wasm/commit/2f31c484aa63560dbdf4d33f69c511a435bcdc7c))
* was defaulting to Debug build ([7387ac2](https://github.com/hpcc-systems/hpcc-js-wasm/commit/7387ac2f787c4e301061df0e41b0236d4713f231))
* wasmBinary should be an ArrayBuffer ([56091e0](https://github.com/hpcc-systems/hpcc-js-wasm/commit/56091e0b077a541112af1322b24cc43b2364e30e))
* wasmBinary should be an ArrayBuffer ([4b18e61](https://github.com/hpcc-systems/hpcc-js-wasm/commit/4b18e616386e3b1702717ad4ccf1f82f2d08d0c9))
* wasmFolder caching issue ([5e51fb5](https://github.com/hpcc-systems/hpcc-js-wasm/commit/5e51fb5c34fc568633a37ff90f1041c047ca2f02))

## [3.13.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/wasm-root-v3.12.0...wasm-root-v3.13.0) (2025-10-20)


### Features

* bump versions ([#330](https://github.com/hpcc-systems/hpcc-js-wasm/issues/330)) ([4ed68e3](https://github.com/hpcc-systems/hpcc-js-wasm/commit/4ed68e341bb8feb9ad27dbb60046f4f8e9f4f935))

## [3.12.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/wasm-root-v3.11.1...wasm-root-v3.12.0) (2025-10-06)


### Features

* update graphviz to 14.0.1 ([b06cbe2](https://github.com/hpcc-systems/hpcc-js-wasm/commit/b06cbe2c6a8e97a3c75b5046a7775124e80cd7cc))

## [3.11.1](https://github.com/hpcc-systems/hpcc-js-wasm/compare/wasm-root-v3.11.0...wasm-root-v3.11.1) (2025-09-22)


### Bug Fixes

* bump versions ([2b2f904](https://github.com/hpcc-systems/hpcc-js-wasm/commit/2b2f9048079ac4aeaa2801ee3ca3f966b43ff8e1))

## [3.11.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/wasm-root-v3.10.0...wasm-root-v3.11.0) (2025-08-30)


### Features

* Add svg_inline to GraphViz Format type ([0ce48b1](https://github.com/hpcc-systems/hpcc-js-wasm/commit/0ce48b1db994f54c93203be5a98fc80502dfeb87))

## [3.10.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/wasm-root-v3.9.0...wasm-root-v3.10.0) (2025-08-10)


### Features

* Bump versions ([a557b2e](https://github.com/hpcc-systems/hpcc-js-wasm/commit/a557b2eb8042f12d4bc78f0a2b9cbcc508c9e26f))
* Bump versions ([b19c6c7](https://github.com/hpcc-systems/hpcc-js-wasm/commit/b19c6c70d7fb1a0da16bcd61cb519db89ed322dd))

## [3.9.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/wasm-root-v3.8.3...wasm-root-v3.9.0) (2025-07-20)


### Features

* bump version ([77a00c9](https://github.com/hpcc-systems/hpcc-js-wasm/commit/77a00c9b5b4a08cc06522fd5e0fda1db7431d4ec))

## [3.8.3](https://github.com/hpcc-systems/hpcc-js-wasm/compare/wasm-root-v3.8.2...wasm-root-v3.8.3) (2025-07-06)


### Bug Fixes

* remove findWasmBinary from bundles ([1fc05ec](https://github.com/hpcc-systems/hpcc-js-wasm/commit/1fc05ec2e5c4b6e82fa1e96bd80bb6ed7865be09))

## [3.8.2](https://github.com/hpcc-systems/hpcc-js-wasm/compare/wasm-root-v3.8.1...wasm-root-v3.8.2) (2025-07-05)


### Bug Fixes

* move esbuild into packages ([03f0587](https://github.com/hpcc-systems/hpcc-js-wasm/commit/03f0587c56a54f4819c78c143a4c4755bdb96ee0))

## [3.8.1](https://github.com/hpcc-systems/hpcc-js-wasm/compare/wasm-root-v3.8.0...wasm-root-v3.8.1) (2025-07-04)


### Bug Fixes

* umd loading not working 100% ([04632f8](https://github.com/hpcc-systems/hpcc-js-wasm/commit/04632f86a2f57482a7c3e903b37de978c9a0f1ec))

## [3.8.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/wasm-root-v3.7.1...wasm-root-v3.8.0) (2025-07-04)


### Features

* Bump versions ([dac0326](https://github.com/hpcc-systems/hpcc-js-wasm/commit/dac032608c36ef27eb5b2a09e7b4e3e4d5f2c79a))
* Bump versions ([93b90e2](https://github.com/hpcc-systems/hpcc-js-wasm/commit/93b90e223d1233b44a7b5cb55130b08cd3c28179))


### Bug Fixes

* bump esbuild deps ([a679d13](https://github.com/hpcc-systems/hpcc-js-wasm/commit/a679d131e089654b2b7dd15233896d36974f5544))

## [3.7.1](https://github.com/hpcc-systems/hpcc-js-wasm/compare/wasm-root-v3.7.0...wasm-root-v3.7.1) (2025-07-02)


### Bug Fixes

* was defaulting to Debug build ([2f31c48](https://github.com/hpcc-systems/hpcc-js-wasm/commit/2f31c484aa63560dbdf4d33f69c511a435bcdc7c))
* was defaulting to Debug build ([7387ac2](https://github.com/hpcc-systems/hpcc-js-wasm/commit/7387ac2f787c4e301061df0e41b0236d4713f231))

## [3.7.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/wasm-root-v3.6.0...wasm-root-v3.7.0) (2025-06-09)


### Features

* Bump Graphviz to 13.0.0 ([56597d4](https://github.com/hpcc-systems/hpcc-js-wasm/commit/56597d4a26c6b8821d39082582eb19c8deeca748))
* Bump Graphviz to 13.0.0 ([af2ff8c](https://github.com/hpcc-systems/hpcc-js-wasm/commit/af2ff8c1870e8edd74f9324b881da33e0e5cabe0))

## [3.6.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/wasm-root-v3.5.1...wasm-root-v3.6.0) (2024-12-10)


### Features

* Bump DuckDB version to 1.1.3 ([33d08e2](https://github.com/hpcc-systems/hpcc-js-wasm/commit/33d08e26736f71b58d109163bb9c885512c852f2))
* Bump graphviz version to 12.2.0 ([0427987](https://github.com/hpcc-systems/hpcc-js-wasm/commit/0427987a317f478ef02f4101034728135d38732d))
* Bump versions ([2ae7438](https://github.com/hpcc-systems/hpcc-js-wasm/commit/2ae7438aa992b26044b43f7ee71753ff57b7c9e6))


### Bug Fixes

* Ossar tests failing with new eslint file format ([1e753a3](https://github.com/hpcc-systems/hpcc-js-wasm/commit/1e753a3c05604bef98e5719d609cb72fa06d25fc))

## [3.5.1](https://github.com/hpcc-systems/hpcc-js-wasm/compare/wasm-root-v3.5.0...wasm-root-v3.5.1) (2024-09-29)


### Bug Fixes

* Graphviz targetting wrong platform ([f5e992c](https://github.com/hpcc-systems/hpcc-js-wasm/commit/f5e992ce34d49b7db75ce6ac14a4bd43cacb2045))

## [3.5.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/wasm-root-v3.4.0...wasm-root-v3.5.0) (2024-09-29)


### Features

* Bump Versions ([33b44f2](https://github.com/hpcc-systems/hpcc-js-wasm/commit/33b44f2d70f8e0de1d83bee2e2af008deecde273))


### Bug Fixes

* Lint should not be run on push ([5cc054b](https://github.com/hpcc-systems/hpcc-js-wasm/commit/5cc054b45c8b350aad6825769f982461f1ff5201))

## [3.4.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/wasm-root-v3.3.0...wasm-root-v3.4.0) (2024-09-17)


### Features

* Add support for the `canon` output format ([66bc3bb](https://github.com/hpcc-systems/hpcc-js-wasm/commit/66bc3bb7f3d8b7b207766e80230fb86973db99e8))

## [3.3.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/wasm-root-v3.2.1...wasm-root-v3.3.0) (2024-09-11)


### Features

* Bump Versions ([208783e](https://github.com/hpcc-systems/hpcc-js-wasm/commit/208783e61c86cd5f9c01931793c3334732bbaed0))

## [3.2.1](https://github.com/hpcc-systems/hpcc-js-wasm/compare/wasm-root-v3.2.0...wasm-root-v3.2.1) (2024-09-06)


### Bug Fixes

* Add missing DuckDB to wasm package ([7f45a67](https://github.com/hpcc-systems/hpcc-js-wasm/commit/7f45a675d97c31c4b3cd3adca912c24d114c9019)), closes [#257](https://github.com/hpcc-systems/hpcc-js-wasm/issues/257)

## [3.2.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/wasm-root-v3.1.1...wasm-root-v3.2.0) (2024-08-30)


### Features

* Add llama.cpp web assembly support ([5602a88](https://github.com/hpcc-systems/hpcc-js-wasm/commit/5602a8889df432345d1370ce4dba919262ce6c34))


### Bug Fixes

* Add -y option for publish ([7cc8bd6](https://github.com/hpcc-systems/hpcc-js-wasm/commit/7cc8bd60ede5bcbb00a193cd398c23f547e64a8f))
* Docs not building and deploying ([2d5e89c](https://github.com/hpcc-systems/hpcc-js-wasm/commit/2d5e89c8163c87a4441583664d7f8587d49708bd))

## [3.1.1](https://github.com/hpcc-systems/hpcc-js-wasm/compare/wasm-root-v3.1.0...wasm-root-v3.1.1) (2024-08-15)


### Bug Fixes

* Graphviz not including html table support ([#252](https://github.com/hpcc-systems/hpcc-js-wasm/issues/252)) ([11fd7e7](https://github.com/hpcc-systems/hpcc-js-wasm/commit/11fd7e7d20b2b8fa7a0d3832775aedb4cd7e9bd3))
* Release Please Publish ([#250](https://github.com/hpcc-systems/hpcc-js-wasm/issues/250)) ([ca67fa1](https://github.com/hpcc-systems/hpcc-js-wasm/commit/ca67fa1a7a36650f7e3406db624c12965a3e514c))
* UMD files were not backward compatible ([11fd7e7](https://github.com/hpcc-systems/hpcc-js-wasm/commit/11fd7e7d20b2b8fa7a0d3832775aedb4cd7e9bd3))

## [3.1.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/wasm-root-v3.0.0...wasm-root-v3.1.0) (2024-08-14)


### Features

* Bump Versions ([#241](https://github.com/hpcc-systems/hpcc-js-wasm/issues/241)) ([fccd582](https://github.com/hpcc-systems/hpcc-js-wasm/commit/fccd58255035da8f1755809dcb29c4b4736443a4))


### Bug Fixes

* Release Please fails to publish ([#246](https://github.com/hpcc-systems/hpcc-js-wasm/issues/246)) ([fccd582](https://github.com/hpcc-systems/hpcc-js-wasm/commit/fccd58255035da8f1755809dcb29c4b4736443a4))

## [3.0.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/wasm-root-v2.18.2...wasm-root-v3.0.0) (2024-08-13)


### ⚠ BREAKING CHANGES

* Refactor public interfaces to follow common pattern Start using sfx-wasm bundler

### Features

* Add "Sync" version of Graphviz ([f80a626](https://github.com/hpcc-systems/hpcc-js-wasm/commit/f80a6262bf4868f759bf4c64cdaec025e69858ac)), closes [#8](https://github.com/hpcc-systems/hpcc-js-wasm/issues/8)
* Add acyclic and tred support ([dc1dd27](https://github.com/hpcc-systems/hpcc-js-wasm/commit/dc1dd2761f97e959498984bef7815f3cfe3ac565)), closes [#210](https://github.com/hpcc-systems/hpcc-js-wasm/issues/210)
* Add additional options to CLI ([b05598b](https://github.com/hpcc-systems/hpcc-js-wasm/commit/b05598b134296c67b1895725f72a4f0bec6cc64f)), closes [#98](https://github.com/hpcc-systems/hpcc-js-wasm/issues/98)
* Add Base91 wasm ([7063b76](https://github.com/hpcc-systems/hpcc-js-wasm/commit/7063b76de652272912d47981e4584431d3eae8e0))
* Add Command Line Interface ([caa0b11](https://github.com/hpcc-systems/hpcc-js-wasm/commit/caa0b119100a3fa915cedd9bc4ed567fc16b2f2a))
* Add DuckDB Support ([005adf6](https://github.com/hpcc-systems/hpcc-js-wasm/commit/005adf6fc8785eaf5e466caaca0921af5ffe97db))
* Add nop and nop2 layout options ([f71c4f1](https://github.com/hpcc-systems/hpcc-js-wasm/commit/f71c4f121105a872a02129c6d9c8d63f5d23317f))
* Add self extracting wasm "sfx-graphviz" ([2bc80f8](https://github.com/hpcc-systems/hpcc-js-wasm/commit/2bc80f860f9ac7f358a94bc5d356ebe635737fd3))
* Add support for Node JS ([d558687](https://github.com/hpcc-systems/hpcc-js-wasm/commit/d558687cca672df2fe8715b17da65025c7f96b2a))
* Add support for yInvert and nop ([2e34ce5](https://github.com/hpcc-systems/hpcc-js-wasm/commit/2e34ce5c32134ceb2fdc6f305138107e952f5adf))
* Add unflatten method ([2844a16](https://github.com/hpcc-systems/hpcc-js-wasm/commit/2844a16a21f74fa789ec086d849a01a77bd59fb2)), closes [#149](https://github.com/hpcc-systems/hpcc-js-wasm/issues/149)
* Add unload method to mirror load ([9adf1f7](https://github.com/hpcc-systems/hpcc-js-wasm/commit/9adf1f760ce084a754be0dc184bd8047cb44e81a))
* Add Zstandard wasm ([6672890](https://github.com/hpcc-systems/hpcc-js-wasm/commit/6672890b2afb30a32fdd182fa04f404c7d71b7f6))
* Bump GraphViz and emsdk versions ([25aa1cc](https://github.com/hpcc-systems/hpcc-js-wasm/commit/25aa1cce7b038afc32a69f07cd6f3d4e1325b37f))
* Bump GraphViz and Expat versions ([763ed49](https://github.com/hpcc-systems/hpcc-js-wasm/commit/763ed49200f959991aeaf94fe47ca0f70111fbb6))
* Bump GraphViz to 6.0.0 ([2059bdf](https://github.com/hpcc-systems/hpcc-js-wasm/commit/2059bdfc3f6df911daa87467be79ff213424069c))
* Bump GraphViz to 7.0.5 ([cf656ad](https://github.com/hpcc-systems/hpcc-js-wasm/commit/cf656adfbe6405e5538c6ccde92348caee79d947))
* Bump Graphviz Version ([dcbfa91](https://github.com/hpcc-systems/hpcc-js-wasm/commit/dcbfa91845ef01f2202b2f4d2d47bc6464412d34))
* Bump GraphViz version to 6.0.2 ([c5a8032](https://github.com/hpcc-systems/hpcc-js-wasm/commit/c5a803254bc375da677b6788cc091cad07ca5f41))
* Bump versions ([5a9386d](https://github.com/hpcc-systems/hpcc-js-wasm/commit/5a9386d2f71a8131cda0f1515401f254194141e1))
* Bump versions ([8c330c2](https://github.com/hpcc-systems/hpcc-js-wasm/commit/8c330c246d42c8f17942d717ffd4116925b12aec))
* Bump versions ([f85a87c](https://github.com/hpcc-systems/hpcc-js-wasm/commit/f85a87cb93182a7388fb072aa3ddc0f2bdd7c495))
* Bump versions ([e303d91](https://github.com/hpcc-systems/hpcc-js-wasm/commit/e303d91e0c87c2a7f52be4c5220786ba16718424))
* Bump Versions ([081c69f](https://github.com/hpcc-systems/hpcc-js-wasm/commit/081c69fd271c785fcb1004692234a5ee3ef5eced))
* Bump Versions ([5302a3b](https://github.com/hpcc-systems/hpcc-js-wasm/commit/5302a3b66fba6973b12329b86769a1c08c3c8eed))
* Bump Versions ([377d85b](https://github.com/hpcc-systems/hpcc-js-wasm/commit/377d85b9da166c32e296e1453c87de421cb8d11b))
* Bump Versions ([88a6aed](https://github.com/hpcc-systems/hpcc-js-wasm/commit/88a6aed30d2895b7d6cf9091454fa9ea6b8d8b49))
* Bump Versions ([0388aee](https://github.com/hpcc-systems/hpcc-js-wasm/commit/0388aeeb9338986f7e0979266652ea99389eacc4))
* Bump Versions ([7257952](https://github.com/hpcc-systems/hpcc-js-wasm/commit/725795271d46e18f2970034fe021ecdb28d6de2e))
* Bump Versions ([fe9580a](https://github.com/hpcc-systems/hpcc-js-wasm/commit/fe9580ad8bdb4b1c984d1d65dd5eed445dc7438d))
* Bump Versions ([1d5be7d](https://github.com/hpcc-systems/hpcc-js-wasm/commit/1d5be7d33c85d51feac5f90ea4db07a5dd44db1d))
* Bump Versions ([abe5230](https://github.com/hpcc-systems/hpcc-js-wasm/commit/abe52305ccf04f5853c83553bd956fd4b5e33b7d))
* Bump versions to latest ([ee76b82](https://github.com/hpcc-systems/hpcc-js-wasm/commit/ee76b8255505ab62afba07340679b45496c7b163))
* Bump versions to latest ([b412b82](https://github.com/hpcc-systems/hpcc-js-wasm/commit/b412b82e48133886bb192dca48e1ee539d3bbd60))
* Common up Node.js and Browser module code ([48a6aff](https://github.com/hpcc-systems/hpcc-js-wasm/commit/48a6affd1139eff106a34694778c7ebb5d542e98))
* Convert to monorepo ([5e20bbd](https://github.com/hpcc-systems/hpcc-js-wasm/commit/5e20bbdaa32a4ae304e79cabe22a9bf1a38a482b))
* **emsdk:** Bump version to 1.5 ([9692fed](https://github.com/hpcc-systems/hpcc-js-wasm/commit/9692fed8c37be9bc64de903681363df35d3f9742))
* GraphViz 7.1.0 ([2b4d9df](https://github.com/hpcc-systems/hpcc-js-wasm/commit/2b4d9dff9344263e47200464ec25f84926ca8439))
* **graphviz:** Add additional convenience methods ([dda20f4](https://github.com/hpcc-systems/hpcc-js-wasm/commit/dda20f4882f8966f6fbfbd4916ff4ccf675adcc5))
* **GraphViz:** Add basic error handling ([5e58238](https://github.com/hpcc-systems/hpcc-js-wasm/commit/5e5823860c8748731f143860bcac3631067b8784))
* **graphviz:** Bump c++ versions ([a4eaf51](https://github.com/hpcc-systems/hpcc-js-wasm/commit/a4eaf51cb57e51671856f9e73c1129a3de4a5ad3))
* **GraphViz:** Bump version to 2.42.2 ([782dfdf](https://github.com/hpcc-systems/hpcc-js-wasm/commit/782dfdfee46b9bc9962ed8d3b576247fe4588e8d))
* **graphviz:** Bump version to 2.44.0 ([8c484d9](https://github.com/hpcc-systems/hpcc-js-wasm/commit/8c484d9dfcf105fe1048f6cc21dbd8a7ce18416a))
* **graphviz:** Bump version to 2.44.1 ([e07624b](https://github.com/hpcc-systems/hpcc-js-wasm/commit/e07624b56d54004d3b3de5bc9ee60ad399b13daa))
* **graphviz:** Bump version to 2.47.0 ([d4157aa](https://github.com/hpcc-systems/hpcc-js-wasm/commit/d4157aaa2f97fd43467baa4d61854f9028a3f3d9))
* **graphviz:** Bump version to 2.47.1 ([0d542c6](https://github.com/hpcc-systems/hpcc-js-wasm/commit/0d542c6e7d3715a040da3ba4c78ce4650abfbe60))
* **GraphViz:** Initial commit ([2cf6182](https://github.com/hpcc-systems/hpcc-js-wasm/commit/2cf6182238afc57b085b5b47fd0bdf08f0928210))
* **Images:** Add Image Support ([b9c3015](https://github.com/hpcc-systems/hpcc-js-wasm/commit/b9c3015a86040ca49168b07952a4b6973b47a521))
* Include individual bundles ([949c02f](https://github.com/hpcc-systems/hpcc-js-wasm/commit/949c02f4e60b61b5e793b756481dfe3aab83dd3d))
* **sfdp:** Add SFDP support ([c829af0](https://github.com/hpcc-systems/hpcc-js-wasm/commit/c829af08073959d458c972edf37380b2f17a7572))
* Switch default to ESM Modules ([02a4e0f](https://github.com/hpcc-systems/hpcc-js-wasm/commit/02a4e0f30a547bcf2d5472f2b49d5e51b3438e51))
* Version Bump ([513bd22](https://github.com/hpcc-systems/hpcc-js-wasm/commit/513bd2249efad32d04d93bb55836fda1a9d22385))
* **wasmBinary:** Allow pre-fetching of wasmBinary ([c86bdd0](https://github.com/hpcc-systems/hpcc-js-wasm/commit/c86bdd0db2211d265e4337fd5640e908819125fe)), closes [#53](https://github.com/hpcc-systems/hpcc-js-wasm/issues/53)
* **xml:** Add simple XML parser based on expat ([cafb0f6](https://github.com/hpcc-systems/hpcc-js-wasm/commit/cafb0f6d0ffdbbba78e655e76073868785ab596c))


### Bug Fixes

* __filename and es6 modules ([3d80a39](https://github.com/hpcc-systems/hpcc-js-wasm/commit/3d80a391779a3464ed8d7d0844293fa3eecf0df8))
* __filename runtime error ([969f62d](https://github.com/hpcc-systems/hpcc-js-wasm/commit/969f62dc0178b637f44718d2099ff921cd4fc6cf))
* __hpcc_wasmFolder override has erroneous "/" char. ([1e4f67e](https://github.com/hpcc-systems/hpcc-js-wasm/commit/1e4f67e26a94f9de6f6b1a7b9ceed85bceed3007))
* "Last error" contains corrupt string ([cc69093](https://github.com/hpcc-systems/hpcc-js-wasm/commit/cc6909316c7f52f2e5cd7205d682ef8c5b1db1d2)), closes [#59](https://github.com/hpcc-systems/hpcc-js-wasm/issues/59)
* Add cli to "files" section ([189ba5a](https://github.com/hpcc-systems/hpcc-js-wasm/commit/189ba5a1ac0b83be3c47af30fef369913409cbe9))
* Add index.js for type resolution ([c370257](https://github.com/hpcc-systems/hpcc-js-wasm/commit/c370257c9ee4a5ab7e233359007ea24ec465b35f))
* Add missing export StackElement ([d786b2a](https://github.com/hpcc-systems/hpcc-js-wasm/commit/d786b2abffdafec9bf6b46b214a42d1704aeecfd))
* Add support for table based labels ([e953069](https://github.com/hpcc-systems/hpcc-js-wasm/commit/e953069a6a1419e0acaee5d19d8c562178bbbcda))
* Add web worker unit test ([f12f5e2](https://github.com/hpcc-systems/hpcc-js-wasm/commit/f12f5e2035db5c9ea59690802f8c68169720687a))
* **build:** Force scripts to have \n line endings ([04e07ae](https://github.com/hpcc-systems/hpcc-js-wasm/commit/04e07ae5ef12531216ffc7f1a4fa6554e09a4b34))
* Bundle yargs into cli.js ([92dc2ba](https://github.com/hpcc-systems/hpcc-js-wasm/commit/92dc2ba0440204687f590f0b05047140c7e1d3cf))
* Convert JSDelivr purge to ESM ([5712eb7](https://github.com/hpcc-systems/hpcc-js-wasm/commit/5712eb7d97321ccb8b6791c75e7c27770ef33bfa))
* Convert local import to be dynamic ([af11237](https://github.com/hpcc-systems/hpcc-js-wasm/commit/af112372546e8ae13502cbe6311f895d42552ef0))
* Dock path typo ([9b217c8](https://github.com/hpcc-systems/hpcc-js-wasm/commit/9b217c870486f5afe2ff7523adb8db0e94e5aa0f))
* Docs failing to generate ([5e6cf94](https://github.com/hpcc-systems/hpcc-js-wasm/commit/5e6cf94e7dcbcd961932aa8c3aabe1b93cf21c4f))
* Documentaion contains invalid links ([65c3c4e](https://github.com/hpcc-systems/hpcc-js-wasm/commit/65c3c4e953d5ebc9f387715f80b11cdc455bdd10)), closes [#226](https://github.com/hpcc-systems/hpcc-js-wasm/issues/226)
* Documentaion contains invalid links ([225c175](https://github.com/hpcc-systems/hpcc-js-wasm/commit/225c1750acda45bf0d835ef9437f27f1114e6bf1)), closes [#226](https://github.com/hpcc-systems/hpcc-js-wasm/issues/226)
* Env detection fails in next.js ([7889083](https://github.com/hpcc-systems/hpcc-js-wasm/commit/7889083f629b31bed03ffd1add51dbb23bba81b2))
* Error handling using GraphvizSync() layout ([4ce3545](https://github.com/hpcc-systems/hpcc-js-wasm/commit/4ce3545afe65c2923121b558635da94ac339f015)), closes [#125](https://github.com/hpcc-systems/hpcc-js-wasm/issues/125)
* Exclude sourcemaps from node_modules ([a7772b3](https://github.com/hpcc-systems/hpcc-js-wasm/commit/a7772b37befdc534893d3c80d0f0d2066230474d))
* Expose specific node/browser packages ([cb36fac](https://github.com/hpcc-systems/hpcc-js-wasm/commit/cb36fac7107b1b5ad1cffe383eaf7a6146aed6ed)), closes [#115](https://github.com/hpcc-systems/hpcc-js-wasm/issues/115)
* Fix load cache II ([98f2fcd](https://github.com/hpcc-systems/hpcc-js-wasm/commit/98f2fcd2b810f4cb2329f3e235995adcc21b27a4))
* Force pre-relase to true on "next" release. ([c28b76a](https://github.com/hpcc-systems/hpcc-js-wasm/commit/c28b76ad374bea21c9dac2965700a011922c6d25))
* Global install missing yargs ([a767e79](https://github.com/hpcc-systems/hpcc-js-wasm/commit/a767e79a859be857a03efe740e59c348fda9ff8e))
* **graphviz:** Add additional exports for Graphviz params ([9d96281](https://github.com/hpcc-systems/hpcc-js-wasm/commit/9d96281d591f19297cb5b59c9f61d00779b6062b)), closes [#92](https://github.com/hpcc-systems/hpcc-js-wasm/issues/92)
* **graphviz:** Add missing options (and defaults) ([f14588b](https://github.com/hpcc-systems/hpcc-js-wasm/commit/f14588bbf197bdccd346f259d7980a945f58c891))
* Improve "require" and "commonjs" support ([15e1ace](https://github.com/hpcc-systems/hpcc-js-wasm/commit/15e1ace5edae7f94714e547a3ac20e0e17cd6b0c))
* Improve default wasmFolder heuristic ([d85ddac](https://github.com/hpcc-systems/hpcc-js-wasm/commit/d85ddacabad89dc266c3ab9f5bf28a6f9288488f))
* Internal source maps can cause warnings in hosting packages ([1a113ae](https://github.com/hpcc-systems/hpcc-js-wasm/commit/1a113ae0aa86377ce56b16caebd576e1712384b9))
* Legacy browser loading fails (UMD) ([1a4388a](https://github.com/hpcc-systems/hpcc-js-wasm/commit/1a4388aaba18d6956c7b544238bacdb5b27226f3)), closes [#228](https://github.com/hpcc-systems/hpcc-js-wasm/issues/228)
* Limit dependabot.yml to only bump security issues ([b41a764](https://github.com/hpcc-systems/hpcc-js-wasm/commit/b41a764f8027e976d76ad7ba84003697929ba52c))
* **package:** main points to non existant package ([0128401](https://github.com/hpcc-systems/hpcc-js-wasm/commit/01284016fa5f8296677800f35921dcef671e96a4)), closes [#114](https://github.com/hpcc-systems/hpcc-js-wasm/issues/114)
* **publish:** Auto releasing fails in GH Action ([6af6f60](https://github.com/hpcc-systems/hpcc-js-wasm/commit/6af6f60ae24d62afa5a39e4d8980b91c56c0d06a))
* Raw git demo fails ([69ec4d5](https://github.com/hpcc-systems/hpcc-js-wasm/commit/69ec4d54b9e9cb2e52b30662fba49d7f266723d8))
* **ReadMe:** Minor formatting fix. ([c0f8d9a](https://github.com/hpcc-systems/hpcc-js-wasm/commit/c0f8d9ad3988f9a15517ad3c2a9b41aa44412d9d))
* **readme:** Update readme sample html to working version ([c042ba9](https://github.com/hpcc-systems/hpcc-js-wasm/commit/c042ba95d886b9af21ea2fad12ed1ba106bd885b))
* Remove "eval" code ([4d5a0ee](https://github.com/hpcc-systems/hpcc-js-wasm/commit/4d5a0ee8a9331dceb38bfc49028ecc2ab684f470)), closes [#56](https://github.com/hpcc-systems/hpcc-js-wasm/issues/56)
* Rename version method for 2.x ([13639ad](https://github.com/hpcc-systems/hpcc-js-wasm/commit/13639ad20f002c5d80ec579eb02e85104a585458))
* Revert to es5 code generation ([e29f5f4](https://github.com/hpcc-systems/hpcc-js-wasm/commit/e29f5f4aa479f98e0e27b0f95cec2e9bee2d9be7))
* Rollback merging of NodeJS and Web builds ([7c2c294](https://github.com/hpcc-systems/hpcc-js-wasm/commit/7c2c29441792a78db5fd7af8326072ae4cb6a6eb))
* Rollback wasmFolder heuristics ([4f3d380](https://github.com/hpcc-systems/hpcc-js-wasm/commit/4f3d380a57e25faecbcbddda6431a3df0c575d02))
* **security:** Bump versions for latest security updates ([caf6f1f](https://github.com/hpcc-systems/hpcc-js-wasm/commit/caf6f1f55f4fd7742014060510f7d0f12f160561))
* Separate NodeJS module from Browser module ([932dba5](https://github.com/hpcc-systems/hpcc-js-wasm/commit/932dba54c8d261b4dc78abcea3ea0e80ed614964))
* Site generation was failing ([c64cd0f](https://github.com/hpcc-systems/hpcc-js-wasm/commit/c64cd0f714d5cab69dd90a829eb59b74333363fd))
* Sync cmake files ([9229493](https://github.com/hpcc-systems/hpcc-js-wasm/commit/92294936e3ca434f914a0649f45f74f1614f13f8))
* Tag pre-release npm publish CI command ([3785a32](https://github.com/hpcc-systems/hpcc-js-wasm/commit/3785a320237cff13901a1072c1e13f564dad4149))
* Test asset should fail ([175325d](https://github.com/hpcc-systems/hpcc-js-wasm/commit/175325dfb9500dbe95d91c3b4f5da395ae51749d))
* **test:** Add helloworld.html example ([7a0257a](https://github.com/hpcc-systems/hpcc-js-wasm/commit/7a0257a89b7c1e2cc78de2dc21e63198ad84dccb))
* Typo in package.json ([cbf98b0](https://github.com/hpcc-systems/hpcc-js-wasm/commit/cbf98b08ecd769aa36c68392c48a195f3ae88f0b))
* Typo in readme.md ([8ab6955](https://github.com/hpcc-systems/hpcc-js-wasm/commit/8ab6955a6c3026e4bcabdf650f16b4c47eefcfb8))
* Update docker build ([25e7410](https://github.com/hpcc-systems/hpcc-js-wasm/commit/25e7410ced8285e917128086d41ad685811b5e15))
* Update test/demo pages to work with es6 ([70e0528](https://github.com/hpcc-systems/hpcc-js-wasm/commit/70e0528d3b4412b78e320d511859f5c655a4030d)), closes [#146](https://github.com/hpcc-systems/hpcc-js-wasm/issues/146)
* vitepress failing to build docs ([d179a54](https://github.com/hpcc-systems/hpcc-js-wasm/commit/d179a548c2cbdc059774797cdd0ce8fa11ff1fdd))
* wasmBinary should be an ArrayBuffer ([4b18e61](https://github.com/hpcc-systems/hpcc-js-wasm/commit/4b18e616386e3b1702717ad4ccf1f82f2d08d0c9))
* wasmFolder caching issue ([5e51fb5](https://github.com/hpcc-systems/hpcc-js-wasm/commit/5e51fb5c34fc568633a37ff90f1041c047ca2f02))
* **wasmFolder:** Add default folder when "undefined" ([233f97c](https://github.com/hpcc-systems/hpcc-js-wasm/commit/233f97c1c819649ab1b3b7fb8f23f4fbfcc1c364))
* **wasmFolder:** Remove trailing folder ([e4e0e0f](https://github.com/hpcc-systems/hpcc-js-wasm/commit/e4e0e0f1ab2165bfd010cf951475a651f0834cff))

### [2.18.2](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v2.18.1...v2.18.2) (2024-08-08)


### Bug Fixes

*  Internal source maps can cause warnings in hosting packages ([1a113ae](https://github.com/hpcc-systems/hpcc-js-wasm/commit/1a113ae0aa86377ce56b16caebd576e1712384b9))

### [2.18.1](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v2.18.0...v2.18.1) (2024-08-06)


### Bug Fixes

*  Documentaion contains invalid links ([65c3c4e](https://github.com/hpcc-systems/hpcc-js-wasm/commit/65c3c4e953d5ebc9f387715f80b11cdc455bdd10)), closes [#226](https://github.com/hpcc-systems/hpcc-js-wasm/issues/226)
*  Documentaion contains invalid links ([225c175](https://github.com/hpcc-systems/hpcc-js-wasm/commit/225c1750acda45bf0d835ef9437f27f1114e6bf1)), closes [#226](https://github.com/hpcc-systems/hpcc-js-wasm/issues/226)
*  Legacy browser loading fails (UMD) ([1a4388a](https://github.com/hpcc-systems/hpcc-js-wasm/commit/1a4388aaba18d6956c7b544238bacdb5b27226f3)), closes [#228](https://github.com/hpcc-systems/hpcc-js-wasm/issues/228)

## [2.18.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v2.17.1...v2.18.0) (2024-07-05)


### Features

*  Bump versions ([5a9386d](https://github.com/hpcc-systems/hpcc-js-wasm/commit/5a9386d2f71a8131cda0f1515401f254194141e1))

### [2.17.1](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v2.17.0...v2.17.1) (2024-06-26)


### Bug Fixes

*  Exclude sourcemaps from node_modules ([a7772b3](https://github.com/hpcc-systems/hpcc-js-wasm/commit/a7772b37befdc534893d3c80d0f0d2066230474d))
*  vitepress failing to build docs ([d179a54](https://github.com/hpcc-systems/hpcc-js-wasm/commit/d179a548c2cbdc059774797cdd0ce8fa11ff1fdd))

## [2.17.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v2.16.2...v2.17.0) (2024-06-25)


### Features

* Add DuckDB Support ([005adf6](https://github.com/hpcc-systems/hpcc-js-wasm/commit/005adf6fc8785eaf5e466caaca0921af5ffe97db))

### [2.16.2](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v2.16.1...v2.16.2) (2024-04-29)

### [2.16.1](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v2.16.0...v2.16.1) (2024-03-28)

## [2.16.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v2.16.0-next.2...v2.16.0) (2024-02-11)

## [2.16.0-next.2](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v2.16.0-next.1...v2.16.0-next.2) (2024-02-04)


### Bug Fixes

*  Tag pre-release npm publish CI command ([3785a32](https://github.com/hpcc-systems/hpcc-js-wasm/commit/3785a320237cff13901a1072c1e13f564dad4149))

## [2.16.0-next.1](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v2.16.0-next.0...v2.16.0-next.1) (2024-02-04)


### Bug Fixes

*  Force pre-relase to true on "next" release. ([c28b76a](https://github.com/hpcc-systems/hpcc-js-wasm/commit/c28b76ad374bea21c9dac2965700a011922c6d25))

## [2.16.0-next.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v2.15.3...v2.16.0-next.0) (2024-02-04)


### Features

* Add acyclic and tred support ([dc1dd27](https://github.com/hpcc-systems/hpcc-js-wasm/commit/dc1dd2761f97e959498984bef7815f3cfe3ac565)), closes [#210](https://github.com/hpcc-systems/hpcc-js-wasm/issues/210)

### [2.15.3](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v2.15.2...v2.15.3) (2023-12-23)

### [2.15.2](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v2.15.1...v2.15.2) (2023-12-22)

### [2.15.1](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v2.15.0...v2.15.1) (2023-12-08)


### Bug Fixes

*  Improve "require" and "commonjs" support ([15e1ace](https://github.com/hpcc-systems/hpcc-js-wasm/commit/15e1ace5edae7f94714e547a3ac20e0e17cd6b0c))

## [2.15.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v2.14.1...v2.15.0) (2023-11-25)


### Features

*  Add nop and nop2 layout options ([f71c4f1](https://github.com/hpcc-systems/hpcc-js-wasm/commit/f71c4f121105a872a02129c6d9c8d63f5d23317f))


### Bug Fixes

*  Limit dependabot.yml to only bump security issues ([b41a764](https://github.com/hpcc-systems/hpcc-js-wasm/commit/b41a764f8027e976d76ad7ba84003697929ba52c))
*  Site generation was failing ([c64cd0f](https://github.com/hpcc-systems/hpcc-js-wasm/commit/c64cd0f714d5cab69dd90a829eb59b74333363fd))

### [2.14.1](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v2.14.0...v2.14.1) (2023-10-12)

## [2.14.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v2.13.1...v2.14.0) (2023-09-13)


### Features

*  Version Bump ([513bd22](https://github.com/hpcc-systems/hpcc-js-wasm/commit/513bd2249efad32d04d93bb55836fda1a9d22385))


### Bug Fixes

* Typo in readme.md ([8ab6955](https://github.com/hpcc-systems/hpcc-js-wasm/commit/8ab6955a6c3026e4bcabdf650f16b4c47eefcfb8))

### [2.13.1](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v2.13.0...v2.13.1) (2023-07-31)

## [2.13.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v2.12.0...v2.13.0) (2023-05-05)


### Features

*  Bump Versions ([081c69f](https://github.com/hpcc-systems/hpcc-js-wasm/commit/081c69fd271c785fcb1004692234a5ee3ef5eced))

## [2.12.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v2.11.0...v2.12.0) (2023-04-22)


### Features

*  Bump Versions ([5302a3b](https://github.com/hpcc-systems/hpcc-js-wasm/commit/5302a3b66fba6973b12329b86769a1c08c3c8eed))

## [2.11.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v2.10.0...v2.11.0) (2023-04-17)


### Features

*  Bump Versions ([377d85b](https://github.com/hpcc-systems/hpcc-js-wasm/commit/377d85b9da166c32e296e1453c87de421cb8d11b))

## [2.10.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v2.9.0...v2.10.0) (2023-04-11)


### Features

*  Bump Versions ([88a6aed](https://github.com/hpcc-systems/hpcc-js-wasm/commit/88a6aed30d2895b7d6cf9091454fa9ea6b8d8b49))


### Bug Fixes

*  Update docker build ([25e7410](https://github.com/hpcc-systems/hpcc-js-wasm/commit/25e7410ced8285e917128086d41ad685811b5e15))

## [2.9.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v2.8.0...v2.9.0) (2023-03-29)


### Features

*  Bump Versions ([0388aee](https://github.com/hpcc-systems/hpcc-js-wasm/commit/0388aeeb9338986f7e0979266652ea99389eacc4))

## [2.8.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v2.7.0...v2.8.0) (2023-01-29)


### Features

*  GraphViz 7.1.0 ([2b4d9df](https://github.com/hpcc-systems/hpcc-js-wasm/commit/2b4d9dff9344263e47200464ec25f84926ca8439))

## [2.7.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v2.6.0...v2.7.0) (2023-01-15)


### Features

*  Add unflatten method ([2844a16](https://github.com/hpcc-systems/hpcc-js-wasm/commit/2844a16a21f74fa789ec086d849a01a77bd59fb2)), closes [#149](https://github.com/hpcc-systems/hpcc-js-wasm/issues/149)


### Bug Fixes

*  Convert local import to be dynamic ([af11237](https://github.com/hpcc-systems/hpcc-js-wasm/commit/af112372546e8ae13502cbe6311f895d42552ef0))
*  Update test/demo pages to work with es6 ([70e0528](https://github.com/hpcc-systems/hpcc-js-wasm/commit/70e0528d3b4412b78e320d511859f5c655a4030d)), closes [#146](https://github.com/hpcc-systems/hpcc-js-wasm/issues/146)

## [2.6.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v2.5.0...v2.6.0) (2023-01-06)


### Features

*  Bump Versions ([7257952](https://github.com/hpcc-systems/hpcc-js-wasm/commit/725795271d46e18f2970034fe021ecdb28d6de2e))

## [2.5.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v2.4.0...v2.5.0) (2022-12-24)


### Features

*  Bump GraphViz to 7.0.5 ([cf656ad](https://github.com/hpcc-systems/hpcc-js-wasm/commit/cf656adfbe6405e5538c6ccde92348caee79d947))


### Bug Fixes

*  Test asset should fail ([175325d](https://github.com/hpcc-systems/hpcc-js-wasm/commit/175325dfb9500dbe95d91c3b4f5da395ae51749d))

## [2.4.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v2.3.0...v2.4.0) (2022-12-23)


### Features

*  Add unload method to mirror load ([9adf1f7](https://github.com/hpcc-systems/hpcc-js-wasm/commit/9adf1f760ce084a754be0dc184bd8047cb44e81a))

## [2.3.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v2.2.0...v2.3.0) (2022-12-06)


### Features

*  Bump versions ([8c330c2](https://github.com/hpcc-systems/hpcc-js-wasm/commit/8c330c246d42c8f17942d717ffd4116925b12aec))


### Bug Fixes

*  Raw git demo fails ([69ec4d5](https://github.com/hpcc-systems/hpcc-js-wasm/commit/69ec4d54b9e9cb2e52b30662fba49d7f266723d8))

## [2.2.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v2.1.1...v2.2.0) (2022-11-26)


### Features

*  Bump Versions ([fe9580a](https://github.com/hpcc-systems/hpcc-js-wasm/commit/fe9580ad8bdb4b1c984d1d65dd5eed445dc7438d))
*  Bump Versions ([1d5be7d](https://github.com/hpcc-systems/hpcc-js-wasm/commit/1d5be7d33c85d51feac5f90ea4db07a5dd44db1d))

### [2.1.1](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v2.1.0...v2.1.1) (2022-11-13)

## [2.1.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v2.0.1...v2.1.0) (2022-11-09)


### Features

*  Bump GraphViz and emsdk versions ([25aa1cc](https://github.com/hpcc-systems/hpcc-js-wasm/commit/25aa1cce7b038afc32a69f07cd6f3d4e1325b37f))

### [2.0.1](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v2.0.0...v2.0.1) (2022-11-08)


### Bug Fixes

*  Add index.js for type resolution ([c370257](https://github.com/hpcc-systems/hpcc-js-wasm/commit/c370257c9ee4a5ab7e233359007ea24ec465b35f))
*  Convert JSDelivr purge to ESM ([5712eb7](https://github.com/hpcc-systems/hpcc-js-wasm/commit/5712eb7d97321ccb8b6791c75e7c27770ef33bfa))

## [2.0.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.20.1...v2.0.0) (2022-11-07)


### ⚠ BREAKING CHANGES

* Refactor public interfaces to follow common pattern
Start using sfx-wasm bundler

Update docs to use vitepress

Signed-off-by: Gordon Smith <GordonJSmith@gmail.com>

### Features

* Switch default to ESM Modules ([02a4e0f](https://github.com/hpcc-systems/hpcc-js-wasm/commit/02a4e0f30a547bcf2d5472f2b49d5e51b3438e51))

### [1.20.1](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.20.0...v1.20.1) (2022-11-06)


### Bug Fixes

*  Rename version method for 2.x ([13639ad](https://github.com/hpcc-systems/hpcc-js-wasm/commit/13639ad20f002c5d80ec579eb02e85104a585458))

## [1.20.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.19.1...v1.20.0) (2022-11-06)


### Features

*  Add self extracting wasm "sfx-graphviz" ([2bc80f8](https://github.com/hpcc-systems/hpcc-js-wasm/commit/2bc80f860f9ac7f358a94bc5d356ebe635737fd3))

### [1.19.1](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.19.0...v1.19.1) (2022-11-04)


### Bug Fixes

*  Add web worker unit test ([f12f5e2](https://github.com/hpcc-systems/hpcc-js-wasm/commit/f12f5e2035db5c9ea59690802f8c68169720687a))

## [1.19.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.18.0...v1.19.0) (2022-11-02)


### Features

*  Add Base91 wasm ([7063b76](https://github.com/hpcc-systems/hpcc-js-wasm/commit/7063b76de652272912d47981e4584431d3eae8e0))
*  Add Zstandard wasm ([6672890](https://github.com/hpcc-systems/hpcc-js-wasm/commit/6672890b2afb30a32fdd182fa04f404c7d71b7f6))


### Bug Fixes

*  Error handling using GraphvizSync() layout ([4ce3545](https://github.com/hpcc-systems/hpcc-js-wasm/commit/4ce3545afe65c2923121b558635da94ac339f015)), closes [#125](https://github.com/hpcc-systems/hpcc-js-wasm/issues/125)

## [1.18.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.17.1...v1.18.0) (2022-10-24)


### Features

*  Bump GraphViz and Expat versions ([763ed49](https://github.com/hpcc-systems/hpcc-js-wasm/commit/763ed49200f959991aeaf94fe47ca0f70111fbb6))

### [1.17.1](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.17.0...v1.17.1) (2022-10-23)


### Bug Fixes

*  Typo in package.json ([cbf98b0](https://github.com/hpcc-systems/hpcc-js-wasm/commit/cbf98b08ecd769aa36c68392c48a195f3ae88f0b))

## [1.17.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.16.5...v1.17.0) (2022-10-23)


### Features

*  Bump GraphViz version to 6.0.2 ([c5a8032](https://github.com/hpcc-systems/hpcc-js-wasm/commit/c5a803254bc375da677b6788cc091cad07ca5f41))

### [1.16.5](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.16.4...v1.16.5) (2022-09-24)


### Bug Fixes

*  Rollback wasmFolder heuristics ([4f3d380](https://github.com/hpcc-systems/hpcc-js-wasm/commit/4f3d380a57e25faecbcbddda6431a3df0c575d02))

### [1.16.4](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.16.3...v1.16.4) (2022-09-24)


### Bug Fixes

*  __filename and es6 modules ([3d80a39](https://github.com/hpcc-systems/hpcc-js-wasm/commit/3d80a391779a3464ed8d7d0844293fa3eecf0df8))

### [1.16.3](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.16.2...v1.16.3) (2022-09-24)


### Bug Fixes

*  __filename runtime error ([969f62d](https://github.com/hpcc-systems/hpcc-js-wasm/commit/969f62dc0178b637f44718d2099ff921cd4fc6cf))

### [1.16.2](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.16.1...v1.16.2) (2022-09-24)


### Bug Fixes

* Improve default wasmFolder heuristic ([d85ddac](https://github.com/hpcc-systems/hpcc-js-wasm/commit/d85ddacabad89dc266c3ab9f5bf28a6f9288488f))

### [1.16.1](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.16.0...v1.16.1) (2022-09-12)

## [1.16.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.15.7...v1.16.0) (2022-09-10)


### Features

* Bump GraphViz to 6.0.0 ([2059bdf](https://github.com/hpcc-systems/hpcc-js-wasm/commit/2059bdfc3f6df911daa87467be79ff213424069c))

### [1.15.7](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.15.6...v1.15.7) (2022-09-08)

### [1.15.6](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.15.5...v1.15.6) (2022-09-07)


### Bug Fixes

* Env detection fails in next.js ([7889083](https://github.com/hpcc-systems/hpcc-js-wasm/commit/7889083f629b31bed03ffd1add51dbb23bba81b2))

### [1.15.5](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.15.4...v1.15.5) (2022-09-07)


### Bug Fixes

*  Expose specific node/browser packages ([cb36fac](https://github.com/hpcc-systems/hpcc-js-wasm/commit/cb36fac7107b1b5ad1cffe383eaf7a6146aed6ed)), closes [#115](https://github.com/hpcc-systems/hpcc-js-wasm/issues/115)

### [1.15.4](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.15.3...v1.15.4) (2022-08-28)


### Bug Fixes

* **package:**  main points to non existant package ([0128401](https://github.com/hpcc-systems/hpcc-js-wasm/commit/01284016fa5f8296677800f35921dcef671e96a4)), closes [#114](https://github.com/hpcc-systems/hpcc-js-wasm/issues/114)

### [1.15.3](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.15.2...v1.15.3) (2022-08-21)


### Bug Fixes

*  Fix load cache II ([98f2fcd](https://github.com/hpcc-systems/hpcc-js-wasm/commit/98f2fcd2b810f4cb2329f3e235995adcc21b27a4))

### [1.15.2](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.15.1...v1.15.2) (2022-08-21)


### Bug Fixes

* wasmFolder caching issue ([5e51fb5](https://github.com/hpcc-systems/hpcc-js-wasm/commit/5e51fb5c34fc568633a37ff90f1041c047ca2f02))

### [1.15.1](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.14.2...v1.15.1) (2022-08-21)

### [1.14.2](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.15.0...v1.14.2) (2022-08-21)

## [1.15.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.14.1...v1.15.0) (2022-07-07)


### Features

*  Bump versions to latest ([ee76b82](https://github.com/hpcc-systems/hpcc-js-wasm/commit/ee76b8255505ab62afba07340679b45496c7b163))


### Bug Fixes

*  wasmBinary should be an ArrayBuffer ([4b18e61](https://github.com/hpcc-systems/hpcc-js-wasm/commit/4b18e616386e3b1702717ad4ccf1f82f2d08d0c9))

### [1.14.1](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.14.0...v1.14.1) (2022-04-04)


### Bug Fixes

* **publish:** Auto releasing fails in GH Action ([6af6f60](https://github.com/hpcc-systems/hpcc-js-wasm/commit/6af6f60ae24d62afa5a39e4d8980b91c56c0d06a))

## [1.14.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.13.0...v1.14.0) (2022-04-04)


### Features

*  Add additional options to CLI ([b05598b](https://github.com/hpcc-systems/hpcc-js-wasm/commit/b05598b134296c67b1895725f72a4f0bec6cc64f)), closes [#98](https://github.com/hpcc-systems/hpcc-js-wasm/issues/98)

## [1.13.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.12.9...v1.13.0) (2022-02-27)


### Features

*  Bump versions ([f85a87c](https://github.com/hpcc-systems/hpcc-js-wasm/commit/f85a87cb93182a7388fb072aa3ddc0f2bdd7c495))

### [1.12.9](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.12.8...v1.12.9) (2022-02-06)


### Bug Fixes

* **graphviz:**  Add additional exports for Graphviz params ([9d96281](https://github.com/hpcc-systems/hpcc-js-wasm/commit/9d96281d591f19297cb5b59c9f61d00779b6062b)), closes [#92](https://github.com/hpcc-systems/hpcc-js-wasm/issues/92)

### [1.12.8](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.12.7...v1.12.8) (2022-01-17)

### [1.12.7](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.12.6...v1.12.7) (2021-12-09)

### [1.12.6](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.12.5...v1.12.6) (2021-10-23)

### [1.12.5](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.12.4...v1.12.5) (2021-10-17)

### [1.12.4](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.12.3...v1.12.4) (2021-09-25)

### [1.12.3](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.12.2...v1.12.3) (2021-09-19)


### Bug Fixes

*  Global install missing yargs ([a767e79](https://github.com/hpcc-systems/hpcc-js-wasm/commit/a767e79a859be857a03efe740e59c348fda9ff8e))

### [1.12.2](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.12.1...v1.12.2) (2021-09-19)


### Bug Fixes

* Bundle yargs into cli.js ([92dc2ba](https://github.com/hpcc-systems/hpcc-js-wasm/commit/92dc2ba0440204687f590f0b05047140c7e1d3cf))

### [1.12.1](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.12.0...v1.12.1) (2021-09-19)


### Bug Fixes

*  Add cli to "files" section ([189ba5a](https://github.com/hpcc-systems/hpcc-js-wasm/commit/189ba5a1ac0b83be3c47af30fef369913409cbe9))

## [1.12.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.11.1...v1.12.0) (2021-09-19)


### Features

*  Add Command Line Interface ([caa0b11](https://github.com/hpcc-systems/hpcc-js-wasm/commit/caa0b119100a3fa915cedd9bc4ed567fc16b2f2a))

### [1.11.1](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.11.0...v1.11.1) (2021-09-18)


### Bug Fixes

* **graphviz:** Add missing options (and defaults) ([f14588b](https://github.com/hpcc-systems/hpcc-js-wasm/commit/f14588bbf197bdccd346f259d7980a945f58c891))

## [1.11.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.10.3...v1.11.0) (2021-08-29)


### Features

*  Bump versions ([e303d91](https://github.com/hpcc-systems/hpcc-js-wasm/commit/e303d91e0c87c2a7f52be4c5220786ba16718424))

### [1.10.3](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.10.2...v1.10.3) (2021-08-11)


### Bug Fixes

*  Revert to es5 code generation ([e29f5f4](https://github.com/hpcc-systems/hpcc-js-wasm/commit/e29f5f4aa479f98e0e27b0f95cec2e9bee2d9be7))

### [1.10.2](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.10.1...v1.10.2) (2021-08-11)


### Bug Fixes

*  Rollback merging of NodeJS and Web builds ([7c2c294](https://github.com/hpcc-systems/hpcc-js-wasm/commit/7c2c29441792a78db5fd7af8326072ae4cb6a6eb))

### [1.10.1](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.10.0...v1.10.1) (2021-08-11)

## [1.10.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.9.1...v1.10.0) (2021-08-11)


### Features

*  Common up Node.js and Browser module code ([48a6aff](https://github.com/hpcc-systems/hpcc-js-wasm/commit/48a6affd1139eff106a34694778c7ebb5d542e98))

### [1.9.1](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.9.0...v1.9.1) (2021-08-11)


### Bug Fixes

*  Add missing export StackElement ([d786b2a](https://github.com/hpcc-systems/hpcc-js-wasm/commit/d786b2abffdafec9bf6b46b214a42d1704aeecfd))

## [1.9.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.8.1...v1.9.0) (2021-08-11)


### Features

*  Include individual bundles ([949c02f](https://github.com/hpcc-systems/hpcc-js-wasm/commit/949c02f4e60b61b5e793b756481dfe3aab83dd3d))

### [1.8.1](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.8.0...v1.8.1) (2021-07-18)


### Bug Fixes

*  Sync cmake files ([9229493](https://github.com/hpcc-systems/hpcc-js-wasm/commit/92294936e3ca434f914a0649f45f74f1614f13f8))

## [1.8.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.7.1...v1.8.0) (2021-07-17)


### Features

*  Bump Graphviz Version ([dcbfa91](https://github.com/hpcc-systems/hpcc-js-wasm/commit/dcbfa91845ef01f2202b2f4d2d47bc6464412d34))

### [1.7.1](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.7.0...v1.7.1) (2021-07-12)

## [1.7.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.6.0...v1.7.0) (2021-07-12)


### Features

*  Bump versions to latest ([b412b82](https://github.com/hpcc-systems/hpcc-js-wasm/commit/b412b82e48133886bb192dca48e1ee539d3bbd60))

## [1.6.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.5.3...v1.6.0) (2021-06-21)


### Features

*  Bump Versions ([abe5230](https://github.com/hpcc-systems/hpcc-js-wasm/commit/abe52305ccf04f5853c83553bd956fd4b5e33b7d))


### Bug Fixes

* **build:**  Force scripts to have \n line endings ([04e07ae](https://github.com/hpcc-systems/hpcc-js-wasm/commit/04e07ae5ef12531216ffc7f1a4fa6554e09a4b34))

### [1.5.3](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.5.2...v1.5.3) (2021-06-04)

### [1.5.2](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.5.1...v1.5.2) (2021-05-13)


### Bug Fixes

* **security:**  Bump versions for latest security updates ([caf6f1f](https://github.com/hpcc-systems/hpcc-js-wasm/commit/caf6f1f55f4fd7742014060510f7d0f12f160561))
* **test:**  Add helloworld.html example ([7a0257a](https://github.com/hpcc-systems/hpcc-js-wasm/commit/7a0257a89b7c1e2cc78de2dc21e63198ad84dccb))

### [1.5.1](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.5.0...v1.5.1) (2021-04-18)

## [1.5.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.4.1...v1.5.0) (2021-04-18)


### Features

* **graphviz:**  Bump version to 2.47.1 ([0d542c6](https://github.com/hpcc-systems/hpcc-js-wasm/commit/0d542c6e7d3715a040da3ba4c78ce4650abfbe60))

### [1.4.1](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.4.0...v1.4.1) (2021-03-16)


### Bug Fixes

* "Last error" contains corrupt string ([cc69093](https://github.com/hpcc-systems/hpcc-js-wasm/commit/cc6909316c7f52f2e5cd7205d682ef8c5b1db1d2)), closes [#59](https://github.com/hpcc-systems/hpcc-js-wasm/issues/59)

## [1.4.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.3.0...v1.4.0) (2021-03-16)


### Features

* **graphviz:**  Bump version to 2.47.0 ([d4157aa](https://github.com/hpcc-systems/hpcc-js-wasm/commit/d4157aaa2f97fd43467baa4d61854f9028a3f3d9))


### Bug Fixes

*  Remove "eval" code ([4d5a0ee](https://github.com/hpcc-systems/hpcc-js-wasm/commit/4d5a0ee8a9331dceb38bfc49028ecc2ab684f470)), closes [#56](https://github.com/hpcc-systems/hpcc-js-wasm/issues/56)

## [1.3.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.2.1...v1.3.0) (2021-02-22)


### Features

* **wasmBinary:**  Allow pre-fetching of wasmBinary ([c86bdd0](https://github.com/hpcc-systems/hpcc-js-wasm/commit/c86bdd0db2211d265e4337fd5640e908819125fe)), closes [#53](https://github.com/hpcc-systems/hpcc-js-wasm/issues/53)

### [1.2.1](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.2.0...v1.2.1) (2021-02-14)

## [1.2.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.1.0...v1.2.0) (2021-01-24)


### Features

* **sfdp:**  Add SFDP support ([c829af0](https://github.com/hpcc-systems/hpcc-js-wasm/commit/c829af08073959d458c972edf37380b2f17a7572))

## [1.1.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.0.2...v1.1.0) (2021-01-18)


### Features

* **graphviz:** Bump c++ versions ([a4eaf51](https://github.com/hpcc-systems/hpcc-js-wasm/commit/a4eaf51cb57e51671856f9e73c1129a3de4a5ad3))

### [1.0.2](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.0.1...v1.0.2) (2021-01-16)

### [1.0.1](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v1.0.0...v1.0.1) (2020-12-17)


### Bug Fixes

*  Separate NodeJS module from Browser module ([932dba5](https://github.com/hpcc-systems/hpcc-js-wasm/commit/932dba54c8d261b4dc78abcea3ea0e80ed614964))

## [1.0.0](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v0.3.15...v1.0.0) (2020-12-17)


### Features

* **graphviz:**  Bump version to 2.44.1 ([e07624b](https://github.com/hpcc-systems/hpcc-js-wasm/commit/e07624b56d54004d3b3de5bc9ee60ad399b13daa))
*  Add support for Node JS ([d558687](https://github.com/hpcc-systems/hpcc-js-wasm/commit/d558687cca672df2fe8715b17da65025c7f96b2a))


### Bug Fixes

*  Dock path typo ([9b217c8](https://github.com/hpcc-systems/hpcc-js-wasm/commit/9b217c870486f5afe2ff7523adb8db0e94e5aa0f))

### [0.3.15](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v0.3.14...v0.3.15) (2020-12-16)


### Features

*  Add support for yInvert and nop ([2e34ce5](https://github.com/hpcc-systems/hpcc-js-wasm/commit/2e34ce5c32134ceb2fdc6f305138107e952f5adf))

### [0.3.14](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v0.3.13...v0.3.14) (2020-05-18)


### Bug Fixes

* **wasmFolder:**  Add default folder when "undefined" ([233f97c](https://github.com/hpcc-systems/hpcc-js-wasm/commit/233f97c1c819649ab1b3b7fb8f23f4fbfcc1c364))

### [0.3.13](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v0.3.12...v0.3.13) (2020-04-12)


### Features

* **graphviz:** Bump version to 2.44.0 ([8c484d9](https://github.com/hpcc-systems/hpcc-js-wasm/commit/8c484d9dfcf105fe1048f6cc21dbd8a7ce18416a))

### [0.3.12](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v0.3.11...v0.3.12) (2020-04-10)


### Bug Fixes

* __hpcc_wasmFolder override has erroneous "/" char. ([1e4f67e](https://github.com/hpcc-systems/hpcc-js-wasm/commit/1e4f67e26a94f9de6f6b1a7b9ceed85bceed3007))

### [0.3.11](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v0.3.10...v0.3.11) (2020-04-06)


### Features

* **xml:** Add simple XML parser based on expat ([cafb0f6](https://github.com/hpcc-systems/hpcc-js-wasm/commit/cafb0f6d0ffdbbba78e655e76073868785ab596c))

### [0.3.10](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v0.3.9...v0.3.10) (2020-03-20)

### [0.3.9](https://github.com/hpcc-systems/hpcc-js-wasm/compare/v0.3.8...v0.3.9) (2020-03-20)

### [0.3.8](https://github.com/GordonSmith/hpcc-js-wasm/compare/v0.3.7...v0.3.8) (2020-03-05)

### [0.3.7](https://github.com/GordonSmith/hpcc-js-wasm/compare/v0.3.6...v0.3.7) (2020-03-05)


### Bug Fixes

* Add support for table based labels ([e953069](https://github.com/GordonSmith/hpcc-js-wasm/commit/e953069a6a1419e0acaee5d19d8c562178bbbcda))

### [0.3.6](https://github.com/GordonSmith/hpcc-js-wasm/compare/v0.3.5...v0.3.6) (2020-03-02)


### Features

* **Images:** Add Image Support ([b9c3015](https://github.com/GordonSmith/hpcc-js-wasm/commit/b9c3015a86040ca49168b07952a4b6973b47a521))

### [0.3.5](https://github.com/GordonSmith/hpcc-js-wasm/compare/v0.3.4...v0.3.5) (2020-02-27)


### Features

* **GraphViz:** Add basic error handling ([5e58238](https://github.com/GordonSmith/hpcc-js-wasm/commit/5e5823860c8748731f143860bcac3631067b8784))

### [0.3.4](https://github.com/GordonSmith/hpcc-js-wasm/compare/v0.3.3...v0.3.4) (2020-02-26)


### Features

* Add "Sync" version of Graphviz ([f80a626](https://github.com/GordonSmith/hpcc-js-wasm/commit/f80a6262bf4868f759bf4c64cdaec025e69858ac)), closes [#8](https://github.com/GordonSmith/hpcc-js-wasm/issues/8)

### [0.3.3](https://github.com/GordonSmith/hpcc-js-wasm/compare/v0.3.2...v0.3.3) (2020-02-20)

### [0.3.2](https://github.com/GordonSmith/hpcc-js-wasm/compare/v0.3.1...v0.3.2) (2020-02-06)


### Bug Fixes

* **wasmFolder:** Remove trailing folder ([e4e0e0f](https://github.com/GordonSmith/hpcc-js-wasm/commit/e4e0e0f1ab2165bfd010cf951475a651f0834cff))

### [0.3.1](https://github.com/GordonSmith/hpcc-js-wasm/compare/v0.3.0...v0.3.1) (2020-01-07)


### Features

* **emsdk:** Bump version to 1.5 ([9692fed](https://github.com/GordonSmith/hpcc-js-wasm/commit/9692fed8c37be9bc64de903681363df35d3f9742))
* **GraphViz:** Bump version to 2.42.2 ([782dfdf](https://github.com/GordonSmith/hpcc-js-wasm/commit/782dfdfee46b9bc9962ed8d3b576247fe4588e8d))

## [0.3.0](https://github.com/GordonSmith/hpcc-js-wasm/compare/v0.1.3...v0.3.0) (2019-09-19)


### Bug Fixes

* **ReadMe:** Minor formatting fix. ([c0f8d9a](https://github.com/GordonSmith/hpcc-js-wasm/commit/c0f8d9a))


### Features

* **graphviz:** Add additional convenience methods ([dda20f4](https://github.com/GordonSmith/hpcc-js-wasm/commit/dda20f4))



### [0.1.3](https://github.com/GordonSmith/hpcc-js-wasm/compare/v0.1.2...v0.1.3) (2019-06-14)


### Bug Fixes

* **readme:** Update readme sample html to working version ([c042ba9](https://github.com/GordonSmith/hpcc-js-wasm/commit/c042ba9))



### [0.1.2](https://github.com/GordonSmith/hpcc-js-wasm/compare/v0.1.1...v0.1.2) (2019-06-14)



### [0.1.1](https://github.com/GordonSmith/hpcc-js-wasm/compare/v0.1.0...v0.1.1) (2019-06-14)



## 0.1.0 (2019-06-14)


### Features

* **GraphViz:** Initial commit ([2cf6182](https://github.com/GordonSmith/hpcc-js-wasm/commit/2cf6182))
