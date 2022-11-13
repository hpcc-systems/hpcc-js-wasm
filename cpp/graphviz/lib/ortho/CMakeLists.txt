if(with_ortho)

add_definitions(-DGVC_EXPORTS)

add_library(ortho_obj OBJECT
  # Header files
  ${GRAPHVIZ_LIB_DIR}/ortho/fPQ.h
  ${GRAPHVIZ_LIB_DIR}/ortho/maze.h
  ${GRAPHVIZ_LIB_DIR}/ortho/ortho.h
  ${GRAPHVIZ_LIB_DIR}/ortho/partition.h
  ${GRAPHVIZ_LIB_DIR}/ortho/rawgraph.h
  ${GRAPHVIZ_LIB_DIR}/ortho/sgraph.h
  ${GRAPHVIZ_LIB_DIR}/ortho/structures.h
  ${GRAPHVIZ_LIB_DIR}/ortho/trap.h

  # Source files
  ${GRAPHVIZ_LIB_DIR}/ortho/fPQ.c
  ${GRAPHVIZ_LIB_DIR}/ortho/maze.c
  ${GRAPHVIZ_LIB_DIR}/ortho/ortho.c
  ${GRAPHVIZ_LIB_DIR}/ortho/partition.c
  ${GRAPHVIZ_LIB_DIR}/ortho/rawgraph.c
  ${GRAPHVIZ_LIB_DIR}/ortho/sgraph.c
  ${GRAPHVIZ_LIB_DIR}/ortho/trapezoid.c
)

target_include_directories(ortho_obj PRIVATE
  ${GRAPHVIZ_LIB_DIR}
  ${GRAPHVIZ_LIB_DIR}/cdt
  ${GRAPHVIZ_LIB_DIR}/cgraph
  ${GRAPHVIZ_LIB_DIR}/common
  ${GRAPHVIZ_LIB_DIR}/gvc
  ${GRAPHVIZ_LIB_DIR}/pack
  ${GRAPHVIZ_LIB_DIR}/pathplan
)

add_library(ortho STATIC
  $<TARGET_OBJECTS:ortho_obj>
)

endif()
