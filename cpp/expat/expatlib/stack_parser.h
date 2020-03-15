#include <expat.h>

#include <cstring>

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
        if (nLength < 0)
            nLength = strlen(pszBuffer) * sizeof(char);

        return XML_Parse(m_p, (const char *)pszBuffer, nLength, fIsFinal) != 0;
    }

    bool ParseBuffer(int nLength, bool fIsFinal = true)
    {
        return XML_ParseBuffer(m_p, nLength, fIsFinal) != 0;
    }

    void *GetBuffer(int nLength)
    {
        return XML_GetBuffer(m_p, nLength);
    }

    void EnableStartElementHandler(bool fEnable = true)
    {
        XML_SetStartElementHandler(m_p, fEnable ? StartElementHandler : NULL);
    }

    void EnableEndElementHandler(bool fEnable = true)
    {
        XML_SetEndElementHandler(m_p, fEnable ? EndElementHandler : NULL);
    }

    void EnableElementHandler(bool fEnable = true)
    {
        EnableStartElementHandler(fEnable);
        EnableEndElementHandler(fEnable);
    }

    void EnableCharacterDataHandler(bool fEnable = true)
    {
        XML_SetCharacterDataHandler(m_p, fEnable ? CharacterDataHandler : NULL);
    }

    void EnableProcessingInstructionHandler(bool fEnable = true)
    {
        XML_SetProcessingInstructionHandler(m_p, fEnable ? ProcessingInstructionHandler : NULL);
    }

    void EnableCommentHandler(bool fEnable = true)
    {
        XML_SetCommentHandler(m_p, fEnable ? CommentHandler : NULL);
    }

    void EnableStartCdataSectionHandler(bool fEnable = true)
    {
        XML_SetStartCdataSectionHandler(m_p, fEnable ? StartCdataSectionHandler : NULL);
    }

    void EnableEndCdataSectionHandler(bool fEnable = true)
    {
        XML_SetEndCdataSectionHandler(m_p, fEnable ? EndCdataSectionHandler : NULL);
    }

    void EnableCdataSectionHandler(bool fEnable = true)
    {
        EnableStartCdataSectionHandler(fEnable);
        EnableEndCdataSectionHandler(fEnable);
    }

    void EnableDefaultHandler(bool fEnable = true, bool fExpand = true)
    {
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
        XML_SetUnknownEncodingHandler(m_p, fEnable ? UnknownEncodingHandler : NULL, 0);
    }

    void EnableStartNamespaceDeclHandler(bool fEnable = true)
    {
        XML_SetStartNamespaceDeclHandler(m_p, fEnable ? StartNamespaceDeclHandler : NULL);
    }

    void EnableEndNamespaceDeclHandler(bool fEnable = true)
    {
        XML_SetEndNamespaceDeclHandler(m_p, fEnable ? EndNamespaceDeclHandler : NULL);
    }

    void EnableNamespaceDeclHandler(bool fEnable = true)
    {
        EnableStartNamespaceDeclHandler(fEnable);
        EnableEndNamespaceDeclHandler(fEnable);
    }

    void EnableXmlDeclHandler(bool fEnable = true)
    {
        XML_SetXmlDeclHandler(m_p, fEnable ? XmlDeclHandler : NULL);
    }

    void EnableStartDoctypeDeclHandler(bool fEnable = true)
    {
        XML_SetStartDoctypeDeclHandler(m_p, fEnable ? StartDoctypeDeclHandler : NULL);
    }

    void EnableEndDoctypeDeclHandler(bool fEnable = true)
    {
        XML_SetEndDoctypeDeclHandler(m_p, fEnable ? EndDoctypeDeclHandler : NULL);
    }

    void EnableDoctypeDeclHandler(bool fEnable = true)
    {
        EnableStartDoctypeDeclHandler(fEnable);
        EnableEndDoctypeDeclHandler(fEnable);
    }

    enum XML_Error GetErrorCode()
    {
        return XML_GetErrorCode(m_p);
    }

    long GetCurrentByteIndex()
    {
        return XML_GetCurrentByteIndex(m_p);
    }

    int GetCurrentLineNumber()
    {
        return XML_GetCurrentLineNumber(m_p);
    }

    int GetCurrentColumnNumber()
    {
        return XML_GetCurrentColumnNumber(m_p);
    }

    int GetCurrentByteCount()
    {
        return XML_GetCurrentByteCount(m_p);
    }

    const char *GetInputContext(int *pnOffset, int *pnSize)
    {
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

    void OnStartElement(const XML_Char *pszName, const XML_Char **papszAttrs) {}
    void OnEndElement(const XML_Char *pszName) {}
    void OnCharacterData(const XML_Char *pszData, int nLength) {}
    void OnProcessingInstruction(const XML_Char *pszTarget, const XML_Char *pszData) {}
    void OnComment(const XML_Char *pszData) {}
    void OnStartCdataSection() {}
    void OnEndCdataSection() {}
    void OnDefault(const XML_Char *pszData, int nLength) {}
    bool OnExternalEntityRef(const XML_Char *pszContext, const XML_Char *pszBase, const XML_Char *pszSystemID, const XML_Char *pszPublicID) { return false; }
    bool OnUnknownEncoding(const XML_Char *pszName, XML_Encoding *pInfo) { return false; }
    void OnStartNamespaceDecl(const XML_Char *pszPrefix, const XML_Char *pszURI) {}
    void OnEndNamespaceDecl(const XML_Char *pszPrefix) {}
    void OnXmlDecl(const XML_Char *pszVersion, const XML_Char *pszEncoding, bool fStandalone) {}
    void OnStartDoctypeDecl(const XML_Char *pszDoctypeName, const XML_Char *pszSysID, const XML_Char *pszPubID, bool fHasInternalSubset) {}
    void OnEndDoctypeDecl() {}

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
