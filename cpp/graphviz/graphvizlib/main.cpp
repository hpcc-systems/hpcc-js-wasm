#include "main.hpp"

#include "../config.h"
#include <gvc.h>
#include <globals.h>
#include <gvc/gvplugin.h>
// #include <cgraph++/AGraph.h>
// #include <gvc++/GVContext.h>
// #include <gvc++/GVLayout.h>
// #include <gvc++/GVRenderData.h>

#include <emscripten.h>

extern gvplugin_library_t gvplugin_dot_layout_LTX_library;
extern gvplugin_library_t gvplugin_neato_layout_LTX_library;
#ifdef HAVE_LIBGD
extern gvplugin_library_t gvplugin_gd_LTX_library;
#endif
#ifdef HAVE_PANGOCAIRO
extern gvplugin_library_t gvplugin_pango_LTX_library;
#ifdef HAVE_WEBP
extern gvplugin_library_t gvplugin_webp_LTX_library;
#endif
#endif
extern gvplugin_library_t gvplugin_core_LTX_library;

lt_symlist_t lt_preloaded_symbols[] = {
    {"gvplugin_dot_layout_LTX_library", &gvplugin_dot_layout_LTX_library},
    {"gvplugin_neato_layout_LTX_library", &gvplugin_neato_layout_LTX_library},
#ifdef HAVE_PANGOCAIRO
    {"gvplugin_pango_LTX_library", &gvplugin_pango_LTX_library},
#ifdef HAVE_WEBP
    {"gvplugin_webp_LTX_library", &gvplugin_webp_LTX_library},
#endif
#endif
#ifdef HAVE_LIBGD
    {"gvplugin_gd_LTX_library", &gvplugin_gd_LTX_library},
#endif
    {"gvplugin_core_LTX_library", &gvplugin_core_LTX_library},
    {0, 0}};

char lastErrorStr[1024];

int vizErrorf(char *buf)
{
    strncpy(lastErrorStr, buf, sizeof(lastErrorStr) - 1);
    return 0;
}

int origYInvert = Y_invert;
int origNop = Nop;

const char *Graphviz::version()
{
    return PACKAGE_VERSION;
}

const char *Graphviz::lastError()
{
    return lastErrorStr;
}

Graphviz::Graphviz(int yInvert, int nop)
{
    Y_invert = yInvert > 0 ? yInvert : origYInvert;
    Nop = nop > 0 ? nop : origNop;
}

Graphviz::~Graphviz()
{
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

const char *Graphviz::lastResult()
{
    return m_result.c_str();
}

const char *Graphviz::layout(const char *src, const char *format, const char *engine)
{
    lastErrorStr[0] = '\0';
    m_result = "";

    // const auto demand_loading = false;
    // auto gvc = std::make_shared<GVC::GVContext>(lt_preloaded_symbols, demand_loading);
    // auto g = std::make_shared<CGraph::AGraph>(dot);
    // const auto layout = GVC::GVLayout(gvc, g, engine);
    // const auto result = layout.render(format);
    // m_result = result.string_view();

    // return m_result.c_str();

    GVC_t *gvc = gvContextPlugins(lt_preloaded_symbols, true);

    agseterr(AGERR);
    agseterrf(vizErrorf);

    agreadline(1);

    Agraph_t *graph;
    char *data = NULL;
    unsigned int length;
    while ((graph = agmemread(src)))
    {
        if (data == NULL)
        {
            gvLayout(gvc, graph, engine);
            gvRenderData(gvc, graph, format, &data, &length);
            gvFreeLayout(gvc, graph);
        }

        agclose(graph);

        src = "";
    }
    m_result = data;
    gvFreeRenderData(data);

    gvFinalize(gvc);
    gvFreeContext(gvc);

    return m_result.c_str();
}

//  Include JS Glue  ---
#include "main_glue.cpp"
