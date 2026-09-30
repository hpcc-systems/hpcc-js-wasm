vcpkg_from_github(
    OUT_SOURCE_PATH SOURCE_PATH
    REPO sdatkinson/NeuralAmpModelerCore
    REF v${VERSION}
    SHA512 65f3fb8350db3c303d34c5a43958294630a63684077e7e59f237ac0b269d76146cedffbb95c8390c9065de93467f065519cfd3d7d1adcceef4192d9fdd55d1be
    HEAD_REF main
)

file(COPY
    "${CMAKE_CURRENT_LIST_DIR}/CMakeLists.txt"
    "${CMAKE_CURRENT_LIST_DIR}/cmake"
    DESTINATION "${SOURCE_PATH}"
)

file(WRITE "${SOURCE_PATH}/json.hpp" "#pragma once\n#include <nlohmann/json.hpp>\n")

vcpkg_cmake_configure(
    SOURCE_PATH "${SOURCE_PATH}"
)

vcpkg_cmake_install()
vcpkg_cmake_config_fixup(PACKAGE_NAME NeuralAmpModelerCore CONFIG_PATH share/NeuralAmpModelerCore)
vcpkg_copy_pdbs()

file(REMOVE_RECURSE
    "${CURRENT_PACKAGES_DIR}/debug/include"
    "${CURRENT_PACKAGES_DIR}/debug/share"
)

file(INSTALL "${SOURCE_PATH}/LICENSE" DESTINATION "${CURRENT_PACKAGES_DIR}/share/${PORT}" RENAME copyright)