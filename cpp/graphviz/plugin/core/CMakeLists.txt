PROJECT(gvplugin_core)

SET(SRCS
    ${GRAPHVIZSRC_DIRS}/plugin/core/gvloadimage_core.c
    ${GRAPHVIZSRC_DIRS}/plugin/core/gvplugin_core.c
    ${GRAPHVIZSRC_DIRS}/plugin/core/gvrender_core_dot.c
    ${GRAPHVIZSRC_DIRS}/plugin/core/gvrender_core_fig.c
    ${GRAPHVIZSRC_DIRS}/plugin/core/gvrender_core_json.c
    ${GRAPHVIZSRC_DIRS}/plugin/core/gvrender_core_map.c
    ${GRAPHVIZSRC_DIRS}/plugin/core/gvrender_core_mp.c
    ${GRAPHVIZSRC_DIRS}/plugin/core/gvrender_core_ps.c
    ${GRAPHVIZSRC_DIRS}/plugin/core/gvrender_core_pic.c
    ${GRAPHVIZSRC_DIRS}/plugin/core/gvrender_core_pov.c
    ${GRAPHVIZSRC_DIRS}/plugin/core/gvrender_core_svg.c
    ${GRAPHVIZSRC_DIRS}/plugin/core/gvrender_core_tk.c
    ${GRAPHVIZSRC_DIRS}/plugin/core/gvrender_core_vml.c
)

INCLUDE_DIRECTORIES(
    ${GRAPHVIZSRC_DIRS}/plugin/core
    ${GRAPHVIZSRC_DIRS}/lib/vpsc
    ${GRAPHVIZSRC_DIRS}/lib/twopigen
    ${GRAPHVIZSRC_DIRS}/lib/sparse
    ${GRAPHVIZSRC_DIRS}/lib/sfdpgen
    ${GRAPHVIZSRC_DIRS}/lib/pathplan
    ${GRAPHVIZSRC_DIRS}/lib/common
    ${GRAPHVIZSRC_DIRS}/lib/gvc
    ${GRAPHVIZSRC_DIRS}/lib/cdt
    ${GRAPHVIZSRC_DIRS}/lib/cgraph
    ${GRAPHVIZSRC_DIRS}/lib/xdot
)

ADD_LIBRARY(gvplugin_core STATIC
    ${SRCS}
)

TARGET_LINK_LIBRARIES(gvplugin_core
    vpsc
    twopigen
    sparse
    sfdpgen
    pathplan
    common
    gvc
    cdt
    cgraph
    xdot
)
