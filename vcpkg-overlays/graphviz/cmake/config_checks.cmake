# Header checks
include(CheckIncludeFile)

check_include_file( sys/inotify.h       HAVE_SYS_INOTIFY_H      )
check_include_file( sys/ioctl.h         HAVE_SYS_IOCTL_H        )
check_include_file( sys/mman.h          HAVE_SYS_MMAN_H         )
check_include_file( sys/select.h        HAVE_SYS_SELECT_H       )
check_include_file( sys/time.h          HAVE_SYS_TIME_H         )
check_include_file( getopt.h            HAVE_GETOPT_H           )

# Function checks
include(CheckFunctionExists)

check_function_exists( dl_iterate_phdr  HAVE_DL_ITERATE_PHDR )
check_function_exists( drand48          HAVE_DRAND48         )
check_function_exists( inotify_init1    HAVE_INOTIFY_INIT1   )
check_function_exists( memrchr          HAVE_MEMRCHR         )
set(HAVE_PANGO_FC_FONT_LOCK_FACE 0)
if(PANGOCAIRO_FOUND)
  if (PANGOCAIRO_VERSION VERSION_GREATER_EQUAL 1.4)
    message(STATUS "Pangocairo >= 1.4, so have pango_fc_font_lock_face")
    set(HAVE_PANGO_FC_FONT_LOCK_FACE 1)
  endif()
endif()
check_function_exists( setenv           HAVE_SETENV          )
check_function_exists( setmode          HAVE_SETMODE         )
check_function_exists( srand48          HAVE_SRAND48         )
check_function_exists( strcasestr       HAVE_STRCASESTR      )

# Library checks
set( HAVE_DEVIL     ${DevIL_FOUND}      )
if(WITH_EXPAT)
  set(HAVE_EXPAT 1)
endif()
set( HAVE_FREETYPE  ${Freetype_FOUND}   )
set( HAVE_LIBGD     ${GD_FOUND}         )
set( HAVE_GDK       ${GDK_FOUND}        )
set( HAVE_GDK_PIXBUF ${GDK_PIXBUF_FOUND})
set( HAVE_GS        ${GS_FOUND}         )
set( HAVE_GTS       ${GTS_FOUND}        )
if(WITH_ZLIB)
  set(HAVE_LIBZ 1)
endif()
set(HAVE_LASI       ${LASI_FOUND}      )
set(HAVE_PANGOCAIRO ${PANGOCAIRO_FOUND})
set(HAVE_POPPLER    ${POPPLER_FOUND}   )
set(HAVE_WEBP       ${WEBP_FOUND}      )
set(HAVE_X11        ${X11_FOUND}       )
set(HAVE_XRENDER    ${XRENDER_FOUND}   )

# Values
if(WIN32)

  set( BROWSER            start                                   )

elseif(APPLE)

  set( BROWSER            open                                    )
  set( DARWIN             1                                       )
  set( DARWIN_DYLIB       1                                       )

else()

  set( BROWSER            xdg-open                                )

endif()

set(DEFAULT_DPI 96)

# Write check results to config.h header
configure_file(config-cmake.h.in config.h)
