#pragma once

#include <string>

class StringBuffer
{
private:
    std::string m_buffer;

public:
    operator std::string() const;
    operator const char *() const;
    StringBuffer &operator=(const std::string &str);
};

class TempFileBuffer
{
private:
    FILE *filePointer = nullptr;
    char tempFileName[L_tmpnam];

public:
    TempFileBuffer();
    ~TempFileBuffer();

    operator FILE *() const;
    operator std::string() const;
    operator const char *() const;
};
