#include "log.h"

#include <cstdarg>
#include <cstdio>
#include <cstring>
#include <mutex>

int common_log_verbosity_thold = LOG_DEFAULT_LLAMA;

struct common_log
{
    std::mutex mtx;
    FILE *file = nullptr;
    log_colors colors = LOG_COLORS_DISABLED;
    bool prefix = false;
    bool timestamps = false;
    bool running = true;
};

static FILE *stream_for_level(enum ggml_log_level level)
{
    switch (level)
    {
    case GGML_LOG_LEVEL_ERROR:
    case GGML_LOG_LEVEL_WARN:
    case GGML_LOG_LEVEL_DEBUG:
        return stderr;
    case GGML_LOG_LEVEL_INFO:
    case GGML_LOG_LEVEL_CONT:
    case GGML_LOG_LEVEL_NONE:
    default:
        return stdout;
    }
}

void common_log_set_verbosity_thold(int verbosity)
{
    common_log_verbosity_thold = verbosity;
}

struct common_log *common_log_init()
{
    return new common_log();
}

struct common_log *common_log_main()
{
    static common_log singleton;
    return &singleton;
}

void common_log_pause(struct common_log *)
{
    common_log *log = common_log_main();
    std::lock_guard<std::mutex> lock(log->mtx);
    log->running = false;
}

void common_log_resume(struct common_log *)
{
    common_log *log = common_log_main();
    std::lock_guard<std::mutex> lock(log->mtx);
    log->running = true;
}

void common_log_free(struct common_log *log)
{
    if (!log || log == common_log_main())
    {
        return;
    }
    if (log->file)
    {
        fclose(log->file);
        log->file = nullptr;
    }
    delete log;
}

static void log_vprintf(common_log *log, enum ggml_log_level level, const char *fmt, va_list args)
{
    if (log && !log->running)
    {
        return;
    }
    char buf[8192];
    int n = vsnprintf(buf, sizeof(buf), fmt, args);
    if (n < 0)
    {
        return;
    }

    FILE *out = stream_for_level(level);
    fputs(buf, out);
    fflush(out);

    if (log && log->file)
    {
        fputs(buf, log->file);
        fflush(log->file);
    }
}

void common_log_default_callback(enum ggml_log_level level, const char *text, void *user_data)
{
    (void)user_data;
    if (!text)
    {
        return;
    }

    common_log *log = common_log_main();
    {
        std::lock_guard<std::mutex> lock(log->mtx);
        if (!log->running)
        {
            return;
        }
    }

    FILE *out = stream_for_level(level);
    fputs(text, out);
    fflush(out);
    if (log && log->file)
    {
        fputs(text, log->file);
        fflush(log->file);
    }
}

void common_log_add(struct common_log *log, enum ggml_log_level level, const char *fmt, ...)
{
    if (!log || !fmt)
    {
        return;
    }

    std::lock_guard<std::mutex> lock(log->mtx);

    if (!log->running)
    {
        return;
    }

    va_list args;
    va_start(args, fmt);
    log_vprintf(log, level, fmt, args);
    va_end(args);
}

void common_log_set_file(struct common_log *log, const char *path)
{
    if (!log)
    {
        return;
    }

    std::lock_guard<std::mutex> lock(log->mtx);

    if (log->file)
    {
        fclose(log->file);
        log->file = nullptr;
    }

    if (path && path[0] != '\0')
    {
        log->file = fopen(path, "w");
    }
}

void common_log_set_colors(struct common_log *log, log_colors colors)
{
    if (!log)
    {
        return;
    }
    std::lock_guard<std::mutex> lock(log->mtx);
    log->colors = colors;
}

void common_log_set_prefix(struct common_log *log, bool prefix)
{
    if (!log)
    {
        return;
    }
    std::lock_guard<std::mutex> lock(log->mtx);
    log->prefix = prefix;
}

void common_log_set_timestamps(struct common_log *log, bool timestamps)
{
    if (!log)
    {
        return;
    }
    std::lock_guard<std::mutex> lock(log->mtx);
    log->timestamps = timestamps;
}

void common_log_flush(struct common_log *log)
{
    if (!log)
    {
        return;
    }

    std::lock_guard<std::mutex> lock(log->mtx);
    if (!log->running)
    {
        return;
    }
    fflush(stdout);
    fflush(stderr);
    if (log->file)
    {
        fflush(log->file);
    }
}
