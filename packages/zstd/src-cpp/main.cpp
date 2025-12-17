#include <cstdlib>
#include <cstdint>
#include <string>

#include <zstd.h>

#include <emscripten/bind.h>

struct zstd
{
public:
    static std::string version()
    {
        return ZSTD_versionString();
    }

    static uintptr_t malloc(size_t size)
    {
        return reinterpret_cast<uintptr_t>(::malloc(size));
    }

    static void free(uintptr_t ptr)
    {
        ::free(reinterpret_cast<void *>(ptr));
    }

    static size_t compress(uintptr_t dst, size_t dstCapacity, uintptr_t src, size_t srcSize, int compressionLevel)
    {
        return ZSTD_compress(
            reinterpret_cast<void *>(dst),
            dstCapacity,
            reinterpret_cast<const void *>(src),
            srcSize,
            compressionLevel);
    }

    static size_t decompress(uintptr_t dst, size_t dstCapacity, uintptr_t src, size_t compressedSize)
    {
        return ZSTD_decompress(
            reinterpret_cast<void *>(dst),
            dstCapacity,
            reinterpret_cast<const void *>(src),
            compressedSize);
    }

    static double getFrameContentSize(uintptr_t src, size_t srcSize)
    {
        return static_cast<double>(ZSTD_getFrameContentSize(reinterpret_cast<const void *>(src), srcSize));
    }

    static size_t findFrameCompressedSize(uintptr_t src, size_t srcSize)
    {
        return ZSTD_findFrameCompressedSize(reinterpret_cast<const void *>(src), srcSize);
    }

    static size_t compressBound(size_t srcSize)
    {
        return ZSTD_compressBound(srcSize);
    }

    static unsigned isError(size_t code)
    {
        return ZSTD_isError(code);
    }

    static std::string getErrorName(size_t code)
    {
        return ZSTD_getErrorName(code);
    }

    static int minCLevel()
    {
        return ZSTD_minCLevel();
    }

    static int maxCLevel()
    {
        return ZSTD_maxCLevel();
    }

    static int defaultCLevel()
    {
        return ZSTD_defaultCLevel();
    }
};

EMSCRIPTEN_BINDINGS(zstdlib_bindings)
{
    emscripten::class_<zstd>("zstd")
        .class_function("version", &zstd::version)
        .class_function("malloc", &zstd::malloc)
        .class_function("free", &zstd::free)
        .class_function("compress", &zstd::compress)
        .class_function("decompress", &zstd::decompress)
        .class_function("getFrameContentSize", &zstd::getFrameContentSize)
        .class_function("findFrameCompressedSize", &zstd::findFrameCompressedSize)
        .class_function("compressBound", &zstd::compressBound)
        .class_function("isError", &zstd::isError)
        .class_function("getErrorName", &zstd::getErrorName)
        .class_function("minCLevel", &zstd::minCLevel)
        .class_function("maxCLevel", &zstd::maxCLevel)
        .class_function("defaultCLevel", &zstd::defaultCLevel);
}
