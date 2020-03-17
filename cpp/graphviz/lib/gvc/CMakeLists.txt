INCLUDE_DIRECTORIES(
    ${GRAPHVIZ_LIB_DIR}/gvc
    ${GRAPHVIZSRC_DIRS}
    ${GRAPHVIZ_LIB_DIR}/ast
    ${GRAPHVIZ_LIB_DIR}/cdt
    ${GRAPHVIZ_LIB_DIR}/cgraph
    ${GRAPHVIZ_LIB_DIR}/common
    ${GRAPHVIZ_LIB_DIR}/pathplan
)

ADD_LIBRARY(gvc STATIC
    # Source files
    ${GRAPHVIZ_LIB_DIR}/gvc/gvc.c
    ${GRAPHVIZ_LIB_DIR}/gvc/gvconfig.c
    ${GRAPHVIZ_LIB_DIR}/gvc/gvcontext.c
    ${GRAPHVIZ_LIB_DIR}/gvc/gvdevice.c
    ${GRAPHVIZ_LIB_DIR}/gvc/gvevent.c
    ${GRAPHVIZ_LIB_DIR}/gvc/gvjobs.c
    ${GRAPHVIZ_LIB_DIR}/gvc/gvlayout.c
    ${GRAPHVIZ_LIB_DIR}/gvc/gvloadimage.c
    ${GRAPHVIZ_LIB_DIR}/gvc/gvplugin.c
    ${GRAPHVIZ_LIB_DIR}/gvc/gvrender.c
    ${GRAPHVIZ_LIB_DIR}/gvc/gvtextlayout.c
    ${GRAPHVIZ_LIB_DIR}/gvc/gvtool_tred.c
    ${GRAPHVIZ_LIB_DIR}/gvc/gvusershape.c
)

TARGET_LINK_LIBRARIES(gvc
    cdt
    cgraph
    common
    label
    pack
    pathplan
    xdot
    expat
)
