#include <string>
#include <base91.hpp>

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

    static void *malloc(size_t __size)
    {
        return ::malloc(__size);
    }

    static void free(void *__ptr)
    {
        ::free(__ptr);
    }

    const char *version()
    {
        return ::version;
    }

    void reset()
    {
        basE91_init(&m_basE91);
    }

    size_t encode(const void *data, size_t dataLen, void *dataOut)
    {
        return basE91_encode(&m_basE91, data, dataLen, dataOut);
    }

    size_t encode_end(void *dataOut)
    {
        return basE91_encode_end(&m_basE91, dataOut);
    }

    size_t decode(const void *data, size_t dataLen, void *dataOut)
    {
        return basE91_decode(&m_basE91, data, dataLen, dataOut);
    }

    size_t decode_end(void *dataOut)
    {
        return basE91_decode_end(&m_basE91, dataOut);
    }
};

//  Include JS Glue  ---
#include "main_glue.cpp"
