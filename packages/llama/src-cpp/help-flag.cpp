// Global flag to track if help/completion was printed successfully
static bool g_help_was_printed = false;

extern "C"
{
    void set_help_was_printed(bool value)
    {
        g_help_was_printed = value;
    }

    bool get_help_was_printed()
    {
        return g_help_was_printed;
    }

    void reset_help_was_printed()
    {
        g_help_was_printed = false;
    }
}
