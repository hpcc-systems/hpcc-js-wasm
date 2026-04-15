vcpkg_from_github(
    OUT_SOURCE_PATH SOURCE_PATH
    REPO ggml-org/llama.cpp
    REF b${VERSION}
    SHA512 a2b938fe05d40f4c9413d91e26af27dadff4272bcd556cf51e7cf1c559283d28a026fd355ddba43b774563c1e3986a9a6be0ae84c2be61391b39e3dc97c232c1
    HEAD_REF master
    PATCHES
        cmake-config.diff
        pkgconfig.diff
        wasm-fixes.diff
)
file(REMOVE_RECURSE "${SOURCE_PATH}/ggml/include" "${SOURCE_PATH}/ggml/src")

vcpkg_check_features(OUT_FEATURE_OPTIONS options
    FEATURES
        download    LLAMA_CURL
        tools       LLAMA_BUILD_TOOLS
)

vcpkg_cmake_configure(
    SOURCE_PATH "${SOURCE_PATH}"
    OPTIONS
        ${options}
        -DGGML_CCACHE=OFF
        -DLLAMA_ALL_WARNINGS=OFF
        -DLLAMA_BUILD_TESTS=OFF
        -DLLAMA_BUILD_EXAMPLES=OFF
        -DLLAMA_BUILD_SERVER=OFF
        -DLLAMA_USE_SYSTEM_GGML=ON
        -DVCPKG_LOCK_FIND_PACKAGE_Git=OFF
)

vcpkg_cmake_install()

# Install common header files
file(GLOB COMMON_HEADERS "${SOURCE_PATH}/common/*.h")
file(INSTALL ${COMMON_HEADERS} DESTINATION "${CURRENT_PACKAGES_DIR}/include/llama-cpp/common")

# Install libllama-common.a library (renamed to avoid conflict with graphviz libcommon.a)
file(INSTALL "${CURRENT_BUILDTREES_DIR}/${TARGET_TRIPLET}-rel/common/libcommon.a" 
     DESTINATION "${CURRENT_PACKAGES_DIR}/lib"
     RENAME "libllama-common.a")
file(INSTALL "${CURRENT_BUILDTREES_DIR}/${TARGET_TRIPLET}-dbg/common/libcommon.a" 
     DESTINATION "${CURRENT_PACKAGES_DIR}/debug/lib"
     RENAME "libllama-common.a")

vcpkg_cmake_config_fixup(CONFIG_PATH "lib/cmake/llama")
vcpkg_copy_pdbs()
vcpkg_fixup_pkgconfig()

file(INSTALL "${SOURCE_PATH}/gguf-py/gguf" DESTINATION "${CURRENT_PACKAGES_DIR}/tools/${PORT}/gguf-py")
file(RENAME "${CURRENT_PACKAGES_DIR}/bin/convert_hf_to_gguf.py" "${CURRENT_PACKAGES_DIR}/tools/${PORT}/convert-hf-to-gguf.py")
file(REMOVE "${CURRENT_PACKAGES_DIR}/debug/bin/convert_hf_to_gguf.py")

if("tools" IN_LIST FEATURES)
    vcpkg_copy_tools(
        TOOL_NAMES
            llama-batched-bench
            llama-bench
            llama-cli
            llama-cvector-generator
            llama-export-lora
            llama-gguf-split
            llama-imatrix
            llama-mtmd-cli
            llama-perplexity
            llama-quantize
            llama-run
            llama-tokenize
            llama-tts
        AUTO_CLEAN
    )
endif()

file(REMOVE_RECURSE "${CURRENT_PACKAGES_DIR}/debug/include")
file(REMOVE_RECURSE "${CURRENT_PACKAGES_DIR}/debug/share")
vcpkg_clean_executables_in_bin(FILE_NAMES none)

set(gguf-py-license "${CURRENT_BUILDTREES_DIR}/${TARGET_TRIPLET}-rel/gguf-py LICENSE")
file(COPY_FILE "${SOURCE_PATH}/gguf-py/LICENSE" "${gguf-py-license}")
vcpkg_install_copyright(FILE_LIST "${SOURCE_PATH}/LICENSE" "${gguf-py-license}")
