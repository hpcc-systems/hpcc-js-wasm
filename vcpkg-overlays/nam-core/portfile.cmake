vcpkg_from_github(
    OUT_SOURCE_PATH SOURCE_PATH
    REPO sdatkinson/NeuralAmpModelerCore
    REF v${VERSION}
    SHA512 319c3002c504cb84300ca965656c008c8bdd4260cc8d25b3ba4feb2a19c7061a8a24eeabc991a41ec9345c85c0325ca96905f1ef1d2a209db65a4093c28d3f59
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