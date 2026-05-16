# BattleMap 作战地图 v0.9.0 — 重构指南（prompt09.md）

> 本文件是大模型重构 BattleMap 作战地图系统的完整提示词指南。
> 结合 PRD09.md 一起使用，可以基于此文档从零重建本系统。
> 版本：v0.9.0 | 日期：2026-04-14 | 状态：整合优化版

---

## 一、系统定位与目标

BattleMap v0.9.0 是一个面向**金融租赁行业**的产业客户作战指挥平台，核心目标是：

1. **全局指挥视图**：统帅驾驶舱提供北极星 KPI、红绿灯预警网
2. **高效协同作战**：战区指挥台支持地图框选派单、团队轨迹追踪
3. **数据驱动决策**：宏观态势 + 产业链沙盘 + 客户全景
4. **数据自主可控**：支持 CSV/JSON 批量导入，导入后所有视图实时联动

---

## 二、技术架构

### 2.1 技术栈

| 层级 | 技术选型 |
|------|---------|
| UI 框架 | React 18 + TypeScript 5 |
| 路由 | react-router-dom v6 |
| 状态管理 | Zustand 5 |
| 样式 | Tailwind CSS + CSS 变量（双主题） |
| 图表 | ECharts 5 |
| 地图 | ECharts Geo + GeoJSON（中国地图，按省份懒加载） |
| 图标 | lucide-react |
| 构建 | Vite 8 |
| 包管理 | npm |

### 2.2 项目结构

```
battle09/
├── frontend/
│   ├── src/
│   │   ├── App.tsx                    # 路由注册 + Toast 容器
│   │   ├── index.css                  # 全局样式 + CSS 变量主题系统
│   │
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   │   ├── AppLayout.tsx     # 根布局（Sidebar + Outlet）
│   │   │   │   └── Sidebar.tsx       # 侧边导航栏（NavLink × 7）
│   │   │   ├── Robot/
│   │   │   │   └── FloatingRobot.tsx  # AI 机器人入口
│   │   │   └── Toast.tsx             # Toast 通知组件
│   │   │
│   │   ├── pages/
│   │   │   ├── MacroPanel.tsx         # 宏观态势（路由：/）
│   │   │   ├── IndustryChain.tsx      # 产业链沙盘（路由：/chain）
│   │   │   ├── CustomerView.tsx       # 客户全景（路由：/customer）
│   │   │   ├── TaskCenter.tsx        # 个人工作台（路由：/tasks）
│   │   │   ├── CommanderDashboard.tsx  # 统帅驾驶舱（路由：/commander）[NEW]
│   │   │   ├── BattleField.tsx        # 战区指挥台（路由：/battlefield）[NEW]
│   │   │   └── RuleConfig.tsx         # 规则配置（路由：/rules）
│   │   │
│   │   ├── data/
│   │   │   ├── types.ts               # 全量 TypeScript 类型定义
│   │   │   ├── importer.ts           # 数据导入引擎
│   │   │   ├── exporter.ts           # 数据导出引擎
│   │   │   ├── mockDataV2.ts         # Mock 数据（18+3 种类型）
│   │   │   ├── geoLoader.ts          # GeoJSON 按需加载器
│   │   │   └── geo/                  # 各省份 GeoJSON（约 30+ 个）
│   │   │
│   │   ├── store/
│   │   │   ├── data.ts               # Zustand 全局数据 store
│   │   │   ├── theme.ts              # 主题切换 store
│   │   │   └── toast.ts              # Toast 通知 store
│   │   │
│   │   ├── hooks/
│   │   │   └── useChartTheme.ts      # ECharts 主题 hook
│   │   │
│   │   └── services/
│   │       └── apiService.ts         # API 服务层（预留）
│   │
│   ├── public/
│   │   └── data/
│   │       └── chinaGeoJSON.json     # 全国地图 GeoJSON
│   │
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── PRD09.md                           # 产品需求文档
├── prompt09.md                        # 本文件
└── report.md                          # 差异化分析报告
```

---

## 三、数据流转架构

### 3.1 核心数据流

```
用户上传 CSV/JSON 文件
    ↓
importer.ts → importData(objectType, text, fileType, filename, callback)
    ↓
parseCsvData() / parseJsonData()  [CSV行解析 或 JSON反序列化]
    ↓
callback(data, log) → useAppStore.importData()  [写入 store]
    ↓
_db.{table} = parsedData    [同步写入内存模拟数据库]
    ↓
syncToStore(objectType, data)  [关键：必须同步到 Zustand store！]
    ↓
useAppStore.setState({ [dataType]: data })  [触发 React 重渲染]
    ↓
rebuildIndex()  [重建 DataIndex 全局索引]
    ↓
组件通过 useAppStore(s => s.{field}) 感知变化并重渲染
```

### 3.2 导出链路

```
getAll(objectType)   [从 _db 读取最新数据]
    ↓
exportData → downloadBlob(content, filename, mimeType)
exportTemplate → 导出 JSON/CSV 模板
exportAllData → 遍历所有类型导出全量 JSON
```

### 3.3 页面数据读取

所有页面通过 `useAppStore` 读取数据：

```typescript
// 直接读取
const firms = useAppStore(s => s.firms);
const parks = useAppStore(s => s.parks);
const riskAlerts = useAppStore(s => s.riskAlerts);

// 派生数据
const dangerFirms = useMemo(() => firms.filter(f => f.risk === 'danger'), [firms]);

// 读取全局状态（非响应式）
const store = useAppStore.getState();
```

---

## 四、数据模型（types.ts）

### 4.1 核心类型速查

```typescript
// 行政区划（四级）
Province: { id, code, name, lng, lat }
City:     { id, code, name, provinceId, lng, lat }
District: { id, code, name, cityId, provinceId }
Street:   { id, name, districtId, lng, lat }

// 行业与产业链
Industry:     { id, name, color, subIndustries[] }
IndustryChain:{ id, name, status, description, color }
ChainNode:    { id, chainId, name, stage, scale, activity, bankRatio, leaseRatio }

// 核心实体
Park:     { id, name, cityId, lng, lat, risk, scale, industries[], chainIds[], data, firmIds[] }
Manager:  { id, name, role, department, area, workOrderCount, visitCount, opportunityCount }
Firm:     { id, name, fullName, creditCode, parkIds[], chainNodeIds[], rating, risk, indicators }

// 关系数据
Executive:    { id, firmId, name, title, phone, isLegalRep }
FirmRelation: { id, sourceFirmId, targetFirmId, type, description, strength }

// 事件记录
WorkOrder:    { id, type, level, title, firmId, ownerId, deadline, status, lbsRequired }
Opportunity:  { id, title, level, source, firmId, product, amount, irr, probability, action }
VisitRecord:  { id, targetType, targetId, managerId, visitType, visitDate, lbsVerified, summary }
DeployPlan:   { id, title, product, firmId, targetAmount, milestones[], ownerId, status }

// 指标数据
AdminData: Record<MetricKey, Record<ProvinceName, number>>

// 新增类型 [NEW]
RiskAlert:    { id, firmId, firmName, type, level, title, desc, createdAt, acknowledged }
VisitTrail:   { managerId, date, points[], totalDistance, firmsVisited[] }
PenetrationData: { dimension, targetId, targetName, totalFirms, signedFirms, penetrationRate, targetRate, status }

// 全局索引
DataIndex: { provinceIdToName, cityIdToName, firmIdToParkIds, parkIdToFirmIds, ... }
```

### 4.2 MetricKey（14 种指标）

```typescript
type MetricKey =
  | '投放' | '融资租赁' | '企业贷款' | '全量融资'
  | '活力指数' | '开工率' | '金租渗透率' | '用电增速'
  | '设备投放' | '客户数' | '不良率'
  | '在园企业数' | '当年新注册' | '高新技术占比';
```

### 4.3 RiskAlertType 和 RiskAlertLevel [NEW]

```typescript
type RiskAlertType = 'overdue' | 'iot_offline' | 'mortgage_warning' | 'credit_drop';
type RiskAlertLevel = 'low' | 'medium' | 'high' | 'critical';
```

---

## 五、组件设计模式

### 5.1 页面组件模板

每个页面遵循以下结构：

```tsx
export const PageName: React.FC = () => {
  // 1. 状态读取
  const data = useAppStore(s => s.dataField);
  const store = useAppStore.getState();  // 非响应式读取

  // 2. 派生数据
  const filtered = useMemo(() => data.filter(...), [data]);

  // 3. 事件处理
  const handleAction = () => { ... };

  return (
    <div className="h-full flex flex-col">
      {/* 顶部工具栏 */}
      <div className="h-14 px-6 flex items-center justify-between border-b border-[var(--c-border)] shrink-0 bg-[var(--c-bg-elevated)]">
        <h1 className="text-lg font-bold tech-title">页面标题</h1>
      </div>

      {/* 内容区：通常 flex-1 flex min-h-0 overflow-hidden */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧列表 */}
        <div className="w-80 border-r border-[var(--c-border)] overflow-y-auto p-4 scrollbar-thin shrink-0">
          {/* 列表内容 */}
        </div>

        {/* 右侧详情/图表区 */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {/* 主内容 */}
        </div>
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
  const chart = useRef<echarts.EChartsType | null>(null);
  const ct = useChartTheme();

  useEffect(() => {
    if (!ref.current) return;
    chart.current = echarts.init(ref.current);
    return () => { chart.current?.dispose(); };
  }, []);

  useEffect(() => {
    if (!chart.current) return;
    chart.current.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item', backgroundColor: ct.tooltipBg, borderColor: ct.tooltipBorder, textStyle: { color: ct.tooltipText } },
      // ...series 配置
    });
    const h = () => chart.current?.resize();
    window.addEventListener('resize', h);
    return () => { window.removeEventListener('resize', h); };
  }, [ct, /* 依赖数据的变量 */]);

  return <div ref={ref} className="w-full h-[300px]" />;
};
```

### 5.3 AI 机器人组件

Robot 由 FloatingRobot（入口）+ 预设问答组成：

```tsx
// 浮动模式
<FloatingRobot mode="float" />

// 内联模式
<FloatingRobot mode="inline" />

// presetQas 在 FloatingRobot.tsx 中配置
const robotConfig: RobotConfig = {
  name: '小E助手',
  presetQas: [
    { q: '当前有多少待处理工单？', a: '当前共有 6 个待闭环工单...' },
    // ...
  ],
};
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
          <Route path="/commander" element={<CommanderDashboard />} />
          <Route path="/battlefield" element={<BattleField />} />
          <Route path="/rules" element={<RuleConfig />} />
        </Route>
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}
```

### 6.2 侧边栏导航（Sidebar.tsx）

7 个固定导航项（NavLink），新增统帅驾驶舱和战区指挥台：

```tsx
const navItems = [
  { to: '/', icon: Map, label: '宏观态势', sub: '产业渗透 · 全局把控' },
  { to: '/chain', icon: GitBranch, label: '产业链沙盘', sub: '拓扑图谱 · 融资结构' },
  { to: '/customer', icon: Users, label: '客户全景', sub: '触达路径 · 资信报告' },
  { to: '/tasks', icon: LayoutDashboard, label: '个人工作台', sub: '工单闭环 · 商机发现' },
  { to: '/commander', icon: Zap, label: '统帅驾驶舱', sub: '北极星 KPI · 红绿灯预警', new: true },
  { to: '/battlefield', icon: Shield, label: '战区指挥台', sub: '框选派单 · 鹰眼轨迹', new: true },
  { to: '/rules', icon: Settings, label: '规则配置', sub: '数据目录 · 策略画布' },
];
```

---

## 七、视觉设计系统

### 7.1 CSS 变量（暗色主题）

```css
:root[data-theme="dark"] {
  --c-bg: #040B16;
  --c-bg-elevated: #060E1A;
  --c-surface: rgba(10, 26, 47, 0.85);
  --c-surface-solid: #0A1A2F;
  --c-border: rgba(30, 64, 112, 0.45);
  --c-text: #F0F4F8;
  --c-text-secondary: #94A3B8;
  --c-text-muted: #475569;
  --c-accent: #3B82F6;
  --c-accent-glow: rgba(59, 130, 246, 0.4);
  --c-green: #00E676;
  --c-red: #FF4D4F;
  --c-yellow: #FAAD14;
  --c-purple: #A855F7;
  --c-orange: #F97316;
  --c-cyan: #06B6D4;
}
```

### 7.2 新增样式 [NEW]

```css
/* 高危节点发光效果 */
.tech-glow-red {
  box-shadow: 0 0 20px rgba(255, 77, 79, 0.4);
}

/* 高危节点闪烁动画 */
@keyframes blink {
  0%, 50%, 100% { opacity: 1; }
  25%, 75% { opacity: 0; }
}

.animate-blink {
  animation: blink 1s ease-in-out infinite;
}

/* 状态颜色 */
.status-purple { color: var(--c-purple); }
```

### 7.3 主题切换

```typescript
// store/theme.ts
const toggle = () => {
  const next = theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  set({ theme: next });
};
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
  csvExample: 'id,新类型名称' }

// 3. importer.ts：parse 函数
function parseNewTypes(text: string, format: 'json' | 'csv'): NewType[] {
  if (format === 'json') return JSON.parse(text);
  // CSV 解析逻辑...
}

// 4. importer.ts：importData switch case
case 'new_type':
  data = parseNewTypes(text, fileType);
  _db.newTypes = data as NewType[];
  syncToStore(objectType, data, filename);
  break;

// 5. store/data.ts：添加字段和导入逻辑
newTypes: NewType[];
importData: (objectType, data, log) => void; // 在 switch 中处理 new_type

// 6. 页面组件：通过 useAppStore(s => s.newTypes) 读取
```

### 8.2 syncToStore 规范

导入数据后**必须**调用 `syncToStore`，否则页面组件无法感知变化：

```typescript
// 关键原则：同步到 Zustand store，不要只写 _db！
function syncToStore(objectType: DataObjectType, data: unknown, filename: string) {
  const store = useAppStore.getState();
  // ... 构建日志和 sourceType
  switch (objectType) {
    case 'firm':
      useAppStore.setState({
        firms: data as Firm[],
        importLogs: newLogs,
        sourceInfo: newSource,
      });
      break;
    // ...
  }
}
```

---

## 九、新增页面开发规范

### 9.1 新增统帅驾驶舱页面

**目标**：新增「统帅驾驶舱」页面（/commander）

### 9.2 新增战区指挥台页面

**目标**：新增「战区指挥台」页面（/battlefield）

---

## 十、关键设计原则

1. **数据即状态**：所有业务数据必须流经 Zustand store，不允许组件内部独立状态持有业务数据
2. **导入即生效**：导入操作必须同步更新 store，否则页面不响应
3. **主题先行**：所有颜色必须使用 CSS 变量，不允许硬编码颜色
4. **图表适配**：所有 ECharts 配置必须通过 `useChartTheme()` 适配主题
5. **懒加载地图**：GeoJSON 按省份懒加载，首屏不阻塞

---

## 十一、开发指南

### 11.1 启动项目

```bash
cd battle09/frontend
npm install
npm run dev        # 开发模式（http://localhost:5173）
npx tsc --noEmit   # 类型检查
```

### 11.2 调试技巧

1. **数据联动调试**：在工作台导入 JSON，观察统帅驾驶舱、战区指挥台数据是否变化
2. **图表调试**：打开浏览器 DevTools → Elements，移除图表容器的 `display:none`
3. **Zustand 调试**：在 DevTools 中查看 `useAppStore` 的状态快照

### 11.3 扩展方向

- **新增页面**：参考「重构示例：新增一个页面」
- **新增数据类型**：参考「数据导入实现规范」
- **新增图表类型**：参考「图表组件模板」
- **AI 对话**：修改 `components/Robot/FloatingRobot.tsx` 中的 `robotConfig.presetQas[]`
- **地图点位**：修改 `mockDataV2.ts` 中的 `parks[]` 坐标数组
