# 儿童生日祝福视频生成器

基于 Remotion 的儿童生日祝福视频，**配置驱动 + 精简用户参数 + 动态时长**。

## 快速开始

```bash
# 根目录
npm install

# Studio
cd project && npm run dev

# 渲染
npm run render:kids-birthday
```

## 最少参数

```json
{ "name": "小明" }
```

推荐：

```json
{
  "name": "小明",
  "age": 6,
  "photos": [{ "src": "your-photo.png" }],
  "blessingSeries": "journey_to_the_west",
  "preset": "general",
  "orientation": "portrait"
}
```

## 功能

### 章节时间轴（classic，动态）

| 章节 | 说明 | 条件 |
|------|------|------|
| 倒计时 | 3-2-1 开场 | 始终 |
| 魔法开场 | 主角色入场 | 始终 |
| 成长庆祝 | 彩带 / 烟花 / 名字 | 始终 |
| 照片互动 1–2 | 魔法圈照片 + 特效 | 有照片 |
| 生日歌 | 多角色 + 蛋糕 | 始终 |
| 未来祝福 | 夜空流星 | 始终 |

无照片总时长约 **61s**，有照片约 **121s**（24fps）。

### 祝福系列

- `journey_to_the_west` 西游记
- `zodiac` 生肖
- `fairy_tale` 童话
- `custom` 自定义资源

### 风格预设

`journey_to_the_west` | `zodiac` | `girl_unicorn` | `boy_rocket` | `animal` | `general`

### 方向

- `portrait` 720×1280
- `landscape` 1280×720

## 目录

```
project/src/
├── recipe/                 # 配方：系列 / 章节 / 模板 / compile
├── compositions/           # 薄 Composition
├── schemas/user.ts         # L0 Schema
├── components/             # 场景子组件 + EffectRenderer
└── Root.tsx
```

## API

```bash
curl -X POST http://localhost:3001/api/render/kids-birthday-effect \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"小明\",\"photos\":[{\"src\":\"熊猫.png\"}]}"
```

参数说明：`GET /api/projects/kids-birthday-effect/params`

## 扩展

见 [AGENTS.md](./AGENTS.md)：加系列 / 加章节 / `chapterOverrides`。

## 说明

- BGM 默认 `JoyfulChildren.mp3`
- 生日歌需传 `birthdaySongSource`（如 `birthday_audio.mp3`）
- 高级引擎层（走马灯等）见 Studio `KidsBirthdayInternal`，不在默认用户 API 中
