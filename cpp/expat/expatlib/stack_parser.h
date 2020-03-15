#include <string>
#include <map>
#include <stack>
#include <vector>
#include <expat.h>
#include <emscripten.h>

typedef std::map<std::string, std::string> ciStringStringMap;

template <class _T>
class CExpatImpl
{
public:
    CExpatImpl()
    {
        m_p = NULL;
    }

    ~CExpatImpl()
    {
        Destroy();
    }

public:
    bool Create(const XML_Char *pszEncoding = NULL, const XML_Char *pszSep = NULL)
    {
        Destroy();

        if (pszEncoding != NULL && pszEncoding[0] == 0)
            pszEncoding = NULL;
        if (pszSep != NULL && pszSep[0] == 0)
            pszSep = NULL;

        m_p = XML_ParserCreate_MM(pszEncoding, NULL, pszSep);
        if (m_p == NULL)
            return false;

        _T *pThis = static_cast<_T *>(this);
        pThis->OnPostCreate();

        XML_SetUserData(m_p, (void *)this);
        return true;
    }

    void Destroy()
    {
        if (m_p != NULL)
            XML_ParserFree(m_p);
        m_p = NULL;
    }

    bool Parse(const char *pszBuffer, int nLength = -1, bool fIsFinal = true)
    {
        assert(m_p != NULL);

        if (nLength < 0)
            nLength = strlen(pszBuffer) * sizeof(char);

        return XML_Parse(m_p, (const char *)pszBuffer, nLength, fIsFinal) != 0;
    }

    bool ParseBuffer(int nLength, bool fIsFinal = true)
    {
        assert(m_p != NULL);
        return XML_ParseBuffer(m_p, nLength, fIsFinal) != 0;
    }

    void *GetBuffer(int nLength)
    {
        assert(m_p != NULL);
        return XML_GetBuffer(m_p, nLength);
    }

    void EnableStartElementHandler(bool fEnable = true)
    {
        assert(m_p != NULL);
        XML_SetStartElementHandler(m_p, fEnable ? StartElementHandler : NULL);
    }

    void EnableEndElementHandler(bool fEnable = true)
    {
        assert(m_p != NULL);
        XML_SetEndElementHandler(m_p, fEnable ? EndElementHandler : NULL);
    }

    void EnableElementHandler(bool fEnable = true)
    {
        assert(m_p != NULL);
        EnableStartElementHandler(fEnable);
        EnableEndElementHandler(fEnable);
    }

    void EnableCharacterDataHandler(bool fEnable = true)
    {
        assert(m_p != NULL);
        XML_SetCharacterDataHandler(m_p, fEnable ? CharacterDataHandler : NULL);
    }

    void EnableProcessingInstructionHandler(bool fEnable = true)
    {
        assert(m_p != NULL);
        XML_SetProcessingInstructionHandler(m_p, fEnable ? ProcessingInstructionHandler : NULL);
    }

    void EnableCommentHandler(bool fEnable = true)
    {
        assert(m_p != NULL);
        XML_SetCommentHandler(m_p, fEnable ? CommentHandler : NULL);
    }

    void EnableStartCdataSectionHandler(bool fEnable = true)
    {
        assert(m_p != NULL);
        XML_SetStartCdataSectionHandler(m_p,
                                        fEnable ? StartCdataSectionHandler : NULL);
    }

    void EnableEndCdataSectionHandler(bool fEnable = true)
    {
        assert(m_p != NULL);
        XML_SetEndCdataSectionHandler(m_p,
                                      fEnable ? EndCdataSectionHandler : NULL);
    }

    void EnableCdataSectionHandler(bool fEnable = true)
    {
        assert(m_p != NULL);
        EnableStartCdataSectionHandler(fEnable);
        EnableEndCdataSectionHandler(fEnable);
    }

    void EnableDefaultHandler(bool fEnable = true, bool fExpand = true)
    {
        assert(m_p != NULL);
        if (fExpand)
        {
            XML_SetDefaultHandlerExpand(m_p, fEnable ? DefaultHandler : NULL);
        }
        else
            XML_SetDefaultHandler(m_p, fEnable ? DefaultHandler : NULL);
    }

    // void EnableExternalEntityRefHandler(bool fEnable = true)
    // {
    // 	assert(m_p != NULL);
    // 	XML_SetExternalEntityRefHandler(m_p, fEnable ? ExternalEntityRefHandler : NULL);
    // }

    void EnableUnknownEncodingHandler(bool fEnable = true)
    {
        assert(m_p != NULL);
        XML_SetUnknownEncodingHandler(m_p, fEnable ? UnknownEncodingHandler : NULL, 0);
    }

    void EnableStartNamespaceDeclHandler(bool fEnable = true)
    {
        assert(m_p != NULL);
        XML_SetStartNamespaceDeclHandler(m_p, fEnable ? StartNamespaceDeclHandler : NULL);
    }

    void EnableEndNamespaceDeclHandler(bool fEnable = true)
    {
        assert(m_p != NULL);
        XML_SetEndNamespaceDeclHandler(m_p, fEnable ? EndNamespaceDeclHandler : NULL);
    }

    void EnableNamespaceDeclHandler(bool fEnable = true)
    {
        EnableStartNamespaceDeclHandler(fEnable);
        EnableEndNamespaceDeclHandler(fEnable);
    }

    void EnableXmlDeclHandler(bool fEnable = true)
    {
        assert(m_p != NULL);
        XML_SetXmlDeclHandler(m_p, fEnable ? XmlDeclHandler : NULL);
    }

    void EnableStartDoctypeDeclHandler(bool fEnable = true)
    {
        assert(m_p != NULL);
        XML_SetStartDoctypeDeclHandler(m_p, fEnable ? StartDoctypeDeclHandler : NULL);
    }

    void EnableEndDoctypeDeclHandler(bool fEnable = true)
    {
        assert(m_p != NULL);
        XML_SetEndDoctypeDeclHandler(m_p, fEnable ? EndDoctypeDeclHandler : NULL);
    }

    void EnableDoctypeDeclHandler(bool fEnable = true)
    {
        assert(m_p != NULL);
        EnableStartDoctypeDeclHandler(fEnable);
        EnableEndDoctypeDeclHandler(fEnable);
    }

    enum XML_Error GetErrorCode()
    {
        assert(m_p != NULL);
        return XML_GetErrorCode(m_p);
    }

    long GetCurrentByteIndex()
    {
        assert(m_p != NULL);
        return XML_GetCurrentByteIndex(m_p);
    }

    int GetCurrentLineNumber()
    {
        assert(m_p != NULL);
        return XML_GetCurrentLineNumber(m_p);
    }

    int GetCurrentColumnNumber()
    {
        assert(m_p != NULL);
        return XML_GetCurrentColumnNumber(m_p);
    }

    int GetCurrentByteCount()
    {
        assert(m_p != NULL);
        return XML_GetCurrentByteCount(m_p);
    }

    const char *GetInputContext(int *pnOffset, int *pnSize)
    {
        assert(m_p != NULL);
        return XML_GetInputContext(m_p, pnOffset, pnSize);
    }

    const XML_LChar *GetErrorString()
    {
        return XML_ErrorString(GetErrorCode());
    }

    static const XML_LChar *GetExpatVersion()
    {
        return XML_ExpatVersion();
    }

    /*	static void GetExpatVersion(int *pnMajor, int *pnMinor, int *pnMicro)
	{
		XML_expat_version v = XML_ExpatVersionInfo();
		if(pnMajor)
			*pnMajor = v .major;
		if(pnMinor)
			*pnMinor = v .minor;
		if(pnMicro)
			*pnMicro = v .micro;
	}*/

    static const XML_LChar *GetErrorString(enum XML_Error nError)
    {
        return XML_ErrorString(nError);
    }

    void OnStartElement(const XML_Char *pszName, const XML_Char **papszAttrs)
    {
        return;
    }

    void OnStartElement2(const XML_Char *pszName, const XML_Char *papszAttrs)
    {
        return;
    }

    void OnEndElement(const XML_Char *pszName)
    {
        return;
    }

    void OnCharacterData(const XML_Char *pszData, int nLength)
    {
        return;
    }

    void OnProcessingInstruction(const XML_Char *pszTarget, const XML_Char *pszData)
    {
        return;
    }

    void OnComment(const XML_Char *pszData)
    {
        return;
    }

    void OnStartCdataSection()
    {
        return;
    }

    void OnEndCdataSection()
    {
        return;
    }

    void OnDefault(const XML_Char *pszData, int nLength)
    {
        return;
    }

    bool OnExternalEntityRef(const XML_Char *pszContext, const XML_Char *pszBase, const XML_Char *pszSystemID, const XML_Char *pszPublicID)
    {
        return false;
    }

    bool OnUnknownEncoding(const XML_Char *pszName, XML_Encoding *pInfo)
    {
        return false;
    }

    void OnStartNamespaceDecl(const XML_Char *pszPrefix, const XML_Char *pszURI)
    {
        return;
    }

    void OnEndNamespaceDecl(const XML_Char *pszPrefix)
    {
        return;
    }

    void OnXmlDecl(const XML_Char *pszVersion, const XML_Char *pszEncoding, bool fStandalone)
    {
        return;
    }

    void OnStartDoctypeDecl(const XML_Char *pszDoctypeName, const XML_Char *pszSysID, const XML_Char *pszPubID, bool fHasInternalSubset)
    {
        return;
    }

    void OnEndDoctypeDecl()
    {
        return;
    }

protected:
    void OnPostCreate()
    {
    }

    static void XMLCALL StartElementHandler(void *pUserData, const XML_Char *pszName, const XML_Char **papszAttrs)
    {
        _T *pThis = static_cast<_T *>((CExpatImpl<_T> *)pUserData);
        pThis->OnStartElement(pszName, papszAttrs);
    }

    static void XMLCALL EndElementHandler(void *pUserData, const XML_Char *pszName)
    {
        _T *pThis = static_cast<_T *>((CExpatImpl<_T> *)pUserData);
        pThis->OnEndElement(pszName);
    }

    static void XMLCALL CharacterDataHandler(void *pUserData, const XML_Char *pszData, int nLength)
    {
        _T *pThis = static_cast<_T *>((CExpatImpl<_T> *)pUserData);
        pThis->OnCharacterData(pszData, nLength);
    }

    static void XMLCALL ProcessingInstructionHandler(void *pUserData, const XML_Char *pszTarget, const XML_Char *pszData)
    {
        _T *pThis = static_cast<_T *>((CExpatImpl<_T> *)pUserData);
        pThis->OnProcessingInstruction(pszTarget, pszData);
    }

    static void XMLCALL CommentHandler(void *pUserData, const XML_Char *pszData)
    {
        _T *pThis = static_cast<_T *>((CExpatImpl<_T> *)pUserData);
        pThis->OnComment(pszData);
    }

    static void XMLCALL StartCdataSectionHandler(void *pUserData)
    {
        _T *pThis = static_cast<_T *>((CExpatImpl<_T> *)pUserData);
        pThis->OnStartCdataSection();
    }

    static void XMLCALL EndCdataSectionHandler(void *pUserData)
    {
        _T *pThis = static_cast<_T *>((CExpatImpl<_T> *)pUserData);
        pThis->OnEndCdataSection();
    }

    static void XMLCALL DefaultHandler(void *pUserData,
                                       const XML_Char *pszData, int nLength)
    {
        _T *pThis = static_cast<_T *>((CExpatImpl<_T> *)pUserData);
        pThis->OnDefault(pszData, nLength);
    }

    static int XMLCALL ExternalEntityRefHandler(void *pUserData, const XML_Char *pszContext, const XML_Char *pszBase, const XML_Char *pszSystemID, const XML_Char *pszPublicID)
    {
        _T *pThis = static_cast<_T *>((CExpatImpl<_T> *)pUserData);
        return pThis->OnExternalEntityRef(pszContext, pszBase, pszSystemID, pszPublicID) ? 1 : 0;
    }

    static int XMLCALL UnknownEncodingHandler(void *pUserData, const XML_Char *pszName, XML_Encoding *pInfo)
    {
        _T *pThis = static_cast<_T *>((CExpatImpl<_T> *)pUserData);
        return pThis->OnUnknownEncoding(pszName, pInfo) ? 1 : 0;
    }

    static void XMLCALL StartNamespaceDeclHandler(void *pUserData,
                                                  const XML_Char *pszPrefix, const XML_Char *pszURI)
    {
        _T *pThis = static_cast<_T *>((CExpatImpl<_T> *)pUserData);
        pThis->OnStartNamespaceDecl(pszPrefix, pszURI);
    }

    static void XMLCALL EndNamespaceDeclHandler(void *pUserData, const XML_Char *pszPrefix)
    {
        _T *pThis = static_cast<_T *>((CExpatImpl<_T> *)pUserData);
        pThis->OnEndNamespaceDecl(pszPrefix);
    }

    static void XMLCALL XmlDeclHandler(void *pUserData, const XML_Char *pszVersion, const XML_Char *pszEncoding, int nStandalone)
    {
        _T *pThis = static_cast<_T *>((CExpatImpl<_T> *)pUserData);
        pThis->OnXmlDecl(pszVersion, pszEncoding, nStandalone != 0);
    }

    static void XMLCALL StartDoctypeDeclHandler(void *pUserData, const XML_Char *pszDoctypeName, const XML_Char *pszSysID, const XML_Char *pszPubID, int nHasInternalSubset)
    {
        _T *pThis = static_cast<_T *>((CExpatImpl<_T> *)pUserData);
        pThis->OnStartDoctypeDecl(pszDoctypeName, pszSysID, pszPubID, nHasInternalSubset != 0);
    }

    static void XMLCALL EndDoctypeDeclHandler(void *pUserData)
    {
        _T *pThis = static_cast<_T *>((CExpatImpl<_T> *)pUserData);
        pThis->OnEndDoctypeDecl();
    }

    XML_Parser m_p;
};

const std::string emptyStr = "";

class CElement
{
protected:
    std::string m_content;

public:
    std::string m_tag;
    ciStringStringMap m_attr;

    CElement()
    {
    }

    CElement(const CElement &e) : m_tag(e.m_tag), m_content(e.m_content), m_attr(e.m_attr)
    {
    }

    CElement &operator=(const CElement &e)
    {
        m_tag = e.m_tag;
        m_content = e.m_content;
        m_attr = e.m_attr;
        return *this;
    }

    void AppendContent(const char *content, int len)
    {
        m_content.append(content, len);
    }

    const char *attrs(std::string &buff) const
    {
        for (ciStringStringMap::const_iterator itr = m_attr.begin(); itr != m_attr.end(); ++itr)
        {
            if (!buff.empty())
                buff += "||";
            buff += itr->first + "|" + itr->second;
        }
        return buff.c_str();
    }

    const char *GetContent() const
    {
        return m_content.c_str();
    }
};
typedef std::stack<CElement> CElementStack;
typedef std::vector<CElement> ElementVector;

class CStackParserCallback
{
public:
    virtual void startElement() = 0;
    virtual void endElement() = 0;
};

class CStackParser : public CExpatImpl<CStackParser>
{
    typedef CExpatImpl<CStackParser> baseClass;

protected:
    CElementStack m_stack;
    CStackParserCallback *m_callback;

public:
    CStackParser(CStackParserCallback *callback) : baseClass()
    {
        m_callback = callback;
    }

    const CElement &top() const
    {
        return m_stack.top();
    }

    void OnPostCreate()
    {
        // Enable all the event routines we want
        EnableStartElementHandler();
        EnableEndElementHandler();
        EnableCharacterDataHandler();
    }

    // Start element handler

    virtual void OnStartElement(const XML_Char *pszName, const XML_Char **papszAttrs)
    {
        CElement e;
        e.m_tag = pszName;

        for (XML_Char **itr = (XML_Char **)papszAttrs; *itr != NULL; itr += 2)
        {
            e.m_attr[*itr] = *(itr + 1);
        }

        m_stack.push(e);
        m_callback->startElement();
        return;
    }

    // End element handler

    virtual void OnEndElement(const XML_Char *pszName)
    {
        m_callback->endElement();
        m_stack.pop();
        return;
    }

    // Character data handler

    virtual void OnCharacterData(const XML_Char *pszData, int nLength)
    {
        m_stack.top().AppendContent(pszData, nLength);
        return;
    }
};
