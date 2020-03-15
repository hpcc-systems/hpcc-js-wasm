INCLUDE_DIRECTORIES(${GRAPHVIZ_LIB_DIR}/xdot)

ADD_LIBRARY(xdot STATIC
    # Source files
    ${GRAPHVIZ_LIB_DIR}/xdot/xdot.c
)

