add_definitions(-DPATHPLAN_EXPORTS)

add_library(pathplan STATIC
  # Header files
  ${GRAPHVIZ_LIB_DIR}/pathplan/pathgeom.h
  ${GRAPHVIZ_LIB_DIR}/pathplan/pathplan.h
  ${GRAPHVIZ_LIB_DIR}/pathplan/pathutil.h
  ${GRAPHVIZ_LIB_DIR}/pathplan/solvers.h
  ${GRAPHVIZ_LIB_DIR}/pathplan/tri.h
  ${GRAPHVIZ_LIB_DIR}/pathplan/vis.h
  ${GRAPHVIZ_LIB_DIR}/pathplan/vispath.h

  # Source files
  ${GRAPHVIZ_LIB_DIR}/pathplan/cvt.c
  ${GRAPHVIZ_LIB_DIR}/pathplan/inpoly.c
  ${GRAPHVIZ_LIB_DIR}/pathplan/route.c
  ${GRAPHVIZ_LIB_DIR}/pathplan/shortest.c
  ${GRAPHVIZ_LIB_DIR}/pathplan/shortestpth.c
  ${GRAPHVIZ_LIB_DIR}/pathplan/solvers.c
  ${GRAPHVIZ_LIB_DIR}/pathplan/triang.c
  ${GRAPHVIZ_LIB_DIR}/pathplan/util.c
  ${GRAPHVIZ_LIB_DIR}/pathplan/visibility.c
)

target_include_directories(pathplan PRIVATE
  ${GRAPHVIZ_LIB_DIR}
  ${GRAPHVIZ_LIB_DIR}/pathplan
)

target_link_libraries(
  pathplan
  ${MATH_LIB}
)
