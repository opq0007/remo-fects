# 儿童生日祝福视频生成器 - AI 开发上下文

## 项目概述

基于 Remotion 的儿童生日祝福视频生成器。采用 **recipe 配方层 + StoryPanel** 配置驱动，用户只暴露 **L0 精简参数**，时长由章节模板 **动态求和**。

## 架构（重构后）

```
L0 User API / KidsBirthdayUserSchema
  name*, age?, photos?, blessingSeries?, preset?, orientation?, …
        │ resolveUserInput + compileKidsBirthdayTimeline
L1 recipe/
  series/ · chapters/ · templates/ · presets · timeline-defaults.json
        │
L2 StoryChapterConfig[] → StoryPanel → Remotion
```

### 关键路径

| 路径 | 职责 |
|------|------|
| `src/recipe/` | 系列、章节工厂、模板、compile、时长估算 |
| `src/schemas/user.ts` | L0 用户 Schema（不继承 CompleteComposition） |
| `src/compositions/KidsBirthdayComposition.tsx` | 薄封装：compile → StoryPanel |
| `src/Root.tsx` | Composition + `calculateMetadata` 动态时长 |
| `api/effect-configs/kids-birthday-effect.js` | API L0 白名单 + 同源 timeline JSON |

### 真实章节（classic 模板）

| id | 条件 | 默认秒数 |
|----|------|----------|
| `0_countdown` | 始终 | 4 |
| `A_magicOpening` | 始终 | 2 |
| `F_growthCelebration` | 始终 | 10 |
| `C_photoInteraction1` | photos≥1 | 30 |
| `D_photoInteraction2` | photos≥1 | 30 |
| `G_birthdaySong` | 始终 | 35 |
| `H_futureBlessing` | 始终 | 10 |

无照片 ≈ 61s；有照片 ≈ 121s（@24fps）。秒数真相：`recipe/timeline-defaults.json`（API 镜像：`api/effect-configs/kids-birthday-timeline.json`）。

**已删除的假能力：** 模块 B/E/I/J、`dreams`、固定 124s 唯一真相、`chapterList`（改为 `chapterOverrides`）。

## L0 用户参数

| 字段 | 必填 | 说明 |
|------|------|------|
| name | 是 | 主角名字 1–10 字 |
| age | | 1–18 |
| photos | | 最多 5 张 `{ src }` |
| blessingSeries | | journey_to_the_west / zodiac / fairy_tale / custom |
| preset | | 风格预设（映射配色与默认 series） |
| orientation | | portrait / landscape |
| message | | 祝福语 |
| musicEnabled | | 默认 true；BGM=`JoyfulChildren.mp3` |
| birthdaySongSource | | 生日歌路径 |
| customCharacterImages/Videos | | 覆盖系列资源 |
| chapterOverrides | 高级 | 按章节 id 深合并 |
| seed / fps | 高级 | |

`blessingSeries` **优先于** preset 内默认 series。

## 扩展指南

### 新增祝福系列

1. 新增 `src/recipe/series/your-series.ts`
2. 在 `src/recipe/series/index.ts` 注册
3. 同步更新 `schemas/user.ts` 与 API `VALID_SERIES` / presets（若对外暴露）
4. 放入 `public/` 图片与可选绿幕 mp4

### 新增章节

1. 新增 `src/recipe/chapters/your-chapter.ts(x)` 实现 `ChapterFactory`
2. 在 `chapters/index.ts` 的 `CHAPTER_FACTORIES` 注册
3. 在 `timeline-defaults.json` 与 `templates/classic.ts` 映射中加 slot
4. **同步** `api/effect-configs/kids-birthday-timeline.json` 秒数

### 高级覆盖

```json
{
  "name": "小明",
  "chapterOverrides": [
    { "id": "A_magicOpening", "background": { "type": "color", "color": "#000" } }
  ]
}
```

走 `mergeChapterConfigs`。

## Remotion

- 主 Composition：`KidsBirthday`（User Schema）
- 调试：`KidsBirthdayInternal`（marquee/watermark/radialBurst）
- 动态时长：`calculateMetadata` → `estimateKidsBirthdayDuration`

## 动画注意

1. `spring({ frame })` 保证 frame ≥ 0  
2. `interpolate` 使用 `extrapolateRight: 'clamp'`  
3. HSL hue ≥ 0  

## 依赖

- `effects/shared`：StoryPanel、StoryChapter、嵌套参数类型  
- 各 `effects/*-effect`：经 `EffectRenderer` 作为 plusEffects  

## API

```
POST /api/render/kids-birthday-effect
{ "name": "小明", "photos": [{ "src": "..." }], "preset": "boy_rocket" }

GET /api/projects/kids-birthday-effect/params
→ paramMode: simplified + presets + timeline
```
