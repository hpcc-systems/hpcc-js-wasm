#include "stack_parser.h"

#include <expat.h>

#include <string>
#include <map>

#include <emscripten/val.h>

using Attributes = std::map<std::string, std::string>;

EMSCRIPTEN_DECLARE_VAL_TYPE(IParser);

class CExpatParser : public CExpatImpl<CExpatParser>
{
private:
    typedef CExpatImpl<CExpatParser> BaseClass;

protected:
    std::string m_tag;
    Attributes m_attributes;
    std::string m_content;

    IParser m_callback;

public:
    CExpatParser(IParser callback) : m_callback(callback)
    {
        BaseClass::Create();
    }

    ~CExpatParser()
    {
        BaseClass::Destroy();
    }

    void OnPostCreate()
    {
        EnableStartElementHandler();
        EnableEndElementHandler();
        EnableCharacterDataHandler();
    }

    bool parse(const std::string &xml)
    {
        return BaseClass::Parse(xml.c_str(), (int)xml.size(), XML_TRUE);
    }

    virtual void startElement()
    {
        if (!m_callback.isUndefined() && !m_callback["startElement"].isUndefined())
        {
            m_callback.call<void>("startElement", m_tag, m_attributes);
        }
    }

    virtual void endElement()
    {
        if (!m_callback.isUndefined() && !m_callback["endElement"].isUndefined())
        {
            m_callback.call<void>("endElement", m_tag);
        }
    }

    virtual void characterData()
    {
        if (!m_callback.isUndefined() && !m_callback["characterData"].isUndefined())
        {
            m_callback.call<void>("characterData", m_content);
        }
    }

    virtual void OnStartElement(const XML_Char *pszName, const XML_Char **papszAttrs)
    {
        m_tag = pszName;
        m_attributes.clear();
        for (XML_Char **itr = (XML_Char **)papszAttrs; *itr != NULL; itr += 2)
        {
            m_attributes[*itr] = *(itr + 1);
        }
        startElement();
    }

    virtual void OnEndElement(const XML_Char *pszName)
    {
        m_tag = pszName;
        endElement();
    }

    virtual void OnCharacterData(const XML_Char *pszData, int nLength)
    {
        m_content.assign(pszData, nLength);
        characterData();
    }
};

namespace CExpatGlobal
{
    std::string version()
    {
        return XML_ExpatVersion();
    }

    bool parse(const std::string &xml, IParser callback)
    {
        CExpatParser parser(callback);
        return parser.parse(xml);
    }
};

#include <emscripten/bind.h>

EMSCRIPTEN_BINDINGS(expatlib_bindings)
{
    using namespace emscripten;

    function("version", &CExpatGlobal::version);
    function("parse", &CExpatGlobal::parse);

    register_vector<std::string>("vector_string");
    register_map<std::string, std::string>("map_string_string");
    register_type<IParser>("IParser", "{startElement: (tag: string, attrs: map_string_string) => void, endElement: (tag: string) => void, characterData: (content: string) => void}");
}
