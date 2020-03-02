#include "main.hpp"

#include <emscripten.h>

void Main::createFile(const char *path, const char *data)
{
    EM_ASM_({
        var path = UTF8ToString($0);
        var data = UTF8ToString($1);

        FS.createPath("/", PATH.dirname(path));
        FS.writeFile(PATH.join("/", path), data);
    },
            path, data);
}
