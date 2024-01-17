#pragma once

#include <string>
#include <cstdio>

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

    TempFileBuffer(const TempFileBuffer &) = delete;
    TempFileBuffer(TempFileBuffer &&) = delete;
    TempFileBuffer &operator=(const TempFileBuffer &) = delete;
    TempFileBuffer &operator=(TempFileBuffer &&) = delete;

    operator FILE *() const;
    operator std::string() const;
    operator const char *() const;
};
