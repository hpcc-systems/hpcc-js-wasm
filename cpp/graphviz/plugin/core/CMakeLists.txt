add_library(gvplugin_core STATIC
    # Source files
    ${GRAPHVIZSRC_DIRS}/plugin/core/gvloadimage_core.c
    ${GRAPHVIZSRC_DIRS}/plugin/core/gvplugin_core.c
    ${GRAPHVIZSRC_DIRS}/plugin/core/gvrender_core_dot.c
    ${GRAPHVIZSRC_DIRS}/plugin/core/gvrender_core_json.c
    ${GRAPHVIZSRC_DIRS}/plugin/core/gvrender_core_fig.c
    ${GRAPHVIZSRC_DIRS}/plugin/core/gvrender_core_map.c
    ${GRAPHVIZSRC_DIRS}/plugin/core/gvrender_core_mp.c
    ${GRAPHVIZSRC_DIRS}/plugin/core/gvrender_core_pic.c
    ${GRAPHVIZSRC_DIRS}/plugin/core/gvrender_core_pov.c
    ${GRAPHVIZSRC_DIRS}/plugin/core/gvrender_core_ps.c
    ${GRAPHVIZSRC_DIRS}/plugin/core/gvrender_core_svg.c
    ${GRAPHVIZSRC_DIRS}/plugin/core/gvrender_core_tk.c
    ${GRAPHVIZSRC_DIRS}/plugin/core/gvrender_core_vml.c
)

include_directories(
    ${GRAPHVIZ_LIB_DIR}
    ${GRAPHVIZSRC_DIRS}/plugin/core
    ${GRAPHVIZSRC_DIRS}/build/plugin/core
    ${GRAPHVIZ_LIB_DIR}/cdt
    ${GRAPHVIZ_LIB_DIR}/cgraph
    ${GRAPHVIZ_LIB_DIR}/common
    ${GRAPHVIZ_LIB_DIR}/gvc
    ${GRAPHVIZ_LIB_DIR}/gvpr
    ${GRAPHVIZ_LIB_DIR}/pathplan
    ${GRAPHVIZ_LIB_DIR}/xdot
)

target_link_libraries(gvplugin_core
    cdt
    cgraph
    gvc
)

