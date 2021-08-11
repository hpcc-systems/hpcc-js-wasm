PROJECT(expatlib)

#  Generate Glue from IDL file  ---
ADD_CUSTOM_COMMAND(
    MAIN_DEPENDENCY ${CMAKE_CURRENT_SOURCE_DIR}/main.idl
    OUTPUT ${CMAKE_CURRENT_BINARY_DIR}/main_glue.js ${CMAKE_CURRENT_BINARY_DIR}/main_glue.cpp
    COMMAND python3 ${CMAKE_BINARY_DIR}/../emsdk/upstream/emscripten/tools/webidl_binder.py ${CMAKE_CURRENT_SOURCE_DIR}/main.idl ${CMAKE_CURRENT_BINARY_DIR}/main_glue
)
SET_PROPERTY(SOURCE main.cpp APPEND PROPERTY OBJECT_DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/main_glue.cpp)
#  ---  ---  ---

INCLUDE_DIRECTORIES(
    ${CMAKE_CURRENT_BINARY_DIR}
    ${EXPAT_LIB_DIR}
)

ADD_EXECUTABLE(expatlib
    main.cpp
)

SET_TARGET_PROPERTIES(expatlib PROPERTIES LINK_FLAGS "${EM_FLAGS} -s EXPORT_NAME='${CMAKE_PROJECT_NAME}' -s EXPORTED_FUNCTIONS=\"['_malloc']\" --post-js ${CMAKE_CURRENT_BINARY_DIR}/main_glue.js")

TARGET_LINK_LIBRARIES(expatlib
    expat
)

INSTALL(FILES 
    ${CMAKE_CURRENT_BINARY_DIR}/expatlib.wasm
    DESTINATION dist
    COMPONENT runtime
)
