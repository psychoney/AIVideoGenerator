# AI Video Generator

FRAMEMINT — AI 视频生成终端。

设计风格参考 [Hermes Agent](https://hermes-agent.nousresearch.com/desktop) 的终端美学（等宽/像素字体、扫描线、ASCII 装饰、硬直角），配色为高对比蓝白：`#ffffff` 纯白底 + `#0018f0` 电光蓝 + `#0a1542` 深海军蓝，终端日志区为深蓝 CRT 屏。功能参考 [VEED AI Video](https://www.veed.io/tools/ai-video)（文生视频 / 图生视频 / 脚本转片 / 数字人口播、多模型路由、配音字幕、模板库、credits 计费）。

## 静态主站（仓库根目录，全英文）

- `index.html` / `styles.css` / `app.js` — 零依赖纯静态页面
- 包含：生成器控制台（TEXT / IMAGE / SCRIPT / AVATAR 四模式 + 6 模型选择 + 实时成本估算 + 终端日志渲染动画 + 渲染产物输出条，点 ▶ 内嵌播放示例视频）、OUTPUT.SAMPLES 视频示例区（`assets/video-*.mp4`，悬停即播）、模型注册表（terminal 风格表格）、全链路能力清单、三步工作流、可筛选模板库、credits 定价、FAQ

本地预览：

```bash
python3 -m http.server 8000
# 打开 http://localhost:8000
```

## Next.js 应用（openjourney-relay/）

- `/`：展示主页
- `/login`：MVP 登录页，登录后进入制作台
- `/studio`：AI 视频中转制作台，支持模型选择、任务类型、路由策略和示例生成流程

## 本地运行

```bash
cd openjourney-relay
npm install
npm run dev
```

默认访问：

```bash
http://localhost:3000
```

## 生产构建

```bash
cd openjourney-relay
npm run build
npm run start
```

## 部署说明

测试服务器当前使用 systemd 运行：

```bash
systemctl status framemint-relay
systemctl restart framemint-relay
journalctl -u framemint-relay -f
```

线上测试地址：

```bash
http://130.94.115.156
```
