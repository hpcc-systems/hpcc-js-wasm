if(with_sfdp)

add_definitions(-DNEATOGEN_EXPORTS)

add_library(sfdpgen STATIC
  # Header files
  ${GRAPHVIZ_LIB_DIR}/sfdpgen/Multilevel.h
  ${GRAPHVIZ_LIB_DIR}/sfdpgen/post_process.h
  ${GRAPHVIZ_LIB_DIR}/sfdpgen/PriorityQueue.h
  ${GRAPHVIZ_LIB_DIR}/sfdpgen/sfdp.h
  ${GRAPHVIZ_LIB_DIR}/sfdpgen/sfdpinternal.h
  ${GRAPHVIZ_LIB_DIR}/sfdpgen/sparse_solve.h
  ${GRAPHVIZ_LIB_DIR}/sfdpgen/spring_electrical.h
  ${GRAPHVIZ_LIB_DIR}/sfdpgen/stress_model.h
  ${GRAPHVIZ_LIB_DIR}/sfdpgen/uniform_stress.h

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

target_include_directories(sfdpgen PRIVATE
  ${GRAPHVIZ_LIB_DIR}
  ${GRAPHVIZ_LIB_DIR}/cdt
  ${GRAPHVIZ_LIB_DIR}/cgraph
  ${GRAPHVIZ_LIB_DIR}/common
  ${GRAPHVIZ_LIB_DIR}/gvc
  ${GRAPHVIZ_LIB_DIR}/pack
  ${GRAPHVIZ_LIB_DIR}/pathplan
)

target_link_libraries(sfdpgen PRIVATE
  gvc
  neatogen
  sparse
)

endif()
