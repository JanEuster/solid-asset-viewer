import { useEffect, useRef, useState } from "react"
import DownloadIcon from "./icons/download"
import CopyrightIcon from "./icons/copyright"
import InfoIcon from "./icons/info"
import ListIcon from "./icons/list"
import ArrowLIcon from "./icons/arrow-l"
import ArrowRIcon from "./icons/arrow-r"
import ReloadIcon from "./icons/reload"
import FullscreenIcon from "./icons/fullscreen"
import "./dist/styles.css"


abstract class AssetType {
  path: string;
  name: string;

  constructor(path: string, name: string) {
    this.path = path;
    this.name = name;
  }
}
export class ImageAsset extends AssetType {
  basePath: string;

  constructor(basePath: string, name: string) {
    super(basePath + name, name);
    this.basePath = basePath;
  }
  get nameWithoutExtension(): string {
    return this.name.split(".")[0];
  }
}

export class PdfAsset extends AssetType {
  constructor(path: string) {
    let splitPath = path.split("/");
    let name = splitPath[splitPath.length - 1];
    super(path, name)
  }
}

export class VideoEmbedAsset extends AssetType {
  constructor(name: string, path: string) {
    super(path, name);
  }
}
export class VideoSrcAsset extends AssetType {
  type: string;

  constructor(name: string, path: string, type: string) {
    super(path, name)
    this.type = type;
  }
}

export class ImageAssetSet {
  basePath: string;
  names: string[];
  length: number;

  constructor(basePath: string, names: string[]) {
    this.basePath = basePath;
    this.names = names;
    this.length = this.names.length
  }
  asArray() {
    const arr = []
    for (const name of this.names) {
      arr.push(new ImageAsset(this.basePath, name))
    }
    return arr
  }
}




type AnyAsset = AssetType | ImageAssetSet;



// collection to manage the state of the viewer
export class AssetCollection {
  assets: AssetType[];
  selectedIndex: number;
  length: number;

  constructor(assets: AnyAsset[]) {
    this.assets = [new ImageAsset("https://pixy.org/src/21/", "219268.jpg"), new ImageAsset("https://pixy.org/src/487/", "4870083.jpg")];
    assets.forEach((asset) => {
      if ((asset instanceof ImageAssetSet)) {
        assets.push(...asset.asArray());
      } else {
        assets.push(asset);
      }
    })

    this.selectedIndex = 1;
    this.length = this.assets.length
  }
  get selectedFileName() {
    return this.assets[this.selectedIndex].name
  }
  get selectedFilePath() {
    return this.assets[this.selectedIndex].path
  }
  get toolbarInfo() {
    console.log(this.assets, this.selectedIndex, this.length);
    return String(this.selectedIndex + 1) + " of " + this.length + " | " + this.assets[this.selectedIndex].name
  }
  get currentAsset() {
    return this.assets[this.selectedIndex]
  }
  set setSelected(value: number) {
    this.selectedIndex = value;
  }
}






export default function SolidAssetViewer({ src }: { src: AnyAsset[] }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [ass, setAss] = useState(new AssetCollection(src))
  const [filesMenuOpen, setFilesMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);

  const select = (value: number) => {
    if (ass.length > 1) {
      if (value < 0) {
        value = ass.length + value
      }
      setLoading(true)
      ass.setSelected = value % ass.length;
    }
    setAss(ass);
  }

  useEffect(() => {
    let scale = 1
    let translate = [0, 0]
    let startOffset = [0, 0]
    let isMouseDown = false

    const apply = () => {
      if (innerRef.current) {
        innerRef.current.style.transform = `scale(${scale}) translate(${translate[0]}px, ${translate[1]}px)`;
      }
    }
    const setScale = (e: WheelEvent) => {
      e.preventDefault();

      let speed = 1.2
      if (e.deltaY < 0) {
        scale = scale * speed
      } else {
        scale = scale / speed
      }
      apply()
    }
    const setTranslate = (e: MouseEvent) => {
      if (isMouseDown) {
        translate[0] -= (startOffset[0] - e.clientX) / scale;
        translate[1] -= (startOffset[1] - e.clientY) / scale;
      }
      startOffset = [e.clientX, e.clientY];
      apply()
    }
    const resetView = () => {
      scale = 1;
      translate = [0, 0];
      apply()
    }
    let outer = outerRef.current;
    outer?.addEventListener("wheel", setScale);
    outer?.addEventListener("mousedown", (e) => { startOffset = [e.clientX, e.clientY]; isMouseDown = true })
    outer?.addEventListener("mousemove", setTranslate)
    outer?.addEventListener("mouseup", () => isMouseDown = false)
    window.addEventListener("sav-reset-view", resetView)
    return () => {
      outer?.removeEventListener("wheel", setScale);
      outer?.removeEventListener("mousedown", (e) => { startOffset = [e.clientX, e.clientY]; isMouseDown = true })
      outer?.removeEventListener("mousemove", setTranslate)
      outer?.removeEventListener("mouseup", () => isMouseDown = false)
      window.removeEventListener("sav-reset-view", resetView)
    }
  }, [])

  const resetView = (e: React.MouseEvent<any, any>) => {
    // dispatch custom event to manipulate data inside useEffect
    const resetViewEvent = new Event("sav-reset-view")
    window.dispatchEvent(resetViewEvent);
  }
  const download = async (e: React.MouseEvent<any, any>) => {
    let href = await fetch(ass.currentAsset.path)
      .then((res) => res.blob())
      .then(blob => URL.createObjectURL(blob));

    const link = document.createElement("a");
    link.href = href;
    link.download = ass.currentAsset.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  return (
    <div ref={outerRef} className="solid-asset-viewer-wrapper" style={fullscreen ? { position: "absolute", top: -20, left: -20, width: "100vw", height: "100vh", zIndex: 99999999 } : undefined}>
      {
        ass.length > 0 ?
          <>
            <div className="solid-asset-viewer-overlay">
              <div className="solid-asset-viewer-info_boxes">
                <div style={{ left: "5%" }} data-open={String(filesMenuOpen)}>
                  {
                    ass.assets.map((asset, i) => (
                      <li key={i}>
                        <input onClick={(e) => select(parseInt((e.target as HTMLInputElement).value))} type="radio" id={asset.name} name="viewedFile" value={i} defaultChecked={asset.name == ass.selectedFileName ? true : false} />
                        <label htmlFor={asset.name}>{asset.name}</label>
                      </li>
                    ))
                  }

                </div>
              </div>
              <div className="solid-asset-viewer-toolbar">
                <div>
                  <div>
                    <span data-tooltip="Go to Last Asset" style={{ cursor: "pointer" }} onClick={() => select(ass.selectedIndex - 1)}><div><ArrowLIcon /></div></span>
                    <span data-tooltip="Go to Next Asset" style={{ cursor: "pointer" }} onClick={() => select(ass.selectedIndex + 1)}><div><ArrowRIcon /></div></span>
                  </div>
                  <span data-tooltip="Select Asset from List" style={{ cursor: "pointer" }} onClick={() => setFilesMenuOpen(!filesMenuOpen)}><div><ListIcon /></div></span>
                  <span data-tooltip="Select Asset from List" style={{ cursor: "default" }} onClick={() => setFilesMenuOpen(!filesMenuOpen)}>{ass.toolbarInfo}</span>
                  <span data-tooltip={ass.currentAsset.name}><div><InfoIcon /></div></span>
                  <span onClick={resetView} data-tooltip="Reset View" style={{ cursor: "pointer" }}><div><ReloadIcon /></div></span>
                </div>
                <div>
                  {!(ass.currentAsset instanceof VideoEmbedAsset) ?
                    <span onClick={download} data-tooltip="Download Asset"><div><DownloadIcon /></div></span>
                    : null
                  }
                  <span data-tooltip="Solid Asset Viewer by Jan Eusterschulte. Currently Private"><div><CopyrightIcon /></div></span>
                  <span data-tooltip="Fullscreen Viewer" style={{ cursor: "pointer" }} onClick={() => setFullscreen(!fullscreen)}><div><FullscreenIcon /></div></span>
                </div>
              </div>
              <button className="solid-asset-viewer-back">
                <div onClick={() => select(ass.selectedIndex - 1)} style={{ display: "flex", width: 30 }}><ArrowLIcon /></div>
              </button>
              <button className="solid-asset-viewer-forward">
                <div onClick={() => select(ass.selectedIndex + 1)} style={{ display: "flex", width: 30 }}> <ArrowRIcon /></div>
              </button>
            </div>
            <div ref={innerRef} className="solid-asset-viewer-inner">
              <div className={loading ? "solid-asset-viewer-loading" : ""}>
                <div className="solid-asset-viewer-loading_inner">
                  {
                    ass.currentAsset instanceof ImageAsset ?
                      <img src={ass.currentAsset.path} onLoad={() => setLoading(false)} draggable={false} placeholder="empty" alt={ass.currentAsset.name} />
                      : ass.currentAsset instanceof VideoEmbedAsset || ass.currentAsset instanceof PdfAsset ?
                        <iframe className="solid-asset-viewer-video" src={ass.currentAsset.path} onLoad={() => setLoading(false)} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
                        : ass.currentAsset instanceof VideoSrcAsset ?
                          <video width="200" height="200" controls src={ass.currentAsset.path} className="solid-asset-viewer-video" onLoad={() => setLoading(false)}>
                          </video>
                          : null
                  }
                </div>
              </div>
            </div>
          </>
          : null
      }

    </div>
  )
}