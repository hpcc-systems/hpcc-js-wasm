vcpkg_from_github(
    OUT_SOURCE_PATH SOURCE_PATH
    REPO ggml-org/llama.cpp
    REF v${VERSION}
    SHA512 88cd464c20370ecca12b174e36fa4f21b271f42851f474dd83b03191dd444dcc96543849a56aaa16a35368d09e5be9c3481bebe66c2d614a0965d882f530ca91
    HEAD_REF master
    PATCHES
        cmake-config.diff
        pkgconfig.diff
        unvendor.diff
)
file(REMOVE_RECURSE
    "${SOURCE_PATH}/vendor/cpp-httplib"
    "${SOURCE_PATH}/vendor/miniaudio"
    "${SOURCE_PATH}/vendor/nlohmann"
    "${SOURCE_PATH}/vendor/stb")

# Upstream common_log spawns a worker thread; use the synchronous WASM logger.
configure_file(
    "${CMAKE_CURRENT_LIST_DIR}/../../packages/llama/src-cpp/log_wasm.cpp"
    "${SOURCE_PATH}/common/log.cpp"
    COPYONLY
)

# Return to the caller after --help/--completion-bash instead of exiting the WASM runtime.
vcpkg_replace_string("${SOURCE_PATH}/common/arg.cpp"
"bool common_params_parse(int argc, char ** argv, common_params & params, llama_example ex, void(*print_usage)(int, char **)) {"
"extern bool g_help_was_printed;

bool common_params_parse(int argc, char ** argv, common_params & params, llama_example ex, void(*print_usage)(int, char **)) {"
)
vcpkg_replace_string("${SOURCE_PATH}/common/arg.cpp"
"        if (ctx_arg.params.usage) {
            common_params_print_usage(ctx_arg);
            if (ctx_arg.print_usage) {
                ctx_arg.print_usage(argc, argv);
            }
            common_log_flush(common_log_main());
            exit(0);
        }
        if (ctx_arg.params.completion) {
            common_params_print_completion(ctx_arg);
            exit(0);
        }"
"        if (ctx_arg.params.usage) {
            g_help_was_printed = true;
            common_params_print_usage(ctx_arg);
            if (ctx_arg.print_usage) {
                ctx_arg.print_usage(argc, argv);
            }
            common_log_flush(common_log_main());
            return false;
        }
        if (ctx_arg.params.completion) {
            g_help_was_printed = true;
            common_params_print_completion(ctx_arg);
            return false;
        }"
)

vcpkg_replace_string("${SOURCE_PATH}/src/llama-graph.cpp"
"    params = {};

    inputs.clear();"
"#if !defined(__EMSCRIPTEN__)
    params = {};
#endif

    inputs.clear();"
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

vcpkg_check_features(OUT_FEATURE_OPTIONS options
    FEATURES
        server      LLAMA_BUILD_SERVER
        tools       LLAMA_BUILD_TOOLS
)

vcpkg_cmake_configure(
    SOURCE_PATH "${SOURCE_PATH}"
    OPTIONS
        ${options}
        -DGGML_CCACHE=OFF
        -DLLAMA_BUILD_IS_DEV=OFF
        -DLLAMA_BUILD_APP=OFF
        -DLLAMA_BUILD_UI=OFF
        -DLLAMA_USE_PREBUILT_UI=OFF
        -DLLAMA_ALL_WARNINGS=OFF
        -DLLAMA_BUILD_TESTS=OFF
        -DLLAMA_BUILD_EXAMPLES=OFF
        -DLLAMA_USE_SYSTEM_GGML=OFF
        -DLLAMA_WASM_MEM64=OFF
        -DVCPKG_LOCK_FIND_PACKAGE_Git=OFF
)

vcpkg_cmake_install()

file(INSTALL
    "${CURRENT_BUILDTREES_DIR}/${TARGET_TRIPLET}-rel/common/libllama-common-base.a"
    DESTINATION "${CURRENT_PACKAGES_DIR}/lib"
)
file(INSTALL
    "${CURRENT_BUILDTREES_DIR}/${TARGET_TRIPLET}-dbg/common/libllama-common-base.a"
    DESTINATION "${CURRENT_PACKAGES_DIR}/debug/lib"
)

file(GLOB COMMON_HEADERS "${SOURCE_PATH}/common/*.h")
file(INSTALL ${COMMON_HEADERS} DESTINATION "${CURRENT_PACKAGES_DIR}/include/llama-cpp/common")

vcpkg_cmake_config_fixup(CONFIG_PATH "lib/cmake/llama")
vcpkg_copy_pdbs()
vcpkg_fixup_pkgconfig()

file(INSTALL "${SOURCE_PATH}/gguf-py/gguf" DESTINATION "${CURRENT_PACKAGES_DIR}/tools/${PORT}/gguf-py")
file(INSTALL "${SOURCE_PATH}/conversion" DESTINATION "${CURRENT_PACKAGES_DIR}/tools/${PORT}")
file(INSTALL "${SOURCE_PATH}/convert_hf_to_gguf.py" DESTINATION "${CURRENT_PACKAGES_DIR}/tools/${PORT}" RENAME convert-hf-to-gguf.py)

if("tools" IN_LIST FEATURES)
    set(tool_names
        llama-batched-bench
        llama-bench
        llama-completion
        llama-fit-params
        llama-gguf-split
        llama-imatrix
        llama-mtmd-cli
        llama-perplexity
        llama-quantize
        llama-results
        llama-tokenize
        llama-tts
    )
    # These tools require the CPU backend, which ggml disables for MSVC arm64.
    if(NOT (VCPKG_TARGET_IS_WINDOWS AND NOT VCPKG_TARGET_IS_MINGW AND VCPKG_TARGET_ARCHITECTURE STREQUAL "arm64"))
        list(APPEND tool_names llama-cvector-generator llama-export-lora)
    endif()
    if("server" IN_LIST FEATURES)
        list(APPEND tool_names llama-cli llama-server)
    endif()
    vcpkg_copy_tools(
        TOOL_NAMES ${tool_names}
        AUTO_CLEAN
    )
endif()

file(REMOVE_RECURSE "${CURRENT_PACKAGES_DIR}/debug/include")
file(REMOVE_RECURSE "${CURRENT_PACKAGES_DIR}/debug/share")
vcpkg_clean_executables_in_bin(FILE_NAMES none)

set(gguf-py-license "${CURRENT_BUILDTREES_DIR}/${TARGET_TRIPLET}-rel/gguf-py LICENSE")
file(COPY_FILE "${SOURCE_PATH}/gguf-py/LICENSE" "${gguf-py-license}")
set(copyright_files
    "${SOURCE_PATH}/LICENSE"
    "${gguf-py-license}"
    "${SOURCE_PATH}/vendor/sheredom/subprocess.h"
)
if("tools" IN_LIST FEATURES)
    list(APPEND copyright_files
        "${SOURCE_PATH}/vendor/hash/xxhash/LICENSE"
        "${SOURCE_PATH}/vendor/hash/sha1/sha1.h"
        "${SOURCE_PATH}/vendor/hash/sha256/sha256.h"
        "${SOURCE_PATH}/vendor/hash/rotate-bits/LICENSE.md"
    )
endif()
vcpkg_install_copyright(FILE_LIST ${copyright_files})
