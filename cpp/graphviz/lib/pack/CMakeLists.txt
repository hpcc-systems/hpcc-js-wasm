add_library(pack_obj OBJECT
    # Header files
    ${GRAPHVIZ_LIB_DIR}/pack/pack.h

    # Source files
    ${GRAPHVIZ_LIB_DIR}/pack/ccomps.c
    ${GRAPHVIZ_LIB_DIR}/pack/pack.c
)

target_include_directories(pack_obj PRIVATE
    ${GRAPHVIZ_LIB_DIR}
    ${CMAKE_CURRENT_SOURCE_DIR}
    ${GRAPHVIZ_LIB_DIR}/cdt
    ${GRAPHVIZ_LIB_DIR}/cgraph
    ${GRAPHVIZ_LIB_DIR}/common
    ${GRAPHVIZ_LIB_DIR}/gvc
    ${GRAPHVIZ_LIB_DIR}/pathplan
)

add_library(pack STATIC
    $<TARGET_OBJECTS:pack_obj>
)

