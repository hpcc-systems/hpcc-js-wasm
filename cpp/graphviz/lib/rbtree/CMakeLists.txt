add_library(rbtree STATIC
    # Header files
    ${GRAPHVIZ_LIB_DIR}/rbtree/red_black_tree.h
    ${GRAPHVIZ_LIB_DIR}/rbtree/stack.h

    # Source files
    ${GRAPHVIZ_LIB_DIR}/rbtree/misc.c
    ${GRAPHVIZ_LIB_DIR}/rbtree/red_black_tree.c
    ${GRAPHVIZ_LIB_DIR}/rbtree/stack.c
)

include_directories(rbtree PRIVATE
    ${GRAPHVIZ_LIB_DIR}
)
