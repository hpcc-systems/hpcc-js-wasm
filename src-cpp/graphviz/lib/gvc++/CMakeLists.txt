add_library(gvc++ STATIC
  ${GRAPHVIZ_LIB_DIR}/gvc++/GVContext.h
  ${GRAPHVIZ_LIB_DIR}/gvc++/GVContext.cpp
  ${GRAPHVIZ_LIB_DIR}/gvc++/GVLayout.h
  ${GRAPHVIZ_LIB_DIR}/gvc++/GVLayout.cpp
  ${GRAPHVIZ_LIB_DIR}/gvc++/GVRenderData.h
  ${GRAPHVIZ_LIB_DIR}/gvc++/GVRenderData.cpp
)

target_include_directories(gvc++ PRIVATE
  ${GRAPHVIZ_LIB_DIR}
  ${GRAPHVIZ_LIB_DIR}/gvc++
  ${GRAPHVIZ_LIB_DIR}/cdt
  ${GRAPHVIZ_LIB_DIR}/cgraph
  ${GRAPHVIZ_LIB_DIR}/cgraph++
  ${GRAPHVIZ_LIB_DIR}/common
  ${GRAPHVIZ_LIB_DIR}/gvc
  ${GRAPHVIZ_LIB_DIR}/pathplan
)

target_link_libraries(gvc++ PUBLIC
  cgraph++
  gvc
)
