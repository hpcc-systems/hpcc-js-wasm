#include "main.hpp"

#include <gvc.h>

extern gvplugin_library_t gvplugin_core_LTX_library;
extern gvplugin_library_t gvplugin_dot_layout_LTX_library;
extern gvplugin_library_t gvplugin_neato_layout_LTX_library;

char *errorMessage = NULL;

int vizErrorf(char *buf)
{
    errorMessage = buf;
    return 0;
}

char *vizLastErrorMessage()
{
    return errorMessage;
}

const char *Main::layout(const char *src, const char *format, const char *engine)
{
    errorMessage = NULL;
    char *result = NULL;
    GVC_t *context;
    Agraph_t *graph;
    unsigned int length;

    context = gvContext();
    gvAddLibrary(context, &gvplugin_core_LTX_library);
    gvAddLibrary(context, &gvplugin_dot_layout_LTX_library);
    gvAddLibrary(context, &gvplugin_neato_layout_LTX_library);

    agseterr(AGERR);
    agseterrf(vizErrorf);

    agreadline(1);

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

const char *Main::lastError()
{
    return errorMessage;
}

//  Patch for invalid osage function  ---
//  https://gitlab.com/graphviz/graphviz/issues/1544
#include "types.h"
#include "SparseMatrix.h"
extern "C"
{
    void remove_overlap(int dim, SparseMatrix A, double *x, double *label_sizes, int ntry, double initial_scaling, int edge_labeling_scheme, int n_constr_nodes, int *constr_nodes, SparseMatrix A_constr, int do_shrinking, int *flag)
    {
        static int once;

        if (once == 0)
        {
            once = 1;
            agerr(AGERR, "remove_overlap: Graphviz not built with triangulation library\n");
        }
    }
}

//  Include JS Glue  ---
#include "main_glue.cpp"
