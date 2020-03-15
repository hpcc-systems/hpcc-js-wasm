PROJECT(common)

INCLUDE_DIRECTORIES(
    ${GRAPHVIZ_LIB_DIR}/common
    ${GRAPHVIZSRC_DIRS}/build/lib/common
    ${EXPATSRC_DIRS}/expat/lib
    ${GRAPHVIZ_LIB_DIR}/cdt
    ${GRAPHVIZ_LIB_DIR}/cgraph
    ${GRAPHVIZ_LIB_DIR}/gvc
    ${GRAPHVIZ_LIB_DIR}/label
    ${GRAPHVIZ_LIB_DIR}/pack
    ${GRAPHVIZ_LIB_DIR}/pathplan
    ${GRAPHVIZ_LIB_DIR}/fdpgen
    ${GRAPHVIZ_LIB_DIR}/xdot
)

ADD_LIBRARY(common STATIC
    # Source files
    ${GRAPHVIZ_LIB_DIR}/common/args.c
    ${GRAPHVIZ_LIB_DIR}/common/arrows.c
    ${GRAPHVIZ_LIB_DIR}/common/colxlate.c
    ${GRAPHVIZ_LIB_DIR}/common/ellipse.c
    ${GRAPHVIZ_LIB_DIR}/common/emit.c
    ${GRAPHVIZ_LIB_DIR}/common/geom.c
    ${GRAPHVIZ_LIB_DIR}/common/globals.c
    ${GRAPHVIZ_LIB_DIR}/common/htmllex.c
    ${GRAPHVIZ_LIB_DIR}/common/htmltable.c
    ${GRAPHVIZ_LIB_DIR}/common/input.c
    ${GRAPHVIZ_LIB_DIR}/common/intset.c
    ${GRAPHVIZ_LIB_DIR}/common/labels.c
    ${GRAPHVIZ_LIB_DIR}/common/ns.c
    ${GRAPHVIZ_LIB_DIR}/common/memory.c
    ${GRAPHVIZ_LIB_DIR}/common/output.c
    ${GRAPHVIZ_LIB_DIR}/common/pointset.c
    ${GRAPHVIZ_LIB_DIR}/common/postproc.c
    ${GRAPHVIZ_LIB_DIR}/common/psusershape.c
    ${GRAPHVIZ_LIB_DIR}/common/routespl.c
    ${GRAPHVIZ_LIB_DIR}/common/shapes.c
    ${GRAPHVIZ_LIB_DIR}/common/splines.c
    ${GRAPHVIZ_LIB_DIR}/common/taper.c
    ${GRAPHVIZ_LIB_DIR}/common/textspan.c
    ${GRAPHVIZ_LIB_DIR}/common/timing.c
    ${GRAPHVIZ_LIB_DIR}/common/utils.c
    
    # Generated files
    ${GRAPHVIZSRC_DIRS}/build/lib/common/htmlparse.c
)

