#include "main.hpp"

#include <gvc.h>
// #include <globals.h>
#include <gvplugin.h>
#include <graphviz_version.h>
#include <fstream>
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

int myindegree(Agnode_t *n)
{
    return agdegree(n->root, n, TRUE, FALSE);
}

/* need outdegree without selfarcs */
int myoutdegree(Agnode_t *n)
{
    Agedge_t *e;
    int rv = 0;

    for (e = agfstout(n->root, n); e; e = agnxtout(n->root, e))
    {
        if (agtail(e) != aghead(e))
            rv++;
    }
    return rv;
}

bool isleaf(Agnode_t *n)
{
    return myindegree(n) + myoutdegree(n) == 1;
}

bool ischainnode(Agnode_t *n)
{
    return myindegree(n) == 1 && myoutdegree(n) == 1;
}

void adjustlen(Agedge_t *e, Agsym_t *sym, int newlen)
{
    char buf[12];

    snprintf(buf, sizeof(buf), "%d", newlen);
    agxset(e, sym, buf);
}

Agsym_t *bindedgeattr(Agraph_t *g, const char *str)
{
    return agattr(g, AGEDGE, const_cast<char *>(str), "");
}

const char *Graphviz::unflatten(const char *src, unsigned int MaxMinlen, bool Do_fans, unsigned int ChainLimit)
{
    lastErrorStr[0] = '\0';
    m_result = "";
    Agraph_t *g = agmemread(src);
    if (g)
    {

        Agnode_t *ChainNode;
        unsigned int ChainSize = 0;

        Agnode_t *n;
        Agedge_t *e;
        char *str;
        Agsym_t *m_ix, *s_ix;
        int cnt, d;

        m_ix = bindedgeattr(g, "minlen");
        s_ix = bindedgeattr(g, "style");

        for (n = agfstnode(g); n; n = agnxtnode(g, n))
        {
            d = myindegree(n) + myoutdegree(n);
            if (d == 0)
            {
                if (ChainLimit < 1)
                    continue;
                if (ChainNode)
                {
                    e = agedge(g, ChainNode, n, const_cast<char *>(""), TRUE);
                    agxset(e, s_ix, "invis");
                    ChainSize++;
                    if (ChainSize < ChainLimit)
                        ChainNode = n;
                    else
                    {
                        ChainNode = NULL;
                        ChainSize = 0;
                    }
                }
                else
                    ChainNode = n;
            }
            else if (d > 1)
            {
                if (MaxMinlen < 1)
                    continue;
                cnt = 0;
                for (e = agfstin(g, n); e; e = agnxtin(g, e))
                {
                    if (isleaf(agtail(e)))
                    {
                        str = agxget(e, m_ix);
                        if (str[0] == 0)
                        {
                            adjustlen(e, m_ix, cnt % MaxMinlen + 1);
                            cnt++;
                        }
                    }
                }

                cnt = 0;
                for (e = agfstout(g, n); e; e = agnxtout(g, e))
                {
                    if (isleaf(e->node) || (Do_fans && ischainnode(e->node)))
                    {
                        str = agxget(e, m_ix);
                        if (str[0] == 0)
                            adjustlen(e, m_ix, cnt % MaxMinlen + 1);
                        cnt++;
                    }
                }
            }
        }
        FILE *fp = fopen("tmp.dot", "w");
        agwrite(g, fp);
        fclose(fp);
        std::ifstream file("tmp.dot");
        std::string graph_str((std::istreambuf_iterator<char>(file)), std::istreambuf_iterator<char>());
        remove("tmp.dot");
        m_result = graph_str;
    }
    return m_result.c_str();
}

//  Include JS Glue  ---
#include "main_glue.cpp"
