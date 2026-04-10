# 课程提交说明（world-vis）

## 项目说明

本项目是一个**可交互的世界银行指标可视化网站**（Vue 3 + Vite + ECharts）。用户可在不同视图间切换，查看各国 GDP、GDP 增速、人均 GDP、失业率等指标在时间与空间维度上的对比与地图展示。

## 环境要求

- Node.js：`^20.19.0` 或 `>=22.12.0`（见 `package.json` 的 `engines` 字段）

## 如何运行

在 **`submission/` 目录下**执行：

```bash
npm install
npm run dev
```

浏览器打开终端提示的本地地址（一般为 `http://localhost:5173`）。

构建生产包：

```bash
npm run build
```

预览构建结果：

```bash
npm run preview
```

## 目录结构说明（核心可视化代码）

| 路径 | 作用 |
|------|------|
| **`src/`** | **核心前端源码**：页面、图表组件、路由、数据加载与业务逻辑，提交时请以本目录为主阅读。 |
| `src/views/` | 各功能页面（首页、空间视图、时间序列、国家对比等）。 |
| `src/components/` | 地图、折线图、雷达图、控制栏等可视化与 UI 组件。 |
| `src/composables/` | 数据获取、路由与筛选同步、数值格式化等组合式逻辑。 |
| `src/data/` | CSV 解析、指标配置、运行时加载逻辑；`generated/` 由脚本生成，勿手改。 |
| `src/router/` | Vue Router 路由定义。 |
| `src/assets/` | 全局样式、地图 GeoJSON（`world.json`）等静态资源。 |
| `public/` | 构建时原样复制的公共资源（如图标）。 |
| `scripts/` | `generate-worldbank-data.mjs`：从世界银行 CSV 生成 `src/data/generated/*.json`（`npm run dev` / `npm run build` 会自动执行）。 |
| `worldbank-csv/` | **本提交包自带**的世界银行原始 CSV 目录（与作业根目录下文件夹同名），保证解压到任意路径均可生成数据。 |
| `index.html` | Vite 入口 HTML。 |
| `vite.config.js` | Vite 构建与 `@` 路径别名配置。 |
| `package.json` / `package-lock.json` | 依赖与脚本定义、锁定版本。 |
| `jsconfig.json` | 编辑器路径提示（可选）。 |

## 备注

- 请勿提交 `node_modules/`、`dist/` 等目录；安装与构建命令见上文。
- 若你在完整作业仓库根目录开发（`world-vis` 与 CSV 同级），数据仍可从上级目录读取；本 `submission` 包通过 `worldbank-csv/` 实现**单文件夹自包含**。
