#include "util.hpp"

#include <string>

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

class CGraphviz
{
public:
    static std::string version()
    {
        return PACKAGE_VERSION;
    }

    static std::string lastError()
    {
        return lastErrorStr;
    }

    CGraphviz(int yInvert = 0, int nop = 0)
    {
        Y_invert = yInvert > 0 ? yInvert : origYInvert;
        Nop = nop > 0 ? nop : origNop;

        lastErrorStr = "";
        agseterr(AGERR);
        agseterrf(vizErrorf);
    }

    ~CGraphviz() = default;

    void createFile(const std::string &path, const std::string &data)
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

    std::string layout_result;
    std::string layout(const std::string &src, const std::string &format, const std::string &engine)
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

    std::string acyclic_outFile;
    size_t acyclic_num_rev;
    bool acyclic(const std::string &src, bool doWrite = false, bool verbose = false)
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

    std::string tred_out;
    std::string tred_err;
    void tred(const std::string &src, bool verbose = false, bool printRemovedEdges = false)
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

    std::string unflatten_out;
    std::string unflatten(const std::string &src, int maxMinlen = 0, bool do_fans = false, int chainLimit = 0)
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
};

#include <emscripten/bind.h>

EMSCRIPTEN_BINDINGS(graphvizlib_bindings)
{
    using namespace emscripten;

    class_<CGraphviz>("CGraphviz")
        .constructor<>()
        .constructor<int, int>()
        .class_function("version", &CGraphviz::version)
        .class_function("lastError", &CGraphviz::lastError)
        .function("createFile", &CGraphviz::createFile)
        .property("layout_result", &CGraphviz::layout_result)
        .function("layout", &CGraphviz::layout)
        .property("acyclic_outFile", &CGraphviz::acyclic_outFile)
        .property("acyclic_num_rev", &CGraphviz::acyclic_num_rev)
        .function("acyclic", &CGraphviz::acyclic)
        .property("tred_out", &CGraphviz::tred_out)
        .property("tred_err", &CGraphviz::tred_err)
        .function("tred", &CGraphviz::tred)
        .property("unflatten_out", &CGraphviz::unflatten_out)
        .function("unflatten", &CGraphviz::unflatten)

        ;
}
