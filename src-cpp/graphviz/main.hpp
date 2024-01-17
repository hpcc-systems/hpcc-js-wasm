#include "util.hpp"

class Graphviz
{
public:
    static const char *version();
    static const char *lastError();

    Graphviz(int yInvert = 0, int nop = 0);
    ~Graphviz();

    void createFile(const char *path, const char *data);

    StringBuffer layout_result;
    const char *layout(const char *dot, const char *format, const char *engine);

    StringBuffer acyclic_outFile;
    size_t acyclic_num_rev;
    bool acyclic(const char *dot, bool doWrite = false, bool verbose = false);

    StringBuffer tred_out;
    StringBuffer tred_err;
    void tred(const char *dot, bool verbose = false, bool printRemovedEdges = false);

    StringBuffer unflatten_out;
    const char *unflatten(const char *dot, int maxMinlen = 0, bool do_fans = false, int chainLimit = 0);
};
