#include <cstdlib>
#include <cstdint>
#include <cstdio>
#include <string>

#include <zstd.h>

#include <emscripten/bind.h>

class zstd
{
protected:
    ZSTD_CStream *m_cstream;
    ZSTD_DStream *m_dstream;
    int m_compressionLevel;

public:
    zstd() : m_cstream(nullptr), m_dstream(nullptr), m_compressionLevel(ZSTD_defaultCLevel())
    {
        reset();
    }

    ~zstd()
    {
        if (m_cstream)
        {
            ZSTD_freeCStream(m_cstream);
            m_cstream = nullptr;
        }
        if (m_dstream)
        {
            ZSTD_freeDStream(m_dstream);
            m_dstream = nullptr;
        }
    }

    void reset()
    {
        if (!m_cstream)
        {
            m_cstream = ZSTD_createCCtx();
        }
        ZSTD_CCtx_reset(m_cstream, ZSTD_reset_session_only);
        ZSTD_CCtx_setParameter(m_cstream, ZSTD_c_compressionLevel, m_compressionLevel);

        if (!m_dstream)
        {
            m_dstream = ZSTD_createDCtx();
        }
        ZSTD_DCtx_reset(m_dstream, ZSTD_reset_session_only);
    }

    void setCompressionLevel(int level)
    {
        m_compressionLevel = level;
        if (m_cstream)
        {
            ZSTD_initCStream(m_cstream, m_compressionLevel);
        }
    }

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

    size_t compressChunk(uintptr_t dst, size_t dstCapacity, uintptr_t src, size_t srcSize)
    {
        ZSTD_inBuffer input = {reinterpret_cast<const void *>(src), srcSize, 0};
        ZSTD_outBuffer output = {reinterpret_cast<void *>(dst), dstCapacity, 0};

        // Use ZSTD_e_flush to ensure data is output immediately
        size_t remaining = 1;
        while (input.pos < srcSize || remaining > 0)
        {
            remaining = ZSTD_compressStream2(m_cstream, &output, &input, ZSTD_e_flush);
            if (ZSTD_isError(remaining))
            {
                fprintf(stderr, "compressChunk error: %s (srcSize=%zu, dstCapacity=%zu, output.pos=%zu)\n",
                        ZSTD_getErrorName(remaining), srcSize, dstCapacity, output.pos);
                return remaining; // Return the error code
            }
        }
        return output.pos;
    }

    size_t compressEnd(uintptr_t dst, size_t dstCapacity)
    {
        ZSTD_outBuffer output = {reinterpret_cast<void *>(dst), dstCapacity, 0};
        ZSTD_inBuffer input = {nullptr, 0, 0};

        // Use ZSTD_e_end to finalize the stream
        size_t remaining = 1;
        while (remaining > 0)
        {
            remaining = ZSTD_compressStream2(m_cstream, &output, &input, ZSTD_e_end);
            if (ZSTD_isError(remaining))
            {
                fprintf(stderr, "compressEnd error: %s (dstCapacity=%zu, output.pos=%zu)\n",
                        ZSTD_getErrorName(remaining), dstCapacity, output.pos);
                return remaining; // Return the error code
            }
        }
        return output.pos;
    }

    static size_t decompress(uintptr_t dst, size_t dstCapacity, uintptr_t src, size_t compressedSize)
    {
        return ZSTD_decompress(
            reinterpret_cast<void *>(dst),
            dstCapacity,
            reinterpret_cast<const void *>(src),
            compressedSize);
    }

    size_t decompressChunk(uintptr_t dst, size_t dstCapacity, uintptr_t src, size_t srcSize)
    {
        ZSTD_inBuffer input = {reinterpret_cast<const void *>(src), srcSize, 0};
        ZSTD_outBuffer output = {reinterpret_cast<void *>(dst), dstCapacity, 0};

        size_t const result = ZSTD_decompressStream(m_dstream, &output, &input);
        return output.pos;
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

    static size_t CStreamOutSize()
    {
        return ZSTD_CStreamOutSize();
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
        .constructor<>()
        .class_function("version", &zstd::version)
        .class_function("malloc", &zstd::malloc)
        .class_function("free", &zstd::free)
        .function("reset", &zstd::reset)
        .function("setCompressionLevel", &zstd::setCompressionLevel)
        .class_function("compress", &zstd::compress)
        .function("compressChunk", &zstd::compressChunk)
        .function("compressEnd", &zstd::compressEnd)
        .class_function("decompress", &zstd::decompress)
        .function("decompressChunk", &zstd::decompressChunk)
        .class_function("getFrameContentSize", &zstd::getFrameContentSize)
        .class_function("findFrameCompressedSize", &zstd::findFrameCompressedSize)
        .class_function("compressBound", &zstd::compressBound)
        .class_function("CStreamOutSize", &zstd::CStreamOutSize)
        .class_function("isError", &zstd::isError)
        .class_function("getErrorName", &zstd::getErrorName)
        .class_function("minCLevel", &zstd::minCLevel)
        .class_function("maxCLevel", &zstd::maxCLevel)
        .class_function("defaultCLevel", &zstd::defaultCLevel);
}
