set(sources
    # Header files
    ${GRAPHVIZ_LIB_DIR}/neatogen/adjust.h
    ${GRAPHVIZ_LIB_DIR}/neatogen/bfs.h
    ${GRAPHVIZ_LIB_DIR}/neatogen/call_tri.h
    ${GRAPHVIZ_LIB_DIR}/neatogen/closest.h
    ${GRAPHVIZ_LIB_DIR}/neatogen/conjgrad.h
    ${GRAPHVIZ_LIB_DIR}/neatogen/defs.h
    ${GRAPHVIZ_LIB_DIR}/neatogen/delaunay.h
    ${GRAPHVIZ_LIB_DIR}/neatogen/digcola.h
    ${GRAPHVIZ_LIB_DIR}/neatogen/dijkstra.h
    ${GRAPHVIZ_LIB_DIR}/neatogen/edges.h
    ${GRAPHVIZ_LIB_DIR}/neatogen/embed_graph.h
    ${GRAPHVIZ_LIB_DIR}/neatogen/fPQ.h
    ${GRAPHVIZ_LIB_DIR}/neatogen/geometry.h
    ${GRAPHVIZ_LIB_DIR}/neatogen/heap.h
    ${GRAPHVIZ_LIB_DIR}/neatogen/hedges.h
    ${GRAPHVIZ_LIB_DIR}/neatogen/info.h
    ${GRAPHVIZ_LIB_DIR}/neatogen/kkutils.h
    ${GRAPHVIZ_LIB_DIR}/neatogen/matrix_ops.h
    ${GRAPHVIZ_LIB_DIR}/neatogen/mem.h
    ${GRAPHVIZ_LIB_DIR}/neatogen/multispline.h
    ${GRAPHVIZ_LIB_DIR}/neatogen/neato.h
    ${GRAPHVIZ_LIB_DIR}/neatogen/neatoprocs.h
    ${GRAPHVIZ_LIB_DIR}/neatogen/overlap.h
    ${GRAPHVIZ_LIB_DIR}/neatogen/pca.h
    ${GRAPHVIZ_LIB_DIR}/neatogen/poly.h
    ${GRAPHVIZ_LIB_DIR}/neatogen/quad_prog_solver.h
    ${GRAPHVIZ_LIB_DIR}/neatogen/quad_prog_vpsc.h
    ${GRAPHVIZ_LIB_DIR}/neatogen/site.h
    ${GRAPHVIZ_LIB_DIR}/neatogen/sparsegraph.h
    ${GRAPHVIZ_LIB_DIR}/neatogen/stress.h
    ${GRAPHVIZ_LIB_DIR}/neatogen/voronoi.h
    ${GRAPHVIZ_LIB_DIR}/neatogen/sgd.h
    ${GRAPHVIZ_LIB_DIR}/neatogen/randomkit.h

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

add_library(neatogen STATIC
    ${sources}
)

target_include_directories(neatogen PRIVATE
    ${GRAPHVIZ_LIB_DIR}
    ${GRAPHVIZ_LIB_DIR}/cdt
    ${GRAPHVIZ_LIB_DIR}/cgraph
    ${GRAPHVIZ_LIB_DIR}/common
    ${GRAPHVIZ_LIB_DIR}/gvc
    ${GRAPHVIZ_LIB_DIR}/pack
    ${GRAPHVIZ_LIB_DIR}/pathplan
)
