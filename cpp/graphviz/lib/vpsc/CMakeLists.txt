INCLUDE_DIRECTORIES(
    ${GRAPHVIZ_LIB_DIR}/vpsc
)

ADD_LIBRARY(vpsc STATIC
    # Source files
    ${GRAPHVIZ_LIB_DIR}/vpsc/block.cpp
    ${GRAPHVIZ_LIB_DIR}/vpsc/blocks.cpp
    ${GRAPHVIZ_LIB_DIR}/vpsc/constraint.cpp
    ${GRAPHVIZ_LIB_DIR}/vpsc/csolve_VPSC.cpp
    ${GRAPHVIZ_LIB_DIR}/vpsc/generate-constraints.cpp
    ${GRAPHVIZ_LIB_DIR}/vpsc/pairingheap/PairingHeap.cpp
    ${GRAPHVIZ_LIB_DIR}/vpsc/remove_rectangle_overlap.cpp
    ${GRAPHVIZ_LIB_DIR}/vpsc/solve_VPSC.cpp
    ${GRAPHVIZ_LIB_DIR}/vpsc/variable.cpp
)
