set(VCPKG_POLICY_EMPTY_INCLUDE_FOLDER enabled)

vcpkg_download_distfile(ARCHIVE
    URLS "https://github.com/westes/flex/releases/download/v${VERSION}/flex-${VERSION}.tar.gz"
    FILENAME "flex-${VERSION}.tar.gz"
    SHA512 e9785f3d620a204b7d20222888917dc065c2036cae28667065bf7862dfa1b25235095a12fd04efdbd09bfd17d3452e6b9ef953a8c1137862ff671c97132a082e
)

vcpkg_extract_source_archive(
    SOURCE_PATH
    ARCHIVE "${ARCHIVE}"
)

vcpkg_configure_make(
    SOURCE_PATH "${SOURCE_PATH}"
    OPTIONS
        --disable-shared
        --enable-static
        --disable-nls
)

vcpkg_install_make()
vcpkg_fixup_pkgconfig()

if(NOT EXISTS "${CURRENT_PACKAGES_DIR}/tools/${PORT}/bin/lex")
    file(CREATE_LINK "${CURRENT_PACKAGES_DIR}/tools/${PORT}/bin/flex" "${CURRENT_PACKAGES_DIR}/tools/${PORT}/bin/lex" SYMBOLIC)
endif()

file(REMOVE_RECURSE "${CURRENT_PACKAGES_DIR}/debug/include")
file(REMOVE_RECURSE "${CURRENT_PACKAGES_DIR}/debug/share")

vcpkg_install_copyright(FILE_LIST "${SOURCE_PATH}/COPYING")
