#include "stack_parser.h"

#include <cstring>

#include <emscripten.h>

class StackParser : CStackParserCallback
{
protected:
	CStackParser m_parser;

public:
	StackParser() : m_parser(this)
	{
		m_parser.Create();
	}

	bool parse(const char *xml)
	{
		m_parser.Parse(xml, (int)strlen(xml), XML_TRUE);
		return true;
	}

	const char *tag() const
	{
		return m_parser.top().m_tag.c_str();
	}

	const char *content() const
	{
		return m_parser.top().GetContent();
	}

	const char *attrs() const
	{
		std::string buff;
		return m_parser.top().attrs(buff);
	}

	virtual void startElement()
	{
		EM_ASM(
			console.log('StackParser-startElement! ');

		);
	};
	virtual void endElement()
	{
		EM_ASM(
			console.log('StackParser-endElement!');

		);
	};
};

class CTest : public CExpatImpl<CTest>
{
public:
	void OnPostCreate()
	{
		// Enable all the event routines we want
		EnableStartElementHandler();
		EnableEndElementHandler();
		EnableCharacterDataHandler();
	}

	virtual void OnStartElement(const XML_Char *pszName, const XML_Char **papszAttrs)
	{
		EM_ASM(
			console.log('CTest-OnStartElement!');

		);
	};

	virtual void OnEndElement(const XML_Char *pszName)
	{
		EM_ASM(
			console.log('CTest-OnEndElement!');

		);
	};

	virtual void OnCharacterData(const XML_Char *pszData, int nLength)
	{
		EM_ASM(
			console.log('CTest-OnCharacterData!');

		);
	}
};

//  Include JS Glue  ---
#include "main_glue.cpp"
