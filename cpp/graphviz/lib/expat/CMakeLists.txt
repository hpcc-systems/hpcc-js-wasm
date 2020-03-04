PROJECT(expat)

ADD_DEFINITIONS(-DXML_POOR_ENTROPY)

SET(SRCS
    ${EXPATSRC_DIRS}/expat/lib/xmlparse.c
    ${EXPATSRC_DIRS}/expat/lib/xmlrole.c
    ${EXPATSRC_DIRS}/expat/lib/xmltok_impl.c
    ${EXPATSRC_DIRS}/expat/lib/xmltok_ns.c
    ${EXPATSRC_DIRS}/expat/lib/xmltok.c
)

INCLUDE_DIRECTORIES(
    ${EXPATSRC_DIRS}/expat/lib
)

ADD_LIBRARY(expat STATIC
    ${SRCS}
)

TARGET_LINK_LIBRARIES(expat
)
