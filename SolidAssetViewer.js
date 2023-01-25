var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsxDEV as _jsxDEV, Fragment as _Fragment } from "react/jsx-dev-runtime";
const _jsxFileName = "SolidAssetViewer.tsx";
import "./styles.css";
import DownloadIcon from "./icons/download";
import CopyrightIcon from "./icons/copyright";
import InfoIcon from "./icons/info";
import ListIcon from "./icons/list";
import ArrowLIcon from "./icons/arrow-l";
import ArrowRIcon from "./icons/arrow-r";
import ReloadIcon from "./icons/reload";
import FullscreenIcon from "./icons/fullscreen";
import { useEffect, useRef, useState } from "react";
class AssetType {
    constructor(path, name) {
        this.path = path;
        this.name = name;
    }
}
export class ImageAsset extends AssetType {
    constructor(basePath, name) {
        super(basePath + name, name);
        this.basePath = basePath;
    }
    get nameWithoutExtension() {
        return this.name.split(".")[0];
    }
}
export class PdfAsset extends AssetType {
    constructor(path) {
        let splitPath = path.split("/");
        let name = splitPath[splitPath.length - 1];
        super(path, name);
    }
}
export class VideoEmbedAsset extends AssetType {
    constructor(name, path) {
        super(path, name);
    }
}
export class VideoSrcAsset extends AssetType {
    constructor(name, path, type) {
        super(path, name);
        this.type = type;
    }
}
export class ImageAssetSet {
    constructor(basePath, names) {
        this.basePath = basePath;
        this.names = names;
        this.length = this.names.length;
    }
    asArray() {
        const arr = [];
        for (const name of this.names) {
            arr.push(new ImageAsset(this.basePath, name));
        }
        return arr;
    }
}
// collection to manage the state of the viewer
export class AssetCollection {
    constructor(assets) {
        this.assets = [new ImageAsset("https://pixy.org/src/21/", "219268.jpg"), new ImageAsset("https://pixy.org/src/487/", "4870083.jpg")];
        assets.forEach((asset) => {
            if ((asset instanceof ImageAssetSet)) {
                assets.push(...asset.asArray());
            }
            else {
                assets.push(asset);
            }
        });
        this.selectedIndex = 1;
        this.length = this.assets.length;
    }
    get selectedFileName() {
        return this.assets[this.selectedIndex].name;
    }
    get selectedFilePath() {
        return this.assets[this.selectedIndex].path;
    }
    get toolbarInfo() {
        console.log(this.assets, this.selectedIndex, this.length);
        return String(this.selectedIndex + 1) + " of " + this.length + " | " + this.assets[this.selectedIndex].name;
    }
    get currentAsset() {
        return this.assets[this.selectedIndex];
    }
    set setSelected(value) {
        this.selectedIndex = value;
    }
}
export default function SolidAssetViewer({ src }) {
    const outerRef = useRef(null);
    const innerRef = useRef(null);
    const [ass, setAss] = useState(new AssetCollection(src));
    const [filesMenuOpen, setFilesMenuOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [fullscreen, setFullscreen] = useState(false);
    const select = (value) => {
        if (ass.length > 1) {
            if (value < 0) {
                value = ass.length + value;
            }
            setLoading(true);
            ass.setSelected = value % ass.length;
        }
        setAss(ass);
    };
    useEffect(() => {
        let scale = 1;
        let translate = [0, 0];
        let startOffset = [0, 0];
        let isMouseDown = false;
        const apply = () => {
            if (innerRef.current) {
                innerRef.current.style.transform = `scale(${scale}) translate(${translate[0]}px, ${translate[1]}px)`;
            }
        };
        const setScale = (e) => {
            e.preventDefault();
            let speed = 1.2;
            if (e.deltaY < 0) {
                scale = scale * speed;
            }
            else {
                scale = scale / speed;
            }
            apply();
        };
        const setTranslate = (e) => {
            if (isMouseDown) {
                translate[0] -= (startOffset[0] - e.clientX) / scale;
                translate[1] -= (startOffset[1] - e.clientY) / scale;
            }
            startOffset = [e.clientX, e.clientY];
            apply();
        };
        const resetView = () => {
            scale = 1;
            translate = [0, 0];
            apply();
        };
        let outer = outerRef.current;
        outer === null || outer === void 0 ? void 0 : outer.addEventListener("wheel", setScale);
        outer === null || outer === void 0 ? void 0 : outer.addEventListener("mousedown", (e) => { startOffset = [e.clientX, e.clientY]; isMouseDown = true; });
        outer === null || outer === void 0 ? void 0 : outer.addEventListener("mousemove", setTranslate);
        outer === null || outer === void 0 ? void 0 : outer.addEventListener("mouseup", () => isMouseDown = false);
        window.addEventListener("sav-reset-view", resetView);
        return () => {
            outer === null || outer === void 0 ? void 0 : outer.removeEventListener("wheel", setScale);
            outer === null || outer === void 0 ? void 0 : outer.removeEventListener("mousedown", (e) => { startOffset = [e.clientX, e.clientY]; isMouseDown = true; });
            outer === null || outer === void 0 ? void 0 : outer.removeEventListener("mousemove", setTranslate);
            outer === null || outer === void 0 ? void 0 : outer.removeEventListener("mouseup", () => isMouseDown = false);
            window.removeEventListener("sav-reset-view", resetView);
        };
    }, []);
    const resetView = (e) => {
        // dispatch custom event to manipulate data inside useEffect
        const resetViewEvent = new Event("sav-reset-view");
        window.dispatchEvent(resetViewEvent);
    };
    const download = (e) => __awaiter(this, void 0, void 0, function* () {
        let href = yield fetch(ass.currentAsset.path)
            .then((res) => res.blob())
            .then(blob => URL.createObjectURL(blob));
        const link = document.createElement("a");
        link.href = href;
        link.download = ass.currentAsset.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
    return (_jsxDEV("div", Object.assign({ ref: outerRef, className: "solid-asset-viewer-wrapper", style: fullscreen ? { position: "absolute", top: -20, left: -20, width: "100vw", height: "100vh", zIndex: 99999999 } : undefined }, { children: ass.length > 0 ?
            _jsxDEV(_Fragment, { children: [_jsxDEV("div", Object.assign({ className: "solid-asset-viewer-overlay" }, { children: [_jsxDEV("div", Object.assign({ className: "solid-asset-viewer-info_boxes" }, { children: _jsxDEV("div", Object.assign({ style: { left: "5%" }, "data-open": String(filesMenuOpen) }, { children: ass.assets.map((asset, i) => (_jsxDEV("li", { children: [_jsxDEV("input", { onClick: (e) => select(parseInt(e.target.value)), type: "radio", id: asset.name, name: "viewedFile", value: i, defaultChecked: asset.name == ass.selectedFileName ? true : false }, void 0, false, { fileName: _jsxFileName, lineNumber: 222, columnNumber: 25 }, this), _jsxDEV("label", Object.assign({ htmlFor: asset.name }, { children: asset.name }), void 0, false, { fileName: _jsxFileName, lineNumber: 223, columnNumber: 25 }, this)] }, i, true, { fileName: _jsxFileName, lineNumber: 220, columnNumber: 51 }, this))) }), void 0, false, { fileName: _jsxFileName, lineNumber: 218, columnNumber: 17 }, this) }), void 0, false, { fileName: _jsxFileName, lineNumber: 217, columnNumber: 15 }, this), _jsxDEV("div", Object.assign({ className: "solid-asset-viewer-toolbar" }, { children: [_jsxDEV("div", { children: [_jsxDEV("div", { children: [_jsxDEV("span", Object.assign({ "data-tooltip": "Go to Last Asset", style: { cursor: "pointer" }, onClick: () => select(ass.selectedIndex - 1) }, { children: _jsxDEV("div", { children: _jsxDEV(ArrowLIcon, {}, void 0, false, { fileName: _jsxFileName, lineNumber: 233, columnNumber: 140 }, this) }, void 0, false, { fileName: _jsxFileName, lineNumber: 233, columnNumber: 135 }, this) }), void 0, false, { fileName: _jsxFileName, lineNumber: 233, columnNumber: 21 }, this), _jsxDEV("span", Object.assign({ "data-tooltip": "Go to Next Asset", style: { cursor: "pointer" }, onClick: () => select(ass.selectedIndex + 1) }, { children: _jsxDEV("div", { children: _jsxDEV(ArrowRIcon, {}, void 0, false, { fileName: _jsxFileName, lineNumber: 234, columnNumber: 140 }, this) }, void 0, false, { fileName: _jsxFileName, lineNumber: 234, columnNumber: 135 }, this) }), void 0, false, { fileName: _jsxFileName, lineNumber: 234, columnNumber: 21 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 232, columnNumber: 19 }, this), _jsxDEV("span", Object.assign({ "data-tooltip": "Select Asset from List", style: { cursor: "pointer" }, onClick: () => setFilesMenuOpen(!filesMenuOpen) }, { children: _jsxDEV("div", { children: _jsxDEV(ListIcon, {}, void 0, false, { fileName: _jsxFileName, lineNumber: 236, columnNumber: 147 }, this) }, void 0, false, { fileName: _jsxFileName, lineNumber: 236, columnNumber: 142 }, this) }), void 0, false, { fileName: _jsxFileName, lineNumber: 236, columnNumber: 19 }, this), _jsxDEV("span", Object.assign({ "data-tooltip": "Select Asset from List", style: { cursor: "default" }, onClick: () => setFilesMenuOpen(!filesMenuOpen) }, { children: ass.toolbarInfo }), void 0, false, { fileName: _jsxFileName, lineNumber: 237, columnNumber: 19 }, this), _jsxDEV("span", Object.assign({ "data-tooltip": ass.currentAsset.name }, { children: _jsxDEV("div", { children: _jsxDEV(InfoIcon, {}, void 0, false, { fileName: _jsxFileName, lineNumber: 238, columnNumber: 67 }, this) }, void 0, false, { fileName: _jsxFileName, lineNumber: 238, columnNumber: 62 }, this) }), void 0, false, { fileName: _jsxFileName, lineNumber: 238, columnNumber: 19 }, this), _jsxDEV("span", Object.assign({ onClick: resetView, "data-tooltip": "Reset View", style: { cursor: "pointer" } }, { children: _jsxDEV("div", { children: _jsxDEV(ReloadIcon, {}, void 0, false, { fileName: _jsxFileName, lineNumber: 239, columnNumber: 106 }, this) }, void 0, false, { fileName: _jsxFileName, lineNumber: 239, columnNumber: 101 }, this) }), void 0, false, { fileName: _jsxFileName, lineNumber: 239, columnNumber: 19 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 231, columnNumber: 17 }, this), _jsxDEV("div", { children: [!(ass.currentAsset instanceof VideoEmbedAsset) ?
                                                _jsxDEV("span", Object.assign({ onClick: download, "data-tooltip": "Download Asset" }, { children: _jsxDEV("div", { children: _jsxDEV(DownloadIcon, {}, void 0, false, { fileName: _jsxFileName, lineNumber: 243, columnNumber: 81 }, this) }, void 0, false, { fileName: _jsxFileName, lineNumber: 243, columnNumber: 76 }, this) }), void 0, false, { fileName: _jsxFileName, lineNumber: 242, columnNumber: 68 }, this)
                                                : null, _jsxDEV("span", Object.assign({ "data-tooltip": "Solid Asset Viewer by Jan Eusterschulte. Currently Private" }, { children: _jsxDEV("div", { children: _jsxDEV(CopyrightIcon, {}, void 0, false, { fileName: _jsxFileName, lineNumber: 246, columnNumber: 104 }, this) }, void 0, false, { fileName: _jsxFileName, lineNumber: 246, columnNumber: 99 }, this) }), void 0, false, { fileName: _jsxFileName, lineNumber: 246, columnNumber: 19 }, this), _jsxDEV("span", Object.assign({ "data-tooltip": "Fullscreen Viewer", style: { cursor: "pointer" }, onClick: () => setFullscreen(!fullscreen) }, { children: _jsxDEV("div", { children: _jsxDEV(FullscreenIcon, {}, void 0, false, { fileName: _jsxFileName, lineNumber: 247, columnNumber: 136 }, this) }, void 0, false, { fileName: _jsxFileName, lineNumber: 247, columnNumber: 131 }, this) }), void 0, false, { fileName: _jsxFileName, lineNumber: 247, columnNumber: 19 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 241, columnNumber: 17 }, this)] }), void 0, true, { fileName: _jsxFileName, lineNumber: 230, columnNumber: 15 }, this), _jsxDEV("button", Object.assign({ className: "solid-asset-viewer-back" }, { children: _jsxDEV("div", Object.assign({ onClick: () => select(ass.selectedIndex - 1), style: { display: "flex", width: 30 } }, { children: _jsxDEV(ArrowLIcon, {}, void 0, false, { fileName: _jsxFileName, lineNumber: 251, columnNumber: 107 }, this) }), void 0, false, { fileName: _jsxFileName, lineNumber: 251, columnNumber: 17 }, this) }), void 0, false, { fileName: _jsxFileName, lineNumber: 250, columnNumber: 15 }, this), _jsxDEV("button", Object.assign({ className: "solid-asset-viewer-forward" }, { children: _jsxDEV("div", Object.assign({ onClick: () => select(ass.selectedIndex + 1), style: { display: "flex", width: 30 } }, { children: [" ", _jsxDEV(ArrowRIcon, {}, void 0, false, { fileName: _jsxFileName, lineNumber: 254, columnNumber: 108 }, this)] }), void 0, true, { fileName: _jsxFileName, lineNumber: 254, columnNumber: 17 }, this) }), void 0, false, { fileName: _jsxFileName, lineNumber: 253, columnNumber: 15 }, this)] }), void 0, true, { fileName: _jsxFileName, lineNumber: 216, columnNumber: 13 }, this), _jsxDEV("div", Object.assign({ ref: innerRef, className: "solid-asset-viewer-inner" }, { children: _jsxDEV("div", Object.assign({ className: loading ? "solid-asset-viewer-loading" : "" }, { children: _jsxDEV("div", Object.assign({ className: "solid-asset-viewer-loading_inner" }, { children: ass.currentAsset instanceof ImageAsset ?
                                    _jsxDEV("img", { src: ass.currentAsset.path, onLoad: () => setLoading(false), draggable: false, placeholder: "empty", alt: ass.currentAsset.name }, void 0, false, { fileName: _jsxFileName, lineNumber: 261, columnNumber: 61 }, this)
                                    : ass.currentAsset instanceof VideoEmbedAsset || ass.currentAsset instanceof PdfAsset ?
                                        _jsxDEV("iframe", { className: "solid-asset-viewer-video", src: ass.currentAsset.path, onLoad: () => setLoading(false), allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" }, void 0, false, { fileName: _jsxFileName, lineNumber: 263, columnNumber: 110 }, this)
                                        : ass.currentAsset instanceof VideoSrcAsset ?
                                            _jsxDEV("video", { width: "200", height: "200", controls: true, src: ass.currentAsset.path, className: "solid-asset-viewer-video", onLoad: () => setLoading(false) }, void 0, false, { fileName: _jsxFileName, lineNumber: 265, columnNumber: 70 }, this)
                                            : null }), void 0, false, { fileName: _jsxFileName, lineNumber: 259, columnNumber: 17 }, this) }), void 0, false, { fileName: _jsxFileName, lineNumber: 258, columnNumber: 15 }, this) }), void 0, false, { fileName: _jsxFileName, lineNumber: 257, columnNumber: 13 }, this)] }, void 0, true, { fileName: _jsxFileName, lineNumber: 214, columnNumber: 25 }, this)
            : null }), void 0, false, { fileName: _jsxFileName, lineNumber: 211, columnNumber: 11 }, this));
}
