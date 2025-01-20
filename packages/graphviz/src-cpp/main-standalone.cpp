#include "util.hpp"

#include <gvc.h>
#include <gvplugin.h>
#include <graphviz_version.h>

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

StringBuffer lastErrorStr;

int vizErrorf(char *buf)
{
    lastErrorStr = buf;
    return 0;
}

extern int Y_invert;
int origYInvert = Y_invert;
extern int Nop;
int origNop = Nop;

StringBuffer layout_result;

extern "C"
{
    const char *layout(const char *src, const char *format, const char *engine)
    {
        layout_result = "";

        GVC_t *gvc = gvContextPlugins(lt_preloaded_symbols, true);

        Agraph_t *graph = agmemread(src);
        if (graph)
        {
            char *data = NULL;
            unsigned int length;

            gvLayout(gvc, graph, engine);
            gvRenderData(gvc, graph, format, &data, &length);
            layout_result = data;
            gvFreeRenderData(data);
            gvFreeLayout(gvc, graph);
            agclose(graph);
        }

        gvFinalize(gvc);
        gvFreeContext(gvc);

        return layout_result;
    }

    const char *lastError()
    {
        return lastErrorStr;
    }
}
