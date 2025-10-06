vcpkg_from_gitlab(
  GITLAB_URL https://gitlab.com
  OUT_SOURCE_PATH SOURCE_PATH
  REPO graphviz/graphviz
  REF "${VERSION}"
  SHA512 edfde09fdd47d5e10c2c531fcc28749b07be49c2a5506102a04a0fbe1321441aaba44545ed7b983c78c510eec894f823c260bbfa06109c29c15eb591b16275d6
  HEAD_REF main
)

# Fix GVPLUGIN_CURRENT and GVPLUGIN_REVISION undefined variables in 14.0.1
# This is a regression from 14.0.0 which used GRAPHVIZ_PLUGIN_VERSION
file(GLOB_RECURSE PLUGIN_CMAKE_FILES "${SOURCE_PATH}/plugin/*/CMakeLists.txt")
foreach(PLUGIN_FILE ${PLUGIN_CMAKE_FILES})
  vcpkg_replace_string("${PLUGIN_FILE}" 
    "\${GVPLUGIN_CURRENT}.0.\${GVPLUGIN_REVISION}"
    "\${GRAPHVIZ_PLUGIN_VERSION}.0.0")
  vcpkg_replace_string("${PLUGIN_FILE}"
    "\${GVPLUGIN_CURRENT}"
    "\${GRAPHVIZ_PLUGIN_VERSION}")
endforeach()

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
