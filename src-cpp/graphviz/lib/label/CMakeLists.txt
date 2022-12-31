add_definitions(-DGVC_EXPORTS)

add_library(label STATIC
  # Header files
  ${GRAPHVIZ_LIB_DIR}/label/index.h
  ${GRAPHVIZ_LIB_DIR}/label/node.h
  ${GRAPHVIZ_LIB_DIR}/label/rectangle.h
  ${GRAPHVIZ_LIB_DIR}/label/split.q.h
  ${GRAPHVIZ_LIB_DIR}/label/xlabels.h

  # Source files
  ${GRAPHVIZ_LIB_DIR}/label/index.c
  ${GRAPHVIZ_LIB_DIR}/label/node.c
  ${GRAPHVIZ_LIB_DIR}/label/rectangle.c
  ${GRAPHVIZ_LIB_DIR}/label/split.q.c
  ${GRAPHVIZ_LIB_DIR}/label/xlabels.c
)

target_include_directories(label PRIVATE
  ${GRAPHVIZ_LIB_DIR}
  ${GRAPHVIZ_LIB_DIR}/cdt
  ${GRAPHVIZ_LIB_DIR}/cgraph
  ${GRAPHVIZ_LIB_DIR}/common
)

target_link_libraries(label PRIVATE
  cdt
)
