/**
 * 公共组件导出
 */

export { Background } from "./Background";
export type { BackgroundComponentProps } from "../schemas";

export { Overlay } from "./Overlay";
export type { OverlayComponentProps } from "../schemas";

export { CenterGlow } from "./CenterGlow";
export type { CenterGlowProps } from "./CenterGlow";

export { StarField } from "./StarField";
export type { StarFieldProps } from "./StarField";

export { AudioPlayer } from "./AudioPlayer";
export type { AudioPlayerProps } from "./AudioPlayer";

export { Watermark } from "./Watermark";

export { Marquee } from "./Marquee";

export { BaseComposition } from "./BaseComposition";
export type { BaseCompositionComponentProps } from "./BaseComposition";

export { BlessingSymbol, SingleBlessingSymbol } from "./BlessingSymbol";

// 混合输入渲染组件
export {
  TextItemRender,
  ImageItemRender,
  BlessingItemRender,
  MixedInputItemRender,
  MixedInputListRender,
  isTextItem,
  isImageItem,
  isBlessingItem,
  isNetworkUrl,
  isDataUrl,
  getImageSrc,
} from "./MixedInputItem";
export type {
  TextItemRenderProps,
  ImageItemRenderProps,
  BlessingItemRenderProps,
  MixedInputItemRenderProps,
  MixedInputListRenderProps,
} from "./MixedInputItem";
