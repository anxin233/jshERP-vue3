# 图表栈迁移：viser-vue → @antv/g2plot

## 变更摘要

| 项 | 变更前 | 变更后 |
|----|--------|--------|
| 依赖 | `viser-vue@2` | `@antv/g2plot@2.4` |
| 全局注册 | `main.js` → `app.use(Viser)` | 已移除 |
| 实现方式 | 声明式 `<v-chart>` 子组件 | `ref` 容器 + G2Plot 命令式渲染 |
| 公共逻辑 | — | `components/chart/mixins/g2plotChartMixin.js` |

## 已迁移组件（`src/components/chart/`）

| 文件 | G2Plot 类型 | 说明 |
|------|-------------|------|
| `Bar.vue` | Column | 首页销售/采购/零售统计 |
| `MiniArea.vue` | Area | 迷你面积图 |
| `MiniBar.vue` | Column | 迷你柱状图 |
| `LineChartMultid.vue` | Line | 多系列折线（DataSet fold） |
| `Pie.vue` | Pie | 饼图（DataSet percent） |
| `BarMultid.vue` | Column | 分组柱状图 |
| `BarAndLine.vue` | DualAxes | 柱+线双轴 |
| `AreaChartTy.vue` | Area | 面积+折线 |
| `StackBar.vue` | Bar | 横向堆叠条 |
| `Liquid.vue` | Liquid | 水波图（多实例） |
| `Radar.vue` | Radar | 雷达图 |
| `DashChartDemo.vue` | Gauge | 仪表盘演示 |
| `TransferBar.vue` | Column | 柱状图（props: data） |
| `IndexBar.vue` | Column | 首页柱状演示 |

## 无需迁移（无 viser 依赖）

`MiniProgress.vue`、`Trend.vue`、`RankList.vue`、`mixins/ChartMixins.js`

## 业务引用

| 路径 | 使用组件 |
|------|----------|
| `views/dashboard/IndexChart.vue` | `Bar`（×3） |

其余 chart 组件保留供 Jeecg 模板/后续报表直接 `import` 使用，对外 props 名称未改。

## 验证

```bash
cd jshERP-web && npm install && npm run build
```

浏览器：登录后打开首页仪表盘，确认三块「销售/零售/采购统计」柱状图无控制台报错。
