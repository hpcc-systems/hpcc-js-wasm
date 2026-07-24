#include <NAM/dsp.h>
#include <NAM/get_dsp.h>
#include <NAM/version.h>

#include <cstdint>
#include <memory>
#include <stdexcept>
#include <string>
#include <vector>

#include <emscripten/bind.h>

class CNamModel
{
private:
    std::unique_ptr<nam::DSP> m_dsp;

public:
    CNamModel(const std::string &jsonSource, bool prewarm)
    {
        nam::DspLoadOptions options;
        options.prewarm = prewarm;
        m_dsp = nam::get_dsp(nlohmann::json::parse(jsonSource), options);
        if (!m_dsp)
        {
            throw std::runtime_error("failed to load NAM model");
        }
    }

    double expectedSampleRate() const
    {
        return m_dsp->GetExpectedSampleRate();
    }

    int inputChannels() const
    {
        return m_dsp->NumInputChannels();
    }

    int outputChannels() const
    {
        return m_dsp->NumOutputChannels();
    }

    int maxBufferSize() const
    {
        return m_dsp->GetMaxBufferSize();
    }

    int prewarmSamples()
    {
        return m_dsp->GetPrewarmSamples();
    }

    bool hasInputLevel()
    {
        return m_dsp->HasInputLevel();
    }

    bool hasOutputLevel()
    {
        return m_dsp->HasOutputLevel();
    }

    bool hasLoudness() const
    {
        return m_dsp->HasLoudness();
    }

    double inputLevel()
    {
        return m_dsp->GetInputLevel();
    }

    double outputLevel()
    {
        return m_dsp->GetOutputLevel();
    }

    double loudness() const
    {
        return m_dsp->GetLoudness();
    }

    void reset(double sampleRate, int maxBufferSize)
    {
        m_dsp->Reset(sampleRate, maxBufferSize);
    }

    void prewarm()
    {
        m_dsp->prewarm();
    }

    void process(uintptr_t inputPtr, uintptr_t outputPtr, int frames)
    {
        const int inputChannels = m_dsp->NumInputChannels();
        const int outputChannels = m_dsp->NumOutputChannels();
        const auto input = reinterpret_cast<const NAM_SAMPLE *>(inputPtr);
        auto output = reinterpret_cast<NAM_SAMPLE *>(outputPtr);

        std::vector<std::vector<NAM_SAMPLE>> inputBuffers(inputChannels, std::vector<NAM_SAMPLE>(frames));
        std::vector<std::vector<NAM_SAMPLE>> outputBuffers(outputChannels, std::vector<NAM_SAMPLE>(frames));
        std::vector<NAM_SAMPLE *> inputChannelPtrs(inputChannels);
        std::vector<NAM_SAMPLE *> outputChannelPtrs(outputChannels);

        for (int channel = 0; channel < inputChannels; ++channel)
        {
            inputChannelPtrs[channel] = inputBuffers[channel].data();
            for (int frame = 0; frame < frames; ++frame)
            {
                inputBuffers[channel][frame] = input[frame * inputChannels + channel];
            }
        }
        for (int channel = 0; channel < outputChannels; ++channel)
        {
            outputChannelPtrs[channel] = outputBuffers[channel].data();
        }

        m_dsp->process(inputChannelPtrs.data(), outputChannelPtrs.data(), frames);

        for (int frame = 0; frame < frames; ++frame)
        {
            for (int channel = 0; channel < outputChannels; ++channel)
            {
                output[frame * outputChannels + channel] = outputBuffers[channel][frame];
            }
        }
    }
};

std::string version()
{
    return std::to_string(NEURAL_AMP_MODELER_DSP_VERSION_MAJOR) + "." +
           std::to_string(NEURAL_AMP_MODELER_DSP_VERSION_MINOR) + "." +
           std::to_string(NEURAL_AMP_MODELER_DSP_VERSION_PATCH);
}

EMSCRIPTEN_BINDINGS(namcorelib_bindings)
{
    using namespace emscripten;

    function("version", &version);

    class_<CNamModel>("CNamModel")
        .constructor<const std::string &, bool>()
        .function("expectedSampleRate", &CNamModel::expectedSampleRate)
        .function("inputChannels", &CNamModel::inputChannels)
        .function("outputChannels", &CNamModel::outputChannels)
        .function("maxBufferSize", &CNamModel::maxBufferSize)
        .function("prewarmSamples", &CNamModel::prewarmSamples)
        .function("hasInputLevel", &CNamModel::hasInputLevel)
        .function("hasOutputLevel", &CNamModel::hasOutputLevel)
        .function("hasLoudness", &CNamModel::hasLoudness)
        .function("inputLevel", &CNamModel::inputLevel)
        .function("outputLevel", &CNamModel::outputLevel)
        .function("loudness", &CNamModel::loudness)
        .function("reset", &CNamModel::reset)
        .function("prewarm", &CNamModel::prewarm)
        .function("process", &CNamModel::process);
}