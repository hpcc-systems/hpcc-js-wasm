vcpkg_from_gitlab(
  GITLAB_URL https://gitlab.com
  OUT_SOURCE_PATH SOURCE_PATH
  REPO graphviz/graphviz
  REF "${VERSION}"
  SHA512 be42ed09230d87b8d3192507b9738c62eea7d6bbe3c5552d1d2fcba7ebc036e0925706c744a6f4e078eae9811e344aba0fc0d9e96682d64ea1710c8afaedb1c8
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

set(graphviz_options
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

# Prefer the vcpkg host-built bison/flex (version 3.8+) over the macOS
# system bison (/usr/bin/bison is only 2.3 and too old for graphviz).
find_program(BISON bison
  PATHS "${CURRENT_INSTALLED_DIR}/../arm64-osx/tools/bison/bin"
  NO_DEFAULT_PATH
)
if(NOT BISON)
  vcpkg_find_acquire_program(BISON)
endif()

find_program(FLEX flex
  PATHS "${CURRENT_INSTALLED_DIR}/../arm64-osx/tools/flex/bin"
  NO_DEFAULT_PATH
)
if(NOT FLEX)
  vcpkg_find_acquire_program(FLEX)
endif()

list(APPEND graphviz_options
  "-DBISON_EXECUTABLE=${BISON}"
  "-DFLEX_EXECUTABLE=${FLEX}"
)

vcpkg_cmake_configure(
    SOURCE_PATH "${SOURCE_PATH}"
  OPTIONS
    ${graphviz_options}
)
vcpkg_cmake_install()
# vcpkg_cmake_config_fixup(PACKAGE_NAME "graphviz" CONFIG_PATH "share/cmake/graphviz")

file(REMOVE_RECURSE "${CURRENT_PACKAGES_DIR}/debug/include")
file(REMOVE_RECURSE "${CURRENT_PACKAGES_DIR}/debug/share")
file(REMOVE_RECURSE "${CURRENT_PACKAGES_DIR}/debug/lib/pkgconfig")
file(REMOVE_RECURSE "${CURRENT_PACKAGES_DIR}/lib/pkgconfig")

file(INSTALL "${SOURCE_PATH}/LICENSE" DESTINATION "${CURRENT_PACKAGES_DIR}/share/${PORT}" RENAME copyright)
