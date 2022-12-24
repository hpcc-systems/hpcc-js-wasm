add_definitions(-DEXPORT_CGRAPH -DEXPORT_CGHDR)

add_library(cgraph STATIC
  # Header files
  ${GRAPHVIZ_LIB_DIR}/cgraph/agxbuf.h
  ${GRAPHVIZ_LIB_DIR}/cgraph/alloc.h
  ${GRAPHVIZ_LIB_DIR}/cgraph/bitarray.h
  ${GRAPHVIZ_LIB_DIR}/cgraph/cghdr.h
  ${GRAPHVIZ_LIB_DIR}/cgraph/cgraph.h
  ${GRAPHVIZ_LIB_DIR}/cgraph/exit.h
  ${GRAPHVIZ_LIB_DIR}/cgraph/itos.h
  ${GRAPHVIZ_LIB_DIR}/cgraph/likely.h
  ${GRAPHVIZ_LIB_DIR}/cgraph/list.h
  ${GRAPHVIZ_LIB_DIR}/cgraph/prisize_t.h
  ${GRAPHVIZ_LIB_DIR}/cgraph/stack.h
  ${GRAPHVIZ_LIB_DIR}/cgraph/startswith.h
  ${GRAPHVIZ_LIB_DIR}/cgraph/strcasecmp.h
  ${GRAPHVIZ_LIB_DIR}/cgraph/strview.h
  ${GRAPHVIZ_LIB_DIR}/cgraph/tokenize.h
  ${GRAPHVIZ_LIB_DIR}/cgraph/unreachable.h
  ${GRAPHVIZ_LIB_DIR}/cgraph/unused.h

  # Source files
  ${GRAPHVIZ_LIB_DIR}/cgraph/agerror.c
  ${GRAPHVIZ_LIB_DIR}/cgraph/apply.c
  ${GRAPHVIZ_LIB_DIR}/cgraph/attr.c
  ${GRAPHVIZ_LIB_DIR}/cgraph/edge.c
  ${GRAPHVIZ_LIB_DIR}/cgraph/flatten.c
  ${GRAPHVIZ_LIB_DIR}/cgraph/graph.c
  ${GRAPHVIZ_LIB_DIR}/cgraph/id.c
  ${GRAPHVIZ_LIB_DIR}/cgraph/imap.c
  ${GRAPHVIZ_LIB_DIR}/cgraph/io.c
  ${GRAPHVIZ_LIB_DIR}/cgraph/mem.c
  ${GRAPHVIZ_LIB_DIR}/cgraph/node.c
  ${GRAPHVIZ_LIB_DIR}/cgraph/obj.c
  ${GRAPHVIZ_LIB_DIR}/cgraph/pend.c
  ${GRAPHVIZ_LIB_DIR}/cgraph/rec.c
  ${GRAPHVIZ_LIB_DIR}/cgraph/refstr.c
  ${GRAPHVIZ_LIB_DIR}/cgraph/subg.c
  ${GRAPHVIZ_LIB_DIR}/cgraph/utils.c
  ${GRAPHVIZ_LIB_DIR}/cgraph/write.c

  # Generated files
  ${GRAPHVIZ_BUILD_DIR}/lib/cgraph/grammar.c
  ${GRAPHVIZ_BUILD_DIR}/lib/cgraph/scan.c
)

target_include_directories(cgraph PRIVATE
  ${GRAPHVIZ_LIB_DIR}
  ${GRAPHVIZ_LIB_DIR}/cdt
  ${GRAPHVIZ_LIB_DIR}/cgraph
  ${GRAPHVIZ_BUILD_DIR}/lib/cgraph
)

target_link_libraries(cgraph cdt)

