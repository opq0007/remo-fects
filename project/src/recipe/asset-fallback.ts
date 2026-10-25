/**
 * 资源可用性清单与卡通回退
 *
 * public 目录实际存在的资源（不含 pic/，角色图片尚未内置）。
 * 系列默认角色若引用不存在的图片，渲染时回退到气质对位的内置卡通形象，
 * 保证"零资源开箱渲染"，杜绝 broken image。
 * 往 public 添加文件后同步更新此清单。
 */

export const AVAILABLE_PUBLIC_ASSETS = new Set<string>([
  '孙悟空.mp4',
  '熊猫.png',
  'birthday_audio.mp3',
  'countDown_clock.mp3',
  'countDown_common.mp3',
  'countDown_game.mp3',
  'JoyfulChildren.mp3',
]);

export const isAssetAvailable = (src?: string): boolean =>
  !!src && AVAILABLE_PUBLIC_ASSETS.has(src);
