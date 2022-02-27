add_library(twopigen STATIC
  # Header files
  ${GRAPHVIZ_LIB_DIR}/twopigen/circle.h

  # Source files
  ${GRAPHVIZ_LIB_DIR}/twopigen/circle.c
  ${GRAPHVIZ_LIB_DIR}/twopigen/twopiinit.c
)

target_include_directories(twopigen PRIVATE
  ${GRAPHVIZ_LIB_DIR}
  ${GRAPHVIZ_LIB_DIR}/cdt
  ${GRAPHVIZ_LIB_DIR}/cgraph
  ${GRAPHVIZ_LIB_DIR}/common
  ${GRAPHVIZ_LIB_DIR}/gvc
  ${GRAPHVIZ_LIB_DIR}/pack
  ${GRAPHVIZ_LIB_DIR}/pathplan
)
