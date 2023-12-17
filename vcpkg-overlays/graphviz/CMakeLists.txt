cmake_minimum_required(VERSION 3.13.0 FATAL_ERROR)
project(Graphviz)

include(FeatureSummary)

# =============================== Build options ================================
option(enable_ltdl     "Support on-demand plugin loading" OFF )
option(with_expat      "Support HTML-like labels through expat" ON )
option(with_digcola    "DIGCOLA features in neato layout engine" ON )
option(with_gvedit     "GVEdit interactive graph editor" OFF )
option(with_ipsepcola  "IPSEPCOLA features in neato layout engine (disabled by default - C++ portability issues)." OFF )
option(with_ortho      "ORTHO features in neato layout engine." ON )
option(with_sfdp       "sfdp layout engine." ON )
option(with_smyrna     "SMYRNA large graph viewer (disabled by default - experimental)" OFF )
option(with_zlib       "Support raster image compression through zlib" OFF )
option(use_coverage    "enables analyzing code coverage" OFF )
option(with_cxx_api    "enables building the C++ API" OFF )
option(with_cxx_tests  "enables building the C++ tests" OFF )
option(use_win_pre_inst_libs "enables building using pre-installed Windows libraries" OFF )

if(WIN32)
  # Build dynamic-link libraries on Windows, including MinGW. The
  # CMake build system does not currently support building static
  # libraries, so the GVDLL symbol can be unconditionally set until
  # such support is introduced.
  add_definitions(-DGVDLL)

  option(install_win_dependency_dlls "Install 3rd party dependencies" ON)
endif()

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
list(APPEND CMAKE_MODULE_PATH "${CMAKE_CURRENT_SOURCE_DIR}/cmake")

# ============================= Build dependencies =============================
find_package(BISON 3.0 REQUIRED)
find_package(FLEX REQUIRED)
find_program(GIT git)
if(NOT GIT)
  message(FATAL_ERROR "git not found")
endif()
find_program(GZIP gzip)

# ================== Convenient values for CMake configuration =================
if(${CMAKE_SYSTEM_NAME} MATCHES "Linux")
  include(GNUInstallDirs)
  set(BINARY_INSTALL_DIR  "${CMAKE_INSTALL_BINDIR}")
  set(LIBRARY_INSTALL_DIR "${CMAKE_INSTALL_LIBDIR}")
  set(HEADER_INSTALL_DIR  "${CMAKE_INSTALL_INCLUDEDIR}/graphviz")
  set(MAN_INSTALL_DIR     "${CMAKE_INSTALL_MANDIR}")
  set(libdir              "${CMAKE_INSTALL_FULL_LIBDIR}")
  set(includedir          "${CMAKE_INSTALL_FULL_INCLUDEDIR}")
  set(DATA_INSTALL_DIR    "${CMAKE_INSTALL_DATAROOTDIR}")
else()
  set(BINARY_INSTALL_DIR  bin)
  set(LIBRARY_INSTALL_DIR lib)
  set(HEADER_INSTALL_DIR  include/graphviz)
  set(MAN_INSTALL_DIR     share/man)
  set(libdir              "${CMAKE_INSTALL_PREFIX}/${LIBRARY_INSTALL_DIR}")
  set(includedir          "${CMAKE_INSTALL_PREFIX}/include")
  set(DATA_INSTALL_DIR    share)
endif()

set(PLUGIN_INSTALL_DIR      ${LIBRARY_INSTALL_DIR}/graphviz)
set(PKGCONFIG_DIR           ${LIBRARY_INSTALL_DIR}/pkgconfig)
# TODO: Find a way to check for groff and ps2pdf for manpage pdf generation
# set(MAN_PDF_INSTALL_DIR share/graphviz/doc/pdf)
set(WINDOWS_DEPENDENCY_DIR  "${CMAKE_CURRENT_SOURCE_DIR}/windows/dependencies/libraries")
set(WINDOWS_DEPENDENCY_VCPKG_DIR  "${CMAKE_CURRENT_SOURCE_DIR}/windows/dependencies/libraries/vcpkg/installed")
if(CMAKE_CL_64)
  set(WINDOWS_DEPENDENCY_DIR "${WINDOWS_DEPENDENCY_DIR}/x64")
  set(WINDOWS_DEPENDENCY_VCPKG_DIR "${WINDOWS_DEPENDENCY_VCPKG_DIR}/x64-windows")
else()
  set(WINDOWS_DEPENDENCY_DIR "${WINDOWS_DEPENDENCY_DIR}/x86")
  set(WINDOWS_DEPENDENCY_VCPKG_DIR "${WINDOWS_DEPENDENCY_VCPKG_DIR}/x86-windows")
endif()

set(GRAPHVIZ_PLUGIN_VERSION 6)
# Name of the config file used by Graphviz
set(GVPLUGIN_CONFIG_FILE config${GRAPHVIZ_PLUGIN_VERSION})

# ============================ Library dependencies ============================
if(WIN32)
  if(use_win_pre_inst_libs)
    list(APPEND CMAKE_PREFIX_PATH ${WINDOWS_DEPENDENCY_DIR})
    list(APPEND CMAKE_PREFIX_PATH ${WINDOWS_DEPENDENCY_VCPKG_DIR})
  endif()
  if(MINGW)
    list(APPEND CMAKE_PREFIX_PATH $ENV{MSYSTEM_PREFIX})
  endif()
endif()

find_package(ANN)
find_package(CAIRO)

if(with_expat)
  find_package(EXPAT)
endif()

find_package(GD)

if(enable_ltdl)
  find_package(LTDL)
  if(LTDL_FOUND)
    add_definitions(-DENABLE_LTDL)
  endif()
endif()

find_package(PANGOCAIRO)

if(with_zlib)
  find_package(ZLIB)
endif()

if(UNIX)
  # find_library(MATH_LIB m)
  # link_libraries(${MATH_LIB})
endif()

if(WIN32)
  # Find Windows specific dependencies

  # Find DLLs on Windows
  find_program(EXPAT_RUNTIME_LIBRARIES NAMES libexpat.dll expat.dll msys-expat-1.dll)
  if(CMAKE_CL_64)
    find_program(MSYS_RUNTIME_LIBRARIES NAMES msys-2.0.dll)
  endif()
endif()

# ============================ Set Graphviz version ============================

find_package(Python3 REQUIRED COMPONENTS Interpreter)

if(DEFINED VERSION)
  set(GRAPHVIZ_VERSION_STRING "${VERSION}")
else()
  execute_process(
    COMMAND           ${Python3_EXECUTABLE} gen_version.py
    WORKING_DIRECTORY "${CMAKE_CURRENT_SOURCE_DIR}"
    RESULT_VARIABLE   gen_version_result
    OUTPUT_VARIABLE   GRAPHVIZ_VERSION_STRING
    ERROR_VARIABLE    gen_version_error
    OUTPUT_STRIP_TRAILING_WHITESPACE
    ERROR_STRIP_TRAILING_WHITESPACE
  )
  if(NOT gen_version_result EQUAL 0)
    message(FATAL_ERROR "Failed to set version: ${gen_version_error}")
  endif()
endif()

# Set GRAPHVIZ_VERSION_BUILD to time of last commit, or to 0 if that fails.
execute_process(
  COMMAND           ${Python3_EXECUTABLE} gen_version.py --committer-date-graphviz
  WORKING_DIRECTORY "${CMAKE_CURRENT_SOURCE_DIR}"
  RESULT_VARIABLE   gen_date_result
  OUTPUT_VARIABLE   GRAPHVIZ_VERSION_BUILD
  ERROR_VARIABLE    gen_date_error
  OUTPUT_STRIP_TRAILING_WHITESPACE
  ERROR_STRIP_TRAILING_WHITESPACE
)
if(NOT gen_date_result EQUAL 0)
  message(FATAL_ERROR "Failed to set date: ${gen_date_error}")
endif()

string(REGEX REPLACE "\\..*"
  "" GRAPHVIZ_VERSION_MAJOR
  ${GRAPHVIZ_VERSION_STRING})
string(REGEX REPLACE "[^.]*\\.([^.]*)\\..*"
  "\\1" GRAPHVIZ_VERSION_MINOR
  ${GRAPHVIZ_VERSION_STRING})
string(REGEX REPLACE "[^.]*\\.[^.]*\\.(.*)$"
  "\\1" GRAPHVIZ_VERSION_PATCH
  ${GRAPHVIZ_VERSION_STRING})

set(GRAPHVIZ_VERSION_FULL "${GRAPHVIZ_VERSION_STRING}")
file(WRITE ${CMAKE_CURRENT_BINARY_DIR}/builddate.h "#define BUILDDATE \"${GRAPHVIZ_VERSION_BUILD}\"")

configure_file(graphviz_version.h.cmake ${CMAKE_CURRENT_BINARY_DIR}/graphviz_version.h @ONLY)
install(FILES ${CMAKE_CURRENT_BINARY_DIR}/graphviz_version.h DESTINATION ${HEADER_INSTALL_DIR})

message(STATUS "Graphviz version: ${GRAPHVIZ_VERSION_FULL}")

include(config_checks)
if(NOT HAVE_GETOPT_H)
  find_package(GETOPT REQUIRED)
endif()
include_directories(${CMAKE_CURRENT_BINARY_DIR})

# ==================== Custom target for `make uninstall` ======================
configure_file(
  "${CMAKE_CURRENT_SOURCE_DIR}/cmake/cmake_uninstall.cmake.in"
  "${CMAKE_CURRENT_BINARY_DIR}/cmake_uninstall.cmake"
  IMMEDIATE @ONLY)

add_custom_target(uninstall
  COMMAND ${CMAKE_COMMAND} -P ${CMAKE_CURRENT_BINARY_DIR}/cmake_uninstall.cmake)

# =========================== Compiler configuration ===========================

set(CMAKE_C_STANDARD 99)
set(CMAKE_C_STANDARD_REQUIRED ON)

set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

set(CMAKE_POSITION_INDEPENDENT_CODE ON)

if(${CMAKE_CXX_COMPILER_ID} STREQUAL MSVC)
  # MSVC warning C4996 mostly fires on completely valid code. The changes
  # proposed in the warning text often seriously compromise the code
  # portability, while they never substantially improve the code quality. Thus
  # we suppress this warning.
  set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} /wd4996")
  set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} /wd4996")
else()
  # Enable common warnings flags
  set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -Wall")
  set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -Wall -Wextra")
endif()

if(use_coverage)
  add_compile_options("-coverage")
  add_link_options("-coverage")
endif()

# ============================ Packaging information ===========================
include(InstallRequiredSystemLibraries)
include(package_info)
include(CPack)

# ==================================== Test ====================================
include(CTest)

# ======================= Specify subdirectories to build ======================
# add_subdirectory(contrib/diffimg)
# add_subdirectory(contrib/prune)
# add_subdirectory(graphs)
add_subdirectory(lib)
add_subdirectory(plugin)
# add_subdirectory(cmd)
# add_subdirectory(share)
if(with_cxx_tests)
  # add_subdirectory(tests)
endif()

add_library(graphviz INTERFACE)

target_include_directories(graphviz
  INTERFACE
  $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}>
  $<INSTALL_INTERFACE:include/graphviz>
)

install(
  TARGETS common gvplugin_core gvplugin_dot_layout gvplugin_neato_layout ortho gvc cdt cgraph dotgen neatogen fdpgen sfdpgen twopigen circogen label osage patchwork pack sparse pathplan xdot
  RUNTIME DESTINATION ${BINARY_INSTALL_DIR}
  LIBRARY DESTINATION ${LIBRARY_INSTALL_DIR}
  ARCHIVE DESTINATION ${LIBRARY_INSTALL_DIR}
)

MATH(EXPR GRAPHVIZ_PLUGIN_VERSION "${GRAPHVIZ_PLUGIN_VERSION}+1")
set(GVPLUGIN_VERSION "${GRAPHVIZ_PLUGIN_VERSION}")
set(VERSION "${GRAPHVIZ_VERSION_STRING}")
set(prefix "${CMAKE_INSTALL_PREFIX}")
set(exec_prefix "${CMAKE_INSTALL_PREFIX}")
set(PACKAGE "graphviz")
configure_file(${CMAKE_CURRENT_SOURCE_DIR}/lib/cdt/libcdt.pc.in ${CMAKE_CURRENT_SOURCE_DIR}/libcdt.pc @ONLY)
configure_file(${CMAKE_CURRENT_SOURCE_DIR}/lib/cgraph/libcgraph.pc.in ${CMAKE_CURRENT_SOURCE_DIR}/libcgraph.pc @ONLY)
configure_file(${CMAKE_CURRENT_SOURCE_DIR}/lib/gvc/libgvc.pc.in ${CMAKE_CURRENT_SOURCE_DIR}/libgvc.pc @ONLY)
configure_file(${CMAKE_CURRENT_SOURCE_DIR}/lib/gvpr/libgvpr.pc.in ${CMAKE_CURRENT_SOURCE_DIR}/libgvpr.pc @ONLY)
configure_file(${CMAKE_CURRENT_SOURCE_DIR}/lib/edgepaint/liblab_gamut.pc.in ${CMAKE_CURRENT_SOURCE_DIR}/liblab_gamut.pc @ONLY)
configure_file(${CMAKE_CURRENT_SOURCE_DIR}/lib/pathplan/libpathplan.pc.in ${CMAKE_CURRENT_SOURCE_DIR}/libpathplan.pc @ONLY)
configure_file(${CMAKE_CURRENT_SOURCE_DIR}/lib/xdot/libxdot.pc.in ${CMAKE_CURRENT_SOURCE_DIR}/libxdot.pc @ONLY)
file(GLOB pcfiles "${CMAKE_CURRENT_SOURCE_DIR}/*.pc")
foreach(file "${pcfiles}")
	install(FILES ${file} DESTINATION "${PKGCONFIG_DIR}")
endforeach(file)

feature_summary(WHAT ALL INCLUDE_QUIET_PACKAGES FATAL_ON_MISSING_REQUIRED_PACKAGES)
