# 版本日志 — 作战地图

本文档记录系统从立项到每次修订的完整变更历史，便于追溯和复盘。

---

## round5k（2026-05-16）— 产业链节点企业关联 + 图例折叠修复

**核心目标：** 产业链图谱点击节点时展示关联企业（含父子节点汇总）；修复斥力图图例折叠功能。

### 解决方案

#### 1. 数据层设计
- 补充 `mockChainFirms['chain_humanoid']` 企业关联数据
- 新增人形机器人相关企业到 `mockFirms`
- 企业名称、角色等信息全部来自数据，不硬编码

#### 2. 逻辑层新增函数
- `getAncestorNodeIds()`: 递归查找节点的所有祖先节点ID
- `getNodeRelatedFirms()`: 根据节点ID汇总关联企业信息

#### 3. 界面层改造
- InfoPanel 组件改造：展示节点及其祖先节点关联的所有企业
- 点击企业可跳转至"客户全景"模块
- 斥力图图例添加折叠/展开功能

### 修改文件

| 文件 | 修改内容 |
|------|---------|
| `mockDataV2.ts` | 补充 `mockChainFirms['chain_humanoid']` 和新增企业数据 |
| `utils/chainToGraph.ts` | 新增 `getAncestorNodeIds()` 和 `getNodeRelatedFirms()` 函数 |
| `pages/IndustryChainV2.tsx` | 调用新函数展示企业、修复图例折叠 |

---

## round5j（2026-05-14）— 产业链图谱视图自动居中（修订）+ 树形图叶子节点颜色

**核心目标：** 产业链斥力图打开时自动居中显示，无需用户手动拖动；树形图叶子节点与背景区分。

### 解决方案

1. **斥力图居中**
   - 在 `buildForceOption` 函数中增加可选的 `center` 参数
   - 切换斥力图时计算画布中心 `[width/2, height/2]` 并传入 force 布局

2. **树形图叶子节点颜色**
   - 在 `leaves` 配置中为叶子节点设置独立的蓝色样式
   - 使用 `#38BDF8`（亮蓝色）与背景区分

### 修改文件

| 文件 | 修改内容 |
|------|---------|
| `utils/chainToGraph.ts` | `buildForceOption` 增加 `center` 参数；`buildTreeOption` 增加叶子节点蓝色样式 |
| `pages/IndustryChainV2.tsx` | 切换斥力图时传入画布中心 |

---

## round5i（2026-05-14）— 产业链图谱视图自动居中

**核心目标：** 产业链的树形图和斥力图打开时自动居中显示，用户无需手动拖动或缩放。

### 解决方案

#### 1. 树形图居中
- 在 `computeChainLayout` 中固定根节点位置：X 坐标为画布宽度的 1/4，Y 坐标为画布高度的 1/2
- 树形自然向右展开，初始即可看到完整结构

#### 2. 斥力图居中
- 在 `setOption` 后延迟 200ms，让 force 布局初步稳定
- 使用 ECharts 的 `focusNodeAdacency` action 触发视图居中

### 修改文件

| 文件 | 修改内容 |
|------|---------|
| `utils/chainLayout.ts` | 根节点位置固定为画布中心 |
| `pages/IndustryChainV2.tsx` | 斥力图渲染后自动居中 |

---

## round5h（2026-05-14）— 产业链页面 UI 调整：移除 V2 标识

**核心目标：** 产业链页面上不再体现 V2 版本标识，使界面更加简洁。

### 修改内容

**`frontend/src/pages/IndustryChainV2.tsx`**
- 将 Banner 组件中的页面标题从 "产业链图谱 V2" 改为 "产业链图谱"
- 侧边栏导航文案保持不变：`{ to: '/chain', icon: GitBranch, label: '产业链沙盘', sub: '拓扑图谱 · 商机发现' }`

### 技术说明

| 项目 | 内容 |
|------|------|
| 修改文件 | `IndustryChainV2.tsx` |
| 修改位置 | Banner 组件 h2 标题 |
| 修改前 | `产业链图谱 V2` |
| 修改后 | `产业链图谱` |

---

## round5g（2026-05-13）— 产业链图谱 V2 实现完成

**核心目标：** 创建基于标准化数据格式的产业链图谱组件，支持斥力图/树形图双模式切换。

### 树形图样式调整 (round5g-1)
- 节点文字放在框的中间（`position: 'inside'`）
- 框的背景色改为半透明蓝色（`color + 'CC'`，80% 透明度）
- 边框改为白色半透明（`rgba(255,255,255,0.3)`）
- 增大节点间距：`nodePadding: 50`，`layerPadding: 120`（原来是 30 和 80）

### 树形图样式调整 (round5g-2)
- 修复节点背景色为黑色的问题：itemStyle.color 回调函数确保返回半透明蓝色
- 进一步增大节点间距：`nodePadding: 60`，`layerPadding: 180`
- 树形图模式下容器支持滚动：设置 `overflow: auto`，画布尺寸 3000x2000
- 图例仅在斥力图模式下显示

### 实现内容

**1. 数据转换层 (`chainToGraph.ts`)**
- `chainToGraphData()`: 将 `ChainNode[]` + `ChainNodeRelation[]` 转换为 ECharts Graph 格式
- `buildForceOption()`: 生成力导向图配置（categories + nodes + links）
- `buildTreeOption()`: 生成树形图配置（使用预定义 treeData）
- `getCategoryColor()`: 根据分类名称获取颜色
- `getLineStyleType()`: 根据关系类型获取线条样式

**2. 组件层 (`IndustryChainV2.tsx`)**
- 使用 `chart.clear()` + `setOption()` 实现模式切换，防止残影
- 支持产业链切换（动力电池、汽车、人形机器人等）
- 斥力图：展示完整网状结构
- 树形图：展示层级结构
- 节点点击显示详情面板

**3. 数据结构匹配**
| ECharts 需求 | 实现方式 |
|-------------|---------|
| `categories` | 从 `graphCategory` 去重生成 |
| `nodes.category` | 字符串转 Number 索引 |
| `links.lineStyle` | 从 `relationType` 推导（flow→solid, fund→dashed） |
| 树形图 | 使用预定义的 `mockChainTreeData` |

---

## round5f（2026-05-13）— 产业链图谱重构：数据转换 + 斥力图/树形图双模式

**核心目标：** 重构产业链图谱的数据结构，实现斥力图（Force）和树形图（Tree）两种模式的完美切换。

### 重大发现：数据不一致问题

**分析结果：**
| ECharts 需求 | store.chainNodes/chainNodeRelations | 是否一致 |
|-------------|---------------------------------------|---------|
| `id` | `ChainNode.id` | ✅ 一致 |
| `name` | `ChainNode.name` | ✅ 一致 |
| `category` (Number) | 只有 `graphCategory` (String) | ❌ 需转换 |
| `symbolSize` | `ChainNode.graphSize` | ✅ 可映射 |
| `source/target` | `ChainNodeRelation.sourceNodeId/targetNodeId` | ✅ 一致 |
| `lineStyle.type` | 无对应字段 | ❌ 需推导 |

### 核心矛盾：网状数据 vs 树形结构

`chainNodeRelations` 是**网状结构**数据，存在：
- **汇聚节点**：一个节点接收多个上游输入（如 `node_hr_joint` 汇聚电机、减速器、传感器、控制器）
- **分叉节点**：一个节点输出到多个下游（如 `node_hr_ai_chip` 输出到感知、控制、灵巧手等）

**结论：** 斥力图完美适配，树形图需要预先定义的树形结构（使用 `mockChainTreeData`）。

### 实现方案

**1. 创建 `chainToGraph.ts` 转换函数**

```typescript
// 将 ChainNode[] + ChainNodeRelation[] 转换为 ECharts Force 图谱数据
export function chainToGraphData(
  chainNodes: ChainNode[],
  chainNodeRelations: ChainNodeRelation[]
): GraphData

// 获取预定义的树形数据（直接使用 mockChainTreeData）
export function getChainTreeData(chainId: string): ChainTreeNode
```

**2. 斥力图 (Force) 配置**
- 使用转换后的 `GraphData`（包含 categories、nodes、links）
- `layout: 'force'`，开启 `roam: true`
- 节点按 `graphCategory` 分组着色

**3. 树形图 (Tree) 配置**
- 使用预定义的 `mockChainTreeData[chainId]`
- 支持折叠/展开
- 叶子节点标签在右侧，非叶子节点标签在左侧

**4. 切换逻辑**
- 切换前调用 `chart.clear()` 防止残影重叠
- 监听 `window.resize` 自适应

---

## round5e（2026-05-13）— 记录当前版本，准备重构

**状态：** 在实现斥力图/树形图切换前，记录当前版本快照。

**待解决问题：**
- `store.chainNodes` + `chainNodeRelations` 与 ECharts 所需格式不完全匹配
- 需要转换函数将网状数据转换为图谱数据
- 树形图需要特殊处理（网状→树形结构转换）

---

## round5d（2026-05-13）— 树形图节点重叠 + 全图漫游修复

**核心目标：** 修复树形图节点重叠问题，同时修复 ECharts 漫游（平移/缩放）功能。

### 问题 1：树形图节点重叠

**现象：** 深层子树的节点与父节点、兄弟节点大量重叠。

**根因：** `chainLayout.ts` 中 `assignY()` 使用固定步长 `nodeHeight` 分配兄弟节点间距，忽略了每个子节点的 `subtreeHeight` 差异。

**修复：**
- 重构 Y 坐标分配算法：改用 **cursor 累加策略**，每个子节点 Y = 前序所有子节点的 `subtreeHeight` + `layerPadding` 之和
- 递归时将子节点的 `subtreeHeight / 2` 作为子树的中心点传入，使父节点居中于其子树

```typescript
// 旧算法（有重叠）
const y = siblingY0 + (siblingIdx - (siblingTotal - 1) / 2) * nodeHeight;

// 新算法（精确间距）
let cursor = childY0;
children.forEach((child) => {
  const childSubtreeH = layoutInfo.get(child.nodeId)?.subtreeHeight ?? nodeHeight;
  layoutInfo.get(child.nodeId)!.y = cursor + childSubtreeH / 2;
  assignY(child, cursor + childSubtreeH / 2);
  cursor += childSubtreeH + layerPadding;
});
```

### 问题 2：ECharts 漫游（Pan/Zoom）被锁死

**现象：** 树形图和斥力图的平移、滚轮缩放功能无法使用。

**根因：** `layout: 'none'` 时，ECharts 的漫游受限于 `xAxis/yAxis` 的 `min/max` 范围。当范围设为 `[0, canvasWidth]` 时，ECharts 限制了平移范围，导致全图拖拽失效。

**修复：**
- 扩展 axis bounds：`min: 0` → `min: -200`，`max: canvasWidth` → `max: 'dataMax' + 400`
- 这样 ECharts 的漫游不会被人为边界锁死，节点可以拖到画布外侧

```typescript
xAxis: { show: false, min: -200, max: 'dataMax' + 400 },
yAxis: { show: false, min: -200, max: 'dataMax' + 400 },
```

### 问题 3：布局参数过密

**修复：** 调大布局间距，减少视觉拥挤：

| 参数 | 旧值 | 新值 |
|---|---|---|
| `levelWidth` | 180 | 220 |
| `layerPadding` | 16 | 20 |
| `canvasMargin` | 60 | 80 |

### 改动文件

- `frontend/src/utils/chainLayout.ts`：Y 坐标分配算法重构、布局参数调大
- `frontend/src/pages/IndustryChain.tsx`：axis bounds 扩展

---

## round5c（2026-05-13）— 图谱交互优化

**核心目标：** 优化产业链图谱的交互体验，修复拖拽功能，添加图例筛选。

### 修复内容

#### 1. 树形图拖拽修复
- **问题**：树形图整体拖拽无法实现，根节点位于页面顶部不可见
- **修复**：
  - 修改图表容器样式：`overflow-auto` → `overflow-hidden`
  - 调整容器为绝对定位：`position: absolute`
  - 布局算法：根节点 Y 坐标固定为 `canvasMargin + 80`，确保顶部有边距

#### 2. 斥力图节点拖拽
- **问题**：斥力图节点无法拖拽调整位置
- **修复**：
  - 移除手动容器宽高设置，让 ECharts 自动管理
  - 调整力导向参数：`repulsion: 400`, `edgeLength: [150, 300]`
  - 增大画布尺寸：`2000 x 1000`
  - 添加节点拖拽事件日志

#### 3. 斥力图节点重叠
- **问题**：灵巧手、感知系统、关键模组等节点有部分重叠
- **修复**：
  - 增大节点斥力：`200` → `400`
  - 增大边长范围：`[80, 150]` → `[150, 300]`
  - 减小重力系数：`0.08` → `0.05`
  - 增大初始随机位置范围

#### 4. 图例点选功能（新增）
- **功能**：点击图例可隐藏/显示对应分类的节点和边
- **实现**：
  - 添加 `legendVisible` 状态管理
  - 图例 UI：隐藏时显示灰色边框，点击切换
  - 斥力图过滤：只渲染可见分类的节点和边
  - 相关边也被过滤（两端节点都可见才显示）

### 代码改动

```typescript
// IndustryChain.tsx
// 1. 图例状态
const [legendVisible, setLegendVisible] = useState<Record<string, boolean>>(() => {
  const init: Record<string, boolean> = {};
  Object.keys(CAT_COLOR).forEach(cat => { init[cat] = true; });
  return init;
});

// 2. 切换图例
const toggleLegend = useCallback((cat: string) => {
  setLegendVisible(prev => ({ ...prev, [cat]: !prev[cat] }));
}, []);

// 3. 斥力图过滤
const visibleNodes = nodes.filter(n => {
  const cat = n.graphCategory || n.stage;
  return legendVisible[cat] !== false;
});
const visibleNodeIds = new Set(visibleNodes.map(n => n.id));
const gLinks = relations
  .filter(r => visibleNodeIds.has(r.sourceNodeId) && visibleNodeIds.has(r.targetNodeId))
  .map(...);
```

---

## round5b（2026-05-08）— 人形机器人产业链数据

**核心目标：** 添加完整的人形机器人产业链数据，支持多层级追溯。

### 产业链层级结构（共6层）

```
第0层 上游原材料
├── 稀土矿开采 → 永磁材料
├── 碳纤维原丝 → 碳纤维复材
├── 高强度铝合金 → 铝合金型材
└── 特种钢材 → 工程塑料

第1层 基础材料加工
├── 永磁材料（供应伺服电机、传感器）
├── 铝合金型材（供应伺服电机、关节模组）
├── 碳纤维复材（供应机器人本体）
└── 工程塑料（供应控制器）

第2层 核心零部件
├── 伺服电机（无框力矩电机，空心杯电机）
├── 精密减速器（谐波、RV、行星减速器）
├── 传感器（力传感器、IMU、视觉、触觉）
└── 控制器（主控、运动控制、伺服驱动）

第3层 关键子系统
├── 关节模组（一体化关节集成）
├── 灵巧手（多指末端执行器）
├── 感知系统（视觉、语音、环境感知）
└── 动力系统（电池、BMS、热管理）

第4层 整机制造
└── 机器人本体（人形机器人整机组装测试）

第5层 终端应用
├── 工业制造（汽车装配、电子、物流）
├── 商业服务（导览、餐饮、酒店）
├── 医疗健康（手术辅助、康复、医护）
└── 特种作业（电力巡检、救援、安防）
```

### 数据规模
- 新增产业链：1条（`chain_humanoid`）
- 新增节点：20个（覆盖全6个层级）
- 新增关系：31条（多层级流向关系）
- 企业关联：空（待验收后补充）

### 设计原则
1. **多层级追溯**：从原材料到终端应用，每层都可追溯上游供应商
2. **暂不关联企业**：产业链结构验收后再补充具体企业名称
3. **节点分类**：上游原材料、基础材料、核心零部件、关键子系统、整机制造、终端应用

---

## round5（2026-05-08）— 产业链数据结构全面升级（支持导入/导出）

**核心目标：** 将产业链数据从硬编码改为可导入/导出的可配置数据，支持未来灵活修改。

### 问题背景
- 原 `IndustryChain.tsx` 中的图谱节点和连线是硬编码的
- `chainTreeData` 树形结构硬编码在组件中
- 无法导出"锂矿开采→正极材料"等节点关系数据

### 解决方案

#### 1. 数据类型扩展（`types.ts`）
- **扩展 `ChainNode` 接口**：新增 `shortName`（简称）、`graphX/graphY`（图谱坐标）、`graphSize`（节点大小）、`graphCategory`（图谱分类）、`status`（状态）等字段
- **新增 `ChainNodeRelation` 接口**：节点间流向关系
  - `sourceNodeId` / `targetNodeId`：上下游节点ID
  - `relationType`：关系类型（flow/info/fund）
  - `strength`：关系强度
  - `isPrimary`：是否主要流向
- **新增 `ChainTreeNode` 接口**：树形结构（改用 `nodeId` 关联）
- **新增 `ChainStructure` 接口**：产业链完整结构

#### 2. Mock 数据扩展（`mockDataV2.ts`）
- `mockChainNodes`：扩展节点数据，包含完整图谱属性
- `mockChainNodeRelations`：新增 25+ 条节点关系
- `mockChainTreeData`：新增 `Record<string, ChainTreeNode>` 格式的树形数据
- `mockChainFirms`：新增节点关联的企业汇总信息

#### 3. 数据导入/导出支持（`importer.ts` / `exporter.ts`）
- 新增 `chain_node_relation` 数据类型
- `parseChainNodeRelations()` 解析函数
- `OBJECT_TYPE_META` 新增节点关系条目
- 导出模板包含完整的节点关系示例

#### 4. Store 状态管理（`store/data.ts`）
- 新增 `chainNodeRelations` 状态
- 新增 `chainFirms` 状态（节点关联企业）
- `chainTreeData` 改为 `Record<string, ChainTreeNode>` 格式
- 新增 `importChainNodeRelations` / `importChainFirms` actions

#### 5. UI 重构（`IndustryChain.tsx`）
- 图谱视图改用 `chainNodes` + `chainNodeRelations` 动态渲染
- 树形视图改用 `chainTreeData[currentChainId]` 动态渲染
- 新增产业链选择器，支持切换不同产业链
- 节点数据完全来自 store，支持导入更新

### 数据模型关系
```
IndustryChain (产业链)
    └── chainNodes[] (节点数组)
            ├── graphX/graphY/graphSize (图谱位置)
            └── chainNodeRelations[] (节点关系)
                    ├── sourceNodeId → node.id
                    └── targetNodeId → node.id

Firm (企业)
    └── chainNodeIds[] → chainNodes[].id (企业-节点关联)

ChainTreeNode
    └── nodeId → chainNodes[].id (树形-节点关联)
```

---

## round1 — 项目初始化

**核心目标：** 确定数据管理方案，建立本地 Mock 数据体系。

1. Mock 数据先用静态本地 JSON 存储和管理；
2. 地图相关表达拉到本地，用 JSON 记录，不通过外网 API 处理；
3. 园区里面的产业链，产业链分布在不同园区，关联关系加到数据模型设计中；
4. 根据数据模型设计，调整数据管理中心 → 手工数据补录功能模块；用户只需维护园区、企业、人员跑动等数据记录及关联关系，即可更新全系统数据并保证一致性；
5. 后续每次功能设计优化时，同步调整数据模型设计，补录功能同步优化。

---

## round2 — 联系链路优化 + 机器人规划

**核心目标：** 重构客户全景视图，增加触达链路和 AI 问答。

1. 数据管理中心更名为**手工数据补录**，放入个人工作台作为独立模块；
2. 客户全景里的联系链路：通过产业链、园区等企业的"朋友圈"找到客户触达路径。
   - 修改点①：联系链路框位置放到客户全景最显眼的地方；
   - 修改点②：规划页面布局，保证可视化简洁美观，内容分为：客户触达路径建议 / 负债结构剖析 / 建立工单 / 租赁物指标监测 / 数智前瞻等资信指标 / 动态基准线对标 / 客户资信报告；
   - 修改点③：客户名称旁放置机器人图标，提供客户主营业务和全景视图内各类问题的 AI 问答服务（问答演示，预设问题），同步更新数据模型和数据补录；
3. 客户工作台漂浮机器人 logo，提供客户经理智能服务支持，弹出浮动窗体效果，预设若干问题作为功能示意。同步考虑数据模型和数据补录。

---

## round3 — 数据模型复盘 + 机器人模块

**核心目标：** 完善数据模型，补录功能和机器人模块规划。

1. 复盘数据模型的设计与调整，以及数据补录的功能设计要求；系统目标：在个人工作台上增加数据补录模块，能在保证一致性的前提下手工补录系统数据；当前系统所有数据通过 Mock 方式管理，暂不用数据库；
2. 复盘机器人的设计工作，增加对应模块。

---

## round4（2026-04-10）— 数据补录完善 + 机器人初版

**核心目标：** 完成数据补录功能，推出机器人 MVP。

1. 数据管理功能融合到数据补录功能：在个人工作台右侧面板「数据管理」Tab 下，提供完整按业务域聚合导入能力（5大业务域：宏观态势/产业链/客户信息/工作台/规则配置），支持拖拽导入/聚合导入/单独导入/导出/重置等操作；
2. 新增文件：
   - `src/data/robotData.ts` — AI 机器人数据（客户全景机器人 + 工作台智能助手）
   - `src/components/Robot/RobotChat.tsx` — 通用对话组件（打字机效果/分类标签/快捷问题）
   - `src/components/Robot/FloatingRobot.tsx` — 浮动机器人按钮组件
3. 新增类型（`src/data/types.ts`）：`RobotConfig`、`PresetQa`、`ChatMessage`
4. 客户全景页面：企业名称旁增加机器人图标，点击弹出 AI 问答弹窗
5. 个人工作台：右下角浮动助手按钮 + 顶部「数据管理」按钮

---

## round5（2026-04-12）— 数据管理移除 + 客户全景7区块重构

**核心目标：** 移除 DataImport，完整重构客户全景布局。

1. 数据管理界面完全移除（删除 DataImport.tsx，移除路由和侧边栏入口），数据补录功能保留在个人工作台；
2. 客户全景页面按 round2 要求重构为**7区块布局**：
   - 区块1（最显眼）：客户触达路径建议（联系链路置顶，用蓝色标题栏标识）
   - 区块2：负债结构剖析（旭日图 + 风险/机会摘要 + 到期时间表）
   - 区块3：建立工单（营销方案：推荐方案卡片 + 备选方案 + 生成工单按钮）
   - 区块4：租赁物指标监测（90天IoT双Y轴图 + 均值汇总卡片）
   - 区块5：数智前瞻（4项进度条 + AI综合洞察）
   - 区块6：动态基准线对标（六维雷达图：企业/园区均值/全国均值）
   - 区块7：客户资信报告（综合评分环 + 6项关键指标 + 风险提示）
3. 客户名称旁保留机器人图标，点击弹出 AI 问答弹窗；
4. 页面底部固定栏显示客户基本信息（企业名称/评级/授信/管户经理联系方式）。

---

## round6（2026-04-12 第二次调整）— 客户全景3大区块重构

**核心目标：** 进一步精简客户全景为3大区块，顶部固定栏聚合快捷操作。

**页面结构调整：**

- **区块1（顶部固定栏）**：客户基本信息（企业头像+名称+机器人图标）+快捷操作按钮（触达路径/建立工单）+管户经理卡片+营销建议；
- **区块2（三列布局）**：负债结构剖析 + 动态基准线对标 + 指标监测（默认 IoT 设备监测，下拉切换：IoT设备监测/数智前瞻指标/基准线指标，图表和均值卡片同步刷新）；
- **区块3（底部）**：客户资信报告，宽度与上方三列对齐。

**交互调整：**

1. 点击「触达路径」按钮 → 弹出全屏弹窗，默认显示「存量客户朋友圈」标签，支持切换「产业链中转」「协会机会挖掘」，弹窗内显示联系链路图；
2. 点击「建立工单」按钮 → 弹出营销方案弹窗（推荐方案卡片+备选方案+生成工单按钮）；
3. 指标监测区块：下拉切换监测指标类型，切换后双Y轴图表同步刷新，下方均值卡片同步变化；
4. 页面底部（客户资信报告）：宽度与上方三列对齐，包含综合评分环+6项关键指标+风险提示。

---

## round7（2026-04-12 第三次调整）— 顶部栏卡片尺寸统一

**核心目标：** 优化顶部栏三个卡片的视觉对齐。

1. 顶部栏卡片对齐优化：触达路径按钮 + 建立工单卡片（tech-panel样式，含"建立工单：推荐3年期直租服务"）+ 管户客户经理卡片，三个卡片尺寸统一 `h-12`（48px）；
2. 建立工单改为卡片形式写入顶部栏，点击"推荐3年期直租服务"文字弹出工单详情弹窗，移除了原有的单独"建立工单"按钮和"营销建议"卡片。

---

## round8（2026-04-12 第四次调整）— 工作台内联机器人助手

**核心目标：** 工作台增加内联 AI 助手入口，移除右下角浮动按钮。

1. 个人工作台头部增加内联机器人助手（`mode='inline'`），圆形蓝色机器人图标，与顶部其他元素对齐，高度40px，无标签文字，点击弹出 AI 对话弹窗；
2. 右下角浮动机器人已移除，仅保留头部内联单入口；
3. `FloatingRobot` 组件支持两种 mode：`'float'`（右下角悬浮）/ `'inline'`（内联嵌入），通过 mode 参数切换。

---

## round9（2026-04-12 第五次调整）— 移除快捷操作面板 + 文档重构

**核心目标：** 清理冗余界面，重构文档结构。

1. 个人工作台右下角快捷操作面板（统计面板内的"快捷操作"区块）已移除；
2. 新建 `VersionLog.md`，将项目历次修订过程全部移入该文件；

## round10（2026-04-12 第六次调整）— 版本梳理与遗留项确认

**核心目标：** 完整梳理系统状态，确认遗留项，更新文档。

### 遗留项分析

经逐文件排查，以下 round1 中提出的远期目标尚在规划中，属于非本次 MVP 范围：

| 遗留项 | 说明 | 状态 |
|--------|------|------|
| 地图数据本地化（GeoJSON 离线化） | round1 要求地图 JSON 拉到本地，不走外网 API | 待做：GeoJSON 仍在在线加载 |
| 园区-产业链完整关联数据模型 | round1 要求园区→产业环节、企业→园区的双向关联 | 待完善：当前 relationLinkData 已建但关联链路较简 |
| 真实后端 API 对接 | round1 指引的 REST 接口规范 | 待做：全部使用 mockData |

### 已完成清单

- 五大模块全部实现并运行
- 数据补录模块（个人工作台内）
- 客户全景触达路径（弹窗形式）
- 客户全景建立工单（弹窗形式）
- 客户全景机器人 AI 问答
- 个人工作台内联 AI 助手
- 客户全景 3 大区块布局（顶部固定栏 + 三列 + 底部报告）
- 顶部栏三个卡片等高对齐
- 主题切换（Dark/Light）
- 快捷操作面板已移除
- VersionLog.md / README.md 文档重构完成
- GeoJSON 地图数据离线化（全国+34省 JSON 已存储于 src/data/geo/）
- 园区-产业链双向关联索引（parkIdToNodeIds + getParkNodes 函数）
- API 服务层建立（src/services/apiService.ts，DATA_SOURCE 切换开关）

---

## round11（2026-04-12 第七次调整）— 遗留项全部完成

**核心目标：** 完成 round10 中识别的全部遗留项。

1. **Vite 配置修复**：在 `vite.config.ts` 中添加 `server.allowedHosts: ['.cpolar.top']`，解决内网穿透访问报错；
2. **GeoJSON 离线化验收**：经逐文件排查，全国 JSON（src/data/chinaGeoJSON.json）及 34 个省级 JSON（src/data/geo/province_*.json）已全部本地存储，无外网请求；round1 中地图不依赖外网的目标已达成；
3. **园区-产业链双向关联完善**：
   - 在 `DataIndex` 类型中增加 `parkIdToNodeIds` 字段；
   - 新增 `getParkNodes(parkId)` 查询函数，路径：park.chainIds → chainId → chainNodeDetails；
   - 更新 dataIndex 构建逻辑（Step 3.5）；
4. **API 服务层建立**：`src/services/apiService.ts`，提供统一数据源切换开关 `DATA_SOURCE: 'mock' | 'remote'`，包含 10 个接口函数（行政区/园区指标/产业链拓扑/企业档案/工单/跟进记录/数据补录/规则/回测），预留 Authorization 头注释；

---

## round13（2026-04-14）— v2.0 Demo 完善版（当前版本）

**核心目标：** 修复遗留 bug，完善数据补录功能，补全文档，形成完整 Demo 版本。

### 一、Bug 修复

| 文件 | 问题 | 修复方式 |
|------|------|---------|
| `Supplement.tsx` | 类型断言错误 + 多余括号导致编译失败 | `as any` 断言 + 删除多余额外 `}` |
| `TaskCenter.tsx` | 缺少 `useState` 状态定义（mainTab/typeFilter/selectedTask/secondaryPanel/searchQuery） | 添加完整 `useState` 定义 |
| `TaskCenter.tsx` | 数据补录入口按钮缺失 | 添加 `['supplement', '数据补录', PenLine, '#F59E0B']` 到按钮数组 |

### 二、功能完善

1. **数据补录入口恢复**：在个人工作台顶部操作栏恢复「数据补录」按钮（黄色），点击跳转到 `/supplement` 页面
2. **工作台状态管理**：为 TaskCenter 组件补全所有交互状态变量
3. **项目目录规范化**：前端代码统一在 `frontend/` 子目录下

### 三、文档完善

本次更新四个核心文档：
- **VersionLog.md**：增加 round13 版本记录，完整记录 v2.0 迭代过程
- **README.md**：更新项目结构，增加数据补录模块说明，更新技术栈
- **PRD.md**：更新产品需求文档，完善功能规格说明
- **prompt.md**：更新开发指南，增加组件设计模式规范

### 四、v2.0 版本总结

#### 完成的功能模块

| 模块 | 路由 | 状态 |
|------|------|------|
| 宏观态势感知 | `/` | 完整 |
| 产业链结构化沙盘 | `/chain` | 完整 |
| 客户全景视图 | `/customer` | 完整 |
| 个人工作台 | `/tasks` | 完整 |
| 规则配置 | `/rules` | 完整 |
| 数据补录（独立页面） | `/supplement` | 完整 |
| 数据管理中心（独立页面） | `/data` | 完整 |

#### 技术架构

| 层面 | 技术选型 |
|------|---------|
| 框架 | React 18 + TypeScript 5 |
| 构建 | Vite 8 |
| 样式 | TailwindCSS 4 + CSS 变量 |
| 状态 | Zustand |
| 路由 | React Router 7 |
| 地图 | ECharts 6 + GeoJSON 离线数据 |
| 图表 | ECharts 6（散点/柱状/雷达/旭日/漏斗/树形/力导向） |
| 图标 | Lucide React |

#### 数据模型（18 种对象类型）

| 分组 | 类型 |
|------|------|
| 行政区划 | province / city / district / street |
| 行业与产业 | industry / sub_industry / chain / chain_node |
| 核心实体 | park / manager / firm |
| 关系数据 | executive / firm_relation |
| 事件记录 | visit_record / work_order / opportunity / plan |
| 指标数据 | admin_data |

#### 核心特性

- 双主题切换（Dark / Light）
- 数据导入/导出/模板下载（JSON + CSV）
- 全系统数据联动（导入后所有视图实时更新）
- AI 机器人助手（客户全景 + 工作台）
- GeoJSON 离线地图（全国 + 34 省）
- 完整索引体系（30+ 双向关联映射）
- API 服务层（DATA_SOURCE 切换开关）
- 团队负载可视化
- 商机发现与工单管理

### 五、遗留项与后续方向

| 方向 | 说明 |
|------|------|
| 后端对接 | 替换 `DATA_SOURCE: 'mock'` 为 `'remote'`，接入真实 REST API |
| 权限系统 | 增加用户角色（客户经理 / 团队负责人 / 风控 / 运营）权限控制 |
| 实时通知 | WebSocket 推送工单变更、商机提醒、系统公告 |
| 地理围栏 | LBS 打卡签到、拜访轨迹记录 |
| 数据可视化增强 | 交互式仪表盘自定义、多维数据分析 |
| 移动端适配 | 响应式布局优化，支持平板端访问 |
| 国际化 | i18n 框架支持英文界面 |

**核心目标：** 建立完整的数据对象模型，实现按对象类型统一导入/导出/模板下载，使原型系统可以通过补录真实数据替代模拟数据。

### 一、数据模型设计（v2.0）

新建 `src/data/types.ts`（v2.0），建立六层数据架构：

| 层次 | 对象类型 | 说明 |
|------|---------|------|
| 基础层 | province / city / district / street | 行政区划（省→市→区县→街道） |
| 行业层 | industry / sub_industry / chain / chain_node | 行业分类与产业链 |
| 核心层 | park / manager / firm | 园区、企业、客户经理（核心业务实体） |
| 关系层 | executive / firm_relation | 企业高管、企业间关系 |
| 事件层 | visit_record / work_order / opportunity / 投放_plan | 拜访、工单、商机、投放计划 |
| 指标层 | admin_data（按省份） | 行政区汇总指标 |

**关系联动设计**：
- 企业 → 多个园区（`parkIds[]`，支持跨园区）
- 企业 → 多个产业链节点（`chainNodeIds[]`，嵌入多条链）
- 企业 → 多个行业（`industryIds[]`）
- 客户经理 → 多家企业（`managerIdToFirmIds[]`）
- 工单/商机/拜访记录 均通过 `firmId` / `managerId` 关联

### 二、导入导出模块

新建 `src/data/importer.ts`（v2.0）：
- 支持 18 种对象类型的 JSON/CSV 解析
- 覆盖式导入，自动触发索引重建（`rebuildIndex()`）
- 索引覆盖：行政区划、行业、产业链、园区↔企业、经理↔企业、事件记录全维度索引
- 提供 `OBJECT_TYPE_META` 元数据（类型标签/图标/CSV列/示例数据）
- 提供 `getAll<T>()` 查询接口

新建 `src/data/exporter.ts`：
- `exportTemplateJSON()` / `exportTemplateCSV()`：导出指定类型的空模板
- `exportCurrentData()`：导出当前已导入的数据（JSON）
- `exportAllData()`：一键导出全量数据（单个 JSON 文件）

### 三、数据管理中心页面

新建 `src/pages/DataManager.tsx`：
- 左侧面板：按 6 大分组（行政区划/行业与产业/核心实体/关系数据/事件记录/指标数据）展示 18 种对象类型
- 每类型显示：当前数据条数、来源标识（"已导入"绿标 或 "示例数据"灰标）
- 中间详情面板：CSV 必需列说明、拖放上传区、JSON/CSV 模板下载、导出当前数据、恢复示例数据
- 底部一键"导出全量数据"
- 通知浮层：导入成功/失败/警告实时反馈
- 路由：`/data`，侧边栏新增"数据管理"入口

### 四、Store 升级

更新 `src/store/data.ts`：
- 新增 16 种新版对象类型的 Zustand 字段和 import action
- 新版字段初始值来自 `mockDataV2.ts`
- 保留旧版字段（firmData / parkData / teamMembers 等）兼容现有组件
- 提供 `getObjectCount()` / `getImportLog()` 工具方法

### 五、示例数据

新建 `src/data/mockDataV2.ts`：
- 完整的 7 个企业 + 3 个园区 + 5 个客户经理 + 3 条产业链 + 完整关系数据
- 每个企业均含：`FirmIndicator`（融资/IOT/财务/信用指标）
- 完整的工单（5条）、商机（4条）、投放计划（3条）、拜访记录（5条）

### 六、用户故事验证

数据补录完成后，以下用户故事可真实运行：

| 用户故事 | 涉及对象 | 联动效果 |
|---------|---------|---------|
| 补录企业数据 | firm + manager + park | 客户全景自动展示该企业完整档案 |
| 补录拜访记录 | visit_record + firm + manager | 工作台显示拜访时间线，工单自动带出 |
| 补录商机并建立投放计划 | opportunity + 投放_plan + firm | 团队视图展示投放进度 |
| 补录行政区指标 | admin_data（按省份） | 宏观面板地图热力图更新 |
| 补录产业链节点 | chain_node + chain | 产业链沙盘节点亮起 |
| 补录企业高管 | executive + firm | 客户全景触达路径增加"高管朋友圈"节点 |

--
round14
仔细审查本工程，比较三个对象：
1、本工程当前版本，定义为battle07src，
2、基于PRD.md和prompt.md生成的新系统为battle07cc，
3、基于PRDbygemini.md生成的新系统为battle07gg，
仔细推敲三个对象在系统功能上的差别，讨论优劣，给出差异化分析报告report.md，
然后给出更好的系统优化设计，并实现它，建立新的系统battle09，相关产品设计文档PRD09.md，以及可生成系统的prompt文档prompt09.md。
最后注意检查bug，然后更新VersionLog.md和ReadMe.md文档。
如果消耗完额度还没有做完，以现在的时间为起点，11个小时后自动继续任务。
请记住，当前工程还是demo原型阶段，要求数据能在保证一致性的前提下进行更新，但是审批权限、敏感信息这种思路就不用特别考虑。

---

## round15（2026-04-15）— 汽车产业链数据全站更新

**核心目标：** 在07版本全站添加汽车产业链数据，完善汽车产业链的企业、关系、园区关联。

### 一、数据更新内容

#### 1. 行业与子行业扩展（mockDataV2.ts）

| 行业 | 行业ID | 新增子行业 |
|------|--------|-----------|
| 汽车制造 | ind_auto | 汽车零部件总成、新能源汽车、汽车电子 |
| 汽车零部件 | ind_auto_parts | 汽车轮胎、汽车玻璃、钢铁铝合金 |

#### 2. 产业链数据（chainData.ts / mockDataV2.ts）

新增汽车产业链（chain_004），包含13个节点：

| 环节 | 节点名称 | 规模(亿) | 活跃度 | 银行占比 | 金租占比 |
|------|---------|---------|--------|---------|---------|
| 上游 | 钢铁与铝合金 | 180 | 72% | 88% | 12% |
| 上游 | 汽车轮胎 | 120 | 75% | 82% | 18% |
| 上游 | 汽车玻璃 | 100 | 70% | 85% | 15% |
| 上游 | 汽车电子元器件 | 220 | 82% | 75% | 25% |
| 上游 | 发动机与变速箱 | 350 | 78% | 80% | 20% |
| 上游 | 汽车零部件总成 | 400 | 85% | 78% | 22% |
| 中游 | 传统燃油车制造 | 500 | 65% | 85% | 15% |
| 中游 | 新能源汽车制造 | 550 | 92% | 70% | 30% |
| 中游 | 智能驾驶系统 | 300 | 88% | 72% | 28% |
| 中游 | 车联网与座舱 | 250 | 85% | 70% | 30% |
| 下游 | 整车销售4S店 | 350 | 75% | 80% | 20% |
| 下游 | 汽车后市场 | 280 | 80% | 75% | 25% |
| 下游 | 汽车金融与保险 | 200 | 78% | 90% | 10% |

#### 3. 企业数据扩展

新增9家汽车产业链相关企业：

| 企业ID | 企业名称 | 评级 | 规模 | 所在产业链节点 |
|--------|---------|------|------|--------------|
| firm_008 | 上海宝钢汽车板 | AAA | 龙头 | 钢铁与铝合金 |
| firm_009 | 杭州中策轮胎 | AA+ | 大型 | 汽车轮胎 |
| firm_011 | 武汉福耀玻璃 | AA | 大型 | 汽车玻璃 |
| firm_010 | 宁波均胜电子 | AA | 大型 | 智能驾驶系统、车联网与座舱 |
| firm_014 | 北京四维图新 | AA+ | 大型 | 智能驾驶系统、车联网与座舱 |
| firm_012 | 广州华德汽配 | A+ | 中型 | 汽车零部件总成、发动机与变速箱 |
| firm_013 | 重庆长安汽车 | AAA | 龙头 | 新能源汽车制造、传统燃油车制造 |
| firm_015 | 成都精典汽车 | A | 中型 | 整车销售4S店、汽车后市场 |
| firm_016 | 西安汽车金融 | AA- | 中型 | 汽车金融与保险 |

#### 4. 关系数据扩展

新增13条汽车产业链企业关系：
- 产业链供应关系（rl_026~rl_034）：福耀→长安、中策→长安、均胜→长安等
- 高管朋友圈关系（rl_035~rl_038）
- 协会关系（rl_039~rl_042）

#### 5. 商机与工单扩展

新增6条汽车产业链商机（OPP-2026-0005~0010）：
- 杭州中策轮胎设备更新直租（6000万）
- 宁波均胜电子扩产融资租赁（1.5亿）
- 重庆长安汽车设备采购直租（8亿）
- 武汉福耀玻璃产线升级直租（3500万）
- 北京四维图新智能座舱直租（5000万）
- 西安汽车金融设备直租（2000万）

新增5条汽车产业链工单（WO-2026-0006~0010）

#### 6. 拜访记录扩展

新增6条汽车产业链拜访记录（visit_006~011）

#### 7. 投放计划扩展

新增4条汽车产业链投放计划（PLAN-2026-0004~0008）

### 二、融资结构图表更新

在融资结构柱状图中新增4个汽车产业链环节：
- 新能源整车：银行70% / 金租30%
- 汽车零部件总成：银行78% / 金租22%
- 智能驾驶系统：银行72% / 金租28%
- 汽车后市场：银行75% / 金租25%

### 三、影响范围

| 模块 | 影响文件 | 变更内容 |
|------|---------|---------|
| 产业链数据 | chainData.ts | 新增汽车产业链节点、树形结构、融资结构 |
| Mock数据 | mockDataV2.ts | 新增行业、链、节点、企业、关系、商机、工单、拜访、投放 |
| 关系图谱 | relationLinkData.ts | 新增6家汽车企业节点、17条关系链路 |
| 数据索引 | dataIndex.ts | 索引已覆盖新增数据（自动关联） |
| 产业链页面 | IndustryChain.tsx | 展示动力电池产业链树形/图谱（汽车产业链待扩展视图） |

### 四、数据联动效果

汽车产业链数据全站更新后，系统具备以下联动能力：

1. **园区关联**：汽车产业链节点可通过园区关联展示
2. **企业关联**：汽车产业链企业可展示在产业链树形图节点详情中
3. **关系链路**：汽车产业链企业间的关系可在联系链路视图中展示
4. **商机发现**：新增商机自动关联对应企业和产业链节点
5. **工单管理**：新增工单自动关联对应企业和产业链节点
6. **客户全景**：新增企业可在客户全景视图中查看完整档案

---

*文档更新于 2026-04-15*

## round16 修订产业链的节点关系

## round17

注意，还有一些隐藏的信息也要补充到产业链中

1. level7有一个很细分的领域，叫做整机代工行业，有不少代工的机器人制造公司
2. 巡检机器人、协作机器人是偏场景的人形机器人，应该归到第5层里
3. 机器人的研发、测试等支撑性的上下游
   3.1 测试验证平台：提供机器人性能测试、安全认证、可靠性测试服务
   3.2 算力基础设施：提供大模型训练和推理所需的算力服务
   3.3 数据基础设施：提供数据存储、传输和处理服务
   3.4 研发服务：第三方研发机构、技术咨询公司
   3.5 检测认证服务：产品检测、安全认证、标准制定
4. UI修订，图谱界面上，可以根据图标隐藏一些节点，被"商机发现"的栏目挡住了，无法选择

## round18

目前的UI上看人形机器人产业链，太密集了，看不清楚。
我们上下游层级实际上都有7级以上了，调整一下树形的产业链图谱，
看得更清爽，
让我们更方便地理解这条产业链的上中下游、上游的上游，中游的不同向上追溯的产业链。
所以实际上，这里一张产业网。
所以，"人形机器人产业链"并不需要在树上用根节点来呈现，他只是这颗"树"、这幅"图"的名字而已。
先理解我的要求，然后再动手，不要着急。

## round 19

1. 产业链沙盘-图谱上的节点太密集了，间距无法拉开，节点圆的大小可以调小到原大小的80%
2. 产业链沙盘-树形图，如何从稀土材料向下一路找到本体：人形机器人的节点？

## round 20（2026-05-08）

**核心目标：** 补全人形机器人产业链缺失节点，完善AI芯片链路，重构树形数据完整结构。

### 发现的问题

人形机器人产业链的树形数据（`mockChainTreeData['chain_humanoid']`）原本只有4个材料体系分组，**核心零部件、关键子系统、整机制造、终端应用全部缺失**，导致：

- 图谱视图正常显示全部20个节点
- 树形视图只显示4个分组，无法下钻到具体节点
- AI芯片链路完全缺失

### 修复内容

#### 1. 新增节点

| 节点ID | 名称 | 层级 | 说明 |
|--------|------|------|------|
| `node_hr_silicon` | 硅片与晶圆 | 上游原材料 | AI芯片基础材料，12英寸晶圆 |
| `node_hr_wafer` | 晶圆加工 | 基础材料 | 研磨、抛光，光刻胶涂覆 |
| `node_hr_ai_chip` | AI芯片 | 核心零部件 | 机器人SoC、异构计算芯片，**活力95%规模350亿，核心大脑** |

#### 2. 新增关系

- 硅片 → 晶圆加工 → AI芯片（半导体上游链路）
- AI芯片 → 感知系统（AI感知推理）
- AI芯片 → 控制器（AI运动控制）
- AI芯片 → 灵巧手（AI灵巧手控制）
- AI芯片 → 关节模组（AI关节控制）
- AI芯片 → 机器人本体（**AI算力大脑，强度98%**）

#### 3. 树形数据重构

重新构建人形机器人产业链树形结构，分为6大分支：

1. **材料体系** → 稀土/碳纤维/铝合金/特种钢四组 → 机械核心零部件
2. **半导体体系** → 硅基材料 → AI芯片 → 智能系统（传感器/控制器/感知系统）
3. **执行系统** → 关节模组 + 灵巧手
4. **机器人本体** → 动力系统 + 整机代工
5. **终端应用** → 工业制造/巡检机器人/协作机器人/商业服务/医疗健康

#### 4. UI交互优化

- 图谱节点缩小至80%
- 树形图双击节点可展开/剖析下游应用的完整路径

---

## round21（2026-05-12）

**核心目标：** 通用化产业链树布局算法，实现折叠局部刷新，移除硬编码依赖。

### 问题背景

原 `buildGraphData` 函数存在三个严重问题：

1. **硬编码参数**：`LEVEL_W=160`、`NODE_H=60`、`canvasHeight=600` 写死，只对人形机器人单条链有效，新链 depth 更大或子节点更多即崩溃
2. **Y坐标公式错误**：`y = parentY + (siblingIdx - (siblingTotal-1)/2) * NODE_H` 中的 `siblingTotal` 传错（传的是父节点子节点数而非当前节点的兄弟数），导致二级子节点全部重叠；根节点 Y 基于错误高度导致距离一级节点过远
3. **折叠全图刷新**：每次折叠都触发 `echarts.init` + `dispose`，整个图重绘，体验差

### 解决方案

#### 1. 抽取 `buildGraphData` 为通用布局算法（`utils/chainLayout.ts`）

新增文件 `src/utils/chainLayout.ts`，实现 Reingold-Tilford 变体算法：

- **纯函数**：`computeChainLayout(treeData, collapsedMap, config, chainMeta, themeColors)`，输入任意 `ChainTreeNode`，不依赖任何产业链 ID
- **两遍遍历**：第一遍 bottom-up 计算 `subtreeHeight`（整个可见子树的垂直范围），第二遍 top-down 分配 Y 坐标
- **关键公式**：子节点 Y = 父节点 Y + (兄弟偏移) × nodeHeight；子节点起点 Y0 = 节点Y - 子节点总高/2（节点居中于子树）
- **布局参数外置**：`ChainLayoutConfig` 可按需覆盖 `levelWidth`/`nodeHeight`/`layerPadding`/`canvasMargin`
- **主题颜色注入**：通过参数传入，不在工具函数里硬编码

#### 2. 重构 `IndustryChain.tsx`

- `buildGraphData` 从 165 行内联代码 → 7 行调用
- `getCategoryIndex` 从硬编码每条链的 map → 动态遍历树构建（按深度优先首次出现的顺序分配序号）
- 不再引用任何 `chain_humanoid` 等具体 ID

#### 3. 折叠局部刷新（Effect 拆分）

将单个 `useEffect` 拆分为两个：

- **Effect A（初始化）**：只在 `viewMode` 变化时执行，`echarts.init` 创建实例，`treeInstanceRef` 持有引用，return 时 dispose
- **Effect B（数据渲染）**：在 `viewMode`、树数据、折叠状态等任意变化时执行，只调用 `chart.setOption({ series: [...] })` 更新 series，图表实例保持不变

**折叠操作流程**：点击节点 → 更新 `nodeCollapseMapRef` → `setNodeCollapseMap` → Effect B 重新执行 → `setOption` 更新 series → ECharts 执行 `animationDuration: 300` 过渡动画，节点平滑移动到新位置，折叠/展开的部分渐入/渐出。

### 文件变更

| 文件 | 变更类型 | 说明 |
|------|---------|------|
| `src/utils/chainLayout.ts` | 新增 | 通用树布局算法（Reingold-Tilford 变体） |
| `src/pages/IndustryChain.tsx` | 重构 | 移除硬编码，调用工具函数，Effect 拆分 |

### 设计原则

| 不再硬编码 | 现在怎么工作 |
|-----------|------------|
| `LEVEL_W=160`、`NODE_H=60` | 通过 `DEFAULT_LAYOUT_CONFIG` 配置，可按链覆盖 |
| `isGroupNode = name.includes('体系')` | 基于 `hasChildren` 判断，不看名称 |
| `canvasHeight = 600` | 动态按最深分支高度计算 |
| `getCategoryIndex` 枚举每条链 | 遍历当前树，cat 首次出现时分配序号 |
| 折叠全图重绘 | 只更新 series，图表实例保持不变 |

### Bug 修复：折叠后页面无法拖拽

**问题**：折叠树形节点后，容器 DOM 高度被更新为更小的 `canvasHeight`，ECharts 可视窗口随之上移，顶部节点超出可视区且无法拖拽回来。

**根因**：`Effect B` 每次折叠都执行 `chartRef.current.style.height = canvasHeight`，导致容器高度随折叠状态变化。

**修复**：
- `chainLayout.ts` 新增 `computeMaxCanvasHeight()` — 计算全展开时的最大画布高度，不受折叠影响
- `computeChainLayout` 返回值新增 `maxCanvasHeight` 字段
- `maxCanvasHeightRef` 持有全展开高度
- **Effect A**（初始化）：设置容器高度为全展开高度（仅执行一次）
- **Effect B**（折叠更新）：series 的 `height` 使用 `maxCanvasHeightRef` 固定值，不随折叠变化

**效果**：容器和 ECharts 视口高度固定，折叠只让节点平滑移动到新位置，不影响可拖拽范围；空白区域出现在底部。

---

*文档更新于 2026-05-12*
## round22 重新设计产业链子页面，忽略这个子页面的前期所有设计，按照下面要求重新构建
### 产业链模块功能说明
#### 前端：
##### banner
标题：产业链，右边有个下拉的选择框，用于选择分析对象：具体的某一条产业链；
选择框的右边有几个可以点亮、置灰的菜单，用于选择产业链的表达形式：树形图、斥力图，和商机“跑马”栏的显示与否。

##### 主要内容区域
1、根据选择的树形图或斥力图，以及后端推送来的数据，绘制产业链的关联图谱；
2、设计在页面的右部1/5处，一个“顶天立地”的信息栏，可自动隐藏的浮动信息框。
3、若在banner处，点击商机，则右端1/5处，浮现一个消息卡片，提醒对应的商机信息。
4、点击产业链的子节点，子结点对应行业的相关企业，呈现在消息栏以卡片形式逐个列出，注意多的话，只列前5个，每5个翻页。
5、树形图的要求：
5.1 根节点为产业链名称，向右给出第一级子节点，然后响应单机操作展开或折叠每个子节点；
5.2 展开子节点的叶子时，向右再平移一列，然后自上而下逐个排列，不得让叶子、子节点的框、文字右重叠。如果有，需要将新展开的叶子、子节点的位置向上或向下平移，避开重叠。
6、整个产业链的树形图或斥力图，都支持抓取后整体平移、拖拽，每个节点也都能响应按住鼠标后拖拽位置，随之而来是带动线条的变化。


#### 后端：
1、对接系统的产业链、产业链对应行业所包含的企业、行业、企业融资结构等数据，产业链相关、企业相关的资讯
2、相关信息的展现，随着相关节点的折叠、展开与下钻、上卷等前端要求，及时通过数据查询接口，获取数据传给前端进行渲染、展现。

## round 23
尝试解决树形图的问题。不着急动手，我们一起来原因先，只做分析，不做任何执行修改代码的动作。
1、为什么所有子节点，那么整齐地从根节点开始，右上方直线上升？
2、我希望一开始只有根节点和一级子节点，剩下的都自动折叠，然后形成每级子节点向右平移一段距离。这种方式，预设的坐标应该是什么样子的？思考一下公式。
切记不修改代码，我们仅仅只是讨论出可行的方案。

基于树结构的图，重新构建数据结构，用来存储节点（层级、本层级所有子节点的排序序号、pathid），对应再有一个path的数据结构，记录path（pathid，path上的节点信息）。
我们先试算一下，不着急真实地去动代码。讨论存储节点的计算数据源头是什么数据，然后怎么给出新的数据结构的计算方式。


# Role
你是一个资深的前端开发工程师和数据可视化专家，精通 ECharts 5 和 Tailwind CSS。

# Task
请帮我编写一个基于 ECharts 的数据可视化组件（单文件 HTML 即可，使用原生 JS + CDN，或者根据我当前项目框架给出 React/Vue 组件）。
该组件的核心功能是：接收一份**扁平化的图数据（Nodes & Links）**，并在“力导向图（斥力图）”和“树形图”两种布局之间进行丝滑切换。

# 核心设计与架构要求

## 1. 数据结构抽象 (Data Schema)
必须将数据与视图逻辑完全解耦。要求定义一套标准的扁平化 JSON 结构，用于描述任意产业生态或复杂依赖关系。
数据需要包含以下三部分：
- `categories`: 数组，定义类别及其颜色。如 `[{name: '核心', itemStyle: {color: '#xxx'}}, ...]`
- `nodes`: 数组，定义节点。格式：`{ id: '唯一标识', name: '展示名称', category: 类别索引(Number), symbolSize: 节点大小(Number) }`
- `links`: 数组，定义连线。格式：`{ source: '源节点ID', target: '目标节点ID', lineStyle: { type: 'solid' | 'dashed' | 'dotted' } }`

## 2. 核心算法：图数据转树形数据 (Graph to Tree Algorithm)
由于 ECharts 的 `tree` 系列需要递归结构的树形数据，而输入的是网状 `links`，你需要编写一个 `buildTreeData(rootId)` 函数进行转换。
**极其重要的算法防踩坑点：**
- **防死循环**：网状结构必有回环，必须使用 `Set` (如 `visited`) 记录已访问节点，遇到重复直接 return null。
- **主链路提取**：为了保证树形图展开时不会因为交叉连线导致结构错乱，过滤规则如下：在遍历子节点时，**仅保留连线 `lineStyle.type` 为 'solid' 或 'dotted' 的边，必须过滤掉 'dashed' 的边**（将 dashed 定义为跨类别的弱引用或辅助连线，不在树形主干中展示）。

## 3. ECharts 图表配置设计 (Chart Options)
- **Base Option**: 包含公共的 `tooltip` (格式化显示节点类别和名称)、`legend`、`title`。
- **Force Graph (力导向图配置)**:
  - `type: 'graph', layout: 'force'`
  - 配置合适的斥力(`repulsion`)、引力(`gravity`)、边长(`edgeLength`)，开启拖拽(`roam: true`)。
  - 节点要有阴影 (`shadowBlur`)，连线需支持 `emphasis: { focus: 'adjacency' }` 以实现高亮相邻节点。
- **Tree Graph (树形图配置)**:
  - `type: 'tree'`
  - 开启折叠/展开 (`expandAndCollapse: true`)，设置默认展开深度 `initialTreeDepth`。
  - 叶子节点和非叶子节点的 label 位置要有区分（如非叶子在左，叶子在右）。

## 4. UI 与交互 (UI/UX)
- 页面布局：全屏显示，上方悬浮或固定一个 Header 控制面板。
- 引入 Tailwind CSS 进行原子化样式布局。
- 在 Header 面板提供两个切换按钮：“斥力图模式”和“树形图模式”。
- **切换逻辑重点**：在调用 `myChart.setOption()` 切换 `series` 之前，**必须先调用 `myChart.clear()`**，防止 ECharts 默认的配置合并策略导致两种图表的残影重叠。
- 监听 `window.resize`，调用 `myChart.resize()` 保证响应式。

# Output
请提供完整的代码。你可以先在代码顶部构造一份简单的 Mock 数据（比如 A -> B, A -> C, B -> D 以及一根 C -> B 的 dashed 辅助线）来验证你的逻辑，然后实现完整的页面。
