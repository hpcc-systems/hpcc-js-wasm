#include <string>

class Graphviz
{
protected:
    std::string m_result;

public:
    static const char *version();
    static const char *lastError();

    Graphviz(int yInvert = 0, int nop = 0);
    ~Graphviz();
    const char *layout(const char *dot, const char *format, const char *engine);
    void createFile(const char *path, const char *data);
};
