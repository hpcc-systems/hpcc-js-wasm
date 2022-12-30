add_library(cgraph++ STATIC
  ${GRAPHVIZ_LIB_DIR}/cgraph++/AGraph.h
  ${GRAPHVIZ_LIB_DIR}/cgraph++/AGraph.cpp
)
set_property(TARGET cgraph++ PROPERTY CXX_STANDARD 20)
set_property(TARGET cgraph++ PROPERTY CXX_STANDARD_REQUIRED ON)

target_include_directories(cgraph++ PRIVATE
  ${GRAPHVIZ_LIB_DIR}
  ${GRAPHVIZ_LIB_DIR}/cdt
  ${GRAPHVIZ_LIB_DIR}/cgraph
#  ${GRAPHVIZ_BUILD_DIR}/lib/cgraph++
)

target_link_libraries(cgraph++ cgraph)

