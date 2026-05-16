# BattleMap 作战地图 — 重构指南（prompt.md）

> 本文件是大模型重构 BattleMap 作战地图系统的完整提示词指南。
> 结合 PRD.md 一起使用，可以基于此文档从零重建本系统。
> 版本：v2.0.2 | 日期：2026-05-13 | 状态：图谱交互优化版

---

## 一、系统定位与目标

BattleMap 是一个面向**金融租赁行业**的产业客户作战指挥平台，核心目标是：

1. **一张地图作战全局**：全国产业园区热力地图 + 产业链拓扑 + 客户单体视图
2. **数据驱动闭环**：工单派发 → 执行 → 跟进全链路管理
3. **AI 辅助决策**：AI 机器人提供问答和商机发现
4. **数据自主可控**：支持 CSV/JSON 批量导入，导入后所有视图实时联动

---

## 二、技术架构

### 2.1 技术栈

| 层级 | 技术选型 |
|------|---------|
| UI 框架 | React 18 + TypeScript 5 |
| 路由 | react-router-dom v6 |
| 状态管理 | Zustand |
| 样式 | Tailwind CSS + CSS 变量（双主题） |
| 图表 | ECharts 5 |
| 地图 | ECharts Geo + GeoJSON（中国地图，按省份懒加载） |
| 图标 | lucide-react |
| 构建 | Vite 8 |
| 包管理 | npm |

### 2.2 项目结构

```
battlemap/
├── frontend/
│   ├── src/
│   │   ├── App.tsx                    # 路由注册 + Toast 容器
│   │   ├── index.css                  # 全局样式 + CSS 变量主题系统
│   │   │
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   │   ├── AppLayout.tsx     # 根布局（Sidebar + Outlet）
│   │   │   │   └── Sidebar.tsx        # 侧边导航栏（NavLink × 5）
│   │   │   ├── Dashboard/
│   │   │   │   ├── Header.tsx         # 顶部状态栏（数字动画）
│   │   │   │   ├── LeftPanel.tsx       # 左侧控制面板
│   │   │   │   ├── RightPanel.tsx      # 右侧信息面板
│   │   │   │   └── BottomBar.tsx       # 底部状态条
│   │   │   ├── Map/
│   │   │   │   └── ChinaMap.tsx        # 全国园区散点+飞线地图
│   │   │   ├── Robot/
│   │   │   │   ├── FloatingRobot.tsx   # AI 入口（float/inline）
│   │   │   │   └── RobotChat.tsx        # AI 对话窗口
│   │   │   └── CustomerView/
│   │   │         └── CustomerRelationPanel.tsx  # 客户关系图谱
│   │   │
│   │   ├── pages/                      # 路由页面组件
│   │   │   ├── MacroPanel.tsx          # 宏观态势（路由：/）
│   │   │   ├── IndustryChain.tsx       # 产业链沙盘（路由：/chain）
│   │   │   ├── CustomerView.tsx        # 客户全景（路由：/customer）
│   │   │   ├── TaskCenter.tsx           # 个人工作台（路由：/tasks）
│   │   │   ├── RuleConfig.tsx           # 规则配置（路由：/rules）
│   │   │   └── TaskDataImport.tsx       # 数据录入面板（嵌入 TaskCenter）
│   │   │
│   │   ├── data/                        # 数据层（核心）
│   │   │   ├── types.ts                 # 全量 TypeScript 类型定义
│   │   │   ├── importer.ts              # v2.0 数据导入引擎
│   │   │   ├── exporter.ts              # v2.0 数据导出引擎
│   │   │   ├── mockDataV2.ts            # v2.0 示例数据（17 类）
│   │   │   ├── dataIndex.ts             # 索引构建 + 查询函数
│   │   │   ├── geoLoader.ts             # GeoJSON 按需加载器
│   │   │   ├── robotData.ts             # AI 机器人配置
│   │   │   ├── relationLinkData.ts      # 客户关系链路数据
│   │   │   ├── mockData.ts              # 旧版入口（兼容层）
│   │   │   ├── importers.ts             # 旧版 CSV 解析器
│   │   │   ├── firmData.ts              # 旧版企业数据
│   │   │   ├── parkData.ts              # 旧版园区数据
│   │   │   ├── chainData.ts             # 旧版产业链数据
│   │   │   ├── teamData.ts              # 旧版团队数据
│   │   │   ├── workOrderData.ts         # 旧版工单数据
│   │   │   ├── opportunityData.ts        # 旧版商机数据
│   │   │   ├── customerData.ts          # 旧版客户数据
│   │   │   ├── metricData.ts            # 旧版指标数据
│   │   │   ├── ruleData.ts              # 旧版规则数据
│   │   │   ├── followData.ts            # 旧版跟进记录
│   │   │   ├── supplementData.ts        # 补录记录
│   │   │   ├── dailyPushData.ts         # 每日推送
│   │   │   └── geo/                     # 各省份 GeoJSON（约 30+ 个）
│   │   │
│   │   ├── store/
│   │   │   ├── data.ts                  # Zustand 全局数据 store
│   │   │   └── toast.ts                  # Toast 通知 store
│   │   │
│   │   ├── hooks/
│   │   │   └── useChartTheme.ts         # ECharts 主题 hook
│   │   │
│   │   └── services/
│   │       └── apiService.ts             # API 服务层
│   │
│   ├── public/
│   │   └── data/
│   │       └── chinaGeoJSON.json         # 全国地图 GeoJSON
│   │
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── PRD.md                                # 产品需求文档
└── prompt.md                             # 本文件
```

---

## 三、数据流转架构

### 3.1 核心数据流

```
用户上传 CSV/JSON 文件
    ↓
importer.ts → importFile(objectType, text, fileType)
    ↓
parseXxx(text, fileType)  [CSV行解析 或 JSON反序列化]
    ↓
_db.{table} = parsedData    [写入内存模拟数据库]
    ↓
syncToStore(objectType, data)  [关键：必须同步到 Zustand store！]
    ↓
useDataStore.setState({ [dataType]: data, ... })  [触发 React 重渲染]
    ↓
rebuildIndex()  [重建 DataIndex 全局索引]
    ↓
组件通过 useDataStore(s => s.{field}) 感知变化并重渲染
```

### 3.2 导出链路

```
getAll(objectType)   [从 _db 读取最新数据]
    ↓
exportCurrentData → downloadBlob(content, filename, mimeType)
exportAllData     → 遍历所有类型导出全量 JSON
exportTemplateJSON → 从 TEMPLATE_JSON 常量导出空模板
exportTemplateCSV  → 从 OBJECT_TYPE_META 生成 CSV 表头+示例行
```

### 3.3 页面数据读取

所有页面通过 `useDataStore` 或自定义 `useObjectData` hook 读取数据：

```typescript
// 方式1：直接读取
const firms = useDataStore(s => s.firms);

// 方式2：通用 hook（支持导入后实时刷新）
const { data, count, source } = useObjectData('firm');

// 方式3：直接获取状态（用于 importer 内部）
const store = useDataStore.getState();
```

---

## 四、数据模型（types.ts）

### 4.1 核心类型速查

```typescript
// 行政区划（四级）
Province: { id, code, name, lng, lat }
City:     { id, code, name, provinceId, lng, lat }
District: { id, code, name, cityId, provinceId }
Street:   { id, name, districtId, cityId, provinceId, lng, lat }

// 行业与产业链
Industry:     { id, name, color, subIndustries[] }
SubIndustry:  { id, name, industryId, color }
IndustryChain:{ id, name, status, description, color }
ChainNode:    { id, chainId, name, stage, scale, activity, bankRatio, leaseRatio }

// 核心实体
Park:     { id, name, cityId, districtId, streetId, lng, lat, risk, scale,
            industries[], chainIds[], data: Record<MetricKey, number>,
            firmIds[], status, establishedYear }
Manager:  { id, name, surname, role, department, area, phone, email,
            leaderId, workOrderCount, opportunityCount, visitCount, status }
Firm:     { id, name, fullName, creditCode, parkIds[], industryIds[],
            subIndustryIds[], chainNodeIds[], rating, risk, scale,
            asset, revenue, establishedYear, primaryManagerId, coManagerIds[],
            indicators: FirmIndicator }

// 关系数据
Executive:     { id, firmId, name, title, phone, email, isLegalRep }
FirmRelation:  { id, sourceFirmId, targetFirmId, type, description, strength }

// 事件记录
VisitRecord:   { id, targetType, targetId, managerId, visitType, visitDate,
                 location, lbsVerified, subject, summary, nextStep, nextVisitDate }
WorkOrder:     { id, type, level, title, firmId, ownerId, creatorId,
                 deadline, status, lbsRequired, completedAt }
Opportunity:   { id, title, level, source, firmId, product, amount, irr,
                 term, probability, action, nextActionDate, ownerId, status }
DeployPlan:    { id, title, product, firmId, targetAmount, milestones[], ownerId, status }

// 指标数据
AdminData: Record<MetricKey, Record<ProvinceName, number>>

// 全局索引
DataIndex: { provinceIdToName, cityIdToName, firmIdToParkIds, firmIdToManagerId,
             parkIdToFirmIds, chainIdToNodeIds, ... }  [30+ 映射表]
```

### 4.2 MetricKey（14 种指标）

```typescript
type MetricKey =
  | '投放' | '融资租赁' | '企业贷款' | '全量融资'
  | '活力指数' | '开工率' | '金租渗透率' | '用电增速'
  | '设备投放' | '客户数' | '不良率'
  | '在园企业数' | '当年新注册' | '高新技术占比';
```

### 4.3 FirmRelationType（8 种关系类型）

```typescript
type FirmRelationType =
  | 'upstream' | 'downstream' | 'same_park' | 'same_chain'
  | 'equity' | 'guarantee' | 'association' | 'other';
```

---

## 五、组件设计模式

### 5.1 页面组件模板

每个页面遵循以下结构：

```tsx
export const PageName: React.FC = () => {
  // 1. 状态读取
  const data = useDataStore(s => s.dataField);
  const store = useDataStore.getState();  // 非响应式读取

  // 2. 派生数据
  const filtered = useMemo(() => data.filter(...), [data]);

  // 3. 事件处理
  const handleAction = () => { ... };

  return (
    <div className="h-full flex flex-col">
      {/* 顶部工具栏 */}
      <div className="shrink-0 px-6 py-4 flex items-center justify-between border-b">
        <h2>页面标题</h2>
        <div className="flex items-center gap-2">
          {/* 操作按钮 */}
        </div>
      </div>

      {/* 内容区：通常 flex-1 flex min-h-0 */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* 左侧列表 */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* 主内容 */}
        </div>

        {/* 右侧详情面板（可选） */}
        {selectedItem && (
          <div className="w-[320px] shrink-0 border-l overflow-y-auto p-4">
            {/* 详情 */}
          </div>
        )}
      </div>
    </div>
  );
};
```

### 5.2 图表组件模板

所有 ECharts 图表遵循以下模式：

```tsx
const ChartComponent: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const ct = useChartTheme();  // 主题适配

  useEffect(() => {
    if (!ref.current) return;
    const chart = echarts.init(ref.current);
    chart.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item', backgroundColor: ct.tooltipBg, ... },
      // ...series 配置
    });
    const h = () => chart.resize();
    window.addEventListener('resize', h);
    return () => { window.removeEventListener('resize', h); chart.dispose(); };
  }, [ct, /* 依赖数据的变量 */]);

  return <div ref={ref} style={{ width: '100%', height: '300px' }} />;
};
```

### 5.3 力导向图（斥力图）实现规范

产业链斥力图使用 ECharts force 布局，支持节点拖拽和图例筛选：

```tsx
// 斥力图关键配置
chart.setOption({
  xAxis: { show: false, min: 0, max: 2000 },
  yAxis: { show: false, min: 0, max: 1000 },
  series: [{
    type: 'graph',
    layout: 'force',
    force: {
      repulsion: 400,        // 节点斥力（越大越分散）
      edgeLength: [150, 300], // 边的长度范围
      layoutAnimation: true,
      gravity: 0.05,          // 重力系数（越小越分散）
    },
    roam: true,               // 启用漫游（拖拽平移+滚轮缩放）
    silent: false,            // 允许节点响应鼠标事件
    data: gNodes,
    links: gLinks,
  }],
});

// 图例筛选逻辑
const visibleNodes = nodes.filter(n => legendVisible[n.cat] !== false);
const visibleNodeIds = new Set(visibleNodes.map(n => n.id));
const gLinks = relations.filter(r =>
  visibleNodeIds.has(r.sourceNodeId) && visibleNodeIds.has(r.targetNodeId)
);
```

**关键参数说明：**
- `repulsion`: 建议 300-500，值越大节点越分散
- `edgeLength`: 建议 [150, 300]，控制边的理想长度
- `gravity`: 建议 0.03-0.08，值越小越分散
- `roam: true`: 必须开启才能拖拽平移和缩放
- `silent: false`: 必须设置为 false 才能响应节点点击

### 5.4 树形图布局规范

产业链树形图使用自定义布局算法（chainLayout.ts），支持折叠展开：

```typescript
// 布局算法关键配置
const ROOT_Y_OFFSET = 80;  // 根节点距顶部边距
const rootY = canvasMargin + ROOT_Y_OFFSET;
```

**注意事项：**
- 容器必须使用 `overflow: hidden`，不能用 `overflow: auto`
- 容器应设置为绝对定位，完全覆盖父容器

### 5.5 AI 机器人组件

Robot 由 FloatingRobot（入口）+ RobotChat（对话窗口）组成：

```tsx
// FloatingRobot 入口
<FloatingRobot config={robotConfig} mode="float" />

// 内联模式（嵌入页面）
<FloatingRobot config={robotConfig} mode="inline" inlineHeight={40} showLabel={false} />

// RobotChat 内部使用 config.presetQas[] 预设问答
// 点击预设问题 → 打字机效果回复
```

---

## 六、路由与导航

### 6.1 路由配置（App.tsx）

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/Layout/AppLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<MacroPanel />} />
          <Route path="/chain" element={<IndustryChain />} />
          <Route path="/customer" element={<CustomerView />} />
          <Route path="/tasks" element={<TaskCenter />} />
          <Route path="/rules" element={<RuleConfig />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

### 6.2 侧边栏导航（Sidebar.tsx）

5 个固定导航项（NavLink），主题切换按钮在底部，版本信息在底部。

---

## 七、视觉设计系统

### 7.1 CSS 变量（暗色主题）

```css
:root[data-theme="dark"] {
  --c-bg: #040B16;
  --c-bg-elevated: #060E1A;
  --c-surface: rgba(10,26,47,0.85);
  --c-surface-solid: #0A1A2F;
  --c-border: rgba(30,64,112,0.45);
  --c-text: #F0F4F8;
  --c-text-secondary: #94A3B8;
  --c-text-muted: #475569;
  --c-accent: #3B82F6;
  --c-accent-glow: rgba(59,130,246,0.4);
  --c-green: #00E676;
  --c-red: #FF4D4F;
  --c-yellow: #FAAD14;
}
```

### 7.2 主题切换

```typescript
// store/theme.ts
const toggle = () => {
  const next = theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  set({ theme: next });
};
```

### 7.3 Tailwind 工具类

| 类名 | 用途 |
|------|------|
| `.tech-panel` | 玻璃态面板（backdrop-filter blur + 边框 + 阴影） |
| `.tech-title` | 渐变标题（accent→青色文字） |
| `.bg-tech-grid` | 技术感网格背景 |
| `.bg-gradient-radial` | 径向发光背景 |

### 7.4 字号规范

```
text-lg   (18px)  — 页面标题
text-sm   (14px)  — 卡片标题
text-xs   (12px)  — 正文
text-[10px]       — 标签/徽章
text-[9px]        — 说明文字
text-[8px]        — 计数/次要标签
```

---

## 八、数据导入实现规范

### 8.1 新增数据类型（types.ts）

在 `types.ts` 中定义接口，然后导出到 `OBJECT_TYPE_META`：

```typescript
// 1. types.ts：定义接口
export interface NewType {
  id: string;
  name: string;
  // ... 其他字段
}

// 2. importer.ts：在 OBJECT_TYPE_META 添加元数据
{ type: 'new_type', label: '新类型', group: '核心实体',
  description: '...', csvRequiredHeaders: ['id', 'name'],
  csvExample: 'id001,新类型名称' }

// 3. importer.ts：parse 函数
function parseNewTypes(text: string, format: 'json' | 'csv'): NewType[] {
  if (format === 'json') return JSON.parse(text);
  // CSV 解析逻辑...
}

// 4. importer.ts：importFile switch case
case 'new_type':
  data = parseNewTypes(text, fileType);
  _db.newTypes = data as NewType[];
  syncToStore(objectType, data, filename);
  break;

// 5. importer.ts：getAll 函数
case 'new_type': return _db.newTypes as T[];

// 6. exporter.ts：TEMPLATE_JSON 添加模板
new_type: [{ id: 'example_001', name: '示例' }]

// 7. store/data.ts：添加字段
newTypes: NewType[];
importNewTypes: (data: NewType[], filename: string) => void;

// 8. 页面组件：通过 useDataStore(s => s.newTypes) 读取
```

### 8.2 CSV 解析规范

```typescript
function parseCsvRows(text: string): string[][] {
  return text.trim().split('\n').map(line => {
    const cells: string[] = [];
    let current = '';
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') { inQuotes = !inQuotes; }
      else if (ch === ',' && !inQuotes) { cells.push(current.trim()); current = ''; }
      else current += ch;
    }
    cells.push(current.trim());
    return cells;
  });
}
```

CSV 表头支持中文别名（如 `id` = `ID` = `省份ID`），需在 parser 中建立别名映射表。

### 8.3 syncToStore 规范

导入数据后**必须**调用 `syncToStore`，否则页面组件无法感知变化：

```typescript
// 关键原则：同步到 Zustand store，不要只写 _db！
function syncToStore(objectType: DataObjectType, data: unknown, filename: string) {
  const store = useDataStore.getState();
  // ... 构建日志和 sourceType
  switch (objectType) {
    case 'firm':
      useDataStore.setState({
        firms: data as Firm[],
        firmData: (data as Firm[]).map(...),  // 旧版兼容字段
        importLogs: newLogs,
        sourceType: newSource,
      });
      break;
    // ...
  }
}
```

---

## 九、重构示例：新增一个页面（参考 round13 修复）

**目标**：新增「风险监控」页面（/risk）

### 步骤 1：定义路由

```tsx
// App.tsx
import { RiskMonitor } from './pages/RiskMonitor';
<Route path="/risk" element={<RiskMonitor />} />
```

### 步骤 2：注册导航

```tsx
// Sidebar.tsx
{ to: '/risk', icon: AlertTriangle, label: '风险监控', sub: '实时预警 · 阻断清单' }
```

### 步骤 3：编写页面

```tsx
// pages/RiskMonitor.tsx
export const RiskMonitor: React.FC = () => {
  const firms = useDataStore(s => s.firms);
  const ct = useChartTheme();

  const riskFirms = useMemo(() =>
    firms.filter(f => f.risk === 'danger'), [firms]);

  return (
    <div className="h-full flex flex-col">
      <div className="shrink-0 px-6 py-4 border-b flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-red-400" />
        <h2 className="text-lg font-bold">风险监控</h2>
        <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/10 text-red-400">
          {riskFirms.length} 家高危
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-3">
          {riskFirms.map(firm => (
            <div key={firm.id} className="tech-panel p-4">
              {/* 风险卡片 */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

---

## 十、常见问题与修复记录

### 10.1 TaskCenter 组件必须的状态定义

`TaskCenter.tsx` 中需要使用以下 useState，否则编译报错：

```tsx
export const TaskCenter: React.FC = () => {
  // 状态定义（必须！）
  const [mainTab, setMainTab] = useState<MainTab>('todo');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [secondaryPanel, setSecondaryPanel] = useState<SecondaryPanel>(null);
  const [searchQuery, setSearchQuery] = useState('');
  // ...
};
```

### 10.2 Supplement 页面类型断言

`Supplement.tsx` 中处理第三方数据时使用 `as any` 断言避免类型冲突：

```tsx
const data = importFile(objectType, fileContent, fileType) as any;
```

### 10.3 Sidebar 版本号

侧边栏底部显示版本号 `v2.0.1`，与 package.json 和 README.md 保持一致。

---

## 十一、开发指南

### 11.1 启动项目

```bash
cd frontend
npm install
npm run dev        # 开发模式（http://localhost:5173）
npx tsc --noEmit   # 类型检查
```

### 11.2 调试技巧

1. **数据联动调试**：在 TaskDataImport 中导入 JSON，观察宏观态势地图数据是否变化
2. **图表调试**：打开浏览器 DevTools → Elements，移除图表容器的 `display:none`
3. **Zustand 调试**：在 DevTools 中查看 `useDataStore` 的状态快照

### 11.3 扩展方向

- **新增页面**：参考「重构示例：新增一个页面」
- **新增数据类型**：参考「数据导入实现规范」
- **新增图表类型**：参考「图表组件模板」
- **AI 对话**：修改 `data/robotData.ts` 中的 `presetQas[]`
- **地图点位**：修改 `components/Map/ChinaMap.tsx` 中的 `cities[]` 坐标数组

---

## 十一、关键设计原则

1. **数据即状态**：所有业务数据必须流经 Zustand store，不允许组件内部独立状态持有业务数据
2. **导入即生效**：导入操作必须同步更新 store，否则页面不响应
3. **主题先行**：所有颜色必须使用 CSS 变量，不允许硬编码颜色
4. **图表适配**：所有 ECharts 配置必须通过 `useChartTheme()` 适配主题
5. **懒加载地图**：GeoJSON 按省份懒加载，首屏不阻塞
