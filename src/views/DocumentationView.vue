<script setup>
/**
 * 课程说明文档（网页内嵌，非 README）
 * 四部分：研究问题、设计决策、数据来源与引用、开发流程
 */
</script>

<template>
  <article class="doc dash-card anim-rise">
    <header class="doc__header">
      <p class="doc__eyebrow">课程文档 · Documentation</p>
      <h1 class="doc__title">《发展差距透镜》说明文档</h1>
    </header>

    <!-- （1）研究问题 -->
    <section class="doc__section" aria-labelledby="doc-rq">
      <h2 id="doc-rq" class="doc__h2">（1）研究问题</h2>
      <ol class="doc__list doc__list--numbered">
        <li>
          <strong>截面位置：</strong>在选定年份，一国在<strong>名义 GDP、人均 GDP、GDP 同比增速与失业率</strong>构成的多维组合下，大致处于全球分布的哪一区域（地图与排名视图可共同定位）？
        </li>
        <li>
          <strong>水平与增速：</strong>对同一国家，2015–2024 年间<strong>名义 GDP 水平</strong>与<strong>同比增速</strong>如何联动变化？是否存在「总量扩张但增速放缓」或「增速回升而人均仍偏低」等可复述模式（时间序列与同比模块）？
        </li>
        <li>
          <strong>人均与劳动市场：</strong>在控制年份与指标后，<strong>人均 GDP</strong>与<strong>失业率</strong>在同一截面内呈现何种粗粒度关系（例如高人均是否伴随更低失业率需结合国家样本逐例核对，地图—折线联动可支持）？
        </li>
        <li>
          <strong>两国结构差异：</strong>两国在四项指标上的差距，主要体现在<strong>绝对水平</strong>（名义/人均）还是<strong>波动节奏</strong>（增速、失业率变化）？雷达图上的相对形状能否概括这种结构（对比页）？
        </li>
      </ol>
    </section>

    <!-- （2）设计决策 -->
    <section class="doc__section" aria-labelledby="doc-design">
      <h2 id="doc-design" class="doc__h2">（2）设计决策</h2>

      <h3 class="doc__h3">图表类型与取舍</h3>
      <ul class="doc__list">
        <li>
          <strong>地图：</strong>用于回答「此刻在全球的位置」。颜色编码连续数值（深蓝—浅青渐变），地理形状提供国家间邻域上下文。
          <em>替代方案：</em>仅使用表格或条形排名——可读国家名与排序，但难以一眼获得区域集聚与邻国对比。
          <em>选择理由：</em>地图在<strong>空间格局</strong>上优于纯排名；排名图作为并列视图补足精确序位。
        </li>
        <li>
          <strong>折线图：</strong>展示多年主指标与增速演变，强调<strong>趋势与拐点</strong>。
          <em>替代方案：</em>每年一根柱的柱状图——适合离散类别比较，但对 10 年连续序列会显得碎片化，趋势感知弱于折线。
          <em>选择理由：</em>折线在时间维度上的<strong>连续性</strong>与<strong>斜率可读性</strong>更符合「演变」分析目标。
        </li>
        <li>
          <strong>排名 / 条形图：</strong>在空间页将多国同一年份并排，突出序位与头部国家。
          <em>替代方案：</em>饼图——在多国场景下扇区过多，角度比较不直观；故未采用。
        </li>
        <li>
          <strong>雷达图（对比页）：</strong>将<strong>量纲不同</strong>的四项指标在同一图中作<strong>两国相对轮廓</strong>对比；轴上展示为按两国较大值归一后的相对刻度，Tooltip 仍显示原始值，避免误读绝对大小。
          <em>替代方案：</em>四张小 multiples 折线——信息完整但占用版面且难以一眼比较「形状」。
        </li>
      </ul>

      <h3 class="doc__h3">视觉编码</h3>
      <p class="doc__p">
        <strong>颜色：</strong>主序列为高对比蓝青系，强调数据序列与 UI 强调色一致；地图用连续色带表示数值强度，并配合图例刻度。 <strong>位置与长度：</strong>折线纵轴为指标值或同比，横轴为年份；条形图为国家沿一维序排列。 <strong>动画：</strong>统一时长与缓动，用于路由切换与图表更新，目的是提示「数据已随筛选变化」，而非装饰性闪烁。
      </p>

      <h3 class="doc__h3">交互设计</h3>
      <ul class="doc__list">
        <li><strong>筛选：</strong>指标、主国家、对比国、年份与播放轴；与路由 query 同步，支持刷新与分享链接。</li>
        <li><strong>联动：</strong>离开对比页时关闭对比态，避免路由与本地状态竞态；图表在布局变化时统一 <code>resize</code>。</li>
        <li><strong>页面分工：</strong>空间 / 时间 / 对比三分法，降低单屏信息过载。</li>
      </ul>
    </section>

    <!-- （3）数据来源与引用 -->
    <section class="doc__section" aria-labelledby="doc-data">
      <h2 id="doc-data" class="doc__h2">（3）数据来源与引用</h2>
      <ul class="doc__list">
        <li>
          <strong>数据：</strong>世界银行（World Bank）公开数据，通过课程提供的 CSV（World Bank Data API 导出格式）接入；指标包括
          NY.GDP.MKTP.CD（GDP，现价美元）、NY.GDP.MKTP.KD.ZG（GDP 增长率）、NY.GDP.PCAP.CD（人均 GDP）、SL.UEM.TOTL.ZS（失业率）；时间范围为2015-2024。
        </li>
        <li>
          <strong>地理底图：</strong>项目中使用的世界地图 GeoJSON 用于与国家名称匹配；来源随代码库内资源文件标注。
        </li>
        <li>
          <strong>工具与库：</strong>Apache ECharts（地图与统计图）、Vue 3、Vue Router、Vite；开发依赖见 <code>package.json</code>。
        </li>
        <li>
          <strong>可视化参考：</strong>世界银行官网指标页、ECharts 官方图表示例（地图与笛卡尔坐标系组合）作为布局与配色克制程度的参考。
        </li>
      </ul>
    </section>

    <!-- （4）开发流程 -->
    <section class="doc__section" aria-labelledby="doc-dev">
      <h2 id="doc-dev" class="doc__h2">（4）开发流程</h2>
      <p class="doc__p">
        整体流程为：<strong>数据管道（CSV → JSON）→ 前端状态与路由 → 各视图图表实现 → 交互与 URL 同步 → 样式统一 → 构建与部署验证</strong>。
      </p>
      <ul class="doc__list">
        <li>
          <strong>总耗时（估算）：</strong>约 <strong>22–30 工时</strong>（含需求对齐、实现与文档）。个人节奏不同，此区间为诚实估算。
        </li>
        <li>
          <strong>最耗时部分：</strong>
          <ul class="doc__sublist">
            <li><strong>数据处理与校验：</strong>统一四国别 CSV、年份列对齐、国名与地图要素匹配。</li>
            <li><strong>图表调试：</strong>ECharts 地图注册、多图实例 resize、雷达归一与 Tooltip 一致性。</li>
            <li><strong>交互与路由：</strong>筛选状态与 query 双向同步、对比模式仅在对比页生效等边界情况。</li>
          </ul>
        </li>
        <li>
          <strong>主要问题与处理：</strong>
          <ul class="doc__sublist">
            <li><strong>子路径部署：</strong>GitHub Pages 使用仓库子路径时，需配置 Vite <code>base</code>、路由 history 的 <code>BASE_URL</code>，并为 SPA 提供 404 回退以避免刷新白屏。</li>
            <li><strong>资源路径：</strong>静态资源与入口 HTML 在构建后必须带统一前缀，避免线上 404。</li>
            <li><strong>数据路径：</strong>构建脚本需在 CI 与本地均能定位 CSV 目录，采用「提交包内目录 + 开发时上级目录」回退策略。</li>
          </ul>
        </li>
      </ul>
    </section>
  </article>
</template>

<style scoped>
.doc {
  padding: 26px 28px 30px;
  max-width: 72ch;
}

.doc__header {
  margin-bottom: 28px;
  padding-bottom: 22px;
  border-bottom: 1px solid var(--dash-card-border);
}

.doc__eyebrow {
  margin: 0 0 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #38bdf8;
}

.doc__title {
  margin: 0 0 12px;
  font-size: clamp(1.25rem, 2vw, 1.5rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.25;
  color: #f8fafc;
}

.doc__section {
  margin-bottom: 28px;
}

.doc__section:last-of-type {
  margin-bottom: 20px;
}

.doc__h2 {
  margin: 0 0 12px;
  font-size: 1.05rem;
  font-weight: 800;
  color: #e2e8f0;
  letter-spacing: -0.02em;
}

.doc__h3 {
  margin: 18px 0 10px;
  font-size: 0.9375rem;
  font-weight: 700;
  color: #cbd5e1;
}

.doc__p {
  margin: 0 0 12px;
  font-size: 0.875rem;
  line-height: 1.7;
  color: var(--dash-muted);
}

.doc__list {
  margin: 10px 0 0;
  padding-left: 1.2rem;
  font-size: 0.875rem;
  line-height: 1.72;
  color: var(--dash-muted);
}

.doc__list--numbered {
  list-style: decimal;
}

.doc__list li {
  margin-bottom: 12px;
}

.doc__list strong {
  color: #e2e8f0;
  font-weight: 600;
}

.doc__list em {
  font-style: normal;
  color: #7dd3fc;
  font-weight: 600;
}

.doc__sublist {
  margin: 8px 0 0;
  padding-left: 1.1rem;
  list-style: disc;
  color: var(--dash-muted);
}

.doc__sublist li {
  margin-bottom: 6px;
}

.doc code {
  font-size: 0.8em;
  padding: 0.1em 0.35em;
  border-radius: 4px;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.2);
  color: #bae6fd;
}
</style>
