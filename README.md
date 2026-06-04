# AI Video Generator

FrameMint Relay 是一个基于开源 AI 生成界面改造的 AI 视频中转站 MVP。

当前主要应用位于：

```bash
openjourney-relay/
```

## 功能结构

- `/`：参考 VEED 风格的简洁展示主页
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
