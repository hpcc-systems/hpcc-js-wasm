cmake_minimum_required(VERSION 3.15)

project(NeuralAmpModelerCore VERSION 0.5.4 LANGUAGES CXX)

include(GNUInstallDirs)
include(CMakePackageConfigHelpers)

option(NAM_ENABLE_A2_FAST "Build the A2 fast-path WaveNet" ON)

find_package(Eigen3 CONFIG REQUIRED)
find_package(nlohmann_json CONFIG REQUIRED)

file(GLOB NAM_SOURCES_TOP CONFIGURE_DEPENDS "${CMAKE_CURRENT_SOURCE_DIR}/NAM/*.cpp")
file(GLOB NAM_SOURCES_WAVENET CONFIGURE_DEPENDS "${CMAKE_CURRENT_SOURCE_DIR}/NAM/wavenet/*.cpp")

add_library(NeuralAmpModelerCore ${NAM_SOURCES_TOP} ${NAM_SOURCES_WAVENET})
add_library(NeuralAmpModelerCore::NeuralAmpModelerCore ALIAS NeuralAmpModelerCore)

target_compile_features(NeuralAmpModelerCore PUBLIC cxx_std_20)
target_include_directories(NeuralAmpModelerCore
    PUBLIC
        "$<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}>"
        "$<INSTALL_INTERFACE:${CMAKE_INSTALL_INCLUDEDIR}>"
)
target_link_libraries(NeuralAmpModelerCore
    PUBLIC
        Eigen3::Eigen
        nlohmann_json::nlohmann_json
)

if(NAM_ENABLE_A2_FAST)
    target_compile_definitions(NeuralAmpModelerCore PUBLIC NAM_ENABLE_A2_FAST)
endif()

if(WIN32)
    target_compile_definitions(NeuralAmpModelerCore PUBLIC NOMINMAX WIN32_LEAN_AND_MEAN)
endif()

if(CMAKE_SYSTEM_NAME STREQUAL "Linux" AND CMAKE_CXX_COMPILER_ID STREQUAL "GNU")
    target_link_libraries(NeuralAmpModelerCore PRIVATE stdc++fs)
endif()

install(TARGETS NeuralAmpModelerCore
    EXPORT NeuralAmpModelerCoreTargets
    ARCHIVE DESTINATION "${CMAKE_INSTALL_LIBDIR}"
    LIBRARY DESTINATION "${CMAKE_INSTALL_LIBDIR}"
    RUNTIME DESTINATION "${CMAKE_INSTALL_BINDIR}"
    INCLUDES DESTINATION "${CMAKE_INSTALL_INCLUDEDIR}"
)
install(DIRECTORY "${CMAKE_CURRENT_SOURCE_DIR}/NAM" DESTINATION "${CMAKE_INSTALL_INCLUDEDIR}" FILES_MATCHING PATTERN "*.h")
install(FILES "${CMAKE_CURRENT_SOURCE_DIR}/json.hpp" DESTINATION "${CMAKE_INSTALL_INCLUDEDIR}")

configure_package_config_file(
    "${CMAKE_CURRENT_SOURCE_DIR}/cmake/NeuralAmpModelerCoreConfig.cmake.in"
    "${CMAKE_CURRENT_BINARY_DIR}/NeuralAmpModelerCoreConfig.cmake"
    INSTALL_DESTINATION "share/NeuralAmpModelerCore"
)
write_basic_package_version_file(
    "${CMAKE_CURRENT_BINARY_DIR}/NeuralAmpModelerCoreConfigVersion.cmake"
    VERSION "${PROJECT_VERSION}"
    COMPATIBILITY SameMajorVersion
)
install(FILES
    "${CMAKE_CURRENT_BINARY_DIR}/NeuralAmpModelerCoreConfig.cmake"
    "${CMAKE_CURRENT_BINARY_DIR}/NeuralAmpModelerCoreConfigVersion.cmake"
    DESTINATION "share/NeuralAmpModelerCore"
)
install(EXPORT NeuralAmpModelerCoreTargets
    NAMESPACE NeuralAmpModelerCore::
    DESTINATION "share/NeuralAmpModelerCore"
)