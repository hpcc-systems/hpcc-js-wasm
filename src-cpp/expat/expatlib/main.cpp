#include "stack_parser.h"

#include <string>
#include <expat.h>

class CExpat : public CExpatImpl<CExpat>
{
private:
    typedef CExpatImpl<CExpat> BaseClass;

protected:
    std::string m_tag;
    std::string m_attrs;
    std::string m_content;

public:
    static const char *version()
    {
        return XML_ExpatVersion();
    }

    CExpat()
    {
    }

    void OnPostCreate()
    {
        EnableStartElementHandler();
        EnableEndElementHandler();
        EnableCharacterDataHandler();
    }

    bool create()
    {
        return BaseClass::Create();
    }

    void destroy()
    {
        BaseClass::Destroy();
    }

    bool parse(const char *xml)
    {
        return BaseClass::Parse(xml, (int)strlen(xml), XML_TRUE);
    }

    const char *tag() const
    {
        return m_tag.c_str();
    }

    const char *attrs() const
    {
        return m_attrs.c_str();
    }

    const char *content() const
    {
        return m_content.c_str();
    }

    virtual void startElement()
    {
    }

    virtual void endElement()
    {
    }

    virtual void characterData()
    {
    }

    virtual void OnStartElement(const XML_Char *pszName, const XML_Char **papszAttrs)
    {
        m_tag = pszName;
        m_attrs = "";
        for (XML_Char **itr = (XML_Char **)papszAttrs; *itr != NULL; itr += 2)
        {
            if (!m_attrs.empty())
            {
                m_attrs += "\1\1";
            }
            m_attrs += *itr;
            m_attrs += "\1";
            m_attrs += *(itr + 1);
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

//  Include JS Glue  ---
#include "main_glue.cpp"
