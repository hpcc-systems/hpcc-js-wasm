vcpkg_from_github(
    OUT_SOURCE_PATH SOURCE_PATH
    REPO ggerganov/llama.cpp
    REF "${VERSION}"
    SHA512 ab331e287e9131cb00431b41f707995813f21c8f3c64fe7b18cb69a3f18f39a6540f51ade30db6a9dbf61722008e611eaa45a337f78c830f73189e56baff0f90
    HEAD_REF master
)

set(GGML_SOURCE_PATH "${SOURCE_PATH}/ggml")

set(_ggml_wrapper_path "${CURRENT_BUILDTREES_DIR}/ggml-wrapper")
file(MAKE_DIRECTORY "${_ggml_wrapper_path}")
file(WRITE "${_ggml_wrapper_path}/CMakeLists.txt" "cmake_minimum_required(VERSION 3.14)\nproject(ggml-wrapper C CXX ASM)\nadd_subdirectory(\"${GGML_SOURCE_PATH}\" ggml)\n")

vcpkg_cmake_configure(
    SOURCE_PATH "${_ggml_wrapper_path}"
    OPTIONS
        -DBUILD_SHARED_LIBS=OFF
        -DGGML_BACKEND_DL=OFF
        -DGGML_WASM_SINGLE_FILE=OFF
        -DGGML_OPENMP=OFF
)

vcpkg_cmake_install()

# Headers
file(INSTALL "${GGML_SOURCE_PATH}/include/" DESTINATION "${CURRENT_PACKAGES_DIR}/include")
file(INSTALL "${GGML_SOURCE_PATH}/include/" DESTINATION "${CURRENT_PACKAGES_DIR}/debug/include")

# Libraries (ggml's upstream install rules are not stable across versions; ensure the expected archives exist)
file(MAKE_DIRECTORY "${CURRENT_PACKAGES_DIR}/lib")
file(MAKE_DIRECTORY "${CURRENT_PACKAGES_DIR}/debug/lib")

foreach(_cfg rel dbg)
    set(_bt "${CURRENT_BUILDTREES_DIR}/${TARGET_TRIPLET}-${_cfg}")

    if("${_cfg}" STREQUAL "dbg")
        set(_dst "${CURRENT_PACKAGES_DIR}/debug/lib")
    else()
        set(_dst "${CURRENT_PACKAGES_DIR}/lib")
    endif()

    if(EXISTS "${_bt}/ggml/src/libggml.a")
        file(INSTALL "${_bt}/ggml/src/libggml.a" DESTINATION "${_dst}")
    endif()
    if(EXISTS "${_bt}/ggml/src/libggml-base.a")
        file(INSTALL "${_bt}/ggml/src/libggml-base.a" DESTINATION "${_dst}")
    endif()
    if(EXISTS "${_bt}/ggml/src/libggml-cpu.a")
        file(INSTALL "${_bt}/ggml/src/libggml-cpu.a" DESTINATION "${_dst}")
    endif()
endforeach()

file(INSTALL "${SOURCE_PATH}/LICENSE" DESTINATION "${CURRENT_PACKAGES_DIR}/share/${PORT}" RENAME copyright)
