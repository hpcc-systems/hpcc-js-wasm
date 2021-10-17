add_library(gvplugin_core STATIC
    # Header files
    ${GRAPHVIZ_PLUGIN_DIR}/core/ps.h

    # Source files
    ${GRAPHVIZ_PLUGIN_DIR}/core/gvloadimage_core.c
    ${GRAPHVIZ_PLUGIN_DIR}/core/gvplugin_core.c
    ${GRAPHVIZ_PLUGIN_DIR}/core/gvrender_core_dot.c
    ${GRAPHVIZ_PLUGIN_DIR}/core/gvrender_core_json.c
    ${GRAPHVIZ_PLUGIN_DIR}/core/gvrender_core_fig.c
    ${GRAPHVIZ_PLUGIN_DIR}/core/gvrender_core_map.c
    ${GRAPHVIZ_PLUGIN_DIR}/core/gvrender_core_mp.c
    ${GRAPHVIZ_PLUGIN_DIR}/core/gvrender_core_pic.c
    ${GRAPHVIZ_PLUGIN_DIR}/core/gvrender_core_pov.c
    ${GRAPHVIZ_PLUGIN_DIR}/core/gvrender_core_ps.c
    ${GRAPHVIZ_PLUGIN_DIR}/core/gvrender_core_svg.c
    ${GRAPHVIZ_PLUGIN_DIR}/core/gvrender_core_tk.c
    ${GRAPHVIZ_PLUGIN_DIR}/core/gvrender_core_vml.c
)

target_include_directories(gvplugin_core PRIVATE
    ${GRAPHVIZ_LIB_DIR}
    ${GRAPHVIZ_PLUGIN_DIR}/core
    ${GRAPHVIZ_BUILD_DIR}/plugin/core
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

