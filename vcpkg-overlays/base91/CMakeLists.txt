cmake_minimum_required(VERSION 3.14)

project(base91 LANGUAGES C CXX)

add_library(base91 
    base91.h
    base91.c
)

target_include_directories(
    base91
    PUBLIC
        $<BUILD_INTERFACE:${CMAKE_CURRENT_LIST_DIR}>
        $<INSTALL_INTERFACE:${CMAKE_INSTALL_INCLUDEDIR}>
)

set_target_properties(base91 PROPERTIES PUBLIC_HEADER base91.h)

install(FILES base91.hpp DESTINATION include)
install(TARGETS base91 EXPORT unofficial-base91-config)

install(
    EXPORT unofficial-base91-config
    NAMESPACE unofficial::base91::
    DESTINATION share/unofficial-base91
    PERMISSIONS OWNER_READ OWNER_WRITE GROUP_READ WORLD_READ
)
