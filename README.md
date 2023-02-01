
# solid-asset-viewer
React Component for Viewing a Set of Images, PDFs and Videos.

![Demonstration of solid-asset-viewer](demo.gif "Demo")

## Usage
solid-asset-viewer styles need to be imported, in nextjs this can be done globally at the top of the `pages/_app.ts` (or `.js`) file:
```javascript
import "solid-asset-viewer-react/dist/solid-asset-viewer.css"
```

Use the Component:
```typescript
<SolidAssetViewer src={[
  new ImageAsset(basePath: string, name: string) 
  // image, including gif where the name is the filename 
  // and is also used as the name in the ui
  new PdfAsset(basePath: string, name: string)
  // same thing just uses the browsers pdf viewer
  new VideoEmbedAsset(name: string, path: string)
  // something like youtube video embed where path is the url
  new VideoSrcAsset(name: string, path: string, type: string)
  // local or remote video
  // type needs to be specified like 'video/mp4'
  new ImageAssetSet(basePath: string, names: string[])
  // set of images with the same basePath
  // names is array of fileNames
  // works with local and remote 'folders'
]}/>
```

## Example
[View Result at https://jan.eusterschulte.com/projects/solid-asset-viewer/](https://jan.eusterschulte.com/projects/solid-asset-viewer/)

```typescript
import SolidAssetViewer, { ImageAsset, PdfAsset, VideoEmbedAsset, VideoSrcAsset, ImageAssetSet } from "solid-asset-viewer-react";

export default function SAVDemo() {
  return (
      <div style={{width: "100vw", height: "600px"}}>
        <SolidAssetViewer src={[
          new ImageAsset("https://pixy.org/src/21/", "219269.jpg"),
          new ImageAsset("https://pixy.org/src2/624/", "6244076.jpg"),
          new PdfAsset("https://africau.edu/images/default/", "sample.pdf"),
          new VideoEmbedAsset(
            "Wostok 1 - 60 Jahre Bemannte Raumfahrt",
            "https://www.youtube-nocookie.com/embed/CCBlA9khxhg"
          ),
          new VideoSrcAsset(
            "Loading.gif",
            "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
            "video/mp4"
          ),
          new ImageAssetSet("https://pixy.org/src2/624/", [
            "6242613.jpg",
            "6242613.jpg",
            "6244076.jpg",
            "6242613.jpg",
          ]),
        ]}/>
      </div>
  )
}
```
