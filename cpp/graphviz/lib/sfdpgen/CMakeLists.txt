add_library(sfdpgen STATIC
    # Source files
    ${GRAPHVIZ_LIB_DIR}/sfdpgen/Multilevel.c
    ${GRAPHVIZ_LIB_DIR}/sfdpgen/post_process.c
    ${GRAPHVIZ_LIB_DIR}/sfdpgen/PriorityQueue.c
    ${GRAPHVIZ_LIB_DIR}/sfdpgen/sfdpinit.c
    ${GRAPHVIZ_LIB_DIR}/sfdpgen/sparse_solve.c
    ${GRAPHVIZ_LIB_DIR}/sfdpgen/spring_electrical.c
    ${GRAPHVIZ_LIB_DIR}/sfdpgen/stress_model.c
    ${GRAPHVIZ_LIB_DIR}/sfdpgen/uniform_stress.c
)

include_directories(
    ${GRAPHVIZ_LIB_DIR}
    ${GRAPHVIZ_LIB_DIR}/cdt
    ${GRAPHVIZ_LIB_DIR}/cgraph
    ${GRAPHVIZ_LIB_DIR}/common
    ${GRAPHVIZ_LIB_DIR}/gvc
    ${GRAPHVIZ_LIB_DIR}/pack
    ${GRAPHVIZ_LIB_DIR}/pathplan
)

