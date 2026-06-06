set(VCPKG_POLICY_EMPTY_INCLUDE_FOLDER enabled)

vcpkg_download_distfile(ARCHIVE
    URLS "https://ftp.gnu.org/gnu/bison/bison-${VERSION}.tar.xz"
    FILENAME "bison-${VERSION}.tar.xz"
    SHA512 d4d23af6671406e97257892f90651b67f2ab95219831372be032190b7156c10a3435d457857e677445df8b2327aacccc15344acbbc3808a6f332a93cce23b444
)

vcpkg_extract_source_archive(
    SOURCE_PATH
    ARCHIVE "${ARCHIVE}"
    PATCHES
        fix-maybe-unused-c17.patch
)

set(ENV{CFLAGS} "$ENV{CFLAGS} -std=gnu17")
set(ENV{CXXFLAGS} "$ENV{CXXFLAGS} -std=gnu++17")
set(ENV{ac_cv_prog_cc_c23} "no")

if(VCPKG_TARGET_IS_OSX)
    vcpkg_configure_make(
        SOURCE_PATH "${SOURCE_PATH}"
        AUTOCONFIG
        OPTIONS
            --disable-shared
            --enable-static
            --disable-nls
    )
else()
    vcpkg_configure_make(
        SOURCE_PATH "${SOURCE_PATH}"
        OPTIONS
            --disable-shared
            --enable-static
            --disable-nls
    )
endif()

vcpkg_install_make()
vcpkg_fixup_pkgconfig()

if(NOT EXISTS "${CURRENT_PACKAGES_DIR}/tools/${PORT}/bin/yacc")
    file(CREATE_LINK "${CURRENT_PACKAGES_DIR}/tools/${PORT}/bin/bison" "${CURRENT_PACKAGES_DIR}/tools/${PORT}/bin/yacc" SYMBOLIC)
endif()

file(REMOVE_RECURSE "${CURRENT_PACKAGES_DIR}/debug/include")
file(REMOVE_RECURSE "${CURRENT_PACKAGES_DIR}/debug/share")

vcpkg_install_copyright(FILE_LIST "${SOURCE_PATH}/COPYING")
