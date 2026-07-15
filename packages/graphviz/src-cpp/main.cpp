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

    const char *implicitAttrDefault(int kind, const std::string &attr)
    {
        if (kind == AGNODE && attr == "label")
            return "\\N";
        return "";
    }

    void setObjectAttrText(void *obj, const std::string &attr, const std::string &value, int kind)
    {
        Agsym_t *sym = agattrsym(obj, const_cast<char *>(attr.c_str()));
        if (sym)
        {
            agxset_text(obj, sym, value.c_str());
        }
        else
        {
            agsafeset_text(obj,
                           const_cast<char *>(attr.c_str()),
                           value.c_str(),
                           implicitAttrDefault(kind, attr));
        }
    }

    void setObjectAttrHtml(void *obj, const std::string &attr, const std::string &value, int kind)
    {
        Agsym_t *sym = agattrsym(obj, const_cast<char *>(attr.c_str()));
        if (sym)
        {
            agxset_html(obj, sym, value.c_str());
        }
        else
        {
            agsafeset_html(obj,
                           const_cast<char *>(attr.c_str()),
                           value.c_str(),
                           implicitAttrDefault(kind, attr));
        }
    }

    void resetSubgraphAttrDefaults(Agraph_t *parent, Agraph_t *subgraph)
    {
        if (!parent || !subgraph)
            return;

        Agraph_t *root = agroot(parent);

        // New subgraphs inherit parent attributes/defaults, except the
        // subgraph/cluster label which should start empty.
        for (int kind : {AGRAPH, AGNODE, AGEDGE})
        {
            for (Agsym_t *attr = agnxtattr(root, kind, nullptr); attr; attr = agnxtattr(root, kind, attr))
            {
                const char *name = attr->name;
                Agsym_t *parentSym = agattr(parent, kind, const_cast<char *>(name), nullptr);
                const char *defaultValue = (parentSym && parentSym->defval)
                                               ? parentSym->defval
                                               : (attr->defval ? attr->defval : implicitAttrDefault(kind, name));

                if (kind == AGRAPH)
                {
                    if (std::string(name) == "label")
                    {
                        agattr(subgraph, kind, const_cast<char *>(name), implicitAttrDefault(kind, name));
                        continue;
                    }

                    const char *parentValue = agget(parent, const_cast<char *>(name));
                    const char *value = (parentValue && *parentValue) ? parentValue : defaultValue;
                    agsafeset_text(subgraph,
                                   const_cast<char *>(name),
                                   value,
                                   defaultValue);
                }
                else
                {
                    if (!parentSym)
                        continue;
                    agattr(subgraph, kind, const_cast<char *>(name), defaultValue);
                }
            }
        }
    }

    int vizErrorf(char *buf)
    {
        lastErrorStr = buf ? buf : "";
        return 0;
    }

    /**
     * Wrap `s` in a JSON string literal, escaping characters that JSON
     * requires to be escaped.  No allocation library is needed — the output
     * is a plain std::string.
     */
    std::string jsonStr(const char *s)
    {
        std::string out;
        out += '"';
        for (; s && *s; ++s)
        {
            const unsigned char c = static_cast<unsigned char>(*s);
            if (c == '"')
            {
                out += "\\\"";
            }
            else if (c == '\\')
            {
                out += "\\\\";
            }
            else if (c == '\n')
            {
                out += "\\n";
            }
            else if (c == '\r')
            {
                out += "\\r";
            }
            else if (c == '\t')
            {
                out += "\\t";
            }
            else if (c < 0x20)
            {
                // U+00xx control character → \u00xx
                static const char hex[] = "0123456789abcdef";
                out += "\\u00";
                out += hex[(c >> 4) & 0xf];
                out += hex[c & 0xf];
            }
            else
            {
                out += static_cast<char>(c);
            }
        }
        out += '"';
        return out;
    }
}

extern int Y_invert;
int origYInvert = Y_invert;
extern int Nop;
int origNop = Nop;

// Forward declaration — CSubgraph is defined after CGraph.
class CSubgraph;

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

/**
 * CGraph wraps the cgraph API to allow programmatic construction of a graph.
 * Nodes, edges, and attributes can be added incrementally, and the finished
 * graph can be serialised to DOT via toDot().
 *
 * Graph types (directed / strict) map to the cgraph Agdesc_t descriptors:
 *   directed=1, strict=0  →  Agdirected
 *   directed=0, strict=0  →  Agundirected
 *   directed=1, strict=1  →  Agstrictdirected
 *   directed=0, strict=1  →  Agstrictundirected
 */
class CGraph
{
public:
    Agraph_t *_graph = nullptr;
    std::string _dot_out;

    CGraph(const std::string &name = "G", int directed = 1, int strict = 0)
    {
        Agdesc_t type;
        if (directed && strict)
            type = Agstrictdirected;
        else if (directed)
            type = Agdirected;
        else if (strict)
            type = Agstrictundirected;
        else
            type = Agundirected;

        _graph = agopen(const_cast<char *>(name.c_str()), type, nullptr);
    }

    ~CGraph()
    {
        if (_graph)
        {
            agclose(_graph);
            _graph = nullptr;
        }
    }

    /** Create (or find) a node with the given name. */
    void addNode(const std::string &name)
    {
        if (_graph)
            agnode(_graph, const_cast<char *>(name.c_str()), 1);
    }

    /**
     * Create an edge from tail to head.  Both nodes are created automatically
     * if they do not already exist.  key distinguishes parallel edges; pass
     * an empty string for an anonymous edge.
     */
    void addEdge(const std::string &tail, const std::string &head, const std::string &key = "")
    {
        if (!_graph)
            return;
        Agnode_t *t = agnode(_graph, const_cast<char *>(tail.c_str()), 1);
        Agnode_t *h = agnode(_graph, const_cast<char *>(head.c_str()), 1);
        char *k = key.empty() ? nullptr : const_cast<char *>(key.c_str());
        agedge(_graph, t, h, k, 1);
    }

    /** Set a graph-level attribute (e.g. "rankdir", "label"). */
    void setGraphAttr(const std::string &attr, const std::string &value, const std::string &defaultValue = "")
    {
        if (_graph)
            agsafeset_text(_graph,
                           const_cast<char *>(attr.c_str()),
                           value.c_str(),
                           defaultValue.c_str());
    }

    void setGraphHtmlAttr(const std::string &attr, const std::string &value, const std::string &defaultValue = "")
    {
        if (_graph)
            agsafeset_html(_graph,
                           const_cast<char *>(attr.c_str()),
                           value.c_str(),
                           defaultValue.c_str());
    }

    /**
     * Set an attribute on a named node.  The node must already exist (call
     * addNode first, or it will be created implicitly by addEdge).
     */
    void setNodeAttr(const std::string &node, const std::string &attr, const std::string &value)
    {
        if (!_graph)
            return;
        Agnode_t *n = agnode(_graph, const_cast<char *>(node.c_str()), 0);
        if (n)
            setObjectAttrText(n, attr, value, AGNODE);
    }

    void setNodeAttr(const std::string &node, const std::string &attr, const std::string &value, const std::string &defaultValue)
    {
        if (!_graph)
            return;
        Agnode_t *n = agnode(_graph, const_cast<char *>(node.c_str()), 0);
        if (n)
            agsafeset_text(n,
                           const_cast<char *>(attr.c_str()),
                           value.c_str(),
                           defaultValue.c_str());
    }

    void setNodeHtmlAttr(const std::string &node, const std::string &attr, const std::string &value)
    {
        if (!_graph)
            return;
        Agnode_t *n = agnode(_graph, const_cast<char *>(node.c_str()), 0);
        if (n)
            setObjectAttrHtml(n, attr, value, AGNODE);
    }

    void setNodeHtmlAttr(const std::string &node, const std::string &attr, const std::string &value, const std::string &defaultValue)
    {
        if (!_graph)
            return;
        Agnode_t *n = agnode(_graph, const_cast<char *>(node.c_str()), 0);
        if (n)
            agsafeset_html(n,
                           const_cast<char *>(attr.c_str()),
                           value.c_str(),
                           defaultValue.c_str());
    }

    /**
     * Set an attribute on an edge identified by (tail, head, key).
     * Use the same key that was passed to addEdge(); pass "" for anonymous edges.
     */
    void setEdgeAttr(const std::string &tail, const std::string &head,
                     const std::string &key,
                     const std::string &attr, const std::string &value, const std::string &defaultValue = "")
    {
        if (!_graph)
            return;
        Agnode_t *t = agnode(_graph, const_cast<char *>(tail.c_str()), 0);
        Agnode_t *h = agnode(_graph, const_cast<char *>(head.c_str()), 0);
        if (!t || !h)
            return;
        char *k = key.empty() ? nullptr : const_cast<char *>(key.c_str());
        Agedge_t *e = agedge(_graph, t, h, k, 0);
        if (e)
            agsafeset_text(e,
                           const_cast<char *>(attr.c_str()),
                           value.c_str(),
                           defaultValue.c_str());
    }

    void setEdgeHtmlAttr(const std::string &tail, const std::string &head,
                         const std::string &key,
                         const std::string &attr, const std::string &value, const std::string &defaultValue = "")
    {
        if (!_graph)
            return;
        Agnode_t *t = agnode(_graph, const_cast<char *>(tail.c_str()), 0);
        Agnode_t *h = agnode(_graph, const_cast<char *>(head.c_str()), 0);
        if (!t || !h)
            return;
        char *k = key.empty() ? nullptr : const_cast<char *>(key.c_str());
        Agedge_t *e = agedge(_graph, t, h, k, 0);
        if (e)
            agsafeset_html(e,
                           const_cast<char *>(attr.c_str()),
                           value.c_str(),
                           defaultValue.c_str());
    }

    void setDefaultGraphAttr(const std::string &attr, const std::string &value)
    {
        if (_graph)
            agattr_text(_graph, AGRAPH, const_cast<char *>(attr.c_str()), value.c_str());
    }

    void setDefaultGraphHtmlAttr(const std::string &attr, const std::string &value)
    {
        if (_graph)
            agattr_html(_graph, AGRAPH, const_cast<char *>(attr.c_str()), value.c_str());
    }

    void setDefaultNodeAttr(const std::string &attr, const std::string &value)
    {
        if (_graph)
            agattr_text(_graph, AGNODE, const_cast<char *>(attr.c_str()), value.c_str());
    }

    void setDefaultNodeHtmlAttr(const std::string &attr, const std::string &value)
    {
        if (_graph)
            agattr_html(_graph, AGNODE, const_cast<char *>(attr.c_str()), value.c_str());
    }

    void setDefaultEdgeAttr(const std::string &attr, const std::string &value)
    {
        if (_graph)
            agattr_text(_graph, AGEDGE, const_cast<char *>(attr.c_str()), value.c_str());
    }

    void setDefaultEdgeHtmlAttr(const std::string &attr, const std::string &value)
    {
        if (_graph)
            agattr_html(_graph, AGEDGE, const_cast<char *>(attr.c_str()), value.c_str());
    }

    bool read(const std::string &src)
    {
        Agraph_t *graph = agmemread(src.c_str());
        if (!graph)
            return false;
        if (_graph)
            agclose(_graph);
        _graph = graph;
        return true;
    }

    /** Serialise the graph to a DOT-language string. */
    std::string toDot()
    {
        _dot_out = "";
        if (_graph)
        {
            TempFileBuffer tempFile;
            agwrite(_graph, tempFile);
            _dot_out = std::string(tempFile);
        }
        return _dot_out;
    }

    /**
     * Render the in-memory graph directly without a DOT round-trip.
     * Equivalent to calling toDot() then gvLayout()+gvRenderData() on the
     * result, but uses the Agraph_t already held in memory.
     *
     * gvFreeLayout is called before returning so subsequent layout() or
     * toDot() calls see a clean graph structure.
     */
    std::string layout_result;
    std::string layout(const std::string &format, const std::string &engine)
    {
        layout_result = "";
        if (!_graph)
            return layout_result;

        lastErrorStr = "";
        agseterr(AGERR);
        agseterrf(vizErrorf);

        GVC_t *gvc = gvContextPlugins(lt_preloaded_symbols, true);

        char *data = nullptr;
        size_t length = 0;

        gvLayout(gvc, _graph, engine.c_str());
        gvRenderData(gvc, _graph, format.c_str(), &data, &length);
        layout_result = data ? data : "";
        gvFreeRenderData(data);
        gvFreeLayout(gvc, _graph);

        gvFinalize(gvc);
        gvFreeContext(gvc);

        return layout_result;
    }

    // ---- Existence checks -----------------------------------------------

    /** Returns true if a node with the given name exists in the graph. */
    bool hasNode(const std::string &name)
    {
        if (!_graph)
            return false;
        return agnode(_graph, const_cast<char *>(name.c_str()), 0) != nullptr;
    }

    /**
     * Returns true if an edge from `tail` to `head` (with the given `key`)
     * exists.  Pass `key = ""` (default) to check for any edge between the
     * two nodes regardless of the discriminator key.
     */
    bool hasEdge(const std::string &tail, const std::string &head, const std::string &key = "")
    {
        if (!_graph)
            return false;
        Agnode_t *t = agnode(_graph, const_cast<char *>(tail.c_str()), 0);
        Agnode_t *h = agnode(_graph, const_cast<char *>(head.c_str()), 0);
        if (!t || !h)
            return false;
        char *k = key.empty() ? nullptr : const_cast<char *>(key.c_str());
        return agedge(_graph, t, h, k, 0) != nullptr;
    }

    /** Returns true if a subgraph with the given name exists. */
    bool hasSubgraph(const std::string &name)
    {
        if (!_graph)
            return false;
        return agsubg(_graph, const_cast<char *>(name.c_str()), 0) != nullptr;
    }

    // ---- Count queries --------------------------------------------------

    /** Returns the number of nodes in this graph. */
    int nodeCount() { return _graph ? agnnodes(_graph) : 0; }

    /** Returns the number of edges in this graph. */
    int edgeCount() { return _graph ? agnedges(_graph) : 0; }

    /** Returns the number of direct subgraphs of this graph. */
    int subgraphCount() { return _graph ? agnsubg(_graph) : 0; }

    /** Returns the degree of a named node. in and out select the edge sets:
     *  in=true, out=false returns in-degree
     *  in=false, out=true returns out-degree
     *  in=true, out=true returns total degree (default)
     *  Returns 0 if the node does not exist. */
    int nodeDegree(const std::string &node, int in = 1, int out = 1)
    {
        if (!_graph)
            return 0;
        Agnode_t *n = agnode(_graph, const_cast<char *>(node.c_str()), 0);
        if (!n)
            return 0;
        return agdegree(_graph, n, in, out);
    }

    // ---- Attribute reading ----------------------------------------------

    /** Returns the current value of a graph-level attribute, or `""`. */
    std::string getGraphAttr(const std::string &attr)
    {
        if (!_graph)
            return "";
        char *val = agget(_graph, const_cast<char *>(attr.c_str()));
        return val ? val : "";
    }

    /** Returns the current value of an attribute on the named node, or `""`. */
    std::string getNodeAttr(const std::string &node, const std::string &attr)
    {
        if (!_graph)
            return "";
        Agnode_t *n = agnode(_graph, const_cast<char *>(node.c_str()), 0);
        if (!n)
            return "";
        char *val = agget(n, const_cast<char *>(attr.c_str()));
        return val ? val : "";
    }

    /**
     * Returns the current value of an attribute on the specified edge, or `""`.
     * Pass `key = ""` to look up the first (or only) edge between the two nodes.
     */
    std::string getEdgeAttr(const std::string &tail, const std::string &head,
                            const std::string &key, const std::string &attr)
    {
        if (!_graph)
            return "";
        Agnode_t *t = agnode(_graph, const_cast<char *>(tail.c_str()), 0);
        Agnode_t *h = agnode(_graph, const_cast<char *>(head.c_str()), 0);
        if (!t || !h)
            return "";
        char *k = key.empty() ? nullptr : const_cast<char *>(key.c_str());
        Agedge_t *e = agedge(_graph, t, h, k, 0);
        if (!e)
            return "";
        char *val = agget(e, const_cast<char *>(attr.c_str()));
        return val ? val : "";
    }

    // ---- Graph traversal ------------------------------------------------

    /** Returns a JSON array of all node names in graph-internal iteration order. */
    std::string nodeNames()
    {
        std::string result = "[";
        bool first = true;
        if (_graph)
            for (Agnode_t *n = agfstnode(_graph); n; n = agnxtnode(_graph, n))
            {
                if (!first)
                    result += ',';
                result += jsonStr(agnameof(n));
                first = false;
            }
        result += ']';
        return result;
    }

    /** Returns a JSON array of all direct subgraph names. */
    std::string subgraphNames()
    {
        std::string result = "[";
        bool first = true;
        if (_graph)
            for (Agraph_t *sg = agfstsubg(_graph); sg; sg = agnxtsubg(sg))
            {
                if (!first)
                    result += ',';
                result += jsonStr(agnameof(sg));
                first = false;
            }
        result += ']';
        return result;
    }

    /**
     * Returns a JSON array of flat triples `[tail,head,key, ...]` for every
     * edge in the graph.  Each unique edge is included exactly once.
     * For directed graphs out-edge iteration gives each edge once from its
     * tail; the `agtail(e) != n` guard handles undirected graphs.
     */
    std::string edges()
    {
        std::string result = "[";
        bool first = true;
        if (_graph)
            for (Agnode_t *n = agfstnode(_graph); n; n = agnxtnode(_graph, n))
                for (Agedge_t *e = agfstout(_graph, n); e; e = agnxtout(_graph, e))
                {
                    if (agtail(e) != n)
                        continue;
                    const char *k = agnameof(e);
                    if (!first)
                        result += ',';
                    result += jsonStr(agnameof(agtail(e)));
                    result += ',';
                    result += jsonStr(agnameof(aghead(e)));
                    result += ',';
                    result += jsonStr(k ? k : "");
                    first = false;
                }
        result += ']';
        return result;
    }

    /**
     * Returns a JSON array of flat triples `[tail,head,key, ...]` for every
     * out-edge of the named node.  Returns `[]` if the node does not exist.
     */
    std::string outEdges(const std::string &node)
    {
        std::string result = "[";
        bool first = true;
        if (_graph)
        {
            Agnode_t *n = agnode(_graph, const_cast<char *>(node.c_str()), 0);
            if (n)
                for (Agedge_t *e = agfstout(_graph, n); e; e = agnxtout(_graph, e))
                {
                    const char *k = agnameof(e);
                    if (!first)
                        result += ',';
                    result += jsonStr(agnameof(agtail(e)));
                    result += ',';
                    result += jsonStr(agnameof(aghead(e)));
                    result += ',';
                    result += jsonStr(k ? k : "");
                    first = false;
                }
        }
        result += ']';
        return result;
    }

    /**
     * Returns a JSON array of flat triples `[tail,head,key, ...]` for every
     * in-edge of the named node.  Returns `[]` if the node does not exist.
     */
    std::string inEdges(const std::string &node)
    {
        std::string result = "[";
        bool first = true;
        if (_graph)
        {
            Agnode_t *n = agnode(_graph, const_cast<char *>(node.c_str()), 0);
            if (n)
                for (Agedge_t *e = agfstin(_graph, n); e; e = agnxtin(_graph, e))
                {
                    const char *k = agnameof(e);
                    if (!first)
                        result += ',';
                    result += jsonStr(agnameof(agtail(e)));
                    result += ',';
                    result += jsonStr(agnameof(aghead(e)));
                    result += ',';
                    result += jsonStr(k ? k : "");
                    first = false;
                }
        }
        result += ']';
        return result;
    }

    /**
     * Returns a JSON array of flat triples `[tail,head,key, ...]` for all
     * edges incident on the named node (in and out).
     * Returns `[]` if the node does not exist.
     */
    std::string nodeEdges(const std::string &node)
    {
        std::string result = "[";
        bool first = true;
        if (_graph)
        {
            Agnode_t *n = agnode(_graph, const_cast<char *>(node.c_str()), 0);
            if (n)
                for (Agedge_t *e = agfstedge(_graph, n); e; e = agnxtedge(_graph, e, n))
                {
                    const char *k = agnameof(e);
                    if (!first)
                        result += ',';
                    result += jsonStr(agnameof(agtail(e)));
                    result += ',';
                    result += jsonStr(agnameof(aghead(e)));
                    result += ',';
                    result += jsonStr(k ? k : "");
                    first = false;
                }
        }
        result += ']';
        return result;
    }

    /**
     * Create (or return an existing) named subgraph.
     * Returns a heap-allocated CSubgraph whose lifetime is managed by the
     * caller — call delete() on the returned object when done.  The
     * underlying Agraph_t is owned by this CGraph and is freed automatically
     * when the parent graph is deleted.
     */
    CSubgraph *addSubgraph(const std::string &name); // defined out-of-line below

    /**
     * Look up an existing subgraph by name without creating a new one.
     * Returns a heap-allocated CSubgraph wrapper if found, or nullptr if no
     * subgraph with that name exists.  Caller is responsible for delete().
     */
    CSubgraph *getSubgraph(const std::string &name); // defined out-of-line below

    /**
     * Remove a node (and all its edges) from the graph.
     * If the node does not exist this is a no-op.
     * Removing a node from the root graph also removes it from every subgraph.
     */
    void removeNode(const std::string &name)
    {
        if (!_graph)
            return;
        Agnode_t *n = agnode(_graph, const_cast<char *>(name.c_str()), 0);
        if (n)
            agdelnode(_graph, n);
    }

    /**
     * Remove a single edge identified by (tail, head, key).
     * If the edge does not exist this is a no-op.
     */
    void removeEdge(const std::string &tail, const std::string &head, const std::string &key = "")
    {
        if (!_graph)
            return;
        Agnode_t *t = agnode(_graph, const_cast<char *>(tail.c_str()), 0);
        Agnode_t *h = agnode(_graph, const_cast<char *>(head.c_str()), 0);
        if (!t || !h)
            return;
        char *k = key.empty() ? nullptr : const_cast<char *>(key.c_str());
        Agedge_t *e = agedge(_graph, t, h, k, 0);
        if (e)
            agdeledge(_graph, e);
    }

    /**
     * Remove a subgraph (cluster) by name.  Nodes and edges that belonged to
     * the subgraph remain in the parent graph; only the subgraph boundary is
     * dissolved.  If no subgraph with that name exists this is a no-op.
     */
    void removeSubgraph(const std::string &name)
    {
        if (!_graph)
            return;
        Agraph_t *sg = agsubg(_graph, const_cast<char *>(name.c_str()), 0);
        if (sg)
            agclose(sg);
    }
};

/**
 * Non-owning wrapper around a cgraph subgraph (Agraph_t *).
 * The underlying Agraph_t is owned by the parent CGraph; do NOT call
 * agclose on it.  This wrapper is heap-allocated by CGraph::addSubgraph
 * and its C++ destructor is a no-op with respect to graph memory.
 */
class CSubgraph
{
public:
    Agraph_t *_subgraph = nullptr;

    // Default constructor required by Emscripten's class binding machinery.
    CSubgraph() = default;

    // Used internally by CGraph::addSubgraph.
    explicit CSubgraph(Agraph_t *sg) : _subgraph(sg) {}

    // Destructor does NOT free _subgraph — the parent CGraph owns it.
    ~CSubgraph() = default;

    /** Create (or find) a node and add it to this subgraph. */
    void addNode(const std::string &name)
    {
        if (_subgraph)
            agnode(_subgraph, const_cast<char *>(name.c_str()), 1);
    }

    /**
     * Create an edge inside this subgraph.  Both endpoints are created
     * automatically if they do not exist.
     */
    void addEdge(const std::string &tail, const std::string &head, const std::string &key = "")
    {
        if (!_subgraph)
            return;
        Agnode_t *t = agnode(_subgraph, const_cast<char *>(tail.c_str()), 1);
        Agnode_t *h = agnode(_subgraph, const_cast<char *>(head.c_str()), 1);
        char *k = key.empty() ? nullptr : const_cast<char *>(key.c_str());
        agedge(_subgraph, t, h, k, 1);
    }

    /**
     * Create (or return an existing) named subgraph under this subgraph.
     * Returns a heap-allocated CSubgraph wrapper whose lifetime is managed by
     * the caller.
     */
    CSubgraph *addSubgraph(const std::string &name)
    {
        if (!_subgraph)
            return nullptr;
        Agraph_t *sg = agsubg(_subgraph, const_cast<char *>(name.c_str()), 0);
        if (!sg)
        {
            sg = agsubg(_subgraph, const_cast<char *>(name.c_str()), 1);
            resetSubgraphAttrDefaults(_subgraph, sg);
        }
        return sg ? new CSubgraph(sg) : nullptr;
    }

    /**
     * Set an attribute on the subgraph itself (e.g. "label", "style",
     * "color", "bgcolor").
     */
    void setAttr(const std::string &attr, const std::string &value, const std::string &defaultValue = "")
    {
        if (_subgraph)
            agsafeset_text(_subgraph,
                           const_cast<char *>(attr.c_str()),
                           value.c_str(),
                           defaultValue.c_str());
    }

    void setHtmlAttr(const std::string &attr, const std::string &value, const std::string &defaultValue = "")
    {
        if (_subgraph)
            agsafeset_html(_subgraph,
                           const_cast<char *>(attr.c_str()),
                           value.c_str(),
                           defaultValue.c_str());
    }

    /** Set an attribute on a node that lives in this subgraph. */
    void setNodeAttr(const std::string &node, const std::string &attr, const std::string &value)
    {
        if (!_subgraph)
            return;
        Agnode_t *n = agnode(_subgraph, const_cast<char *>(node.c_str()), 0);
        if (n)
            setObjectAttrText(n, attr, value, AGNODE);
    }

    void setNodeAttr(const std::string &node, const std::string &attr, const std::string &value, const std::string &defaultValue)
    {
        if (!_subgraph)
            return;
        Agnode_t *n = agnode(_subgraph, const_cast<char *>(node.c_str()), 0);
        if (n)
            agsafeset_text(n,
                           const_cast<char *>(attr.c_str()),
                           value.c_str(),
                           defaultValue.c_str());
    }

    void setNodeHtmlAttr(const std::string &node, const std::string &attr, const std::string &value)
    {
        if (!_subgraph)
            return;
        Agnode_t *n = agnode(_subgraph, const_cast<char *>(node.c_str()), 0);
        if (n)
            setObjectAttrHtml(n, attr, value, AGNODE);
    }

    void setNodeHtmlAttr(const std::string &node, const std::string &attr, const std::string &value, const std::string &defaultValue)
    {
        if (!_subgraph)
            return;
        Agnode_t *n = agnode(_subgraph, const_cast<char *>(node.c_str()), 0);
        if (n)
            agsafeset_html(n,
                           const_cast<char *>(attr.c_str()),
                           value.c_str(),
                           defaultValue.c_str());
    }

    /** Set an attribute on an edge inside this subgraph (identified by tail/head/key). */
    void setEdgeAttr(const std::string &tail, const std::string &head,
                     const std::string &key,
                     const std::string &attr, const std::string &value, const std::string &defaultValue = "")
    {
        if (!_subgraph)
            return;
        Agnode_t *t = agnode(_subgraph, const_cast<char *>(tail.c_str()), 0);
        Agnode_t *h = agnode(_subgraph, const_cast<char *>(head.c_str()), 0);
        if (!t || !h)
            return;
        char *k = key.empty() ? nullptr : const_cast<char *>(key.c_str());
        Agedge_t *e = agedge(_subgraph, t, h, k, 0);
        if (e)
            agsafeset_text(e,
                           const_cast<char *>(attr.c_str()),
                           value.c_str(),
                           defaultValue.c_str());
    }

    void setEdgeHtmlAttr(const std::string &tail, const std::string &head,
                         const std::string &key,
                         const std::string &attr, const std::string &value, const std::string &defaultValue = "")
    {
        if (!_subgraph)
            return;
        Agnode_t *t = agnode(_subgraph, const_cast<char *>(tail.c_str()), 0);
        Agnode_t *h = agnode(_subgraph, const_cast<char *>(head.c_str()), 0);
        if (!t || !h)
            return;
        char *k = key.empty() ? nullptr : const_cast<char *>(key.c_str());
        Agedge_t *e = agedge(_subgraph, t, h, k, 0);
        if (e)
            agsafeset_html(e,
                           const_cast<char *>(attr.c_str()),
                           value.c_str(),
                           defaultValue.c_str());
    }

    void setDefaultAttr(const std::string &attr, const std::string &value)
    {
        if (_subgraph)
            agattr_text(_subgraph, AGRAPH, const_cast<char *>(attr.c_str()), value.c_str());
    }

    void setDefaultHtmlAttr(const std::string &attr, const std::string &value)
    {
        if (_subgraph)
            agattr_html(_subgraph, AGRAPH, const_cast<char *>(attr.c_str()), value.c_str());
    }

    void setDefaultNodeAttr(const std::string &attr, const std::string &value)
    {
        if (_subgraph)
            agattr_text(_subgraph, AGNODE, const_cast<char *>(attr.c_str()), value.c_str());
    }

    void setDefaultNodeHtmlAttr(const std::string &attr, const std::string &value)
    {
        if (_subgraph)
            agattr_html(_subgraph, AGNODE, const_cast<char *>(attr.c_str()), value.c_str());
    }

    void setDefaultEdgeAttr(const std::string &attr, const std::string &value)
    {
        if (_subgraph)
            agattr_text(_subgraph, AGEDGE, const_cast<char *>(attr.c_str()), value.c_str());
    }

    void setDefaultEdgeHtmlAttr(const std::string &attr, const std::string &value)
    {
        if (_subgraph)
            agattr_html(_subgraph, AGEDGE, const_cast<char *>(attr.c_str()), value.c_str());
    }

    /**
     * Remove a node from this subgraph only.
     * The node and its edges remain in the root graph and other subgraphs.
     * If the node is not in this subgraph this is a no-op.
     */
    void removeNode(const std::string &name)
    {
        if (!_subgraph)
            return;
        Agnode_t *n = agnode(_subgraph, const_cast<char *>(name.c_str()), 0);
        if (n)
            agdelnode(_subgraph, n);
    }

    /**
     * Remove a single edge from this subgraph only.
     * The edge remains in the root graph and other subgraphs.
     * If the edge is not in this subgraph this is a no-op.
     */
    void removeEdge(const std::string &tail, const std::string &head, const std::string &key = "")
    {
        if (!_subgraph)
            return;
        Agnode_t *t = agnode(_subgraph, const_cast<char *>(tail.c_str()), 0);
        Agnode_t *h = agnode(_subgraph, const_cast<char *>(head.c_str()), 0);
        if (!t || !h)
            return;
        char *k = key.empty() ? nullptr : const_cast<char *>(key.c_str());
        Agedge_t *e = agedge(_subgraph, t, h, k, 0);
        if (e)
            agdeledge(_subgraph, e);
    }

    // ---- Existence checks -----------------------------------------------

    /** Returns true if a node with the given name exists in this subgraph. */
    bool hasNode(const std::string &name)
    {
        if (!_subgraph)
            return false;
        return agnode(_subgraph, const_cast<char *>(name.c_str()), 0) != nullptr;
    }

    /**
     * Returns true if an edge from `tail` to `head` (with the given `key`)
     * exists in this subgraph.  Pass `key = ""` to check for any edge.
     */
    bool hasEdge(const std::string &tail, const std::string &head, const std::string &key = "")
    {
        if (!_subgraph)
            return false;
        Agnode_t *t = agnode(_subgraph, const_cast<char *>(tail.c_str()), 0);
        Agnode_t *h = agnode(_subgraph, const_cast<char *>(head.c_str()), 0);
        if (!t || !h)
            return false;
        char *k = key.empty() ? nullptr : const_cast<char *>(key.c_str());
        return agedge(_subgraph, t, h, k, 0) != nullptr;
    }

    // ---- Count queries --------------------------------------------------

    /** Returns the number of nodes in this subgraph. */
    int nodeCount() { return _subgraph ? agnnodes(_subgraph) : 0; }

    /** Returns the number of edges in this subgraph. */
    int edgeCount() { return _subgraph ? agnedges(_subgraph) : 0; }

    /** Returns the degree of a named node in this subgraph. in and out select the edge sets:
     *  in=true, out=false returns in-degree
     *  in=false, out=true returns out-degree
     *  in=true, out=true returns total degree (default)
     *  Returns 0 if the node does not exist. */
    int nodeDegree(const std::string &node, int in = 1, int out = 1)
    {
        if (!_subgraph)
            return 0;
        Agnode_t *n = agnode(_subgraph, const_cast<char *>(node.c_str()), 0);
        if (!n)
            return 0;
        return agdegree(_subgraph, n, in, out);
    }

    // ---- Attribute reading ----------------------------------------------

    /** Returns the current value of a subgraph-level attribute, or `""`. */
    std::string getAttr(const std::string &attr)
    {
        if (!_subgraph)
            return "";
        char *val = agget(_subgraph, const_cast<char *>(attr.c_str()));
        return val ? val : "";
    }

    /** Returns the current value of an attribute on the named node, or `""`. */
    std::string getNodeAttr(const std::string &node, const std::string &attr)
    {
        if (!_subgraph)
            return "";
        Agnode_t *n = agnode(_subgraph, const_cast<char *>(node.c_str()), 0);
        if (!n)
            return "";
        char *val = agget(n, const_cast<char *>(attr.c_str()));
        return val ? val : "";
    }

    /**
     * Returns the current value of an attribute on the specified edge, or `""`.
     * Pass `key = ""` to look up the first (or only) edge.
     */
    std::string getEdgeAttr(const std::string &tail, const std::string &head,
                            const std::string &key, const std::string &attr)
    {
        if (!_subgraph)
            return "";
        Agnode_t *t = agnode(_subgraph, const_cast<char *>(tail.c_str()), 0);
        Agnode_t *h = agnode(_subgraph, const_cast<char *>(head.c_str()), 0);
        if (!t || !h)
            return "";
        char *k = key.empty() ? nullptr : const_cast<char *>(key.c_str());
        Agedge_t *e = agedge(_subgraph, t, h, k, 0);
        if (!e)
            return "";
        char *val = agget(e, const_cast<char *>(attr.c_str()));
        return val ? val : "";
    }

    // ---- Graph traversal ------------------------------------------------

    /** Returns a JSON array of all node names in this subgraph (iteration order). */
    std::string nodeNames()
    {
        std::string result = "[";
        bool first = true;
        if (_subgraph)
            for (Agnode_t *n = agfstnode(_subgraph); n; n = agnxtnode(_subgraph, n))
            {
                if (!first)
                    result += ',';
                result += jsonStr(agnameof(n));
                first = false;
            }
        result += ']';
        return result;
    }

    /**
     * Returns a JSON array of flat triples `[tail,head,key, ...]` for every
     * edge in this subgraph.  Each unique edge is included exactly once.
     */
    std::string edges()
    {
        std::string result = "[";
        bool first = true;
        if (_subgraph)
            for (Agnode_t *n = agfstnode(_subgraph); n; n = agnxtnode(_subgraph, n))
                for (Agedge_t *e = agfstout(_subgraph, n); e; e = agnxtout(_subgraph, e))
                {
                    if (agtail(e) != n)
                        continue;
                    const char *k = agnameof(e);
                    if (!first)
                        result += ',';
                    result += jsonStr(agnameof(agtail(e)));
                    result += ',';
                    result += jsonStr(agnameof(aghead(e)));
                    result += ',';
                    result += jsonStr(k ? k : "");
                    first = false;
                }
        result += ']';
        return result;
    }

    /** Returns a JSON array of flat triples for out-edges of the named node. */
    std::string outEdges(const std::string &node)
    {
        std::string result = "[";
        bool first = true;
        if (_subgraph)
        {
            Agnode_t *n = agnode(_subgraph, const_cast<char *>(node.c_str()), 0);
            if (n)
                for (Agedge_t *e = agfstout(_subgraph, n); e; e = agnxtout(_subgraph, e))
                {
                    const char *k = agnameof(e);
                    if (!first)
                        result += ',';
                    result += jsonStr(agnameof(agtail(e)));
                    result += ',';
                    result += jsonStr(agnameof(aghead(e)));
                    result += ',';
                    result += jsonStr(k ? k : "");
                    first = false;
                }
        }
        result += ']';
        return result;
    }

    /** Returns a JSON array of flat triples for in-edges of the named node. */
    std::string inEdges(const std::string &node)
    {
        std::string result = "[";
        bool first = true;
        if (_subgraph)
        {
            Agnode_t *n = agnode(_subgraph, const_cast<char *>(node.c_str()), 0);
            if (n)
                for (Agedge_t *e = agfstin(_subgraph, n); e; e = agnxtin(_subgraph, e))
                {
                    const char *k = agnameof(e);
                    if (!first)
                        result += ',';
                    result += jsonStr(agnameof(agtail(e)));
                    result += ',';
                    result += jsonStr(agnameof(aghead(e)));
                    result += ',';
                    result += jsonStr(k ? k : "");
                    first = false;
                }
        }
        result += ']';
        return result;
    }

    /** Returns a JSON array of flat triples for all edges incident on the named node. */
    std::string nodeEdges(const std::string &node)
    {
        std::string result = "[";
        bool first = true;
        if (_subgraph)
        {
            Agnode_t *n = agnode(_subgraph, const_cast<char *>(node.c_str()), 0);
            if (n)
                for (Agedge_t *e = agfstedge(_subgraph, n); e; e = agnxtedge(_subgraph, e, n))
                {
                    const char *k = agnameof(e);
                    if (!first)
                        result += ',';
                    result += jsonStr(agnameof(agtail(e)));
                    result += ',';
                    result += jsonStr(agnameof(aghead(e)));
                    result += ',';
                    result += jsonStr(k ? k : "");
                    first = false;
                }
        }
        result += ']';
        return result;
    }
};

// Out-of-line definitions now that CSubgraph is complete.
CSubgraph *CGraph::addSubgraph(const std::string &name)
{
    if (!_graph)
        return nullptr;
    Agraph_t *sg = agsubg(_graph, const_cast<char *>(name.c_str()), 0);
    if (!sg)
    {
        sg = agsubg(_graph, const_cast<char *>(name.c_str()), 1);
        resetSubgraphAttrDefaults(_graph, sg);
    }
    return sg ? new CSubgraph(sg) : nullptr;
}

CSubgraph *CGraph::getSubgraph(const std::string &name)
{
    if (!_graph)
        return nullptr;
    Agraph_t *sg = agsubg(_graph, const_cast<char *>(name.c_str()), 0);
    return sg ? new CSubgraph(sg) : nullptr;
}

#include <emscripten/bind.h>

EMSCRIPTEN_BINDINGS(graphvizlib_bindings)
{
    using namespace emscripten;

    class_<CGraphviz>("CGraphviz")
        .constructor<>()
        .constructor<int>()
        .constructor<int, int>()
        .class_function("version", &CGraphviz::version)
        .class_function("lastError", &CGraphviz::lastError)
        .function("createFile", &CGraphviz::createFile)
        .property("layout_result", &CGraphviz::layout_result)
        .function("layout", &CGraphviz::layout)
        .property("acyclic_outFile", &CGraphviz::acyclic_outFile)
        .property("acyclic_num_rev", &CGraphviz::acyclic_num_rev)
        .function("acyclic", optional_override([](CGraphviz &self, const std::string &src)
                                               { return self.acyclic(src); }))
        .function("acyclic", optional_override([](CGraphviz &self, const std::string &src, bool doWrite)
                                               { return self.acyclic(src, doWrite); }))
        .function("acyclic", &CGraphviz::acyclic)
        .property("tred_out", &CGraphviz::tred_out)
        .property("tred_err", &CGraphviz::tred_err)
        .function("tred", optional_override([](CGraphviz &self, const std::string &src)
                                            { self.tred(src); }))
        .function("tred", optional_override([](CGraphviz &self, const std::string &src, bool verbose)
                                            { self.tred(src, verbose); }))
        .function("tred", &CGraphviz::tred)
        .property("unflatten_out", &CGraphviz::unflatten_out)
        .function("unflatten", optional_override([](CGraphviz &self, const std::string &src)
                                                 { return self.unflatten(src); }))
        .function("unflatten", optional_override([](CGraphviz &self, const std::string &src, int maxMinlen)
                                                 { return self.unflatten(src, maxMinlen); }))
        .function("unflatten", optional_override([](CGraphviz &self, const std::string &src, int maxMinlen, bool do_fans)
                                                 { return self.unflatten(src, maxMinlen, do_fans); }))
        .function("unflatten", &CGraphviz::unflatten)

        ;

    class_<CGraph>("CGraph")
        .constructor<>()
        .constructor<const std::string &>()
        .constructor<const std::string &, int>()
        .constructor<const std::string &, int, int>()
        .function("addNode", &CGraph::addNode)
        .function("addEdge", optional_override([](CGraph &self, const std::string &tail, const std::string &head)
                                               { self.addEdge(tail, head); }))
        .function("addEdge", &CGraph::addEdge)
        .function("setGraphAttr", optional_override([](CGraph &self, const std::string &attr, const std::string &value)
                                                    { self.setGraphAttr(attr, value); }))
        .function("setGraphAttr", optional_override([](CGraph &self, const std::string &attr, const std::string &value, const std::string &defaultValue)
                                                    { self.setGraphAttr(attr, value, defaultValue); }))
        .function("setGraphHtmlAttr", optional_override([](CGraph &self, const std::string &attr, const std::string &value)
                                                        { self.setGraphHtmlAttr(attr, value); }))
        .function("setGraphHtmlAttr", optional_override([](CGraph &self, const std::string &attr, const std::string &value, const std::string &defaultValue)
                                                        { self.setGraphHtmlAttr(attr, value, defaultValue); }))
        .function("setNodeAttr", optional_override([](CGraph &self, const std::string &node, const std::string &attr, const std::string &value)
                                                   { self.setNodeAttr(node, attr, value); }))
        .function("setNodeAttr", optional_override([](CGraph &self, const std::string &node, const std::string &attr, const std::string &value, const std::string &defaultValue)
                                                   { self.setNodeAttr(node, attr, value, defaultValue); }))
        .function("setNodeHtmlAttr", optional_override([](CGraph &self, const std::string &node, const std::string &attr, const std::string &value)
                                                       { self.setNodeHtmlAttr(node, attr, value); }))
        .function("setNodeHtmlAttr", optional_override([](CGraph &self, const std::string &node, const std::string &attr, const std::string &value, const std::string &defaultValue)
                                                       { self.setNodeHtmlAttr(node, attr, value, defaultValue); }))
        .function("setEdgeAttr", optional_override([](CGraph &self, const std::string &tail, const std::string &head, const std::string &key, const std::string &attr, const std::string &value)
                                                   { self.setEdgeAttr(tail, head, key, attr, value); }))
        .function("setEdgeAttr", optional_override([](CGraph &self, const std::string &tail, const std::string &head, const std::string &key, const std::string &attr, const std::string &value, const std::string &defaultValue)
                                                   { self.setEdgeAttr(tail, head, key, attr, value, defaultValue); }))
        .function("setEdgeHtmlAttr", optional_override([](CGraph &self, const std::string &tail, const std::string &head, const std::string &key, const std::string &attr, const std::string &value)
                                                       { self.setEdgeHtmlAttr(tail, head, key, attr, value); }))
        .function("setEdgeHtmlAttr", optional_override([](CGraph &self, const std::string &tail, const std::string &head, const std::string &key, const std::string &attr, const std::string &value, const std::string &defaultValue)
                                                       { self.setEdgeHtmlAttr(tail, head, key, attr, value, defaultValue); }))
        .function("setDefaultGraphAttr", &CGraph::setDefaultGraphAttr)
        .function("setDefaultGraphHtmlAttr", &CGraph::setDefaultGraphHtmlAttr)
        .function("setDefaultNodeAttr", &CGraph::setDefaultNodeAttr)
        .function("setDefaultNodeHtmlAttr", &CGraph::setDefaultNodeHtmlAttr)
        .function("setDefaultEdgeAttr", &CGraph::setDefaultEdgeAttr)
        .function("setDefaultEdgeHtmlAttr", &CGraph::setDefaultEdgeHtmlAttr)
        .function("read", &CGraph::read)
        .function("addSubgraph", &CGraph::addSubgraph, allow_raw_pointers())
        .function("getSubgraph", &CGraph::getSubgraph, allow_raw_pointers())
        .function("removeNode", &CGraph::removeNode)
        .function("removeEdge", optional_override([](CGraph &self, const std::string &tail, const std::string &head)
                                                  { self.removeEdge(tail, head); }))
        .function("removeEdge", &CGraph::removeEdge)
        .function("removeSubgraph", &CGraph::removeSubgraph)
        .function("hasNode", &CGraph::hasNode)
        .function("hasEdge", optional_override([](CGraph &self, const std::string &tail, const std::string &head)
                                               { return self.hasEdge(tail, head); }))
        .function("hasEdge", &CGraph::hasEdge)
        .function("hasSubgraph", &CGraph::hasSubgraph)
        .function("nodeCount", &CGraph::nodeCount)
        .function("edgeCount", &CGraph::edgeCount)
        .function("subgraphCount", &CGraph::subgraphCount)
        .function("nodeDegree", optional_override([](CGraph &self, const std::string &node)
                                                  { return self.nodeDegree(node); }))
        .function("nodeDegree", optional_override([](CGraph &self, const std::string &node, int in)
                                                  { return self.nodeDegree(node, in); }))
        .function("nodeDegree", &CGraph::nodeDegree)
        .function("getGraphAttr", &CGraph::getGraphAttr)
        .function("getNodeAttr", &CGraph::getNodeAttr)
        .function("getEdgeAttr", &CGraph::getEdgeAttr)
        .function("nodeNames", &CGraph::nodeNames)
        .function("subgraphNames", &CGraph::subgraphNames)
        .function("edges", &CGraph::edges)
        .function("outEdges", &CGraph::outEdges)
        .function("inEdges", &CGraph::inEdges)
        .function("nodeEdges", &CGraph::nodeEdges)
        .property("dot_out", &CGraph::_dot_out)
        .function("write", &CGraph::toDot)
        .function("toDot", &CGraph::toDot)
        .property("layout_result", &CGraph::layout_result)
        .function("layout", &CGraph::layout);

    class_<CSubgraph>("CSubgraph")
        // No constructor — instances are only created via CGraph::addSubgraph.
        .function("addNode", &CSubgraph::addNode)
        .function("addEdge", optional_override([](CSubgraph &self, const std::string &tail, const std::string &head)
                                               { self.addEdge(tail, head); }))
        .function("addEdge", &CSubgraph::addEdge)
        .function("addSubgraph", &CSubgraph::addSubgraph, allow_raw_pointers())
        .function("setAttr", optional_override([](CSubgraph &self, const std::string &attr, const std::string &value)
                                               { self.setAttr(attr, value); }))
        .function("setAttr", optional_override([](CSubgraph &self, const std::string &attr, const std::string &value, const std::string &defaultValue)
                                               { self.setAttr(attr, value, defaultValue); }))
        .function("setHtmlAttr", optional_override([](CSubgraph &self, const std::string &attr, const std::string &value)
                                                   { self.setHtmlAttr(attr, value); }))
        .function("setHtmlAttr", optional_override([](CSubgraph &self, const std::string &attr, const std::string &value, const std::string &defaultValue)
                                                   { self.setHtmlAttr(attr, value, defaultValue); }))
        .function("setNodeAttr", optional_override([](CSubgraph &self, const std::string &node, const std::string &attr, const std::string &value)
                                                   { self.setNodeAttr(node, attr, value); }))
        .function("setNodeAttr", optional_override([](CSubgraph &self, const std::string &node, const std::string &attr, const std::string &value, const std::string &defaultValue)
                                                   { self.setNodeAttr(node, attr, value, defaultValue); }))
        .function("setNodeHtmlAttr", optional_override([](CSubgraph &self, const std::string &node, const std::string &attr, const std::string &value)
                                                       { self.setNodeHtmlAttr(node, attr, value); }))
        .function("setNodeHtmlAttr", optional_override([](CSubgraph &self, const std::string &node, const std::string &attr, const std::string &value, const std::string &defaultValue)
                                                       { self.setNodeHtmlAttr(node, attr, value, defaultValue); }))
        .function("setEdgeAttr", optional_override([](CSubgraph &self, const std::string &tail, const std::string &head, const std::string &key, const std::string &attr, const std::string &value)
                                                   { self.setEdgeAttr(tail, head, key, attr, value); }))
        .function("setEdgeAttr", optional_override([](CSubgraph &self, const std::string &tail, const std::string &head, const std::string &key, const std::string &attr, const std::string &value, const std::string &defaultValue)
                                                   { self.setEdgeAttr(tail, head, key, attr, value, defaultValue); }))
        .function("setEdgeHtmlAttr", optional_override([](CSubgraph &self, const std::string &tail, const std::string &head, const std::string &key, const std::string &attr, const std::string &value)
                                                       { self.setEdgeHtmlAttr(tail, head, key, attr, value); }))
        .function("setEdgeHtmlAttr", optional_override([](CSubgraph &self, const std::string &tail, const std::string &head, const std::string &key, const std::string &attr, const std::string &value, const std::string &defaultValue)
                                                       { self.setEdgeHtmlAttr(tail, head, key, attr, value, defaultValue); }))
        .function("setDefaultAttr", &CSubgraph::setDefaultAttr)
        .function("setDefaultHtmlAttr", &CSubgraph::setDefaultHtmlAttr)
        .function("setDefaultNodeAttr", &CSubgraph::setDefaultNodeAttr)
        .function("setDefaultNodeHtmlAttr", &CSubgraph::setDefaultNodeHtmlAttr)
        .function("setDefaultEdgeAttr", &CSubgraph::setDefaultEdgeAttr)
        .function("setDefaultEdgeHtmlAttr", &CSubgraph::setDefaultEdgeHtmlAttr)
        .function("removeNode", &CSubgraph::removeNode)
        .function("removeEdge", optional_override([](CSubgraph &self, const std::string &tail, const std::string &head)
                                                  { self.removeEdge(tail, head); }))
        .function("removeEdge", &CSubgraph::removeEdge)
        .function("hasNode", &CSubgraph::hasNode)
        .function("hasEdge", optional_override([](CSubgraph &self, const std::string &tail, const std::string &head)
                                               { return self.hasEdge(tail, head); }))
        .function("hasEdge", &CSubgraph::hasEdge)
        .function("nodeCount", &CSubgraph::nodeCount)
        .function("edgeCount", &CSubgraph::edgeCount)
        .function("nodeDegree", optional_override([](CSubgraph &self, const std::string &node)
                                                  { return self.nodeDegree(node); }))
        .function("nodeDegree", optional_override([](CSubgraph &self, const std::string &node, int in)
                                                  { return self.nodeDegree(node, in); }))
        .function("nodeDegree", &CSubgraph::nodeDegree)
        .function("getAttr", &CSubgraph::getAttr)
        .function("getNodeAttr", &CSubgraph::getNodeAttr)
        .function("getEdgeAttr", &CSubgraph::getEdgeAttr)
        .function("nodeNames", &CSubgraph::nodeNames)
        .function("edges", &CSubgraph::edges)
        .function("outEdges", &CSubgraph::outEdges)
        .function("inEdges", &CSubgraph::inEdges)
        .function("nodeEdges", &CSubgraph::nodeEdges);
}
