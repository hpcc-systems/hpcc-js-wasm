#include "util.hpp"

StringBuffer::operator std::string() const
{
    return m_buffer;
}

StringBuffer::operator const char *() const
{
    return m_buffer.c_str();
}

StringBuffer &StringBuffer::operator=(const std::string &str)
{
    m_buffer = str;
    return *this;
}

TempFileBuffer::TempFileBuffer()
{
    if (std::tmpnam(tempFileName) == nullptr)
        throw std::runtime_error("Failed to generate a unique temporary file name.");

    filePointer = std::fopen(tempFileName, "w+");
    if (filePointer == nullptr)
        throw std::runtime_error("Failed to open temporary file for writing.");
}

TempFileBuffer::~TempFileBuffer()
{
    if (filePointer != nullptr)
    {
        std::fclose(filePointer);
        std::remove(tempFileName);
    }
}

TempFileBuffer::operator FILE *() const
{
    return filePointer;
}

TempFileBuffer::operator std::string() const
{
    std::string content;
    if (filePointer != nullptr)
    {
        std::rewind(filePointer);
        std::fseek(filePointer, 0, SEEK_END);
        long fileSize = std::ftell(filePointer);
        std::rewind(filePointer);

        content.resize(fileSize);
        std::fread(&content[0], 1, fileSize, filePointer);
    }
    return content;
}
