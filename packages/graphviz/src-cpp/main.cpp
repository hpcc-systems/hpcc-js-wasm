#include "main.hpp"

#include <gvc.h>
#include <gvplugin.h>
#include <graphviz_version.h>

#include <emscripten/bind.h>
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

namespace
{
    std::string lastErrorStr;

    int vizErrorf(char *buf)
    {
        lastErrorStr = buf ? buf : "";
        return 0;
    }
}

extern int Y_invert;
int origYInvert = Y_invert;
extern int Nop;
int origNop = Nop;

std::string Graphviz::version()
{
    return PACKAGE_VERSION;
}

std::string Graphviz::lastError()
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
}

Graphviz::~Graphviz()
{
}

void Graphviz::createFile(const std::string &path, const std::string &data)
{
    EM_ASM(
        {
            var path = UTF8ToString($0);
            var data = UTF8ToString($1);

            FS.createPath("/", PATH.dirname(path));
            FS.writeFile(PATH.join("/", path), data);
        },
        path.c_str(), data.c_str());
}

std::string Graphviz::layout(const std::string &src, const std::string &format, const std::string &engine)
{
    layout_result = "";

    GVC_t *gvc = gvContextPlugins(lt_preloaded_symbols, true);

    Agraph_t *graph = agmemread(src.c_str());
    if (graph)
    {
        char *data = NULL;
        size_t length;

        gvLayout(gvc, graph, engine.c_str());
        gvRenderData(gvc, graph, format.c_str(), &data, &length);
        layout_result = data ? data : "";
        gvFreeRenderData(data);
        gvFreeLayout(gvc, graph);
        agclose(graph);
    }

    gvFinalize(gvc);
    gvFreeContext(gvc);

    return layout_result;
}

bool Graphviz::acyclic(const std::string &src, bool doWrite, bool verbose)
{
    acyclic_outFile = "";
    acyclic_num_rev = 0;
    bool retVal = false;

    Agraph_t *graph = agmemread(src.c_str());
    if (graph)
    {
        TempFileBuffer outFile;
        graphviz_acyclic_options_t opts = {outFile, doWrite, verbose};
        retVal = graphviz_acyclic(graph, &opts, &acyclic_num_rev);
        acyclic_outFile = std::string(outFile);
        agclose(graph);
    }
    return retVal;
}

void Graphviz::tred(const std::string &src, bool verbose, bool printRemovedEdges)
{
    tred_out = "";
    tred_err = "";

    Agraph_t *graph = agmemread(src.c_str());
    if (graph)
    {
        TempFileBuffer out;
        TempFileBuffer err;
        graphviz_tred_options_t opts = {verbose, printRemovedEdges, out, err};
        graphviz_tred(graph, &opts);
        tred_out = std::string(out);
        tred_err = std::string(err);
        agclose(graph);
    }
}

std::string Graphviz::unflatten(const std::string &src, int maxMinlen, bool do_fans, int chainLimit)
{
    unflatten_out = "";

    Agraph_t *graph = agmemread(src.c_str());
    if (graph)
    {
        graphviz_unflatten_options_t opts = {do_fans, maxMinlen, chainLimit};
        graphviz_unflatten(graph, &opts);

        TempFileBuffer tempFile;
        agwrite(graph, tempFile);
        unflatten_out = std::string(tempFile);
        agclose(graph);
    }
    return unflatten_out;
}

EMSCRIPTEN_BINDINGS(graphvizlib_bindings)
{
    emscripten::class_<Graphviz>("Graphviz")
        .constructor<>()
        .constructor<int, int>()
        .class_function("version", &Graphviz::version)
        .class_function("lastError", &Graphviz::lastError)
        .function("createFile", &Graphviz::createFile)
        .property("layout_result", &Graphviz::layout_result)
        .function("layout", &Graphviz::layout)
        .property("acyclic_outFile", &Graphviz::acyclic_outFile)
        .property("acyclic_num_rev", &Graphviz::acyclic_num_rev)
        .function("acyclic", &Graphviz::acyclic)
        .property("tred_out", &Graphviz::tred_out)
        .property("tred_err", &Graphviz::tred_err)
        .function("tred", &Graphviz::tred)
        .property("unflatten_out", &Graphviz::unflatten_out)
        .function("unflatten", &Graphviz::unflatten);
}
