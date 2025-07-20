vcpkg_from_gitlab(
  GITLAB_URL https://gitlab.com
  OUT_SOURCE_PATH SOURCE_PATH
  REPO graphviz/graphviz
  REF "${VERSION}"
  SHA512 10531aeb65f8a19b014018ab1e8b3463a83f9b2b0bb5e3caa000b7e5302e8905e8e7b18dec3c8aaa90d6a1562851e8400157e6662163d740f2ba54e20ca79247
  HEAD_REF main
)

file(COPY ${CMAKE_CURRENT_LIST_DIR}/CMakeLists.txt DESTINATION ${SOURCE_PATH})
file(COPY ${CMAKE_CURRENT_LIST_DIR}/cmake/config_checks.cmake DESTINATION ${SOURCE_PATH}/cmake)

# file(COPY ${CMAKE_CURRENT_LIST_DIR}/lib DESTINATION "${SOURCE_PATH}/lib")

vcpkg_cmake_configure(
    SOURCE_PATH "${SOURCE_PATH}"
    OPTIONS
        -DENABLE_LTDL=OFF
        -DWITH_EXPAT=ON
        -DWITH_GVEDIT=OFF
        -WITH_SMYRNA=OFF
        -DWITH_ZLIB=OFF
        -Duse_win_pre_inst_libs=OFF
        -DBUILD_SHARED_LIBS=OFF
        -DENABLE_TCL=OFF
        -DENABLE_SWIG=OFF
        -DENABLE_SHARP=OFF
        -DENABLE_D=OFF
        -DENABLE_GO=OFF
        -DENABLE_JAVASCRIPT=OFF
        -DGRAPHVIZ_CLI=OFF
)
vcpkg_cmake_install()
# vcpkg_cmake_config_fixup(PACKAGE_NAME "graphviz" CONFIG_PATH "share/cmake/graphviz")

file(REMOVE_RECURSE "${CURRENT_PACKAGES_DIR}/debug/include")
file(REMOVE_RECURSE "${CURRENT_PACKAGES_DIR}/debug/share")
file(REMOVE_RECURSE "${CURRENT_PACKAGES_DIR}/debug/lib/pkgconfig")
file(REMOVE_RECURSE "${CURRENT_PACKAGES_DIR}/lib/pkgconfig")

file(INSTALL "${SOURCE_PATH}/LICENSE" DESTINATION "${CURRENT_PACKAGES_DIR}/share/${PORT}" RENAME copyright)
