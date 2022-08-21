PROJECT(graphlayout)

find_package(expat CONFIG REQUIRED)

SET(GRAPHVIZ_LIB_DIR "${GRAPHVIZ_DIR}/lib")
SET(GRAPHVIZ_PLUGIN_DIR "${GRAPHVIZ_DIR}/plugin")
SET(GRAPHVIZ_BUILD_DIR "${GRAPHVIZ_DIR}/build")

INCLUDE_DIRECTORIES(
    ${CMAKE_CURRENT_SOURCE_DIR}
    ${VCPKG_INCLUDE_DIR}
)

option(enable_ltdl     "Support on-demand plugin loading" OFF)
option(with_expat      "Support HTML-like labels through expat" ON )
option(with_digcola    "DIGCOLA features in neato layout engine" ON )
option(with_ipsepcola  "IPSEPCOLA features in neato layout engine (disabled by default - C++ portability issues)." OFF )
option(with_ortho      "ORTHO features in neato layout engine." ON )
option(with_sfdp       "sfdp layout engine." ON )
option(with_smyrna     "SMYRNA large graph viewer (disabled by default - experimental)" OFF)
option(with_zlib       "Support raster image compression through zlib" OFF)
option(use_sanitizers  "enables using address and undefined behavior sanitizer" OFF)
option(use_coverage    "enables analyzing code coverage" OFF)
option(with_cxx_api    "enables building the C++ API" ON)
option(with_cxx_tests  "enables building the C++ tests" OFF)
option(use_win_pre_inst_libs "enables building using pre-installed Windows libraries" OFF)

if(with_digcola)
  add_definitions(-DDIGCOLA)
endif()

if(with_ipsepcola)
  add_definitions(-DIPSEPCOLA)
endif()

if(with_ortho)
  add_definitions(-DORTHO)
endif()

if(with_sfdp)
  add_definitions(-DSFDP)
endif()

# ===================== Append local CMake module directory ====================
list(APPEND CMAKE_MODULE_PATH "${GRAPHVIZ_DIR}/cmake")

# find_package(ANN)

# find_package(CAIRO)

if(with_expat)
  find_package(EXPAT)
endif()

# find_package(GD)

if(enable_ltdl)
  find_package(LTDL)
  if(LTDL_FOUND)
    add_definitions(-DENABLE_LTDL)
  endif()
endif()

# find_package(PANGOCAIRO)

if(with_zlib)
  find_package(ZLIB)
endif()

# if(UNIX)
#   find_library(MATH_LIB m)
# endif()
add_subdirectory(lib)
add_subdirectory(plugin)
add_subdirectory(graphvizlib)
