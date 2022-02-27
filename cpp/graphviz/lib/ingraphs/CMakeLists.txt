add_library(ingraphs STATIC
  # Header files
  ${GRAPHVIZ_LIB_DIR}/ingraphs/ingraphs.h

  # Source files
  ${GRAPHVIZ_LIB_DIR}/ingraphs/ingraphs.c
)

target_include_directories(ingraphs PRIVATE
  ${GRAPHVIZ_LIB_DIR}
  ${GRAPHVIZ_LIB_DIR}/cdt
  ${GRAPHVIZ_LIB_DIR}/cgraph
)
