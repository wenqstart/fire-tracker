# FIRE Tracker 🔥

以财富自由早日退休为目标驱动的个人/家庭资产管理应用

## 功能特性

- 📊 **资产概览** - 实时追踪净资产、总资产、总负债
- 💰 **账户管理** - 管理银行账户、投资账户、公积金等
- 💳 **负债管理** - 追踪房贷、车贷、信用卡等负债
- 📝 **记账功能** - 记录收支、分类统计
- 🎯 **FIRE目标** - 基于4%法则的退休规划
- 📱 **跨平台** - 支持 Web、iOS、Android

## 技术栈

- **框架**: Next.js 14 + TypeScript
- **样式**: Tailwind CSS
- **状态管理**: Zustand
- **本地存储**: Dexie.js (IndexedDB)
- **移动端**: Capacitor

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
```

### 移动端构建

```bash
# 添加平台
npm run cap:add:android
npm run cap:add:ios

# 同步资源
npm run cap:sync

# 打开原生项目
npm run cap:open:android
npm run cap:open:ios
```

## 项目结构

```
fire-tracker/
├── src/
│   ├── app/              # 页面 (Next.js App Router)
│   ├── components/       # 组件
│   ├── lib/              # 工具库
│   │   ├── db.ts         # 数据库
│   │   ├── store.ts      # 状态管理
│   │   ├── utils.ts      # 工具函数
│   │   └── fire-calculator.ts  # FIRE计算
│   └── types/            # 类型定义
├── public/               # 静态资源
└── capacitor.config.ts   # Capacitor配置
```

## FIRE 计算说明

应用使用 **4% 法则** 进行退休规划：

- 目标金额 = 年支出 × 25
- 年度被动收入 = 投资组合 × 4%
- 储蓄率 = (收入 - 支出) / 收入

## License

MIT
