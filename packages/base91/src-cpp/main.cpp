#include <base91.hpp>

#include <string>

const char *const version = "0.6.0";

class CBasE91
{
protected:
    basE91 m_basE91;

public:
    CBasE91()
    {
        reset();
    }

    uintptr_t malloc(size_t __size)
    {
        return reinterpret_cast<uintptr_t>(::malloc(__size));
    }

    void free(uintptr_t __ptr)
    {
        ::free(reinterpret_cast<void *>(__ptr));
    }

    std::string version() const
    {
        return ::version;
    }

    void reset()
    {
        basE91_init(&m_basE91);
    }

    size_t encode(uintptr_t data, size_t dataLen, uintptr_t dataOut)
    {
        return basE91_encode(&m_basE91, reinterpret_cast<const void *>(data), dataLen, reinterpret_cast<void *>(dataOut));
    }

    size_t encode_end(uintptr_t dataOut)
    {
        return basE91_encode_end(&m_basE91, reinterpret_cast<void *>(dataOut));
    }

    size_t decode(uintptr_t data, size_t dataLen, uintptr_t dataOut)
    {
        return basE91_decode(&m_basE91, reinterpret_cast<const void *>(data), dataLen, reinterpret_cast<void *>(dataOut));
    }

    size_t decode_end(uintptr_t dataOut)
    {
        return basE91_decode_end(&m_basE91, reinterpret_cast<void *>(dataOut));
    }
};

#include <emscripten/bind.h>

EMSCRIPTEN_BINDINGS(base91lib_bindings)
{
    using namespace emscripten;

    class_<CBasE91>("CBasE91")
        .constructor<>()
        .function("malloc", &CBasE91::malloc)
        .function("free", &CBasE91::free)
        .function("version", &CBasE91::version)
        .function("reset", &CBasE91::reset)
        .function("encode", &CBasE91::encode)
        .function("encode_end", &CBasE91::encode_end)
        .function("decode", &CBasE91::decode)
        .function("decode_end", &CBasE91::decode_end);
}
