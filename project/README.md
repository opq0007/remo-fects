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
| 倒计时 | 3-2-1 开场（魔法夜空紫） | 始终 |
| 魔法开场 | 主角色入场 + 开场白（含名字） | 始终 |
| 照片互动 1 | 魔法圈照片 + 特效 + 陪伴角色讲解 | ≥1 张照片 |
| 照片互动 2 | 照片 + 绿幕角色巡游（照片不足时循环复用） | ≥1 张照片 |
| 成长庆祝 | 彩带 / 烟花 / 名字弹跳 | 始终 |
| 生日歌 | 多角色 + 蛋糕 + 许愿 | 始终 |
| 未来祝福 | 暮光流星 + 角色寄语 | 始终 |
| 梦想种子 | 梦想职业泡泡（`dreams` 参数） | 始终 |
| 温暖收尾 | 名字 + 祝福语（`message`）+ 日落 | 始终 |

时长随照片数量自动伸缩：无照片 **74s**，有照片 **124s**（照片不足 2 张时 D 模块循环复用已上传照片）。每章节有专属转场，陪伴角色台词把章节串成连续故事；角色图片缺失时自动回退内置卡通形象。

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
