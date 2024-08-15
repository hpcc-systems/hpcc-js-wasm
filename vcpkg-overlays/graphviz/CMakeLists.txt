cmake_minimum_required(VERSION 3.14.1 FATAL_ERROR)
project(Graphviz)

include(FeatureSummary)

# =============================== Build options ================================
set(ENABLE_LTDL AUTO CACHE STRING "Support on-demand plugin loading")
set_property(CACHE ENABLE_LTDL PROPERTY STRINGS AUTO ON OFF)
set(WITH_EXPAT AUTO CACHE STRING "Support HTML-like labels through expat")
set_property(CACHE WITH_EXPAT PROPERTY STRINGS AUTO ON OFF)
option(with_digcola    "DIGCOLA features in neato layout engine" ON )
set(WITH_GVEDIT AUTO CACHE STRING "GVEdit interactive graph editor")
set_property(CACHE WITH_GVEDIT PROPERTY STRINGS AUTO ON OFF)
option(with_ipsepcola  "IPSEPCOLA features in neato layout engine" ON )
option(with_ortho      "ORTHO features in neato layout engine." ON )
option(with_sfdp       "sfdp layout engine." ON )
set(WITH_SMYRNA AUTO CACHE STRING "SMYRNA large graph viewer")
set_property(CACHE WITH_SMYRNA PROPERTY STRINGS AUTO ON OFF)
set(WITH_ZLIB AUTO CACHE STRING "Support raster image compression through zlib")
set_property(CACHE WITH_ZLIB PROPERTY STRINGS AUTO ON OFF)
option(use_coverage    "enables analyzing code coverage" OFF)
option(with_cxx_api    "enables building the C++ API" OFF)
option(with_cxx_tests  "enables building the C++ tests" OFF)
option(use_win_pre_inst_libs
       "enables building using pre-installed Windows libraries" ON)
option(BUILD_SHARED_LIBS "Build in shared lib mode" ON)
set(ENABLE_TCL AUTO CACHE STRING "Build TCL components")
set_property(CACHE ENABLE_TCL PROPERTY STRINGS AUTO ON OFF)
set(ENABLE_SWIG AUTO CACHE STRING "Build language bindings")
set_property(CACHE ENABLE_SWIG PROPERTY STRINGS AUTO ON OFF)
set(ENABLE_SHARP AUTO CACHE STRING "Build C# language bindings")
set_property(CACHE ENABLE_SHARP PROPERTY STRINGS AUTO ON OFF)
set(ENABLE_D AUTO CACHE STRING "Build D language bindings")
set_property(CACHE ENABLE_D PROPERTY STRINGS AUTO ON OFF)
set(ENABLE_GO AUTO CACHE STRING "Build Go language bindings")
set_property(CACHE ENABLE_GO PROPERTY STRINGS AUTO ON OFF)
set(INTGOSIZE AUTO CACHE STRING "Integer size for go, 32 or 64")
set_property(CACHE INTGOSIZE PROPERTY STRINGS AUTO 32 64)
set(ENABLE_JAVASCRIPT AUTO CACHE STRING "Build Javascript language bindings")
set_property(CACHE ENABLE_JAVASCRIPT PROPERTY STRINGS AUTO ON OFF)
option(GRAPHVIZ_CLI "Build command line tools" ON)

if(WIN32)
  if(BUILD_SHARED_LIBS)
    # build dynamic-link libraries on Windows, including MinGW
    add_definitions(-DGVDLL)
  endif()

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
find_program(GZIP gzip)

# ================== Convenient values for CMake configuration =================
if(${CMAKE_SYSTEM_NAME} MATCHES "Linux")
  include(GNUInstallDirs)
  set(BINARY_INSTALL_DIR  "${CMAKE_INSTALL_BINDIR}")
  set(LIBRARY_INSTALL_DIR "${CMAKE_INSTALL_LIBDIR}")
  set(HEADER_INSTALL_DIR  "${CMAKE_INSTALL_INCLUDEDIR}/graphviz")
  set(MAN_INSTALL_DIR     "${CMAKE_INSTALL_MANDIR}")
  set(libdir # cmake-lint: disable=C0103
                          "${CMAKE_INSTALL_FULL_LIBDIR}")
  set(includedir # cmake-lint: disable=C0103
                          "${CMAKE_INSTALL_FULL_INCLUDEDIR}")
  set(DATA_INSTALL_DIR    "${CMAKE_INSTALL_DATAROOTDIR}")
else()
  set(BINARY_INSTALL_DIR  bin)
  set(LIBRARY_INSTALL_DIR lib)
  set(HEADER_INSTALL_DIR  include/graphviz)
  set(MAN_INSTALL_DIR     share/man)
  set(libdir # cmake-lint: disable=C0103
                          "${CMAKE_INSTALL_PREFIX}/${LIBRARY_INSTALL_DIR}")
  set(includedir # cmake-lint: disable=C0103
                          "${CMAKE_INSTALL_PREFIX}/include")
  set(DATA_INSTALL_DIR    share)
endif()

set(PLUGIN_INSTALL_DIR      ${LIBRARY_INSTALL_DIR}/graphviz)
set(PKGCONFIG_DIR           ${LIBRARY_INSTALL_DIR}/pkgconfig)
# TODO: Find a way to check for groff and ps2pdf for manpage pdf generation
# set(MAN_PDF_INSTALL_DIR share/graphviz/doc/pdf)
set(WINDOWS_DEPENDENCY_DIR
    "${CMAKE_CURRENT_SOURCE_DIR}/windows/dependencies/libraries")
set(WINDOWS_DEPENDENCY_VCPKG_DIR "${WINDOWS_DEPENDENCY_DIR}/vcpkg/installed")
if(CMAKE_CL_64)
  set(WINDOWS_DEPENDENCY_DIR "${WINDOWS_DEPENDENCY_DIR}/x64")
  set(WINDOWS_DEPENDENCY_VCPKG_DIR
      "${WINDOWS_DEPENDENCY_VCPKG_DIR}/x64-windows")
else()
  set(WINDOWS_DEPENDENCY_DIR "${WINDOWS_DEPENDENCY_DIR}/x86")
  set(WINDOWS_DEPENDENCY_VCPKG_DIR
      "${WINDOWS_DEPENDENCY_VCPKG_DIR}/x86-windows")
endif()

set(GRAPHVIZ_PLUGIN_VERSION 6)
# Name of the config file used by Graphviz
set(GVPLUGIN_CONFIG_FILE config${GRAPHVIZ_PLUGIN_VERSION})

# ============================ Library dependencies ============================
if(WIN32)
  if(use_win_pre_inst_libs)
    list(APPEND CMAKE_PREFIX_PATH ${WINDOWS_DEPENDENCY_VCPKG_DIR})
    list(APPEND CMAKE_PREFIX_PATH ${WINDOWS_DEPENDENCY_DIR})
    set(PKG_CONFIG_EXECUTABLE
        "${WINDOWS_DEPENDENCY_VCPKG_DIR}/tools/pkgconf/pkgconf.exe"
        CACHE STRING "The pathname of the pkg-config program")
  endif()
  if(MINGW)
    list(APPEND CMAKE_PREFIX_PATH $ENV{MSYSTEM_PREFIX})
  endif()
endif()

# FIXME: workaround for uninitialized variable in `freetype-targets.cmake`
set(_cmake_import_check_xcframework_for_freetype /dev/null)

find_package(ANN)
find_package(CAIRO)

if(NOT WITH_EXPAT STREQUAL "OFF")
  find_package(EXPAT)
  if(WITH_EXPAT STREQUAL "AUTO")
    if(EXPAT_FOUND)
      message(STATUS "setting -DWITH_EXPAT=ON")
      set(WITH_EXPAT ON)
    else()
      message(STATUS "setting -DWITH_EXPAT=OFF")
      set(WITH_EXPAT OFF)
    endif()
  elseif(NOT EXPAT_FOUND)
    message(FATAL_ERROR "-DWITH_EXPAT=ON and expat not found")
  endif()
endif()

find_package(GTS)

if(NOT WITH_SMYRNA STREQUAL "OFF")
  find_package(Freetype)
  find_package(GLUT)
  find_package(GTK2)
  find_package(PkgConfig)
  find_package(Fontconfig)
  if(PkgConfig_FOUND)
    pkg_check_modules(GTKGLEXT gtkglext-1.0)
    pkg_check_modules(XRENDER xrender)
  endif()
  if(Freetype_FOUND AND GLUT_FOUND AND GTK2_FOUND AND Fontconfig_FOUND AND
     GTKGLEXT_FOUND AND GTS_FOUND AND XRENDER_FOUND)
    if(WITH_SMYRNA STREQUAL "AUTO")
      message(STATUS "setting -DWITH_SMYRNA=ON")
      set(WITH_SMYRNA ON)
    endif()
  else()
    if(WITH_SMYRNA STREQUAL "AUTO")
      message(STATUS "setting -DWITH_SMYRNA=OFF")
      set(WITH_SMYRNA OFF)
    else()
      message(FATAL_ERROR "-DWITH_SMYRNA=ON and dependencies not found")
    endif()
  endif()
endif()

find_package(GD)
find_package(GS)

if(NOT ENABLE_LTDL STREQUAL "OFF")
  find_package(LTDL)
  if(ENABLE_LTDL STREQUAL "AUTO")
    if(LTDL_FOUND)
      message(STATUS "setting -DENABLE_LTDL=ON")
      set(ENABLE_LTDL ON)
    else()
      message(STATUS "setting -DENABLE_LTDL=OFF")
      set(ENABLE_LTDL OFF)
    endif()
  elseif(NOT LTDL_FOUND)
    message(FATAL_ERROR "-DENABLE_LTDL=ON and ltdl not found")
  endif()
endif()
if(ENABLE_LTDL)
  add_definitions(-DENABLE_LTDL)
endif()

find_package(DevIL)
find_package(Freetype)
find_package(PANGOCAIRO)
find_package(PkgConfig)
if(PkgConfig_FOUND)
  pkg_check_modules(GDK gdk-3.0)
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

if(NOT WITH_ZLIB STREQUAL "OFF")
  find_package(ZLIB)
  if(WITH_ZLIB STREQUAL "AUTO")
    if(ZLIB_FOUND)
      message(STATUS "setting -DWITH_ZLIB=ON")
      set(WITH_ZLIB ON)
    else()
      message(STATUS "setting -DWITH_ZLIB=OFF")
      set(WITH_ZLIB OFF)
    endif()
  elseif(NOT ZLIB_FOUND)
    message(FATAL_ERROR "-DWITH_ZLIB=ON and zlib not found")
  endif()
endif()

if(NOT ENABLE_TCL STREQUAL "OFF")
  find_package(TCL)
  if(ENABLE_TCL STREQUAL "AUTO")
    if(TCL_FOUND)
      message(STATUS "setting -DENABLE_TCL=ON")
      set(ENABLE_TCL ON)
    else()
      message(STATUS "setting -DENABLE_TCL=OFF")
      set(ENABLE_TCL OFF)
    endif()
  elseif(NOT TCL_FOUND)
    message(FATAL_ERROR "-DENABLE_TCL=ON and TCL not found")
  endif()
endif()

if(NOT ENABLE_SWIG STREQUAL "OFF")
  # Opt in to new `-module` behavior that we do not care about. This silences
  # -Wdev warnings. See `cmake --help-policy CMP0086`.
  if(POLICY CMP0086)
    cmake_policy(SET CMP0086 NEW)
  endif()

  find_package(SWIG COMPONENTS csharp d go javascript)
  if(ENABLE_SWIG STREQUAL "AUTO")
    if(SWIG_FOUND)
      message(STATUS "setting -DENABLE_SWIG=ON")
      set(ENABLE_SWIG ON)
    else()
      message(STATUS "setting -DENABLE_SWIG=OFF")
      set(ENABLE_SWIG OFF)
    endif()
  elseif(NOT SWIG_FOUND)
    message(FATAL_ERROR "-DENABLE_SWIG=ON and SWIG not found")
  endif()
endif()

if(NOT ENABLE_SHARP STREQUAL "OFF")
  # Opt in to new default naming conventions for C#. This silences -Wdev
  # warnings. See `cmake --help-policy CMP0122`.
  if(POLICY CMP0122)
    cmake_policy(SET CMP0122 NEW)
  endif()

  if(ENABLE_SWIG AND SWIG_csharp_FOUND)
    if(ENABLE_SHARP STREQUAL "AUTO")
      message(STATUS "setting -DENABLE_SHARP=ON")
      set(ENABLE_SHARP ON)
    endif()
  elseif(ENABLE_SHARP STREQUAL "ON")
    message(FATAL_ERROR "-DENABLE_SWIG=ON must be set to use -DENABLE_SHARP=ON")
  else()
    message(STATUS "setting -DENABLE_SHARP=OFF")
    set(ENABLE_SHARP OFF)
  endif()
endif()

if(NOT ENABLE_D STREQUAL "OFF")
  if(ENABLE_SWIG AND SWIG_d_FOUND)
    if(ENABLE_D STREQUAL "AUTO")
      message(STATUS "setting -DENABLE_D=ON")
      set(ENABLE_D ON)
    endif()
  elseif(ENABLE_D STREQUAL "ON")
    message(FATAL_ERROR "-DENABLE_SWIG=ON must be set to use -DENABLE_D=ON")
  else()
    message(STATUS "setting -DENABLE_D=OFF")
    set(ENABLE_D OFF)
  endif()
endif()

if(NOT ENABLE_GO STREQUAL "OFF")
  if(ENABLE_SWIG AND SWIG_go_FOUND)
    if(ENABLE_GO STREQUAL "AUTO")
      message(STATUS "setting -DENABLE_GO=ON")
      set(ENABLE_GO ON)
    endif()
  elseif(ENABLE_GO STREQUAL "ON")
    message(FATAL_ERROR "-DENABLE_SWIG=ON must be set to use -DENABLE_GO=ON")
  else()
    message(STATUS "setting -DENABLE_GO=OFF")
    set(ENABLE_GO OFF)
  endif()
endif()

if(ENABLE_GO)
  if(INTGOSIZE STREQUAL "AUTO")
    math(EXPR INTGOSIZE "${CMAKE_SIZEOF_VOID_P} * 8")
    message(STATUS "setting -DINTGOSIZE=${INTGOSIZE}")
  endif()
endif()

if(NOT ENABLE_JAVASCRIPT STREQUAL "OFF")
  find_package(JAVASCRIPTCORE)
  if(ENABLE_SWIG AND SWIG_javascript_FOUND AND JAVASCRIPTCORE_FOUND)
    if(ENABLE_JAVASCRIPT STREQUAL "AUTO")
      message(STATUS "setting -DENABLE_JAVASCRIPT=ON")
      set(ENABLE_JAVASCRIPT ON)
    endif()
  elseif(ENABLE_JAVASCRIPT STREQUAL "ON")
    message(
      FATAL_ERROR "-DENABLE_SWIG=ON must be set and JavaScriptCore must be \
                   available to use -DENABLE_JAVASCRIPT=ON"
    )
  else()
    message(STATUS "setting -DENABLE_JAVASCRIPT=OFF")
    set(ENABLE_JAVASCRIPT OFF)
  endif()
endif()

if(UNIX)
  # hpcc-js-wasm find_library(MATH_LIB m)
  # hpcc-js-wasm link_libraries(${MATH_LIB})
endif()

if(WIN32)
  # Find Windows specific dependencies

  # Find DLLs on Windows
  if(WITH_EXPAT)
    find_program(EXPAT_RUNTIME_LIBRARIES
                 NAMES libexpat.dll expat.dll msys-expat-1.dll)
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
  COMMAND           ${Python3_EXECUTABLE}
                    gen_version.py --committer-date-graphviz
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
file(WRITE ${CMAKE_CURRENT_BINARY_DIR}/builddate.h
     "#define BUILDDATE \"${GRAPHVIZ_VERSION_BUILD}\"")

configure_file(graphviz_version.h.cmake
               ${CMAKE_CURRENT_BINARY_DIR}/graphviz_version.h @ONLY)
install(FILES ${CMAKE_CURRENT_BINARY_DIR}/graphviz_version.h
        DESTINATION ${HEADER_INSTALL_DIR})

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
  COMMAND ${CMAKE_COMMAND} -P ${CMAKE_CURRENT_BINARY_DIR}/cmake_uninstall.cmake
  COMMENT "Uninstall Graphviz"
)

# =========================== Compiler configuration ===========================

set(CMAKE_C_STANDARD 99)
set(CMAKE_C_STANDARD_REQUIRED ON)

set(CMAKE_CXX_STANDARD 17)
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
check_c_compiler_flag(-Wcast-function-type HAVE_C_WCAST_FUNCTION_TYPE)
if(HAVE_C_WCAST_FUNCTION_TYPE)
  set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -Wcast-function-type")
endif()
check_c_compiler_flag(-Wformat-overflow=2 HAVE_C_WFORMAT_OVERFLOW_2)
if(HAVE_C_WFORMAT_OVERFLOW_2)
  set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -Wformat-overflow=2")
endif()
check_c_compiler_flag(-Wimplicit-fallthrough HAVE_C_WIMPLICIT_FALLTHROUGH)
if(HAVE_C_WIMPLICIT_FALLTHROUGH)
  set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -Wimplicit-fallthrough")
endif()
check_c_compiler_flag(
  -Wmissing-field-initializers HAVE_C_WMISSING_FIELD_INITIALIZERS
)
if(HAVE_C_WMISSING_FIELD_INITIALIZERS)
  set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -Wmissing-field-initializers")
endif()
check_c_compiler_flag(-Wmissing-prototypes HAVE_C_WMISSING_PROTOTYPES)
if(HAVE_C_WMISSING_PROTOTYPES)
  set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -Wmissing-prototypes")
endif()
check_c_compiler_flag(-Wshadow HAVE_C_WSHADOW)
if(HAVE_C_WSHADOW)
  set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -Wshadow")
endif()
check_c_compiler_flag(-Wundef HAVE_C_WUNDEF)
if(HAVE_C_WUNDEF)
  set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -Wundef")
endif()
include(CheckCXXCompilerFlag)
check_cxx_compiler_flag(-Wsign-compare HAVE_CXX_WSIGN_COMPARE)
check_cxx_compiler_flag(-Wunused-function HAVE_CXX_WUNUSED_FUNCTION)
check_cxx_compiler_flag(-Wunused-parameter HAVE_CXX_WUNUSED_PARAMETER)

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
# hpcc-js-wasm add_subdirectory(contrib/diffimg)
# hpcc-js-wasm add_subdirectory(contrib/prune)
# hpcc-js-wasm add_subdirectory(graphs)
add_subdirectory(lib)
add_subdirectory(plugin)
if(GRAPHVIZ_CLI)
  # hpcc-js-wasm add_subdirectory(cmd)
endif()
# hpcc-js-wasm add_subdirectory(share)
add_subdirectory(tclpkg)
if(with_cxx_tests)
  # hpcc-js-wasm add_subdirectory(tests)
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
set(prefix "${CMAKE_INSTALL_PREFIX}") # cmake-lint: disable=C0103
set(exec_prefix "${CMAKE_INSTALL_PREFIX}") # cmake-lint: disable=C0103
set(PACKAGE "graphviz")
configure_file(${CMAKE_CURRENT_SOURCE_DIR}/lib/cdt/libcdt.pc.in
               ${CMAKE_CURRENT_BINARY_DIR}/libcdt.pc @ONLY)
configure_file(${CMAKE_CURRENT_SOURCE_DIR}/lib/cgraph/libcgraph.pc.in
               ${CMAKE_CURRENT_BINARY_DIR}/libcgraph.pc @ONLY)
configure_file(${CMAKE_CURRENT_SOURCE_DIR}/lib/gvc/libgvc.pc.in
               ${CMAKE_CURRENT_BINARY_DIR}/libgvc.pc @ONLY)
configure_file(${CMAKE_CURRENT_SOURCE_DIR}/lib/gvpr/libgvpr.pc.in
               ${CMAKE_CURRENT_BINARY_DIR}/libgvpr.pc @ONLY)
configure_file(${CMAKE_CURRENT_SOURCE_DIR}/lib/pathplan/libpathplan.pc.in
               ${CMAKE_CURRENT_BINARY_DIR}/libpathplan.pc @ONLY)
configure_file(${CMAKE_CURRENT_SOURCE_DIR}/lib/xdot/libxdot.pc.in
               ${CMAKE_CURRENT_BINARY_DIR}/libxdot.pc @ONLY)
file(GLOB pcfiles "${CMAKE_CURRENT_BINARY_DIR}/*.pc")
foreach(file "${pcfiles}")
  install(FILES ${file} DESTINATION "${PKGCONFIG_DIR}")
endforeach(file)

feature_summary(
  WHAT
  ALL
  INCLUDE_QUIET_PACKAGES
  FATAL_ON_MISSING_REQUIRED_PACKAGES
)
