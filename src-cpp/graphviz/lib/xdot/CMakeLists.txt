add_definitions(-DEXPORT_XDOT)

add_library(xdot STATIC
  # Header files
  ${GRAPHVIZ_LIB_DIR}/xdot/xdot.h

  # Source files
  ${GRAPHVIZ_LIB_DIR}/xdot/xdot.c
)

target_include_directories(xdot PRIVATE
  ${GRAPHVIZ_LIB_DIR}
  ${GRAPHVIZ_LIB_DIR}/xdot
)
