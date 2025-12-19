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

    void EnableStartElementHandler(bool fEnable = true)
    {
        XML_SetStartElementHandler(m_p, fEnable ? StartElementHandler : NULL);
    }

    void EnableEndElementHandler(bool fEnable = true)
    {
        XML_SetEndElementHandler(m_p, fEnable ? EndElementHandler : NULL);
    }

    void EnableCharacterDataHandler(bool fEnable = true)
    {
        XML_SetCharacterDataHandler(m_p, fEnable ? CharacterDataHandler : NULL);
    }
    void OnStartElement(const XML_Char *pszName, const XML_Char **papszAttrs) {}
    void OnEndElement(const XML_Char *pszName) {}
    void OnCharacterData(const XML_Char *pszData, int nLength) {}

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

    XML_Parser m_p;
};
