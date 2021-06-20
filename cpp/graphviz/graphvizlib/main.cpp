#include "main.hpp"

#include "../config.h"
#include <gvc.h>
#include <globals.h>

#include <emscripten.h>

extern gvplugin_library_t gvplugin_core_LTX_library;
extern gvplugin_library_t gvplugin_dot_layout_LTX_library;
extern gvplugin_library_t gvplugin_neato_layout_LTX_library;

char lastErrorStr[1024];

int vizErrorf(char *buf)
{
    strncpy(lastErrorStr, buf, sizeof(lastErrorStr) - 1);
    return 0;
}

const char *Graphviz::version()
{
    return PACKAGE_VERSION;
}

const char *Graphviz::lastError()
{
    return lastErrorStr;
}

int origYInvert = Y_invert;
int origNop = Nop;

Graphviz::Graphviz(bool yInvert, int nop)
{
    Y_invert = yInvert == true ? 1 : origYInvert;
    Nop = nop > 0 ? nop : origNop;
}

Graphviz::~Graphviz()
{
}

const char *Graphviz::layout(const char *src, const char *format, const char *engine)
{
    lastErrorStr[0] = '\0';

    GVC_t *context = gvContext();
    gvAddLibrary(context, &gvplugin_core_LTX_library);
    gvAddLibrary(context, &gvplugin_dot_layout_LTX_library);
    gvAddLibrary(context, &gvplugin_neato_layout_LTX_library);

    agseterr(AGERR);
    agseterrf(vizErrorf);

    agreadline(1);

    Agraph_t *graph;
    char *result = NULL;
    unsigned int length;
    while ((graph = agmemread(src)))
    {
        if (result == NULL)
        {
            gvLayout(context, graph, engine);
            gvRenderData(context, graph, format, &result, &length);
            gvFreeLayout(context, graph);
        }

        agclose(graph);

        src = "";
    }

    return result;
}

void Graphviz::createFile(const char *path, const char *data)
{
    EM_ASM(
        {
            var path = UTF8ToString($0);
            var data = UTF8ToString($1);

            FS.createPath("/", PATH.dirname(path));
            FS.writeFile(PATH.join("/", path), data);
        },
        path, data);
}

//  Include JS Glue  ---
#include "main_glue.cpp"
