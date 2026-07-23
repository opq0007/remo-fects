/**
 * Schemas 导出
 * 用户面：KidsBirthdayUserSchema
 * 兼容别名：KidsBirthdaySchema === User Schema
 */

export {
  KidsBirthdayUserSchema,
  KidsBirthdayInternalSchema,
  PhotoDataSchema,
  BlessingSeriesSchema,
  KidsPresetSchema,
  ScreenOrientationSchema,
  type KidsBirthdayUserProps,
  type KidsBirthdayInternalProps,
} from './user';

/** 兼容旧 import 名 */
export { KidsBirthdayUserSchema as KidsBirthdaySchema } from './user';
export type { KidsBirthdayUserProps as KidsBirthdayProps } from './user';

export {
  estimateKidsBirthdayDuration,
  compileKidsBirthdayTimeline,
  getSeriesPack,
  getValidBlessingSeriesIds,
  KIDS_PRESETS,
} from '../recipe';
