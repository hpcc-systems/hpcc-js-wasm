vcpkg_from_github(
    OUT_SOURCE_PATH SOURCE_PATH
    REPO duckdb/duckdb
    REF v${VERSION}
    SHA512 1d726bb45b5d1c98ab4d31720534979cbe7d0c72dc777979fb42fa241b6b408959f6a6ed5db76e3cd3840df187f15f309364e931db257c45379101b24191d775
    HEAD_REF main
    PATCHES
        library-linkage.diff
)

# Remove vendored dependencies which are optional or not properly namespaced
file(REMOVE_RECURSE
    "${SOURCE_PATH}/extension/icu/third_party/icu"
    "${SOURCE_PATH}/third_party/catch"
    "${SOURCE_PATH}/third_party/imdb"
    "${SOURCE_PATH}/third_party/snowball"
    "${SOURCE_PATH}/third_party/tpce-tool"
)

set(extension_dirs "")

if("excel" IN_LIST FEATURES)
    vcpkg_from_github(
        OUT_SOURCE_PATH DUCKDB_EXCEL_SOURCE_PATH
        REPO duckdb/duckdb-excel
        REF 81bb84b115b97cc4edec4827714cac80da0127e1
        SHA512 7c6ecd90d3c744bdf23605b14b961164cac894c831380889875d0eb175ecfb8521741d2628ed82ba8353a6e59de0208acd6d5df1fb63411205dad327008c62ce
        HEAD_REF main
        PATCHES
            library-linkage-excel.diff
    )
    list(APPEND extension_dirs
        "${DUCKDB_EXCEL_SOURCE_PATH}"
        "${DUCKDB_EXCEL_SOURCE_PATH}/src/excel/numformat"
    )
    file(WRITE "${SOURCE_PATH}/.github/config/extensions/excel.cmake" "
duckdb_extension_load(excel
    SOURCE_DIR \"${DUCKDB_EXCEL_SOURCE_PATH}\"
    INCLUDE_DIR \"${DUCKDB_EXCEL_SOURCE_PATH}/src/excel/include\"
)
")
endif()

if("httpfs" IN_LIST FEATURES)
    vcpkg_from_github(
        OUT_SOURCE_PATH DUCKDB_HTTPFS_SOURCE_PATH
        REPO duckdb/duckdb_httpfs
        REF 77392a72077a85897db2519fae11e2c0da972b8a
        SHA512 44362620cf28ef384b36cb51fdf6b1d4a497bd70434ba4ada5765225073c7300c9fae9fcad55ecda26457ee7d847a2d3bc7396d4b01c2ec1a3cb42ed289ed87
        HEAD_REF main
        PATCHES
            library-linkage-httpfs.diff
    )
    list(APPEND extension_dirs "${DUCKDB_HTTPFS_SOURCE_PATH}")
    file(WRITE "${SOURCE_PATH}/.github/config/extensions/httpfs.cmake" "
duckdb_extension_load(httpfs
    SOURCE_DIR \"${DUCKDB_HTTPFS_SOURCE_PATH}\"
    INCLUDE_DIR \"${DUCKDB_HTTPFS_SOURCE_PATH}/src/include\"
)
")
endif()

set(BUILD_EXTENSIONS "${FEATURES}")
list(FILTER BUILD_EXTENSIONS INCLUDE REGEX "^(autocomplete|excel|httpfs|icu|json|tpcds|tpch)\$")

string(COMPARE EQUAL "${VCPKG_LIBRARY_LINKAGE}" "static" EXTENSION_STATIC_BUILD)
if(EXTENSION_STATIC_BUILD)
    set(DUCKDB_BUILD_SHARED_LIBS OFF)
else()
    set(DUCKDB_BUILD_SHARED_LIBS ON)
endif()

if(VCPKG_CROSSCOMPILING AND NOT DEFINED DUCKDB_EXPLICIT_PLATFORM)
    set(DUCKDB_EXPLICIT_PLATFORM "")
    if(VCPKG_TARGET_ARCHITECTURE STREQUAL "arm64")
        set(DUCKDB_EXPLICIT_PLATFORM "arm64")
    elseif(VCPKG_TARGET_ARCHITECTURE STREQUAL "x64")
        set(DUCKDB_EXPLICIT_PLATFORM "amd64")
    elseif(VCPKG_TARGET_ARCHITECTURE STREQUAL "x86")
        set(DUCKDB_EXPLICIT_PLATFORM "i686")
    endif()
    if(DUCKDB_EXPLICIT_PLATFORM)
        if(VCPKG_TARGET_IS_ANDROID)
            string(APPEND DUCKDB_EXPLICIT_PLATFORM "-linux_android")
        elseif(VCPKG_TARGET_IS_FREEBSD)
            string(APPEND DUCKDB_EXPLICIT_PLATFORM "-freebsd")
        elseif(VCPKG_TARGET_IS_LINUX)
            string(APPEND DUCKDB_EXPLICIT_PLATFORM "-linux")
        elseif(VCPKG_TARGET_IS_OSX)
            string(APPEND DUCKDB_EXPLICIT_PLATFORM "-osx")
        elseif(VCPKG_TARGET_IS_WINDOWS)
            string(APPEND DUCKDB_EXPLICIT_PLATFORM "-windows")
            if(VCPKG_TARGET_IS_MINGW)
                string(APPEND DUCKDB_EXPLICIT_PLATFORM "_mingw")
            endif()
        elseif()
            set(DUCKDB_EXPLICIT_PLATFORM "") # unknown. override in triplet file.
        endif()
    endif()
endif()

vcpkg_cmake_configure(
        SOURCE_PATH ${SOURCE_PATH}
        OPTIONS
            -DOVERRIDE_GIT_DESCRIBE=v${VERSION}-0-g0123456789
            -DDUCKDB_EXPLICIT_PLATFORM=${DUCKDB_EXPLICIT_PLATFORM}
            -DDUCKDB_EXPLICIT_VERSION=v${VERSION}
            "-DBUILD_EXTENSIONS=${BUILD_EXTENSIONS}"
            -DBUILD_SHARED_LIBS=${DUCKDB_BUILD_SHARED_LIBS}
            -DBUILD_SHELL=FALSE
            -DBUILD_UNITTESTS=OFF
            -DCMAKE_CXX_STANDARD=17
            -DCMAKE_JOB_POOL_LINK=console # Serialize linking to avoid OOM
            "-DDUCKDB_CAPABILITIES=httplib;loadable_extensions"
            -DLINK_CORE_EXTENSIONS=ON
            -DENABLE_SANITIZER=OFF
            -DENABLE_THREAD_SANITIZER=OFF
            -DENABLE_UBSAN=OFF
            "-DEXTENSION_CONFIG_BASE_DIR=${SOURCE_PATH}/.github/config/extensions"
            "-DEXTENSION_STATIC_BUILD=${EXTENSION_STATIC_BUILD}"
            "-DINSTALL_CMAKE_DIR:STRING=share/${PORT}"
)
vcpkg_cmake_install()
vcpkg_cmake_config_fixup()

if(VCPKG_LIBRARY_LINKAGE STREQUAL "static")
    foreach(path IN ITEMS duckdb.h duckdb/common/winapi.hpp)
        vcpkg_replace_string("${CURRENT_PACKAGES_DIR}/include/${path}" "#ifdef DUCKDB_STATIC_BUILD" "#if 1")
    endforeach()
endif()

file(REMOVE_RECURSE "${CURRENT_PACKAGES_DIR}/debug/include")
file(REMOVE_RECURSE "${CURRENT_PACKAGES_DIR}/debug/share")
# empty dirs
file(REMOVE_RECURSE "${CURRENT_PACKAGES_DIR}/include/duckdb/main/capi/header_generation")
file(REMOVE_RECURSE "${CURRENT_PACKAGES_DIR}/include/duckdb/storage/serialization")

file(INSTALL "${CMAKE_CURRENT_LIST_DIR}/usage" DESTINATION "${CURRENT_PACKAGES_DIR}/share/${PORT}")

set(third_party_licenses "")
file(COPY_FILE "${SOURCE_PATH}/third_party/thrift/thrift/LICENSE" "${SOURCE_PATH}/third_party/thrift/LICENSE")
file(GLOB third_party_files "${SOURCE_PATH}/third_party/*")
foreach(maybe_directory IN LISTS extension_dirs third_party_files)
    if(IS_DIRECTORY "${maybe_directory}")
        cmake_path(GET maybe_directory FILENAME package)
        set(license_file "${CURRENT_BUILDTREES_DIR}/${TARGET_TRIPLET}-rel/## ${package} license")
        file(COPY_FILE "${maybe_directory}/LICENSE" "${license_file}")
        list(APPEND third_party_licenses "${license_file}")
    endif()
endforeach()
vcpkg_install_copyright(
    COMMENT [[
Duckdb contains copies of many third-party packages which are subject to
separate license terms.
]]
    FILE_LIST
        "${SOURCE_PATH}/LICENSE"
        "${SOURCE_PATH}/third_party/tdigest/NOTICES"
        ${third_party_licenses}
)
