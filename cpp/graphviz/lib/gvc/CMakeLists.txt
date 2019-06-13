PROJECT(gvc)

SET(SRCS
    ${GRAPHVIZSRC_DIRS}/lib/gvc/gvc.c
    ${GRAPHVIZSRC_DIRS}/lib/gvc/gvconfig.c
    ${GRAPHVIZSRC_DIRS}/lib/gvc/gvcontext.c
    ${GRAPHVIZSRC_DIRS}/lib/gvc/gvdevice.c
    ${GRAPHVIZSRC_DIRS}/lib/gvc/gvevent.c
    ${GRAPHVIZSRC_DIRS}/lib/gvc/gvjobs.c
    ${GRAPHVIZSRC_DIRS}/lib/gvc/gvlayout.c
    ${GRAPHVIZSRC_DIRS}/lib/gvc/gvloadimage.c
    ${GRAPHVIZSRC_DIRS}/lib/gvc/gvplugin.c
    ${GRAPHVIZSRC_DIRS}/lib/gvc/gvrender.c
    ${GRAPHVIZSRC_DIRS}/lib/gvc/gvtextlayout.c
    ${GRAPHVIZSRC_DIRS}/lib/gvc/gvusershape.c
)

INCLUDE_DIRECTORIES(
    ${GRAPHVIZSRC_DIRS}/lib/gvc
    ${GRAPHVIZSRC_DIRS}/lib/common
    ${GRAPHVIZSRC_DIRS}/lib/cdt
    ${GRAPHVIZSRC_DIRS}/lib/cgraph
    ${GRAPHVIZSRC_DIRS}/lib/pathplan
    ${GRAPHVIZSRC_DIRS}
)

ADD_LIBRARY(gvc STATIC
    ${SRCS}
)

TARGET_LINK_LIBRARIES(gvc
    common
    cdt
    cgraph
    pathplan
)
