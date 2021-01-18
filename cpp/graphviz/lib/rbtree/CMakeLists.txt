add_library(rbtree STATIC
    # Source files
    ${GRAPHVIZ_LIB_DIR}/rbtree/misc.c
    ${GRAPHVIZ_LIB_DIR}/rbtree/red_black_tree.c
    ${GRAPHVIZ_LIB_DIR}/rbtree/stack.c
)

include_directories(
    ${GRAPHVIZ_LIB_DIR}
)
