vcpkg_from_github(
    OUT_SOURCE_PATH SOURCE_PATH
    REPO ggerganov/llama.cpp
    REF "${VERSION}"
    SHA512 ab331e287e9131cb00431b41f707995813f21c8f3c64fe7b18cb69a3f18f39a6540f51ade30db6a9dbf61722008e611eaa45a337f78c830f73189e56baff0f90
    HEAD_REF master
)

vcpkg_cmake_configure(
    SOURCE_PATH "${SOURCE_PATH}"
    OPTIONS
        -DLLAMA_BUILD_TESTS=OFF
        -DLLAMA_BUILD_EXAMPLES=OFF
        -DLLAMA_BUILD_SERVER=OFF
        -DLLAMA_WASM_SINGLE_FILE=OFF
        -DLLAMA_WASM_MEM64=OFF
        -DLLAMA_USE_SYSTEM_GGML=ON
        -DLLAMA_CURL=OFF
)

vcpkg_cmake_install()

vcpkg_copy_pdbs()
vcpkg_fixup_pkgconfig()
vcpkg_cmake_config_fixup(CONFIG_PATH lib/cmake/llama)

file(INSTALL ${SOURCE_PATH}/common DESTINATION ${CURRENT_PACKAGES_DIR}/share/${PORT})

file(REMOVE_RECURSE "${CURRENT_PACKAGES_DIR}/debug/include")
file(REMOVE_RECURSE "${CURRENT_PACKAGES_DIR}/debug/share")
file(INSTALL ${SOURCE_PATH}/LICENSE DESTINATION ${CURRENT_PACKAGES_DIR}/share/${PORT} RENAME copyright)
