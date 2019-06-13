PROJECT(gvplugin_neato_layout)

SET(SRCS
    ${GRAPHVIZSRC_DIRS}/plugin/neato_layout/gvlayout_neato_layout.c
    ${GRAPHVIZSRC_DIRS}/plugin/neato_layout/gvplugin_neato_layout.c
)

INCLUDE_DIRECTORIES(
    ${GRAPHVIZSRC_DIRS}/plugin/neato_layout
    ${GRAPHVIZSRC_DIRS}/lib/common
    ${GRAPHVIZSRC_DIRS}/lib/vpsc
    ${GRAPHVIZSRC_DIRS}/lib/twopigen
    ${GRAPHVIZSRC_DIRS}/lib/sparse
    ${GRAPHVIZSRC_DIRS}/lib/sfdpgen
    ${GRAPHVIZSRC_DIRS}/lib/pathplan
    ${GRAPHVIZSRC_DIRS}/lib/gvc
    ${GRAPHVIZSRC_DIRS}/lib/cdt
    ${GRAPHVIZSRC_DIRS}/lib/cgraph
)

ADD_LIBRARY(gvplugin_neato_layout STATIC
    ${SRCS}
)
TARGET_LINK_LIBRARIES(gvplugin_neato_layout
    common
    vpsc
    twopigen
    sparse
    sfdpgen
    pathplan
    gvc
    cdt
    cgraph
)
