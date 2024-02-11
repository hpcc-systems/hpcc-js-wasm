cmake_minimum_required(VERSION 3.13.0 FATAL_ERROR)
project(Graphviz)

include(FeatureSummary)

# =============================== Build options ================================
set(enable_ltdl AUTO CACHE STRING "Support on-demand plugin loading")
set_property(CACHE enable_ltdl PROPERTY STRINGS AUTO ON OFF)
set(with_expat AUTO CACHE STRING "Support HTML-like labels through expat")
set_property(CACHE with_expat PROPERTY STRINGS AUTO ON OFF)
option(with_digcola    "DIGCOLA features in neato layout engine" ON )
set(with_gvedit AUTO CACHE STRING "GVEdit interactive graph editor")
set_property(CACHE with_gvedit PROPERTY STRINGS AUTO ON OFF)
option(with_ipsepcola  "IPSEPCOLA features in neato layout engine" ON )
option(with_ortho      "ORTHO features in neato layout engine." ON )
option(with_sfdp       "sfdp layout engine." ON )
set(with_smyrna AUTO CACHE STRING "SMYRNA large graph viewer")
set_property(CACHE with_smyrna PROPERTY STRINGS AUTO ON OFF)
set(with_zlib AUTO CACHE STRING "Support raster image compression through zlib")
set_property(CACHE with_zlib PROPERTY STRINGS AUTO ON OFF)
option(use_coverage    "enables analyzing code coverage" OFF )
option(with_cxx_api    "enables building the C++ API" OFF )
option(with_cxx_tests  "enables building the C++ tests" OFF )
option(use_win_pre_inst_libs "enables building using pre-installed Windows libraries" ON)
option(BUILD_SHARED_LIBS "Build in shared lib mode" ON)

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

if(NOT with_expat STREQUAL "OFF")
  find_package(EXPAT)
  if(with_expat STREQUAL "AUTO")
    if(EXPAT_FOUND)
      message(STATUS "setting -Dwith_expat=ON")
      set(with_expat ON)
    else()
      message(STATUS "setting -Dwith_expat=OFF")
      set(with_expat OFF)
    endif()
  elseif(NOT EXPAT_FOUND)
    message(FATAL_ERROR "-Dwith_expat=ON and expat not found")
  endif()
endif()

if(NOT with_smyrna STREQUAL "OFF")
  find_package(Freetype)
  find_package(GLUT)
  find_package(GTK2)
  find_package(PkgConfig)
  if(PkgConfig_FOUND)
    pkg_check_modules(FONTCONFIG fontconfig)
    pkg_check_modules(GTKGLEXT gtkglext-1.0)
    pkg_check_modules(GTS gts)
    pkg_check_modules(XRENDER xrender)
  endif()
  if(Freetype_FOUND AND GLUT_FOUND AND GTK2_FOUND AND FONTCONFIG_FOUND AND
     GTKGLEXT_FOUND AND GTS_FOUND AND XRENDER_FOUND)
    if(with_smyrna STREQUAL "AUTO")
      message(STATUS "setting -Dwith_smyrna=ON")
      set(with_smyrna ON)
    endif()
  else()
    if(with_smyrna STREQUAL "AUTO")
      message(STATUS "setting -Dwith_smyrna=OFF")
      set(with_smyrna OFF)
    else()
      message(FATAL_ERROR "-Dwith_smyrna=ON and dependencies not found")
    endif()
  endif()
endif()

find_package(GD)
find_package(GS)
find_package(GTS)

if(NOT enable_ltdl STREQUAL "OFF")
  find_package(LTDL)
  if(enable_ltdl STREQUAL "AUTO")
    if(LTDL_FOUND)
      message(STATUS "setting -Denable_ltdl=ON")
      set(enable_ltdl ON)
    else()
      message(STATUS "setting -Denable_ltdl=OFF")
      set(enable_ltdl OFF)
    endif()
  elseif(NOT LTDL_FOUND)
    message(FATAL_ERROR "-Denable_ltdl=ON and ltdl not found")
  endif()
endif()
if(enable_ltdl)
  add_definitions(-DENABLE_LTDL)
endif()

find_package(DevIL)
find_package(Freetype)
find_package(PANGOCAIRO)
find_package(PkgConfig)
if(PkgConfig_FOUND)
  pkg_check_modules(GDK gdk-2.0)
  pkg_check_modules(GDK_PIXBUF gdk-pixbuf-2.0)
  pkg_check_modules(LASI lasi)
  pkg_check_modules(POPPLER poppler-glib)
  pkg_check_modules(RSVG librsvg-2.0)
  pkg_check_modules(WEBP libwebp)
  pkg_check_modules(X11 x11)
  pkg_check_modules(XRENDER xrender)
else()
  set(GDK_FOUND 0)
  set(GDK_PIXBUF_FOUND 0)
  set(LASI_FOUND 0)
  set(POPPLER_FOUND 0)
  set(RSVG_FOUND 0)
  set(WEBP_FOUND 0)
  set(X11_FOUND 0)
  set(XRENDER_FOUND 0)
endif()

if(NOT with_zlib STREQUAL "OFF")
  find_package(ZLIB)
  if(with_zlib STREQUAL "AUTO")
    if(ZLIB_FOUND)
      message(STATUS "setting -Dwith_zlib=ON")
      set(with_zlib ON)
    else()
      message(STATUS "setting -Dwith_zlib=OFF")
      set(with_zlib OFF)
    endif()
  elseif(NOT ZLIB_FOUND)
    message(FATAL_ERROR "-Dwith_zlib=ON and zlib not found")
  endif()
endif()

if(UNIX)
  # find_library(MATH_LIB m)
  # link_libraries(${MATH_LIB})
endif()

if(WIN32)
  # Find Windows specific dependencies

  # Find DLLs on Windows
  if(with_expat)
    find_program(EXPAT_RUNTIME_LIBRARIES NAMES libexpat.dll expat.dll msys-expat-1.dll)
  endif()
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

# enable LTO in release builds
include(CheckIPOSupported)
check_ipo_supported(RESULT HAVE_IPO)
if(CMAKE_BUILD_TYPE STREQUAL "Release" OR
   CMAKE_BUILD_TYPE STREQUAL "RelWithDebInfo")
  if(HAVE_IPO)
    set(CMAKE_INTERPROCEDURAL_OPTIMIZATION ON)
  endif()
endif()

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
include(CheckCCompilerFlag)
check_c_compiler_flag(-Wformat-overflow=2 HAVE_C_WFORMAT_OVERFLOW_2)
if(HAVE_C_WFORMAT_OVERFLOW_2)
  set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -Wformat-overflow=2")
endif()
check_c_compiler_flag(-Wshadow HAVE_C_WSHADOW)
if(HAVE_C_WSHADOW)
  set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -Wshadow")
endif()
check_c_compiler_flag(-Wundef HAVE_C_WUNDEF)
if(HAVE_C_WUNDEF)
  set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -Wundef")
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

#  === hpcc-js-wasm  ===
add_library(graphviz INTERFACE)

target_include_directories(graphviz
  INTERFACE
  $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}>
  $<INSTALL_INTERFACE:include/graphviz>
)

install(
  TARGETS common gvplugin_core gvplugin_dot_layout gvplugin_neato_layout ortho gvc cdt cgraph dotgen neatogen fdpgen sfdpgen twopigen circogen label osage patchwork pack sparse pathplan xdot vpsc
  RUNTIME DESTINATION ${BINARY_INSTALL_DIR}
  LIBRARY DESTINATION ${LIBRARY_INSTALL_DIR}
  ARCHIVE DESTINATION ${LIBRARY_INSTALL_DIR}
)
#  === hpcc-js-wasm  ===

MATH(EXPR GRAPHVIZ_PLUGIN_VERSION "${GRAPHVIZ_PLUGIN_VERSION}+1")
set(GVPLUGIN_VERSION "${GRAPHVIZ_PLUGIN_VERSION}")
set(VERSION "${GRAPHVIZ_VERSION_STRING}")
set(prefix "${CMAKE_INSTALL_PREFIX}")
set(exec_prefix "${CMAKE_INSTALL_PREFIX}")
set(PACKAGE "graphviz")
configure_file(${CMAKE_CURRENT_SOURCE_DIR}/lib/cdt/libcdt.pc.in ${CMAKE_CURRENT_BINARY_DIR}/libcdt.pc @ONLY)
configure_file(${CMAKE_CURRENT_SOURCE_DIR}/lib/cgraph/libcgraph.pc.in ${CMAKE_CURRENT_BINARY_DIR}/libcgraph.pc @ONLY)
configure_file(${CMAKE_CURRENT_SOURCE_DIR}/lib/gvc/libgvc.pc.in ${CMAKE_CURRENT_BINARY_DIR}/libgvc.pc @ONLY)
configure_file(${CMAKE_CURRENT_SOURCE_DIR}/lib/gvpr/libgvpr.pc.in ${CMAKE_CURRENT_BINARY_DIR}/libgvpr.pc @ONLY)
configure_file(${CMAKE_CURRENT_SOURCE_DIR}/lib/pathplan/libpathplan.pc.in ${CMAKE_CURRENT_BINARY_DIR}/libpathplan.pc @ONLY)
configure_file(${CMAKE_CURRENT_SOURCE_DIR}/lib/xdot/libxdot.pc.in ${CMAKE_CURRENT_BINARY_DIR}/libxdot.pc @ONLY)
file(GLOB pcfiles "${CMAKE_CURRENT_BINARY_DIR}/*.pc")
foreach(file "${pcfiles}")
	install(FILES ${file} DESTINATION "${PKGCONFIG_DIR}")
endforeach(file)

feature_summary(WHAT ALL INCLUDE_QUIET_PACKAGES FATAL_ON_MISSING_REQUIRED_PACKAGES)
