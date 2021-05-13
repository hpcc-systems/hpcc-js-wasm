add_library(circogen STATIC
    # Header files
    ${GRAPHVIZ_LIB_DIR}/circogen/block.h
    ${GRAPHVIZ_LIB_DIR}/circogen/blockpath.h
    ${GRAPHVIZ_LIB_DIR}/circogen/blocktree.h
    ${GRAPHVIZ_LIB_DIR}/circogen/circo.h
    ${GRAPHVIZ_LIB_DIR}/circogen/circpos.h
    ${GRAPHVIZ_LIB_DIR}/circogen/circular.h
    ${GRAPHVIZ_LIB_DIR}/circogen/deglist.h
    ${GRAPHVIZ_LIB_DIR}/circogen/edgelist.h
    ${GRAPHVIZ_LIB_DIR}/circogen/nodelist.h
    ${GRAPHVIZ_LIB_DIR}/circogen/nodeset.h

    # Source files
    ${GRAPHVIZ_LIB_DIR}/circogen/block.c
    ${GRAPHVIZ_LIB_DIR}/circogen/blockpath.c
    ${GRAPHVIZ_LIB_DIR}/circogen/blocktree.c
    ${GRAPHVIZ_LIB_DIR}/circogen/circpos.c
    ${GRAPHVIZ_LIB_DIR}/circogen/circular.c
    ${GRAPHVIZ_LIB_DIR}/circogen/circularinit.c
    ${GRAPHVIZ_LIB_DIR}/circogen/deglist.c
    ${GRAPHVIZ_LIB_DIR}/circogen/edgelist.c
    ${GRAPHVIZ_LIB_DIR}/circogen/nodelist.c
    ${GRAPHVIZ_LIB_DIR}/circogen/nodeset.c
)

target_include_directories(circogen PRIVATE
    ${GRAPHVIZ_LIB_DIR}
    ${GRAPHVIZ_LIB_DIR}/cdt
    ${GRAPHVIZ_LIB_DIR}/cgraph
    ${GRAPHVIZ_LIB_DIR}/common
    ${GRAPHVIZ_LIB_DIR}/gvc
    ${GRAPHVIZ_LIB_DIR}/pack
    ${GRAPHVIZ_LIB_DIR}/pathplan
)
