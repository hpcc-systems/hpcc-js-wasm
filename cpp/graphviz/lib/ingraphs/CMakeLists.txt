PROJECT(ingraphs)

SET(SRCS
    ${GRAPHVIZSRC_DIRS}/lib/ingraphs/ingraphs.c
)

INCLUDE_DIRECTORIES(
    ${GRAPHVIZSRC_DIRS}/lib/ingraphs
)

ADD_LIBRARY(ingraphs STATIC
    ${SRCS}
)

TARGET_LINK_LIBRARIES(ingraphs
)
