#include "main.hpp"

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

    lastErrorStr = "";
    agseterr(AGERR);
    agseterrf(vizErrorf);
    agreadline(1);
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

const char *Graphviz::layout(const char *src, const char *format, const char *engine)
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

bool Graphviz::acyclic(const char *src, bool doWrite, bool verbose)
{
    acyclic_outFile = "";
    acyclic_num_rev = 0;
    bool retVal = false;

    Agraph_t *graph = agmemread(src);
    if (graph)
    {
        TempFileBuffer outFile;
        graphviz_acyclic_options_t opts = {outFile, doWrite, verbose};
        retVal = graphviz_acyclic(graph, &opts, &acyclic_num_rev);
        acyclic_outFile = outFile;
        agclose(graph);
    }
    return retVal;
}

void Graphviz::tred(const char *src, bool verbose, bool printRemovedEdges)
{
    tred_out = "";
    tred_err = "";

    Agraph_t *graph = agmemread(src);
    if (graph)
    {
        TempFileBuffer out;
        TempFileBuffer err;
        graphviz_tred_options_t opts = {verbose, printRemovedEdges, out, err};
        graphviz_tred(graph, &opts);
        tred_out = out;
        tred_err = err;
        agclose(graph);
    }
}

const char *Graphviz::unflatten(const char *src, int maxMinlen, bool do_fans, int chainLimit)
{
    unflatten_out = "";

    Agraph_t *graph = agmemread(src);
    if (graph)
    {
        graphviz_unflatten_options_t opts = {do_fans, maxMinlen, chainLimit};
        graphviz_unflatten(graph, &opts);

        TempFileBuffer tempFile;
        agwrite(graph, tempFile);
        unflatten_out = tempFile;
        agclose(graph);
    }
    return unflatten_out;
}

//  Include JS Glue  ---
#include "main_glue.cpp"
