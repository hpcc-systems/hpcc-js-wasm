add_library(vpsc STATIC
    # Header files
    ${GRAPHVIZ_LIB_DIR}/vpsc/block.h
    ${GRAPHVIZ_LIB_DIR}/vpsc/blocks.h
    ${GRAPHVIZ_LIB_DIR}/vpsc/constraint.h
    ${GRAPHVIZ_LIB_DIR}/vpsc/csolve_VPSC.h
    ${GRAPHVIZ_LIB_DIR}/vpsc/generate-constraints.h
    ${GRAPHVIZ_LIB_DIR}/vpsc/pairingheap/PairingHeap.h
    ${GRAPHVIZ_LIB_DIR}/vpsc/pairingheap/dsexceptions.h
    ${GRAPHVIZ_LIB_DIR}/vpsc/remove_rectangle_overlap.h
    ${GRAPHVIZ_LIB_DIR}/vpsc/solve_VPSC.h
    ${GRAPHVIZ_LIB_DIR}/vpsc/variable.h

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

target_include_directories(vpsc PRIVATE
    ${GRAPHVIZ_LIB_DIR}
)

