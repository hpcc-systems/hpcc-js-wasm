vcpkg_from_gitlab(
  GITLAB_URL https://gitlab.com
  OUT_SOURCE_PATH SOURCE_PATH
  REPO graphviz/graphviz
  REF "${VERSION}"
  SHA512 cd99efeb4516b34f32b3c4432bf022dd412919b502edcc54541f112e5330bd14fe3fdecc819fc482cd57a8e1b2ee93d85793531fadf2f3b4422c317a0b3b049d
  HEAD_REF main
)

file(COPY ${CMAKE_CURRENT_LIST_DIR}/CMakeLists.txt DESTINATION ${SOURCE_PATH})
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
