#include <string>

class Graphviz
{
private:
    std::string m_result;

public:
    static const char *version();
    static const char *lastError();

    Graphviz(int yInvert = 0, int nop = 0);
    ~Graphviz();

    void createFile(const char *path, const char *data);
    const char *lastResult();
    const char *layout(const char *dot, const char *format, const char *engine);
};
