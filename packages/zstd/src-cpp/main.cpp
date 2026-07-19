#include <cstdlib>
#include <cstdint>
#include <climits>
#include <string>

#include <zstd.h>

#include <emscripten/bind.h>

struct StreamResult
{
    size_t consumed;
    size_t produced;
    size_t remaining;
    bool error;
    std::string errorName;
};

struct FrameContentSizeResult
{
    bool known;
    bool error;
    size_t size;
    std::string errorName;
};

static StreamResult makeStreamResult(size_t result, size_t consumed, size_t produced)
{
    StreamResult sr;
    sr.consumed = consumed;
    sr.produced = produced;
    sr.remaining = result;
    sr.error = ZSTD_isError(result) != 0;
    sr.errorName = sr.error ? std::string(ZSTD_getErrorName(result)) : std::string();
    return sr;
}

static StreamResult makeErrorResult(const std::string &errorName)
{
    StreamResult sr;
    sr.consumed = 0;
    sr.produced = 0;
    sr.remaining = 0;
    sr.error = true;
    sr.errorName = errorName;
    return sr;
}

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

    StreamResult resetCompression(int level)
    {
        m_compressionLevel = level;

        if (!m_cstream)
        {
            m_cstream = ZSTD_createCCtx();
            if (!m_cstream)
            {
                return makeErrorResult("ZSTD_createCCtx failed");
            }
        }

        size_t const resetResult = ZSTD_CCtx_reset(m_cstream, ZSTD_reset_session_only);
        if (ZSTD_isError(resetResult))
        {
            return makeStreamResult(resetResult, 0, 0);
        }

        size_t const paramResult = ZSTD_CCtx_setParameter(m_cstream, ZSTD_c_compressionLevel, m_compressionLevel);
        if (ZSTD_isError(paramResult))
        {
            return makeStreamResult(paramResult, 0, 0);
        }

        return makeStreamResult(0, 0, 0);
    }

    StreamResult resetDecompression()
    {
        if (!m_dstream)
        {
            m_dstream = ZSTD_createDCtx();
            if (!m_dstream)
            {
                return makeErrorResult("ZSTD_createDCtx failed");
            }
        }

        size_t const resetResult = ZSTD_DCtx_reset(m_dstream, ZSTD_reset_session_only);
        if (ZSTD_isError(resetResult))
        {
            return makeStreamResult(resetResult, 0, 0);
        }

        return makeStreamResult(0, 0, 0);
    }

    // Compatibility: reset both contexts (legacy API).
    StreamResult reset()
    {
        StreamResult compression = resetCompression(m_compressionLevel);
        StreamResult decompression = resetDecompression();

        if (compression.error && decompression.error)
        {
            return makeErrorResult(
                std::string("compression reset failed: ") + compression.errorName +
                std::string("; decompression reset failed: ") + decompression.errorName);
        }

        if (compression.error)
        {
            return compression;
        }

        if (decompression.error)
        {
            return decompression;
        }

        return makeStreamResult(0, 0, 0);
    }

    StreamResult setCompressionLevel(int level)
    {
        if (!m_cstream)
        {
            return makeErrorResult("compression context is not initialized");
        }

        size_t const paramResult = ZSTD_CCtx_setParameter(m_cstream, ZSTD_c_compressionLevel, level);
        if (ZSTD_isError(paramResult))
        {
            return makeStreamResult(paramResult, 0, 0);
        }

        m_compressionLevel = level;
        return makeStreamResult(0, 0, 0);
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

    StreamResult compressChunk(uintptr_t dst, size_t dstCapacity, uintptr_t src, size_t srcSize)
    {
        if (!m_cstream)
        {
            return makeErrorResult("compression context is not initialized");
        }

        ZSTD_inBuffer input = {reinterpret_cast<const void *>(src), srcSize, 0};
        ZSTD_outBuffer output = {reinterpret_cast<void *>(dst), dstCapacity, 0};

        size_t const result = ZSTD_compressStream2(m_cstream, &output, &input, ZSTD_e_continue);
        return makeStreamResult(result, input.pos, output.pos);
    }

    StreamResult compressEnd(uintptr_t dst, size_t dstCapacity)
    {
        if (!m_cstream)
        {
            return makeErrorResult("compression context is not initialized");
        }

        ZSTD_inBuffer input = {nullptr, 0, 0};
        ZSTD_outBuffer output = {reinterpret_cast<void *>(dst), dstCapacity, 0};

        size_t const result = ZSTD_compressStream2(m_cstream, &output, &input, ZSTD_e_end);
        return makeStreamResult(result, input.pos, output.pos);
    }

    static size_t decompress(uintptr_t dst, size_t dstCapacity, uintptr_t src, size_t compressedSize)
    {
        return ZSTD_decompress(
            reinterpret_cast<void *>(dst),
            dstCapacity,
            reinterpret_cast<const void *>(src),
            compressedSize);
    }

    StreamResult decompressChunk(uintptr_t dst, size_t dstCapacity, uintptr_t src, size_t srcSize)
    {
        if (!m_dstream)
        {
            return makeErrorResult("decompression context is not initialized");
        }

        ZSTD_inBuffer input = {reinterpret_cast<const void *>(src), srcSize, 0};
        ZSTD_outBuffer output = {reinterpret_cast<void *>(dst), dstCapacity, 0};

        size_t const result = ZSTD_decompressStream(m_dstream, &output, &input);
        return makeStreamResult(result, input.pos, output.pos);
    }

    static FrameContentSizeResult getFrameContentSize(uintptr_t src, size_t srcSize)
    {
        FrameContentSizeResult result;
        result.known = false;
        result.error = false;
        result.size = 0;
        result.errorName = "";

        unsigned long long const contentSize =
            ZSTD_getFrameContentSize(reinterpret_cast<const void *>(src), srcSize);

        if (contentSize == ZSTD_CONTENTSIZE_ERROR)
        {
            result.error = true;
            result.errorName = "ZSTD_CONTENTSIZE_ERROR";
            return result;
        }

        if (contentSize == ZSTD_CONTENTSIZE_UNKNOWN)
        {
            return result;
        }

        if (contentSize > static_cast<unsigned long long>(SIZE_MAX))
        {
            result.error = true;
            result.errorName = "frame content size exceeds WASM addressable range";
            return result;
        }

        result.known = true;
        result.size = static_cast<size_t>(contentSize);
        return result;
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

    static size_t DStreamOutSize()
    {
        return ZSTD_DStreamOutSize();
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
    emscripten::value_object<StreamResult>("StreamResult")
        .field("consumed", &StreamResult::consumed)
        .field("produced", &StreamResult::produced)
        .field("remaining", &StreamResult::remaining)
        .field("error", &StreamResult::error)
        .field("errorName", &StreamResult::errorName);

    emscripten::value_object<FrameContentSizeResult>("FrameContentSizeResult")
        .field("known", &FrameContentSizeResult::known)
        .field("error", &FrameContentSizeResult::error)
        .field("size", &FrameContentSizeResult::size)
        .field("errorName", &FrameContentSizeResult::errorName);

    emscripten::class_<zstd>("zstd")
        .constructor<>()
        .class_function("version", &zstd::version)
        .class_function("malloc", &zstd::malloc)
        .class_function("free", &zstd::free)
        .function("reset", &zstd::reset)
        .function("resetCompression", &zstd::resetCompression)
        .function("resetDecompression", &zstd::resetDecompression)
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
        .class_function("DStreamOutSize", &zstd::DStreamOutSize)
        .class_function("isError", &zstd::isError)
        .class_function("getErrorName", &zstd::getErrorName)
        .class_function("minCLevel", &zstd::minCLevel)
        .class_function("maxCLevel", &zstd::maxCLevel)
        .class_function("defaultCLevel", &zstd::defaultCLevel);
}
