project(duckdblib)

find_package(DuckDB CONFIG REQUIRED)

# See:  https://github.com/emscripten-core/emscripten/blob/main/src/settings.js

set(EM_CPP_FLAGS 
    ${EM_CPP_FLAGS}
    "-fwasm-exceptions"
)
string(REPLACE ";" " " CPP_FLAGS "${EM_CPP_FLAGS}")

set(EM_LINK_FLAGS 
    ${EM_LINK_FLAGS}
    "-sEXPORT_NAME='${CMAKE_PROJECT_NAME}'"
    "-sFILESYSTEM=1"
    "-sFORCE_FILESYSTEM=1"
    "-sWASMFS=1"
    "-sWASM_BIGINT=1"
    "-lembind"
    "-fwasm-exceptions"
    "--emit-tsd ${CMAKE_CURRENT_BINARY_DIR}/duckdblib.d.ts"
)
string(REPLACE ";" " " LINK_FLAGS "${EM_LINK_FLAGS}")

set(SRCS
    main.cpp
)

include_directories(
    ${VCPKG_INCLUDE_DIR}
)

add_executable(duckdblib
    ${SRCS}
)

set_target_properties(duckdblib PROPERTIES COMPILE_FLAGS "${CPP_FLAGS}")
set_target_properties(duckdblib PROPERTIES LINK_FLAGS "${LINK_FLAGS}")

target_link_libraries(duckdblib
    PRIVATE $<IF:$<TARGET_EXISTS:duckdb>,duckdb,duckdb_static>
)
