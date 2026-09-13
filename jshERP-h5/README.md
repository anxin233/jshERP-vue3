# jshERP-h5（管伊佳ERP 移动端）

基于 Vue 3 + Vite + Vant 4 的移动端 H5，作为 `jshERP-web`（PC 端）的补充，面向门店开单、仓库查询与管理审批场景。

- 后端：复用 `jshERP-boot` 现有接口（**零改动**）
- 方案文档：`../25-移动端H5开发方案与实施步骤.md`
- 执行与测试：`../26-移动端H5实施执行计划.md`（P0~P8 分步执行，每步必须通过测试）

## 常用命令

```bash
npm install
npm run dev       # http://localhost:3001（代理 /jshERP-boot → localhost:9999）
npm run build     # 产物 dist/（部署到 /m/）
npm run preview   # http://localhost:4174
npm run lint
```

## 环境变量

| 文件 | 变量 | 值 |
|---|---|---|
| `.env.development` | `VITE_APP_PUBLIC_PATH` / `VITE_APP_API_BASE` | `/` / `/jshERP-boot` |
| `.env.production` | `VITE_APP_PUBLIC_PATH` / `VITE_APP_API_BASE` | `/m/` / `/jshERP-boot` |

## 目录结构

```text
src/
├── api/         # 请求封装与接口（P1 起实现）
├── components/  # 业务公共组件（P2 起实现）
├── constants/   # 业务常量
├── layout/      # TabBar 布局
├── router/      # 静态路由
├── store/       # Pinia
├── styles/      # 全局样式
├── utils/       # 工具函数
└── views/       # 页面
```

## 测试证据

每阶段测试结果记录在 `docs/test-evidence/`，缺陷记录在 `docs/bugs.md`。
