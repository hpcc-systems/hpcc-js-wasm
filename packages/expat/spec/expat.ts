import { expect } from "chai";
import { Attributes, Expat, StackParser } from "@hpcc-js/wasm-expat";

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

class KeywordParser extends StackParser {

    currCat: any;
    _json: any = {};
    _meta: string = "";

    startElement(tag: string, attrs: Attributes) {
        const retVal = super.startElement(tag, attrs);
        switch (tag) {
            case "cat":
                this.currCat = `keyword_${attrs["group"]}`;
                this._json[this.currCat] = [];
                break;
            case "keyword":
                this._json[this.currCat].push(attrs["name"]);
                break;
        }
        return retVal;
    }

    endElement(tag: string) {
        switch (tag) {
            case "meta":
                this._meta = this.top().content;
                break;
        }
        return super.endElement(tag);
    }
}

describe("expat", function () {
    it("version", async function () {
        let expat = await Expat.load();
        let v = await expat.version();
        expect(v).to.be.a.string;
        expect(v).to.equal("expat_2.6.2");
        console.log("expat version: " + v);
        Expat.unload();

        expat = await Expat.load();
        v = await expat.version();
        expect(v).to.be.a.string;
        expect(v).to.not.be.empty;
        Expat.unload();
    });

    it("simple", async function () {
        const xml = "<root><child xxx=\"yyy\">content</child></root>";
        const callback = {
            startElement(tag: string, attrs: Attributes) { console.log("start", tag, attrs); },
            endElement(tag: string) { console.log("end", tag); },
            characterData(content: string) { console.log("characterData", content); }
        };
        const expat = await Expat.load();
        const response = expat.parse(xml, callback);
        expect(response).to.be.true;
    });

    it("parse", async function () {
        const parser = new KeywordParser();
        const response = await parser.parse(encodedXml());
        expect(response).to.be.true;
        expect(parser._meta).to.equal("Some Content!");
    });
});

function encodedXml() {
    return xml()
        .split("&").join("&amp;")
        .split("\"<").join("\"&lt;")
        .split("<\"").join("&lt;\"")
        // .split("\">").join("\"&gt;")
        .split(">\"").join("&gt;\"")
        .split("<<").join("&lt;&lt;")
        .split(">>").join("&gt;&gt;")
        ;
}

function xml() {
    return `
<xml>
    <meta>Some Content!</meta>
    <cat group="1">
        <keyword name="beginc++" />
        <keyword name="elif" />
        <keyword name="else" />
        <keyword name="elseif" />
        <keyword name="elsif" />
        <keyword name="embed" />
        <keyword name="endembed" />
        <keyword name="end" />
        <keyword name="endc++" />
        <keyword name="endmacro" />
        <keyword name="function" />
        <keyword name="functionmacro" />
        <keyword name="if" />
        <keyword name="ifblock" />
        <keyword name="iff" />
        <keyword name="interface" />
        <keyword name="macro" />
        <keyword name="module" />
        <keyword name="record" />
        <keyword name="service" />
        <keyword name="then" />
        <keyword name="transform" />
        <keyword name="type" />
    </cat>
    <cat group="2">
        <keyword name="__debug__" />
        <keyword name="__ecl_legacy_mode__" />
        <keyword name="__ecl_version__" />
        <keyword name="__ecl_version_major__" />
        <keyword name="__ecl_version_minor__" />
        <keyword name="__ecl_version_subminor__" />
        <keyword name="__line__" />
        <keyword name="__os__" />
        <keyword name="__platform__" />
        <keyword name="__set_debug_option__" />
        <keyword name="__stand_alone__" />
        <keyword name="__target_platform__" />
        <keyword name="clustersize" />
        <keyword name="getenv" />
    </cat>
    <cat group="3">
        <keyword name="#append" />
        <keyword name="#apply" />
        <keyword name="#break" />
        <keyword name="#constant" />
        <keyword name="#debug" />
        <keyword name="#declare" />
        <keyword name="#demangle" />
        <keyword name="#else" />
        <keyword name="#elseif" />
        <keyword name="#end" />
        <keyword name="#endregion" />
        <keyword name="#error" />
        <keyword name="#expand" />
        <keyword name="#export" />
        <keyword name="#exportxml" />
        <keyword name="#for" />
        <keyword name="#forall" />
        <keyword name="#getdatatype" />
        <keyword name="#if" />
        <keyword name="#ifdefined" />
        <keyword name="#inmodule" />
        <keyword name="#isdefined" />
        <keyword name="#isvalid" />
        <keyword name="#line" />
        <keyword name="#link" />
        <keyword name="#loop" />
        <keyword name="#mangle" />
        <keyword name="#onwarning" />
        <keyword name="#option" />
        <keyword name="#region" />
        <keyword name="#set" />
        <keyword name="#stored" />
        <keyword name="#text" />
        <keyword name="#trace" />
        <keyword name="#uniquename" />
        <keyword name="#warning" />
        <keyword name="#webservice" />
        <keyword name="#workunit" />
        <keyword name="#$" />
        <keyword name="loadxml" />
    </cat>
    <cat group="4">
        <keyword name="asstring" />
        <keyword name="encoding" />
        <keyword name="fromunicode" />
        <keyword name="intformat" />
        <keyword name="keyunicode" />
        <keyword name="length" />
        <keyword name="realformat" />
        <keyword name="regexfind" />
        <keyword name="regexfindset" />
        <keyword name="regexreplace" />
        <keyword name="tojson" />
        <keyword name="tounicode" />
        <keyword name="toxml" />
        <keyword name="trim" />
        <keyword name="unicodeorder" />
    </cat>
    <cat group="5">
        <keyword name="abs" />
        <keyword name="acos" />
        <keyword name="asin" />
        <keyword name="atan" />
        <keyword name="atan2" />
        <keyword name="ave" />
        <keyword name="cos" />
        <keyword name="cosh" />
        <keyword name="count" />
        <keyword name="correlation" />
        <keyword name="covariance" />
        <keyword name="div" />
        <keyword name="exists" />
        <keyword name="exp" />
        <keyword name="log" />
        <keyword name="ln" />
        <keyword name="max" />
        <keyword name="min" />
        <keyword name="power" />
        <keyword name="random" />
        <keyword name="round" />
        <keyword name="roundup" />
        <keyword name="sin" />
        <keyword name="sinh" />
        <keyword name="sqrt" />
        <keyword name="sum" />
        <keyword name="tan" />
        <keyword name="tanh" />
        <keyword name="truncate" />
        <keyword name="variance" />
    </cat>
    <cat group="6">
        <keyword name="&" />
        <keyword name="|" />
        <keyword name="bnot" />
        <keyword name="<<" />
        <keyword name=">>" />
        <keyword name="(>" />
        <keyword name="<)" />
    </cat>
    <cat group="7">
        <keyword name="=" />
        <keyword name="<" />
        <keyword name="<=" />
        <keyword name=">" />
        <keyword name="!=" />
        <keyword name="<>" />
        <keyword name="between" />
        <keyword name="in" />
        <keyword name="isnull" />
    </cat>
    <cat group="8">
        <keyword name="false" />
        <keyword name="true" />
        <keyword name="and" />
        <keyword name="not" />
        <keyword name="or" />
    </cat>
    <cat group="9">
        <keyword name="ascii" />
        <keyword name="big_endian" />
        <keyword name="bitfield" />
        <keyword name="boolean" />
        <keyword name="data" />
        <keyword name="decimal" />
        <keyword name="enum" />
        <keyword name="integer" />
        <keyword name="little_endian" />
        <keyword name="qstring" />
        <keyword name="real" />
        <keyword name="recordof" />
        <keyword name="recordset" />
        <keyword name="set" />
        <keyword name="set of" />
        <keyword name="size_t" />
        <keyword name="string" />
        <keyword name="typeof" />
        <keyword name="udecimal" />
        <keyword name="unsigned" />
        <keyword name="utf8" />
        <keyword name="varstring" />
        <keyword name="varunicode" />
    </cat>
    <cat group="10">
        <keyword name="backup" />
        <keyword name="cluster" />
        <keyword name="encrypt" />
        <keyword name="expire" />
        <keyword name="heading" />
        <keyword name="multiple" />
        <keyword name="label" />
        <keyword name="nooverwrite" />
        <keyword name="overwrite" />
        <keyword name="preload" />
        <keyword name="single" />
        <keyword name="csv" />
        <keyword name="quote" />
        <keyword name="separator" />
        <keyword name="terminator" />
        <keyword name="noxpath" />
    </cat>
    <cat group="11">
        <keyword name="aggregate" />
        <keyword name="allnodes" />
        <keyword name="case" />
        <keyword name="choose" />
        <keyword name="choosen" />
        <keyword name="choosesets" />
        <keyword name="combine" />
        <keyword name="dataset" />
        <keyword name="dedup" />
        <keyword name="denormalize" />
        <keyword name="dictionary" />
        <keyword name="distribute" />
        <keyword name="distribution" />
        <keyword name="_empty_" />
        <keyword name="enth" />
        <keyword name="fetch" />
        <keyword name="fromxml" />
        <keyword name="fromjson" />
        <keyword name="graph" />
        <keyword name="group" />
        <keyword name="having" />
        <keyword name="httpcall" />
        <keyword name="index" />
        <keyword name="iterate" />
        <keyword name="join" />
        <keyword name="loop" />
        <keyword name="map" />
        <keyword name="merge" />
        <keyword name="mergejoin" />
        <keyword name="nocombine" />
        <keyword name="nonempty" />
        <keyword name="normalize" />
        <keyword name="parse" />
        <keyword name="pattern" />
        <keyword name="process" />
        <keyword name="project" />
        <keyword name="quantile" />
        <keyword name="range" />
        <keyword name="rank" />
        <keyword name="ranked" />
        <keyword name="regroup" />
        <keyword name="rejected" />
        <keyword name="rollup" />
        <keyword name="row" />
        <keyword name="sample" />
        <keyword name="score" />
        <keyword name="sort" />
        <keyword name="stepped" />
        <keyword name="subsort" />
        <keyword name="table" />
        <keyword name="topn" />
        <keyword name="trace" />
        <keyword name="ungroup" />
        <keyword name="which" />
        <keyword name="within" />
        <keyword name="workunit" />
        <keyword name="xmldecode" />
        <keyword name="xmlencode" />
    </cat>
    <cat group="12">
        <keyword name="__alias__" />
        <keyword name="_array_" />
        <keyword name="cardinality" />
        <keyword name="__compound__" />
        <keyword name="__compressed__" />
        <keyword name="__grouped__" />
        <keyword name="_linkcounted_" />
        <keyword name="__nameof__" />
        <keyword name="__nostreaming__" />
        <keyword name="__owned__" />
        <keyword name="after" />
        <keyword name="algorithm" />
        <keyword name="all" />
        <keyword name="any" />
        <keyword name="best" />
        <keyword name="bitmap" />
        <keyword name="bloom" />
        <keyword name="blob" />
        <keyword name="c++" />
        <keyword name="choosen:all" />
        <keyword name="const" />
        <keyword name="counter" />
        <keyword name="descend" />
        <keyword name="desc" />
        <keyword name="ebcdic" />
        <keyword name="embedded" />
        <keyword name="except" />
        <keyword name="exclusive" />
        <keyword name="extend" />
        <keyword name="few" />
        <keyword name="fileposition" />
        <keyword name="filtered" />
        <keyword name="first" />
        <keyword name="fixed" />
        <keyword name="flat" />
        <keyword name="full" />
        <keyword name="grouped" />
        <keyword name="inner" />
        <keyword name="last" />
        <keyword name="left" />
        <keyword name="linkcounted" />
        <keyword name="literal" />
        <keyword name="local" />
        <keyword name="locale" />
        <keyword name="localfileposition" />
        <keyword name="logicalfilename" />
        <keyword name="lookup" />
        <keyword name="lzw" />
        <keyword name="many" />
        <keyword name="noconst" />
        <keyword name="noroot" />
        <keyword name="noscan" />
        <keyword name="notrim" />
        <keyword name="only" />
        <keyword name="opt" />
        <keyword name="__option__" />
        <keyword name="out" />
        <keyword name="outer" />
        <keyword name="packed" />
        <keyword name="probability" />
        <keyword name="pulled" />
        <keyword name="remote" />
        <keyword name="restricted" />
        <keyword name="return" />
        <keyword name="right" />
        <keyword name="rows" />
        <keyword name="rule" />
        <keyword name="scan" />
        <keyword name="self" />
        <keyword name="smart" />
        <keyword name="sql" />
        <keyword name="streamed" />
        <keyword name="thor" />
        <keyword name="unordered" />
        <keyword name="unsorted" />
        <keyword name="volatile" />
        <keyword name="whole" />
    </cat>
    <cat group="13">
        <keyword name="eclcrc" />
        <keyword name="hash" />
        <keyword name="hash32" />
        <keyword name="hash64" />
        <keyword name="hashcrc" />
        <keyword name="hashmd5" />
        <keyword name="matchlength" />
        <keyword name="matchposition" />
        <keyword name="matchrow" />
        <keyword name="rowdiff" />
        <keyword name="sizeof" />
        <keyword name="transfer" />
    </cat>
    <cat group="14">
        <keyword name="atmost" />
        <keyword name="before" />
        <keyword name="cogroup" />
        <keyword name="compressed" />
        <keyword name="default" />
        <keyword name="escape" />
        <keyword name="format" />
        <keyword name="global" />
        <keyword name="groupby" />
        <keyword name="guard" />
        <keyword name="httpheader" />
        <keyword name="internal" />
        <keyword name="joined" />
        <keyword name="json" />
        <keyword name="keep" />
        <keyword name="keyed" />
        <keyword name="limit" />
        <keyword name="matched" />
        <keyword name="matchtext" />
        <keyword name="matchunicode" />
        <keyword name="matchutf8" />
        <keyword name="mofn" />
        <keyword name="maxcount" />
        <keyword name="maxlength" />
        <keyword name="maxsize" />
        <keyword name="named" />
        <keyword name="namespace" />
        <keyword name="nocase" />
        <keyword name="nolocal" />
        <keyword name="nosort" />
        <keyword name="onfail" />
        <keyword name="partition" />
        <keyword name="penalty" />
        <keyword name="prefetch" />
        <keyword name="proxyaddress" />
        <keyword name="refresh" />
        <keyword name="repeat" />
        <keyword name="response" />
        <keyword name="retry" />
        <keyword name="rowset" />
        <keyword name="skew" />
        <keyword name="skip" />
        <keyword name="soapaction" />
        <keyword name="stable" />
        <keyword name="thisnode" />
        <keyword name="threshold" />
        <keyword name="timelimit" />
        <keyword name="timeout" />
        <keyword name="token" />
        <keyword name="unstable" />
        <keyword name="update" />
        <keyword name="use" />
        <keyword name="validate" />
        <keyword name="virtual" />
        <keyword name="whitespace" />
        <keyword name="width" />
        <keyword name="wild" />
        <keyword name="xml" />
        <keyword name="xmlns" />
        <keyword name="xmldefault" />
        <keyword name="xpath" />
        <keyword name="xmlproject" />
        <keyword name="xmltext" />
        <keyword name="xmlunicode" />
    </cat>
    <cat group="15">
        <keyword name="action" />
        <keyword name="apply" />
        <keyword name="as" />
        <keyword name="build" />
        <keyword name="buildindex" />
        <keyword name="checkpoint" />
        <keyword name="critical" />
        <keyword name="cron" />
        <keyword name="define" />
        <keyword name="deprecated" />
        <keyword name="dynamic" />
        <keyword name="event" />
        <keyword name="eventextra" />
        <keyword name="eventname" />
        <keyword name="export" />
        <keyword name="from" />
        <keyword name="import" />
        <keyword name="independent" />
        <keyword name="keydiff" />
        <keyword name="keypatch" />
        <keyword name="labeled" />
        <keyword name="labelled" />
        <keyword name="library" />
        <keyword name="notify" />
        <keyword name="once" />
        <keyword name="onwarning" />
        <keyword name="ordered" />
        <keyword name="output" />
        <keyword name="parallel" />
        <keyword name="persist" />
        <keyword name="pipe" />
        <keyword name="priority" />
        <keyword name="private" />
        <keyword name="section" />
        <keyword name="sequential" />
        <keyword name="shared" />
        <keyword name="soapcall" />
        <keyword name="stored" />
        <keyword name="wait" />
        <keyword name="when" />
    </cat>
    <cat group="16">
        <keyword name="__common__" />
        <keyword name="distributed" />
        <keyword name="evaluate" />
        <keyword name="forward" />
        <keyword name="hint" />
        <keyword name="noboundcheck" />
        <keyword name="nofold" />
        <keyword name="nohoist" />
        <keyword name="nothor" />
        <keyword name="pull" />
        <keyword name="sorted" />
        <keyword name="likely" />
        <keyword name="unlikely" />
    </cat>
    <cat group="17">
        <keyword name="assert" />
        <keyword name="catch" />
        <keyword name="encrypted" />
        <keyword name="error" />
        <keyword name="fail" />
        <keyword name="failcode" />
        <keyword name="failmessage" />
        <keyword name="failure" />
        <keyword name="ignore" />
        <keyword name="isvalid" />
        <keyword name="onfail" />
        <keyword name="success" />
        <keyword name="recovery" />
        <keyword name="warning" />
    </cat>
    <cat group="18">
        <keyword name="__sequence__" />
        <keyword name="feature" />
        <keyword name="omitted" />
    </cat>
    <cat group="19">
        <keyword name=":=" />
        <keyword name="<?>" />
        <keyword name="<??>" />
        <keyword name=".." />
        <keyword name="=>" />
    </cat>
</xml> `;
}