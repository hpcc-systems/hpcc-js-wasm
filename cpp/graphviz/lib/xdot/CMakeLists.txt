add_library(xdot STATIC
    # Source files
    ${GRAPHVIZ_LIB_DIR}/xdot/xdot.c
)

include_directories(
    ${GRAPHVIZ_LIB_DIR}
    ${GRAPHVIZ_LIB_DIR}/xdot
)
