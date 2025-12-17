#include "util.hpp"

#include <string>

class Graphviz
{
public:
    static std::string version();
    static std::string lastError();

    Graphviz(int yInvert = 0, int nop = 0);
    ~Graphviz();

    void createFile(const std::string &path, const std::string &data);

    std::string layout_result;
    std::string layout(const std::string &dot, const std::string &format, const std::string &engine);

    std::string acyclic_outFile;
    size_t acyclic_num_rev;
    bool acyclic(const std::string &dot, bool doWrite = false, bool verbose = false);

    std::string tred_out;
    std::string tred_err;
    void tred(const std::string &dot, bool verbose = false, bool printRemovedEdges = false);

    std::string unflatten_out;
    std::string unflatten(const std::string &dot, int maxMinlen = 0, bool do_fans = false, int chainLimit = 0);
};
