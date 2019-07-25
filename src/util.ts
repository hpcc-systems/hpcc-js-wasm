export const PKG_URL = (function () {
    if (document.currentScript) {
        return (document.currentScript as any).src;
    }
    const scripts = document.getElementsByTagName("script");
    const script = scripts[scripts.length - 1];

    if (script.getAttribute.length !== undefined) {
        return (script as any).src;
    }

    return script.getAttribute("src");
}());
console.log(`PKG_URL:  ${PKG_URL}`);

export const PKG_BASE = (function () {
    const urlParts = PKG_URL.split("/");
    urlParts.pop();  //  index.js
    urlParts.pop();  //  dist/
    return urlParts.join("/");
}());
console.log(`PKG_BASE:  ${PKG_BASE}`);
