class Graphviz
{
protected:
public:
    static const char *version();
    static const char *lastError();

    Graphviz(bool yInvert = false, int nop = 0);
    ~Graphviz();
    const char *layout(const char *dot, const char *format, const char *engine);
    void createFile(const char *path, const char *data);
};
