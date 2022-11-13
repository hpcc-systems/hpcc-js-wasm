add_library(gvplugin_neato_layout STATIC
  # Source files
  ${GRAPHVIZ_PLUGIN_DIR}/neato_layout/gvplugin_neato_layout.c
  ${GRAPHVIZ_PLUGIN_DIR}/neato_layout/gvlayout_neato_layout.c
)

target_include_directories(gvplugin_neato_layout PRIVATE
  ${GRAPHVIZ_LIB_DIR}
  ${GRAPHVIZ_PLUGIN_DIR}/neato_layout
  ${GRAPHVIZ_LIB_DIR}/cdt
  ${GRAPHVIZ_LIB_DIR}/cgraph
  ${GRAPHVIZ_LIB_DIR}/common
  ${GRAPHVIZ_LIB_DIR}/gvc
  ${GRAPHVIZ_LIB_DIR}/pathplan
)

target_link_libraries(gvplugin_neato_layout
  circogen
  fdpgen
  gvc
  neatogen
  osage
  patchwork
  rbtree
  sparse
  twopigen
)

if(with_ipsepcola)
  target_link_libraries(gvplugin_neato_layout vpsc)
endif()

if(with_sfdp)
  target_link_libraries(gvplugin_neato_layout sfdpgen)
endif()

