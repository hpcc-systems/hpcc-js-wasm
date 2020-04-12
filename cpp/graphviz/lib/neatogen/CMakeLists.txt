INCLUDE_DIRECTORIES(
    ${GRAPHVIZ_LIB_DIR}/neatogen
    ${GRAPHVIZ_LIB_DIR}/cdt
    ${GRAPHVIZ_LIB_DIR}/cgraph
    ${GRAPHVIZ_LIB_DIR}/common
    ${GRAPHVIZ_LIB_DIR}/gvc
    ${GRAPHVIZ_LIB_DIR}/ortho
    ${GRAPHVIZ_LIB_DIR}/pack
    ${GRAPHVIZ_LIB_DIR}/pathplan
    ${GRAPHVIZ_LIB_DIR}/rbtree
    ${GRAPHVIZ_LIB_DIR}/sfdpgen
    ${GRAPHVIZ_LIB_DIR}/sparse

    # with_ipsepcola
    ${GRAPHVIZ_LIB_DIR}/vpsc
)

SET(sources
    # Source files
    ${GRAPHVIZ_LIB_DIR}/neatogen/adjust.c
    ${GRAPHVIZ_LIB_DIR}/neatogen/bfs.c
    ${GRAPHVIZ_LIB_DIR}/neatogen/call_tri.c
    ${GRAPHVIZ_LIB_DIR}/neatogen/circuit.c
    ${GRAPHVIZ_LIB_DIR}/neatogen/closest.c
    ${GRAPHVIZ_LIB_DIR}/neatogen/compute_hierarchy.c
    ${GRAPHVIZ_LIB_DIR}/neatogen/conjgrad.c
    ${GRAPHVIZ_LIB_DIR}/neatogen/constrained_majorization.c
    ${GRAPHVIZ_LIB_DIR}/neatogen/constraint.c
    ${GRAPHVIZ_LIB_DIR}/neatogen/delaunay.c
    ${GRAPHVIZ_LIB_DIR}/neatogen/dijkstra.c
    ${GRAPHVIZ_LIB_DIR}/neatogen/edges.c
    ${GRAPHVIZ_LIB_DIR}/neatogen/embed_graph.c
    ${GRAPHVIZ_LIB_DIR}/neatogen/geometry.c
    ${GRAPHVIZ_LIB_DIR}/neatogen/heap.c
    ${GRAPHVIZ_LIB_DIR}/neatogen/hedges.c
    ${GRAPHVIZ_LIB_DIR}/neatogen/info.c
    ${GRAPHVIZ_LIB_DIR}/neatogen/kkutils.c
    ${GRAPHVIZ_LIB_DIR}/neatogen/legal.c
    ${GRAPHVIZ_LIB_DIR}/neatogen/lu.c
    ${GRAPHVIZ_LIB_DIR}/neatogen/matinv.c
    ${GRAPHVIZ_LIB_DIR}/neatogen/matrix_ops.c
    ${GRAPHVIZ_LIB_DIR}/neatogen/memory.c
    ${GRAPHVIZ_LIB_DIR}/neatogen/multispline.c
    ${GRAPHVIZ_LIB_DIR}/neatogen/neatoinit.c
    ${GRAPHVIZ_LIB_DIR}/neatogen/neatosplines.c
    ${GRAPHVIZ_LIB_DIR}/neatogen/opt_arrangement.c
    ${GRAPHVIZ_LIB_DIR}/neatogen/overlap.c
    ${GRAPHVIZ_LIB_DIR}/neatogen/pca.c
    ${GRAPHVIZ_LIB_DIR}/neatogen/poly.c
    ${GRAPHVIZ_LIB_DIR}/neatogen/printvis.c
    ${GRAPHVIZ_LIB_DIR}/neatogen/quad_prog_solve.c
    ${GRAPHVIZ_LIB_DIR}/neatogen/site.c
    ${GRAPHVIZ_LIB_DIR}/neatogen/smart_ini_x.c
    ${GRAPHVIZ_LIB_DIR}/neatogen/solve.c
    ${GRAPHVIZ_LIB_DIR}/neatogen/stuff.c
    ${GRAPHVIZ_LIB_DIR}/neatogen/stress.c
    ${GRAPHVIZ_LIB_DIR}/neatogen/voronoi.c
    ${GRAPHVIZ_LIB_DIR}/neatogen/sgd.c
    ${GRAPHVIZ_LIB_DIR}/neatogen/randomkit.c

    # with_ipsepcola
    ${GRAPHVIZ_LIB_DIR}/neatogen/constrained_majorization_ipsep.c
    ${GRAPHVIZ_LIB_DIR}/neatogen/mosek_quad_solve.c
    ${GRAPHVIZ_LIB_DIR}/neatogen/mosek_quad_solve.h
    ${GRAPHVIZ_LIB_DIR}/neatogen/quad_prog_vpsc.c
)

ADD_LIBRARY(neatogen STATIC
    ${sources}
)

