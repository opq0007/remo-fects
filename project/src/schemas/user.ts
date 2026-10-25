import { z } from "zod";

/**
 * L0 用户参数 Schema（对外唯一默认面）
 * 字段尽量 optional，默认值由 recipe/resolve 与 createDefaultUserProps 负责，
 * 避免 z.default 导致 z.infer 与 Remotion input props 不兼容。
 */

export const PhotoDataSchema = z.object({
  id: z.string().optional(),
  src: z.string(),
});

export const BlessingSeriesSchema = z.enum([
  "journey_to_the_west",
  "zodiac",
  "fairy_tale",
  "custom",
]);

export const KidsPresetSchema = z.enum([
  "journey_to_the_west",
  "zodiac",
  "girl_unicorn",
  "boy_rocket",
  "animal",
  "general",
]);

export const ScreenOrientationSchema = z.enum(["portrait", "landscape"]);

export const KidsBirthdayUserSchema = z.object({
  name: z.string().min(1).max(10),
  age: z.number().min(1).max(18).optional(),
  photos: z.array(PhotoDataSchema).max(5).optional(),
  blessingSeries: BlessingSeriesSchema.optional(),
  preset: KidsPresetSchema.optional(),
  orientation: ScreenOrientationSchema.optional(),
  message: z.string().max(100).optional(),
  musicEnabled: z.boolean().optional(),
  birthdaySongSource: z.string().optional(),
  customCharacterImages: z.array(z.string()).optional(),
  customCharacterVideos: z.array(z.string()).optional(),
  chapterOverrides: z.array(z.record(z.string(), z.unknown())).optional(),
  seed: z.number().optional(),
  fps: z.number().optional(),
});

export type KidsBirthdayUserProps = z.infer<typeof KidsBirthdayUserSchema>;

export const KidsBirthdayInternalSchema = KidsBirthdayUserSchema.extend({
  marquee: z.record(z.string(), z.unknown()).optional(),
  watermark: z.record(z.string(), z.unknown()).optional(),
  radialBurst: z.record(z.string(), z.unknown()).optional(),
  foreground: z.record(z.string(), z.unknown()).optional(),
});

export type KidsBirthdayInternalProps = z.infer<typeof KidsBirthdayInternalSchema>;
