PROJECT(gvplugin_dot_layout)

SET(SRCS
    ${GRAPHVIZSRC_DIRS}/plugin/dot_layout/gvlayout_dot_layout.c
    ${GRAPHVIZSRC_DIRS}/plugin/dot_layout/gvplugin_dot_layout.c
)

INCLUDE_DIRECTORIES(
    ${GRAPHVIZSRC_DIRS}/plugin/dot_layout
    ${GRAPHVIZSRC_DIRS}/lib/vpsc
    ${GRAPHVIZSRC_DIRS}/lib/twopigen
    ${GRAPHVIZSRC_DIRS}/lib/sparse
    ${GRAPHVIZSRC_DIRS}/lib/sfdpgen
    ${GRAPHVIZSRC_DIRS}/lib/pathplan
    ${GRAPHVIZSRC_DIRS}/lib/common
    ${GRAPHVIZSRC_DIRS}/lib/gvc
    ${GRAPHVIZSRC_DIRS}/lib/cdt
    ${GRAPHVIZSRC_DIRS}/lib/cgraph
)

ADD_LIBRARY(gvplugin_dot_layout STATIC
    ${SRCS}
)

TARGET_LINK_LIBRARIES(gvplugin_dot_layout
    vpsc
    twopigen
    sparse
    sfdpgen
    pathplan
    common
    gvc
    cdt
    cgraph
)
