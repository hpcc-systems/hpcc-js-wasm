//  See: https://github.com/ggerganov/llama.cpp/blob/master/examples/embedding/embedding.cpp  ---
#include "common.h"
#include "log.h"
#include "llama.h"

#include <ctime>

#if defined(_MSC_VER)
#pragma warning(disable : 4244 4267) // possible loss of data
#endif

namespace embedding
{

    // These are declared as extern in llama.cpp's common headers but are not always
    // provided as compiled sources in this repo's WASM build. Provide safe defaults.
    int LLAMA_BUILD_NUMBER = 0;
    const char *LLAMA_COMMIT = "unknown";
    const char *LLAMA_COMPILER = "unknown";
    const char *LLAMA_BUILD_TARGET = "unknown";

    static void print_usage(const char *argv0)
    {
        fprintf(stderr, "\nexample usage:\n");
        fprintf(stderr, "  %s -m model.gguf -p \"hello\" --pooling mean --embd-output-format array\n\n", argv0);
    }

    static bool parse_args(int argc, char **argv, common_params &params)
    {
        for (int i = 1; i < argc; ++i)
        {
            const std::string arg = argv[i];

            auto require_value = [&](const char *name) -> std::string
            {
                if (i + 1 >= argc)
                {
                    fprintf(stderr, "%s: missing value for %s\n", argv[0], name);
                    return {};
                }
                return std::string(argv[++i]);
            };

            if (arg == "-m" || arg == "--model")
            {
                const auto v = require_value(arg.c_str());
                if (v.empty())
                    return false;
                params.model.path = v;
            }
            else if (arg == "-p" || arg == "--prompt")
            {
                const auto v = require_value(arg.c_str());
                if (v.empty())
                    return false;
                params.prompt = v;
            }
            else if (arg == "--pooling")
            {
                const auto v = require_value("--pooling");
                if (v.empty())
                    return false;
                if (v == "none")
                {
                    params.pooling_type = LLAMA_POOLING_TYPE_NONE;
                }
                else if (v == "mean")
                {
                    params.pooling_type = LLAMA_POOLING_TYPE_MEAN;
                }
                else if (v == "cls")
                {
                    params.pooling_type = LLAMA_POOLING_TYPE_CLS;
                }
                else if (v == "last")
                {
                    params.pooling_type = LLAMA_POOLING_TYPE_LAST;
                }
                else
                {
                    fprintf(stderr, "%s: unsupported pooling type: %s\n", argv[0], v.c_str());
                    return false;
                }
            }
            else if (arg == "--embd-output-format")
            {
                const auto v = require_value("--embd-output-format");
                if (v.empty())
                    return false;
                params.embd_out = v;
            }
            else if (arg == "--embd-separator")
            {
                const auto v = require_value("--embd-separator");
                if (v.empty())
                    return false;
                params.embd_sep = v;
            }
            else if (arg == "--log-disable")
            {
                // Disable llama.cpp/common logging so stdout contains only JSON output.
                common_log_pause(common_log_main());
            }
            else if (arg == "-h" || arg == "--help")
            {
                print_usage(argv[0]);
                return false;
            }
            else
            {
                // ignore unknown args for forward compatibility
            }
        }

        if (params.model.path.empty())
        {
            fprintf(stderr, "%s: missing model path (-m)\n", argv[0]);
            return false;
        }

        return true;
    }

    static std::vector<std::string> split_lines(const std::string &s, const std::string &separator = "\n")
    {
        std::vector<std::string> lines;
        size_t start = 0;
        size_t end = s.find(separator);

        while (end != std::string::npos)
        {
            lines.push_back(s.substr(start, end - start));
            start = end + separator.length();
            end = s.find(separator, start);
        }

        lines.push_back(s.substr(start)); // Add the last part

        return lines;
    }

    static void batch_add_seq(llama_batch &batch, const std::vector<int32_t> &tokens, llama_seq_id seq_id)
    {
        size_t n_tokens = tokens.size();
        for (size_t i = 0; i < n_tokens; i++)
        {
            common_batch_add(batch, tokens[i], i, {seq_id}, true);
        }
    }

    static void batch_decode(llama_context *ctx, llama_batch &batch, float *output, int n_seq, int n_embd, int embd_norm)
    {
        const enum llama_pooling_type pooling_type = llama_pooling_type(ctx);
        const struct llama_model *model = llama_get_model(ctx);

        // clear previous memory values (irrelevant for embeddings)
        llama_memory_clear(llama_get_memory(ctx), /*data*/ true);

        // run model
        fprintf(stderr, "%s: n_tokens = %d, n_seq = %d\n", __func__, batch.n_tokens, n_seq);
        if (llama_model_has_encoder(model) && !llama_model_has_decoder(model))
        {
            // encoder-only model
            if (llama_encode(ctx, batch) < 0)
            {
                fprintf(stderr, "%s : failed to encode\n", __func__);
            }
        }
        else if (!llama_model_has_encoder(model) && llama_model_has_decoder(model))
        {
            // decoder-only model
            if (llama_decode(ctx, batch) < 0)
            {
                fprintf(stderr, "%s : failed to decode\n", __func__);
            }
        }

        for (int i = 0; i < batch.n_tokens; i++)
        {
            if (!batch.logits[i])
            {
                continue;
            }

            const float *embd = nullptr;
            int embd_pos = 0;

            if (pooling_type == LLAMA_POOLING_TYPE_NONE)
            {
                // try to get token embeddings
                embd = llama_get_embeddings_ith(ctx, i);
                embd_pos = i;
                GGML_ASSERT(embd != NULL && "failed to get token embeddings");
            }
            else
            {
                // try to get sequence embeddings - supported only when pooling_type is not NONE
                embd = llama_get_embeddings_seq(ctx, batch.seq_id[i][0]);
                embd_pos = batch.seq_id[i][0];
                GGML_ASSERT(embd != NULL && "failed to get sequence embeddings");
            }

            float *out = output + embd_pos * n_embd;
            common_embd_normalize(embd, out, n_embd, embd_norm);
        }
    }

    int main(int argc, char **argv)
    {
        common_params params;

        if (!parse_args(argc, argv, params))
        {
            return 1;
        }

        params.embedding = true;

        // WASM builds typically run without cross-origin isolation (browser) and/or with limited
        // worker thread availability (Node/test runners). Force single-threaded execution to
        // avoid ggml threadpool creation failures ("thread constructor failed").
        params.cpuparams.n_threads = 1;
        params.cpuparams_batch.n_threads = 1;

        // llama.cpp requires n_batch <= n_ctx. For many embedding models n_ctx defaults to the
        // training context (often 512), while common_params defaults n_batch to 2048.
        // Clamp to a conservative value to avoid runtime traps inside llama.cpp.
        if (params.n_batch > 512)
        {
            params.n_batch = 512;
        }
        // For non-causal models, batch size must be equal to ubatch size
        params.n_ubatch = params.n_batch;

        if (params.embd_out.empty())
        {
            params.embd_out = "array";
        }

        llama_backend_init();
        llama_numa_init(params.numa);

        // load the model
        auto init = common_init_from_params(params);

        llama_model *model = init.model.get();
        llama_context *ctx = init.context.get();
        if (model == NULL)
        {
            fprintf(stderr, "%s: error: unable to load model\n", __func__);
            return 1;
        }

        const int n_ctx = llama_n_ctx(ctx);

        const enum llama_pooling_type pooling_type = llama_pooling_type(ctx);

        if (llama_model_has_encoder(model) && llama_model_has_decoder(model))
        {
            fprintf(stderr, "%s: error: computing embeddings in encoder-decoder models is not supported\n", __func__);
            return 1;
        }

        // split the prompt into lines
        std::vector<std::string> prompts = split_lines(params.prompt, params.embd_sep);

        // max batch size (cannot exceed the context window)
        const uint64_t n_batch = std::min<uint64_t>(params.n_batch, (uint64_t)n_ctx);
        GGML_ASSERT(n_batch > 0);

        // tokenize the prompts and trim
        std::vector<std::vector<int32_t>> inputs;
        for (const auto &prompt : prompts)
        {
            auto inp = common_tokenize(ctx, prompt, true, false);
            if (inp.size() > n_batch)
            {
                fprintf(stderr, "%s: error: number of tokens in input line (%lld) exceeds batch size (%lld), increase batch size and re-run\n",
                        __func__, (long long int)inp.size(), (long long int)n_batch);
                return 1;
            }
            inputs.push_back(inp);
        }

        // check if the last token is SEP
        // it should be automatically added by the tokenizer when 'tokenizer.ggml.add_eos_token' is set to 'true'
        const llama_vocab *vocab = llama_model_get_vocab(model);
        for (auto &inp : inputs)
        {
            if (inp.empty() || inp.back() != llama_vocab_sep(vocab))
            {
                fprintf(stderr, "%s: warning: last token in the prompt is not SEP\n", __func__);
                fprintf(stderr, "%s:          'tokenizer.ggml.add_eos_token' should be set to 'true' in the GGUF header\n", __func__);
            }
        }

        // tokenization stats
        if (params.verbose_prompt)
        {
            for (int i = 0; i < (int)inputs.size(); i++)
            {
                fprintf(stderr, "%s: prompt %d: '%s'\n", __func__, i, prompts[i].c_str());
                fprintf(stderr, "%s: number of tokens in prompt = %zu\n", __func__, inputs[i].size());
                for (int j = 0; j < (int)inputs[i].size(); j++)
                {
                    fprintf(stderr, "%6d -> '%s'\n", inputs[i][j], common_token_to_piece(ctx, inputs[i][j]).c_str());
                }
                fprintf(stderr, "\n\n");
            }
        }

        // initialize batch
        const int n_prompts = prompts.size();
        struct llama_batch batch = llama_batch_init(n_batch, 0, 1);

        // count number of embeddings
        int n_embd_count = 0;
        if (pooling_type == LLAMA_POOLING_TYPE_NONE)
        {
            for (int k = 0; k < n_prompts; k++)
            {
                n_embd_count += inputs[k].size();
            }
        }
        else
        {
            n_embd_count = n_prompts;
        }

        // allocate output
        const int n_embd = llama_model_n_embd(model);
        std::vector<float> embeddings(n_embd_count * n_embd, 0);
        float *emb = embeddings.data();

        // break into batches
        int e = 0; // number of embeddings already stored
        int s = 0; // number of prompts in current batch
        for (int k = 0; k < n_prompts; k++)
        {
            // clamp to n_batch tokens
            auto &inp = inputs[k];

            const uint64_t n_toks = inp.size();

            // encode if at capacity
            if (batch.n_tokens + n_toks > n_batch)
            {
                float *out = emb + e * n_embd;
                batch_decode(ctx, batch, out, s, n_embd, params.embd_normalize);
                e += pooling_type == LLAMA_POOLING_TYPE_NONE ? batch.n_tokens : s;
                s = 0;
                common_batch_clear(batch);
            }

            // add to batch
            batch_add_seq(batch, inp, s);
            s += 1;
        }

        // final batch
        float *out = emb + e * n_embd;
        batch_decode(ctx, batch, out, s, n_embd, params.embd_normalize);

        if (params.embd_out.empty())
        {
            fprintf(stdout, "\n");

            if (pooling_type == LLAMA_POOLING_TYPE_NONE)
            {
                for (int j = 0; j < n_embd_count; j++)
                {
                    fprintf(stdout, "embedding %d: ", j);
                    for (int i = 0; i < std::min(3, n_embd); i++)
                    {
                        if (params.embd_normalize == 0)
                        {
                            fprintf(stdout, "%6.0f ", emb[j * n_embd + i]);
                        }
                        else
                        {
                            fprintf(stdout, "%9.6f ", emb[j * n_embd + i]);
                        }
                    }
                    fprintf(stdout, " ... ");
                    for (int i = n_embd - 3; i < n_embd; i++)
                    {
                        if (params.embd_normalize == 0)
                        {
                            fprintf(stdout, "%6.0f ", emb[j * n_embd + i]);
                        }
                        else
                        {
                            fprintf(stdout, "%9.6f ", emb[j * n_embd + i]);
                        }
                    }
                    fprintf(stdout, "\n");
                }
            }
            else
            {
                // print the first part of the embeddings or for a single prompt, the full embedding
                for (int j = 0; j < n_prompts; j++)
                {
                    fprintf(stdout, "embedding %d: ", j);
                    for (int i = 0; i < (n_prompts > 1 ? std::min(16, n_embd) : n_embd); i++)
                    {
                        if (params.embd_normalize == 0)
                        {
                            fprintf(stdout, "%6.0f ", emb[j * n_embd + i]);
                        }
                        else
                        {
                            fprintf(stdout, "%9.6f ", emb[j * n_embd + i]);
                        }
                    }
                    fprintf(stdout, "\n");
                }

                // print cosine similarity matrix
                if (n_prompts > 1)
                {
                    fprintf(stdout, "\n");
                    printf("cosine similarity matrix:\n\n");
                    for (int i = 0; i < n_prompts; i++)
                    {
                        fprintf(stdout, "%6.6s ", prompts[i].c_str());
                    }
                    fprintf(stdout, "\n");
                    for (int i = 0; i < n_prompts; i++)
                    {
                        for (int j = 0; j < n_prompts; j++)
                        {
                            float sim = common_embd_similarity_cos(emb + i * n_embd, emb + j * n_embd, n_embd);
                            fprintf(stdout, "%6.2f ", sim);
                        }
                        fprintf(stdout, "%1.10s", prompts[i].c_str());
                        fprintf(stdout, "\n");
                    }
                }
            }
        }

        if (params.embd_out == "json" || params.embd_out == "json+" || params.embd_out == "array")
        {
            const bool notArray = params.embd_out != "array";

            fprintf(stdout, notArray ? "{\n  \"object\": \"list\",\n  \"data\": [\n" : "[");
            for (int j = 0;;)
            { // at least one iteration (one prompt)
                if (notArray)
                    fprintf(stdout, "    {\n      \"object\": \"embedding\",\n      \"index\": %d,\n      \"embedding\": ", j);
                fprintf(stdout, "[");
                for (int i = 0;;)
                { // at least one iteration (n_embd > 0)
                    fprintf(stdout, params.embd_normalize == 0 ? "%1.0f" : "%1.7f", emb[j * n_embd + i]);
                    i++;
                    if (i < n_embd)
                        fprintf(stdout, ",");
                    else
                        break;
                }
                fprintf(stdout, notArray ? "]\n    }" : "]");
                j++;
                if (j < n_embd_count)
                    fprintf(stdout, notArray ? ",\n" : ",");
                else
                    break;
            }
            fprintf(stdout, notArray ? "\n  ]" : "]\n");

            if (params.embd_out == "json+" && n_prompts > 1)
            {
                fprintf(stdout, ",\n  \"cosineSimilarity\": [\n");
                for (int i = 0;;)
                { // at least two iteration (n_embd_count > 1)
                    fprintf(stdout, "    [");
                    for (int j = 0;;)
                    { // at least two iteration (n_embd_count > 1)
                        float sim = common_embd_similarity_cos(emb + i * n_embd, emb + j * n_embd, n_embd);
                        fprintf(stdout, "%6.2f", sim);
                        j++;
                        if (j < n_embd_count)
                            fprintf(stdout, ", ");
                        else
                            break;
                    }
                    fprintf(stdout, " ]");
                    i++;
                    if (i < n_embd_count)
                        fprintf(stdout, ",\n");
                    else
                        break;
                }
                fprintf(stdout, "\n  ]");
            }

            if (notArray)
                fprintf(stdout, "\n}\n");
        }

        // clean up
        llama_batch_free(batch);

        // common_init_result's unique_ptrs handle cleanup automatically
        llama_backend_free();

        return 0;
    }
}
//  ---  EMSCRIPTEN BINDINGS  ---  EMSCRIPTEN BINDINGS  ---  EMSCRIPTEN BINDINGS  ---  EMSCRIPTEN BINDINGS  ---

#include "util.hpp"
int embeddingMain(const std::vector<std::string> &args, std::vector<std::string> &retVal)
{
    // Always attempt to return [stdout, stderr] in retVal.
    // If something goes wrong before we can redirect, populate retVal directly.
    try
    {
        ArgBuffer argBuffer(args);
        int ret = 0;
        {
            OutErrRedirect outerr;
            try
            {
                ret = embedding::main(argBuffer.argc, argBuffer.argv);
            }
            catch (const std::exception &e)
            {
                fprintf(stderr, "embedding: exception: %s\n", e.what());
                ret = 1;
            }
            catch (...)
            {
                fprintf(stderr, "embedding: unknown exception\n");
                ret = 1;
            }
        }

        readOutFile(retVal);
        readErrorFile(retVal);
        return ret;
    }
    catch (const std::exception &e)
    {
        retVal.push_back("");
        retVal.push_back(std::string("embeddingMain: exception: ") + e.what());
        return 1;
    }
    catch (...)
    {
        retVal.push_back("");
        retVal.push_back("embeddingMain: unknown exception");
        return 1;
    }
}

#include <emscripten/bind.h>
EMSCRIPTEN_BINDINGS(llama_embedding)
{
    emscripten::register_vector<std::string>("VectorString");
    emscripten::function("embedding", &embeddingMain);
}
