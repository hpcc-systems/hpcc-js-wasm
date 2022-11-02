#include <stdlib.h>

#include <zstd.h>

struct zstd
{
public:
    static const char *version(void)
    {
        return ZSTD_versionString();
    }

    static void *malloc(size_t __size)
    {
        return ::malloc(__size);
    }

    static void free(void *__ptr)
    {
        ::free(__ptr);
    }

    static size_t compress(void *dst, size_t dstCapacity, const void *src, size_t srcSize, int compressionLevel)
    {
        return ZSTD_compress(dst, dstCapacity, src, srcSize, compressionLevel);
    }

    static size_t decompress(void *dst, size_t dstCapacity, const void *src, size_t compressedSize)
    {
        return ZSTD_decompress(dst, dstCapacity, src, compressedSize);
    }

    static unsigned long long getFrameContentSize(const void *src, size_t srcSize)
    {
        return ZSTD_getFrameContentSize(src, srcSize);
    }

    static size_t findFrameCompressedSize(const void *src, size_t srcSize)
    {
        return ZSTD_findFrameCompressedSize(src, srcSize);
    }

    static size_t compressBound(size_t srcSize) /*!< maximum compressed size in worst case single-pass scenario */
    {
        return ZSTD_compressBound(srcSize);
    }

    static unsigned isError(size_t code) /*!< tells if a `size_t` function result is an error code */
    {
        return ZSTD_isError(code);
    }

    static const char *getErrorName(size_t code) /*!< provides readable string from an error code */
    {
        return ZSTD_getErrorName(code);
    }

    static int minCLevel(void) /*!< minimum negative compression level allowed, requires v1.4.0+ */
    {
        return ZSTD_minCLevel();
    }

    static int maxCLevel(void) /*!< maximum compression level available */
    {
        return ZSTD_maxCLevel();
    }

    static int defaultCLevel(void) /*!< default compression level, specified by ZSTD_CLEVEL_DEFAULT, requires v1.5.0+ */
    {
        return ZSTD_defaultCLevel();
    }
};

//  Include JS Glue  ---
#include "main_glue.cpp"
