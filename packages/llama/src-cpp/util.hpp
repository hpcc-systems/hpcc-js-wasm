#pragma once

#include <string>
#include <vector>

class ArgBuffer
{
public:
    int argc;
    char **argv;

    ArgBuffer(const std::vector<std::string> &args);
    ~ArgBuffer();

    ArgBuffer(const ArgBuffer &) = delete;
    ArgBuffer(ArgBuffer &&) = delete;
    ArgBuffer &operator=(const ArgBuffer &) = delete;
    ArgBuffer &operator=(ArgBuffer &&) = delete;
};

class OutErrRedirect
{
private:
    int outBackup = -1;
    int errBackup = -1;

public:
    OutErrRedirect();
    ~OutErrRedirect();

    OutErrRedirect(const OutErrRedirect &) = delete;
    OutErrRedirect(OutErrRedirect &&) = delete;
    OutErrRedirect &operator=(const OutErrRedirect &) = delete;
    OutErrRedirect &operator=(OutErrRedirect &&) = delete;
};

void readOutFile(std::vector<std::string> &retVal);
void readErrorFile(std::vector<std::string> &retVal);
