# 儿童生日祝福视频生成器

基于 Remotion 框架的儿童生日祝福视频生成器。传一个名字即可出片：角色、照片互动、梦想泡泡、生日歌、温暖收尾全部自动编排，角色图片缺失时自动回退内置卡通形象，开箱即渲染。

## 快速开始

```bash
# 安装依赖（在仓库根目录执行）
npm install

# 启动 Remotion Studio 预览（仓库根目录执行；项目目录内则 npm run dev）
npm run dev:kids-birthday --workspace=project

# 渲染完整视频（项目目录内）
npm run render:kids-birthday
```

## 通过 API 生成

```bash
# 最简调用：只传名字（其余全部使用默认配置）
curl -X POST http://localhost:3001/api/render/kids-birthday-effect \
  -H "Content-Type: application/json" \
  -d '{ "name": "小明" }'

# 常用参数
curl -X POST http://localhost:3001/api/render/kids-birthday-effect \
  -H "Content-Type: application/json" \
  -d '{
    "name": "小雨",
    "age": 5,
    "message": "愿你永远快乐！",
    "blessingSeries": "journey_to_the_west",
    "subStyle": "girl_unicorn",
    "photos": [{ "src": "photo1.png" }, { "src": "photo2.png" }],
    "dreams": ["astronaut", "artist"],
    "duration": 60
  }'
```

返回 jobId 后用 `GET /api/jobs/:jobId` 轮询状态，`GET /api/download/:jobId` 下载成片。

## 核心参数

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `name` | 必填 | 主角名字（1-10 字），片头弹跳展示 + 片尾署名 |
| `age` | 不传则不显示 | 年龄角标（1-18） |
| `message` | 愿你每天开心成长 | 祝福语，显示在片尾收尾模块 |
| `blessingSeries` | journey_to_the_west | 角色系列：西游记 / zodiac 生肖 / fairy_tale 童话 / custom 自定义 |
| `subStyle` | general | 配色主题：girl_unicorn 粉紫 / boy_rocket 蓝绿 / animal 绿黄 / general 黄蓝 |
| `photos` | [] | 照片列表（相对 public 目录，最多 5 张），**决定视频时长** |
| `dreams` | astronaut, artist, racer | 梦想职业列表（最多 5 个），显示在梦想泡泡模块 |
| `duration` | 124 | 期望输出时长（秒），实际按内容时长截断，详见下方时长规则 |
| `blessingText` / `blessingFontSize` | 生日快乐 / 60 | 主祝福文字及字号 |
| `nameFontSize` / `nameColor` / `showAge` | 120 / 主题色 / true | 名字样式 |
| `customCharacterImages` / `customCharacterVideos` | - | 自定义角色资源（按索引覆盖系列默认） |
| `musicEnabled` / `musicTrack` | true / JoyfulChildren | 背景音乐（曲目为 public 下 mp3 文件名，不含扩展名） |
| `birthdaySongSource` | birthday_audio.mp3 | 生日歌音频（G 模块独立播放） |
| `chapterList` | - | 高级定制：按 id 与默认章节配置合并 |

## 视频时长规则（自动伸缩）

总时长随照片数量变化，Studio 预览与 API 渲染一致，不会出现黑屏等待：

| 照片数 | 总时长 | 模块构成 |
|--------|--------|----------|
| 0 张 | 74 秒 | 倒计时4s + 开场2s + 庆祝10s + 生日歌35s + 未来祝福10s + 梦想10s + 收尾3s |
| 1 张 | 99 秒 | + 照片互动1 (25s) |
| 2 张及以上 | 124 秒 | + 照片互动2 (25s) |

`duration` 参数是输出上限：传 `60` 输出前 60 秒短片；传大于内容时长的值输出完整视频。

## 角色与资源

每个祝福系列自带默认角色（含问候语）。角色图片（`public/pic/*.png`）暂未内置时，会自动回退到气质对位的**内置卡通形象**（如孙悟空→生肖猴、猪八戒→生肖猪、白龙马→生肖马），视频始终可渲染、无 broken 图片。

- 真实图片就位：把图片放入 `project/public/pic/`（文件名与 `src/schemas/index.ts` 中 `imageSrc` 一致），并同步更新该文件的 `AVAILABLE_PUBLIC_ASSETS` 清单
- 完全自定义：`blessingSeries: "custom"` + `customCharacterImages` / `customCharacterVideos`（须提供至少一项）
- 角色视频（绿幕）用于庆祝与照片互动模块，当前内置 `孙悟空.mp4`

## 已内置资源（project/public/）

| 文件 | 用途 |
|------|------|
| JoyfulChildren.mp3 | 背景音乐（默认曲目） |
| birthday_audio.mp3 | 生日歌（G 模块） |
| countDown_common.mp3 / countDown_game.mp3 | 倒计时音效 |
| 孙悟空.mp4 | 西游记系列绿幕角色视频 |
| 熊猫.png | 示例照片 |

## 模块结构（124s 完整版）

| 模块 | 名称 | 时长 | 内容 |
|------|------|------|------|
| 0 | 倒计时 | 4s | 3-2-1 弹跳数字 + 音效 |
| A | 魔法开场 | 2s | 黑屏 → 主角色入场 |
| C | 照片互动1 | 25s | 魔法圆环揭示照片1 + 文字烟花雨 |
| D | 照片互动2 | 25s | 照片2 + 角色绿幕视频巡游 + 飘心 |
| F | 成长庆祝 | 10s | 名字弹跳 + 祝福语 + 彩带烟花 |
| G | 生日歌 | 35s | 四角色环绕庆贺 + 生日歌 + 照片墙 |
| H | 未来祝福 | 10s | 流星 + 角色寄语字幕 |
| I | 梦想种子 | 10s | 梦想职业泡泡（`dreams` 参数） |
| J | 温暖收尾 | 3s | 名字 + 祝福语（`message` 参数）+ 彩带 |

## 目录结构

```
project/
├── public/                 # 资源目录（图片/音频/视频）
├── src/
│   ├── components/         # 分镜内容组件（名字弹跳/照片/梦想泡泡等）
│   ├── compositions/       # 主组合（章节编排逻辑）
│   ├── schemas/index.ts    # 参数 Schema + 时长公式 + 资源清单 + 系列配置
│   ├── types/index.ts      # 角色/颜色/模块常量
│   └── utils/              # 配色与章节合并工具
├── AGENTS.md               # AI 开发上下文
└── package.json
```

## 开发注意

- 视频总时长由 `schemas/index.ts` 的 `computeContentPlan` 统一计算，Studio（calculateMetadata）与 API 渲染（截断公式）共享同一份逻辑，**修改模块时长时必须同步更新该函数**
- `spring()` 的 frame 参数必须 ≥ 0；`interpolate()` 必须设置 `extrapolateRight: 'clamp'`
- 新增章节后记得更新 README 的时长规则表与 `computeContentDuration`（api/effect-configs/kids-birthday-effect.js 中有同步副本）
