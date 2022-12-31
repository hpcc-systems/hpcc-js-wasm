add_library(patchwork STATIC
  # Header files
  ${GRAPHVIZ_LIB_DIR}/patchwork/patchwork.h
  ${GRAPHVIZ_LIB_DIR}/patchwork/tree_map.h

  # Source files
  ${GRAPHVIZ_LIB_DIR}/patchwork/patchwork.c
  ${GRAPHVIZ_LIB_DIR}/patchwork/patchworkinit.c
  ${GRAPHVIZ_LIB_DIR}/patchwork/tree_map.c
)

target_include_directories(patchwork PRIVATE
  ${GRAPHVIZ_LIB_DIR}
  ${GRAPHVIZ_LIB_DIR}/cdt
  ${GRAPHVIZ_LIB_DIR}/cgraph
  ${GRAPHVIZ_LIB_DIR}/common
  ${GRAPHVIZ_LIB_DIR}/gvc
  ${GRAPHVIZ_LIB_DIR}/pack
  ${GRAPHVIZ_LIB_DIR}/pathplan
)

target_link_libraries(patchwork PRIVATE
  cgraph
)
