vcpkg_from_github(
    OUT_SOURCE_PATH SOURCE_PATH
    REPO ggml-org/llama.cpp
    REF b${VERSION}
    SHA512 d58a69aeb927e45e976a35f0118b38c5484d8d0f2efcc8f20e746b2ab96ea264d946602f7d1ca1f124f316a356f032c885ac39486682b542202f65f100982fc2
    HEAD_REF master
    PATCHES
        wasm-fixes.diff
)

vcpkg_check_features(OUT_FEATURE_OPTIONS options
    FEATURES
        download    LLAMA_CURL
        tools       LLAMA_BUILD_TOOLS
)

configure_file(
    "${CMAKE_CURRENT_LIST_DIR}/../../packages/llama/src-cpp/log_wasm.cpp"
    "${SOURCE_PATH}/common/log.cpp"
    COPYONLY
)
vcpkg_replace_string("${SOURCE_PATH}/common/log.cpp"
"void common_log_set_verbosity_thold(int verbosity)
{
    common_log_verbosity_thold = verbosity;
}
"
"int common_log_get_verbosity_thold(void)
{
    return common_log_verbosity_thold;
}

void common_log_set_verbosity_thold(int verbosity)
{
    common_log_verbosity_thold = verbosity;
}
"
)

vcpkg_replace_string("${SOURCE_PATH}/common/arg.cpp"
"        [](common_params &) {\n            common_log_pause(common_log_main());\n        }"
"        [](common_params & params) {\n            params.verbosity = -1;\n            common_log_set_verbosity_thold(-1);\n        }"
)

vcpkg_replace_string("${SOURCE_PATH}/ggml/src/ggml-backend-dl.h"
"#else
#    include <dlfcn.h>
#    include <unistd.h>
#endif"
"#elif defined(__EMSCRIPTEN__)
#    include <unistd.h>
#else
#    include <dlfcn.h>
#    include <unistd.h>
#endif"
)
vcpkg_replace_string("${SOURCE_PATH}/ggml/src/ggml-backend-dl.h"
"#else

using dl_handle = void;

struct dl_handle_deleter {
    void operator()(void * handle) {
        dlclose(handle);
    }
};

#endif"
"#elif defined(__EMSCRIPTEN__)

using dl_handle = void;

struct dl_handle_deleter {
    void operator()(void * handle) {
        (void) handle;
    }
};

#else

using dl_handle = void;

struct dl_handle_deleter {
    void operator()(void * handle) {
        dlclose(handle);
    }
};

#endif"
)
vcpkg_replace_string("${SOURCE_PATH}/ggml/src/ggml-backend-dl.cpp"
"#else

dl_handle * dl_load_library(const fs::path & path) {
    dl_handle * handle = dlopen(path.string().c_str(), RTLD_NOW | RTLD_LOCAL);
    return handle;
}

void * dl_get_sym(dl_handle * handle, const char * name) {
    return dlsym(handle, name);
}

const char * dl_error() {
    const char *rslt = dlerror();
    return rslt != nullptr ? rslt : \"\";
}

#endif"
"#elif defined(__EMSCRIPTEN__)

dl_handle * dl_load_library(const fs::path & path) {
    (void) path;
    return nullptr;
}

void * dl_get_sym(dl_handle * handle, const char * name) {
    (void) handle;
    (void) name;
    return nullptr;
}

const char * dl_error() {
    return \"dynamic backend loading is not supported on Emscripten\";
}

#else

dl_handle * dl_load_library(const fs::path & path) {
    dl_handle * handle = dlopen(path.string().c_str(), RTLD_NOW | RTLD_LOCAL);
    return handle;
}

void * dl_get_sym(dl_handle * handle, const char * name) {
    return dlsym(handle, name);
}

const char * dl_error() {
    const char *rslt = dlerror();
    return rslt != nullptr ? rslt : \"\";
}

#endif"
)

vcpkg_cmake_configure(
    SOURCE_PATH "${SOURCE_PATH}"
    OPTIONS
        ${options}
        -DGGML_CCACHE=OFF
        -DGGML_OPENMP=ON
        -DLLAMA_ALL_WARNINGS=OFF
        -DLLAMA_BUILD_APP=OFF
        -DLLAMA_BUILD_TESTS=OFF
        -DLLAMA_BUILD_EXAMPLES=OFF
        -DLLAMA_BUILD_SERVER=OFF
        -DLLAMA_USE_SYSTEM_GGML=OFF
        -DLLAMA_WASM_MEM64=OFF
        -DVCPKG_LOCK_FIND_PACKAGE_Git=OFF
)

vcpkg_cmake_install()

# Install common header files
file(GLOB COMMON_HEADERS "${SOURCE_PATH}/common/*.h")
file(INSTALL ${COMMON_HEADERS} DESTINATION "${CURRENT_PACKAGES_DIR}/include/llama-cpp/common")

vcpkg_cmake_config_fixup(CONFIG_PATH "lib/cmake/llama")
vcpkg_copy_pdbs()
vcpkg_fixup_pkgconfig()

set(llama_config "${CURRENT_PACKAGES_DIR}/share/${PORT}/llama-config.cmake")
vcpkg_replace_string("${llama_config}"
"set(LLAMA_BIN_DIR \"\${PACKAGE_PREFIX_DIR}/bin\")

find_package(ggml REQUIRED HINTS \${LLAMA_LIB_DIR}/cmake)
"
"set(LLAMA_BIN_DIR \"\${PACKAGE_PREFIX_DIR}/bin\")

find_library(ggml_LIBRARY
    NAMES ggml
    REQUIRED
    HINTS \${LLAMA_LIB_DIR}
    NO_CMAKE_FIND_ROOT_PATH
)
find_library(ggml_base_LIBRARY
    NAMES ggml-base
    REQUIRED
    HINTS \${LLAMA_LIB_DIR}
    NO_CMAKE_FIND_ROOT_PATH
)
find_library(ggml_cpu_LIBRARY
    NAMES ggml-cpu
    REQUIRED
    HINTS \${LLAMA_LIB_DIR}
    NO_CMAKE_FIND_ROOT_PATH
)
"
)
vcpkg_replace_string("${llama_config}"
"INTERFACE_LINK_LIBRARIES \"ggml::ggml;ggml::ggml-base;\""
"INTERFACE_LINK_LIBRARIES \"\${ggml_LIBRARY};\${ggml_base_LIBRARY};\${ggml_cpu_LIBRARY}\""
)

foreach(pkgconfig_path IN ITEMS
    "${CURRENT_PACKAGES_DIR}/lib/pkgconfig/llama.pc"
    "${CURRENT_PACKAGES_DIR}/debug/lib/pkgconfig/llama.pc")
    vcpkg_replace_string("${pkgconfig_path}" "Requires: ggml\n" "")
    vcpkg_replace_string("${pkgconfig_path}" "Libs: \"-L\${libdir}\" -lggml -lggml-base -lllama" "Libs: \"-L\${libdir}\" -lllama -lggml-cpu -lggml -lggml-base")
endforeach()

file(INSTALL "${SOURCE_PATH}/gguf-py/gguf" DESTINATION "${CURRENT_PACKAGES_DIR}/tools/${PORT}/gguf-py")
set(convert_hf_to_gguf_installed "${CURRENT_PACKAGES_DIR}/bin/convert_hf_to_gguf.py")
set(convert_hf_to_gguf_tool "${CURRENT_PACKAGES_DIR}/tools/${PORT}/convert-hf-to-gguf.py")
if(EXISTS "${convert_hf_to_gguf_installed}")
    file(RENAME "${convert_hf_to_gguf_installed}" "${convert_hf_to_gguf_tool}")
else()
    file(INSTALL "${SOURCE_PATH}/convert_hf_to_gguf.py" DESTINATION "${CURRENT_PACKAGES_DIR}/tools/${PORT}")
    file(RENAME "${CURRENT_PACKAGES_DIR}/tools/${PORT}/convert_hf_to_gguf.py" "${convert_hf_to_gguf_tool}")
endif()
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
