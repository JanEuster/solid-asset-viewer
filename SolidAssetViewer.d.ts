/// <reference types="react" />
import "./styles.css";
declare abstract class AssetType {
    path: string;
    name: string;
    constructor(path: string, name: string);
}
export declare class ImageAsset extends AssetType {
    basePath: string;
    constructor(basePath: string, name: string);
    get nameWithoutExtension(): string;
}
export declare class PdfAsset extends AssetType {
    constructor(path: string);
}
export declare class VideoEmbedAsset extends AssetType {
    constructor(name: string, path: string);
}
export declare class VideoSrcAsset extends AssetType {
    type: string;
    constructor(name: string, path: string, type: string);
}
export declare class ImageAssetSet {
    basePath: string;
    names: string[];
    length: number;
    constructor(basePath: string, names: string[]);
    asArray(): any[];
}
type AnyAsset = AssetType | ImageAssetSet;
export declare class AssetCollection {
    assets: AssetType[];
    selectedIndex: number;
    length: number;
    constructor(assets: AnyAsset[]);
    get selectedFileName(): string;
    get selectedFilePath(): string;
    get toolbarInfo(): string;
    get currentAsset(): AssetType;
    set setSelected(value: number);
}
export default function SolidAssetViewer({ src }: {
    src: AnyAsset[];
}): JSX.Element;
export {};
