vcpkg_from_sourceforge(
    OUT_SOURCE_PATH SOURCE_PATH
    REPO base91/basE91
    REF 0.6.0
    SHA512 0785178bcf556c02c03dfb467eb936fa84d92f070827f05d356bca4e8558a2f73462228f157dc8242e31305d8a61bfbabf92706974fc3bbec21c4076adc0e37e
    FILENAME base91-0.6.0.tar.gz
)

file(COPY ${CMAKE_CURRENT_LIST_DIR}/CMakeLists.txt ${CMAKE_CURRENT_LIST_DIR}/base91.hpp DESTINATION ${SOURCE_PATH})

vcpkg_cmake_configure(
    SOURCE_PATH "${SOURCE_PATH}"
    PREFER_NINJA
)

vcpkg_cmake_install()

vcpkg_copy_pdbs()

vcpkg_fixup_cmake_targets(CONFIG_PATH share/unofficial-${PORT} TARGET_PATH share/unofficial-${PORT})

# Handle copyright
file(INSTALL ${SOURCE_PATH}/LICENSE DESTINATION ${CURRENT_PACKAGES_DIR}/share/${PORT} RENAME copyright)
