## Usage
solid-asset-viewer styles need to be imported at the top of the `pages/_app.ts` (or `.js`) file:
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