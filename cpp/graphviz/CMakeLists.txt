PROJECT(graphlayout)

SET(GRAPHVIZ_LIB_DIR "${GRAPHVIZ_DIR}/lib")
SET(GRAPHVIZ_PLUGIN_DIR "${GRAPHVIZ_DIR}/plugin")
SET(GRAPHVIZ_BUILD_DIR "${GRAPHVIZ_DIR}/build")

INCLUDE_DIRECTORIES(
    ${CMAKE_CURRENT_SOURCE_DIR}
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
option(with_cxx_api    "enables building the C++ API" OFF)
option(with_cxx_tests  "enables building the C++ tests" OFF)

if (with_digcola)
    add_definitions(-DDIGCOLA)
endif (with_digcola)

if (with_ipsepcola)
    add_definitions(-DIPSEPCOLA)
endif (with_ipsepcola)

if (with_ortho)
    add_definitions(-DORTHO)
endif (with_ortho)

if (with_sfdp)
    add_definitions(-DSFDP)
endif (with_sfdp)

if (with_smyrna)
    # TODO include dependency checks
    add_definitions(-DSMYRNA)
endif (with_smyrna)

ADD_SUBDIRECTORY(lib)
ADD_SUBDIRECTORY(plugin)
ADD_SUBDIRECTORY(graphvizlib)
