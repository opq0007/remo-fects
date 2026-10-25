import type { BlessingSeriesId, BlessingSeriesPack, SeriesCharacter } from '../types';
import { isAssetAvailable } from '../asset-fallback';
import { journeyToTheWestSeries } from './journey-to-the-west';
import { zodiacSeries } from './zodiac';
import { fairyTaleSeries } from './fairy-tale';
import { customSeries } from './custom';

export const BLESSING_SERIES_REGISTRY: Record<BlessingSeriesId, BlessingSeriesPack> = {
  journey_to_the_west: journeyToTheWestSeries,
  zodiac: zodiacSeries,
  fairy_tale: fairyTaleSeries,
  custom: customSeries,
};

export function getSeriesPack(id?: BlessingSeriesId): BlessingSeriesPack {
  if (id && BLESSING_SERIES_REGISTRY[id]) {
    return BLESSING_SERIES_REGISTRY[id];
  }
  return BLESSING_SERIES_REGISTRY.journey_to_the_west;
}

export function getValidBlessingSeriesIds(): BlessingSeriesId[] {
  return Object.keys(BLESSING_SERIES_REGISTRY) as BlessingSeriesId[];
}

/**
 * 自定义图片/视频按索引覆盖系列默认角色资源
 */
export function resolveCharacterResources(
  pack: BlessingSeriesPack,
  customImages?: string[],
  customVideos?: string[]
): SeriesCharacter[] {
  const defaults = pack.characters;

  if (customImages && customImages.length > 0) {
    if (defaults.length === 0) {
      return customImages.map((imageSrc, index) => ({
        type: `custom_${index}`,
        imageSrc,
        videoSrc: customVideos?.[index],
        name: `角色${index + 1}`,
        greeting: '祝你生日快乐！',
        // 用户显式提供的资源，不做可用性回退
        isCustomAsset: true,
      }));
    }
    return defaults.map((char, index) => ({
      ...char,
      imageSrc: customImages[index] || char.imageSrc,
      videoSrc: customVideos?.[index] || char.videoSrc,
      isCustomAsset: true,
    }));
  }

  if (customVideos && customVideos.length > 0 && defaults.length > 0) {
    return defaults.map((char, index) => ({
      ...char,
      videoSrc: customVideos[index] || char.videoSrc,
    }));
  }

  // 默认资源：图片缺失时由 leadCharacterConfig 按 cartoonFallback 渲染卡通形象，
  // 视频缺失的绿幕配置同样需要过滤（在章节工厂内按 isAssetAvailable 过滤）
  return defaults;
}

export {
  journeyToTheWestSeries,
  zodiacSeries,
  fairyTaleSeries,
  customSeries,
};
