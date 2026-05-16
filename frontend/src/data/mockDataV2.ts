// ═══════════════════════════════════════════════════════════════
// 新版 v2.0 模拟数据（mockDataV2.ts）
// 核心理念：提供完整的示例数据，用于填充新版全量对象类型
// 展示数据联动效果：企业 → 园区 → 产业链 → 客户全景 → 工作台
// ═══════════════════════════════════════════════════════════════

import type {
  Province, City, District, Street,
  Industry, SubIndustry, IndustryChain, ChainNode,
  ChainNodeRelation, ChainTreeNode,
  Park, Manager, Firm,
  Executive, FirmRelation, VisitRecord, WorkOrder, Opportunity, DeployPlan,
} from './types';

// ─────────────────────────────────────────────────────────────
// 行政区划
// ─────────────────────────────────────────────────────────────

export const mockProvinces: Province[] = [
  { id: 'prov_320000', code: '320000', name: '江苏省', lng: 119.5, lat: 32.5 },
  { id: 'prov_440000', code: '440000', name: '广东省', lng: 113.5, lat: 23.5 },
  { id: 'prov_330000', code: '330000', name: '浙江省', lng: 120.2, lat: 29.8 },
  { id: 'prov_510000', code: '510000', name: '四川省', lng: 104.0, lat: 30.6 },
  { id: 'prov_340000', code: '340000', name: '安徽省', lng: 117.3, lat: 31.8 },
];

export const mockCities: City[] = [
  { id: 'city_320400', code: '320400', name: '常州市', provinceId: 'prov_320000', lng: 119.9, lat: 31.8 },
  { id: 'city_320500', code: '320500', name: '苏州市', provinceId: 'prov_320000', lng: 120.6, lat: 31.3 },
  { id: 'city_440100', code: '440100', name: '广州市', provinceId: 'prov_440000', lng: 113.3, lat: 23.1 },
  { id: 'city_330100', code: '330100', name: '杭州市', provinceId: 'prov_330000', lng: 120.2, lat: 30.3 },
  { id: 'city_510100', code: '510100', name: '成都市', provinceId: 'prov_510000', lng: 104.0, lat: 30.6 },
];

export const mockDistricts: District[] = [
  { id: 'dist_320412', code: '320412', name: '武进区', cityId: 'city_320400', provinceId: 'prov_320000' },
  { id: 'dist_320505', code: '320505', name: '虎丘区', cityId: 'city_320500', provinceId: 'prov_320000' },
  { id: 'dist_440106', code: '440106', name: '天河区', cityId: 'city_440100', provinceId: 'prov_440000' },
  { id: 'dist_330106', code: '330106', name: '西湖区', cityId: 'city_330100', provinceId: 'prov_330000' },
  { id: 'dist_510104', code: '510104', name: '锦江区', cityId: 'city_510100', provinceId: 'prov_510000' },
];

export const mockStreets: Street[] = [
  { id: 'street_wj', name: '武进经开区', districtId: 'dist_320412', cityId: 'city_320400', provinceId: 'prov_320000', lng: 119.9, lat: 31.7 },
  { id: 'street_sq', name: '苏州高新区', districtId: 'dist_320505', cityId: 'city_320500', provinceId: 'prov_320000', lng: 120.6, lat: 31.3 },
  { id: 'street_th', name: '天河软件园', districtId: 'dist_440106', cityId: 'city_440100', provinceId: 'prov_440000', lng: 113.4, lat: 23.2 },
];

// ─────────────────────────────────────────────────────────────
// 行业与产业链
// ─────────────────────────────────────────────────────────────

export const mockIndustries: Industry[] = [
  { id: 'ind_new_energy', name: '新能源', color: '#00E676', subIndustries: ['sub_li_battery', 'sub_solar'] },
  { id: 'ind_auto', name: '汽车制造', color: '#3B82F6', subIndustries: ['sub_auto_parts', 'sub_ev', 'sub_auto_electronics'] },
  { id: 'ind_semi', name: '半导体', color: '#A78BFA', subIndustries: ['sub_chip'] },
  { id: 'ind_new_materials', name: '新材料', color: '#F59E0B', subIndustries: [] },
  { id: 'ind_auto_parts', name: '汽车零部件', color: '#60A5FA', subIndustries: ['sub_tire', 'sub_glass', 'sub_steel'] },
];

export const mockSubIndustries: SubIndustry[] = [
  { id: 'sub_li_battery', name: '锂电设备', industryId: 'ind_new_energy', color: '#00E676' },
  { id: 'sub_solar', name: '光伏组件', industryId: 'ind_new_energy', color: '#A3E635' },
  { id: 'sub_auto_parts', name: '汽车零部件总成', industryId: 'ind_auto', color: '#3B82F6' },
  { id: 'sub_ev', name: '新能源汽车', industryId: 'ind_auto', color: '#22D3EE' },
  { id: 'sub_auto_electronics', name: '汽车电子', industryId: 'ind_auto', color: '#818CF8' },
  { id: 'sub_chip', name: '芯片封测', industryId: 'ind_semi', color: '#A78BFA' },
  { id: 'sub_tire', name: '汽车轮胎', industryId: 'ind_auto_parts', color: '#64748B' },
  { id: 'sub_glass', name: '汽车玻璃', industryId: 'ind_auto_parts', color: '#94A3B8' },
  { id: 'sub_steel', name: '钢铁铝合金', industryId: 'ind_auto_parts', color: '#475569' },
];

export const mockChains: IndustryChain[] = [
  { id: 'chain_power_battery', name: '动力电池产业链', status: 'active', description: '从正极材料到整车应用的完整链条', color: '#00E676' },
  { id: 'chain_ev', name: '新能源汽车产业链', status: 'active', description: '整车及核心零部件制造', color: '#3B82F6' },
  { id: 'chain_solar', name: '光伏产业链', status: 'active', description: '硅料-组件-电站完整链条', color: '#F59E0B' },
  { id: 'chain_auto', name: '汽车产业链', status: 'active', description: '从零部件到整车制造，再到销售与后市场的完整链条', color: '#3B82F6' },
  { id: 'chain_humanoid', name: '人形机器人产业链', status: 'active', description: '从核心零部件到机器人整机的完整链条', color: '#EC4899' },
];

// 动力电池产业链节点（扩展：包含图谱展示属性）
export const mockChainNodes: ChainNode[] = [
  // ── 动力电池产业链 ──
  { id: 'node_lithium', chainId: 'chain_power_battery', name: '锂矿开采', stage: 'upstream', scale: 120, activity: 70, bankRatio: 90, leaseRatio: 10, description: '锂矿资源开采与选矿', shortName: '锂矿', graphX: 200, graphY: 50, graphSize: 44, graphCategory: '上游原材料', status: 'active' },
  { id: 'node_cathode', chainId: 'chain_power_battery', name: '正极材料', stage: 'upstream', scale: 80, activity: 85, bankRatio: 78, leaseRatio: 12, description: '磷酸铁锂/三元材料', shortName: '正极', graphX: 400, graphY: 50, graphSize: 52, graphCategory: '上游原材料', status: 'active' },
  { id: 'node_anode', chainId: 'chain_power_battery', name: '负极材料', stage: 'upstream', scale: 75, activity: 80, bankRatio: 82, leaseRatio: 8, description: '石墨负极材料', shortName: '负极', graphX: 600, graphY: 50, graphSize: 48, graphCategory: '上游原材料', status: 'active' },
  { id: 'node_electrolyte', chainId: 'chain_power_battery', name: '电解液', stage: 'upstream', scale: 90, activity: 75, bankRatio: 82, leaseRatio: 18, description: '锂电池电解液配制', shortName: '电解液', graphX: 800, graphY: 50, graphSize: 38, graphCategory: '上游原材料', status: 'active' },
  { id: 'node_separator', chainId: 'chain_power_battery', name: '隔膜', stage: 'upstream', scale: 110, activity: 74, bankRatio: 86, leaseRatio: 14, description: '锂电池隔膜材料', shortName: '隔膜', graphX: 1000, graphY: 50, graphSize: 40, graphCategory: '上游原材料', status: 'active' },
  { id: 'node_equipment', chainId: 'chain_power_battery', name: '锂电设备', stage: 'midstream', scale: 300, activity: 88, bankRatio: 78, leaseRatio: 22, description: '锂电生产设备制造', shortName: '设备', graphX: 200, graphY: 250, graphSize: 56, graphCategory: '装备供应商', status: 'active' },
  { id: 'node_cell', chainId: 'chain_power_battery', name: '电芯制造', stage: 'midstream', scale: 100, activity: 92, bankRatio: 65, leaseRatio: 22, description: '电芯生产与封装', shortName: '电芯', graphX: 500, graphY: 250, graphSize: 72, graphCategory: '中游制造', status: 'active' },
  { id: 'node_bms', chainId: 'chain_power_battery', name: 'BMS系统', stage: 'midstream', scale: 140, activity: 82, bankRatio: 80, leaseRatio: 20, description: '电池管理系统', shortName: 'BMS', graphX: 800, graphY: 250, graphSize: 44, graphCategory: '中游制造', status: 'active' },
  { id: 'node_pack', chainId: 'chain_power_battery', name: '电池包组装', stage: 'midstream', scale: 85, activity: 80, bankRatio: 70, leaseRatio: 18, description: '动力电池包集成', shortName: 'PACK', graphX: 500, graphY: 420, graphSize: 64, graphCategory: '中游制造', status: 'active' },
  { id: 'node_storage', chainId: 'chain_power_battery', name: '储能系统', stage: 'downstream', scale: 250, activity: 80, bankRatio: 70, leaseRatio: 30, description: '储能电池系统集成', shortName: '储能', graphX: 300, graphY: 560, graphSize: 52, graphCategory: '下游应用', status: 'active' },
  { id: 'node_vehicle', chainId: 'chain_power_battery', name: '新能源整车', stage: 'downstream', scale: 450, activity: 90, bankRatio: 75, leaseRatio: 25, description: '新能源汽车装配', shortName: '整车', graphX: 700, graphY: 560, graphSize: 66, graphCategory: '下游应用', status: 'active' },
  // ── 汽车产业链节点 ──
  { id: 'node_steel', chainId: 'chain_auto', name: '钢铁与铝合金', stage: 'upstream', scale: 180, activity: 72, bankRatio: 88, leaseRatio: 12, description: '汽车用高强度钢、铝合金板材', shortName: '钢材', graphX: 200, graphY: 50, graphSize: 48, graphCategory: '上游原材料', status: 'active' },
  { id: 'node_tire', chainId: 'chain_auto', name: '汽车轮胎', stage: 'upstream', scale: 120, activity: 75, bankRatio: 82, leaseRatio: 18, description: '乘用车/商用车轮胎制造', shortName: '轮胎', graphX: 400, graphY: 50, graphSize: 40, graphCategory: '上游原材料', status: 'active' },
  { id: 'node_glass', chainId: 'chain_auto', name: '汽车玻璃', stage: 'upstream', scale: 100, activity: 70, bankRatio: 85, leaseRatio: 15, description: '钢化玻璃、夹层玻璃、智能玻璃', shortName: '玻璃', graphX: 600, graphY: 50, graphSize: 38, graphCategory: '上游原材料', status: 'active' },
  { id: 'node_electronics', chainId: 'chain_auto', name: '汽车电子元器件', stage: 'upstream', scale: 220, activity: 82, bankRatio: 75, leaseRatio: 25, description: '传感器、控制器、线束', shortName: '电子', graphX: 800, graphY: 50, graphSize: 50, graphCategory: '上游原材料', status: 'active' },
  { id: 'node_engine', chainId: 'chain_auto', name: '发动机与变速箱', stage: 'upstream', scale: 350, activity: 78, bankRatio: 80, leaseRatio: 20, description: '燃油发动机、电机、变速箱', shortName: '发动机', graphX: 1000, graphY: 50, graphSize: 60, graphCategory: '核心零部件', status: 'active' },
  { id: 'node_parts', chainId: 'chain_auto', name: '汽车零部件总成', stage: 'upstream', scale: 400, activity: 85, bankRatio: 78, leaseRatio: 22, description: '车身件、底盘件、内饰件', shortName: '总成', graphX: 600, graphY: 200, graphSize: 65, graphCategory: '核心零部件', status: 'active' },
  { id: 'node_ice_vehicle', chainId: 'chain_auto', name: '传统燃油车制造', stage: 'midstream', scale: 500, activity: 65, bankRatio: 85, leaseRatio: 15, description: '燃油乘用车/商用车整车装配', shortName: '燃油车', graphX: 300, graphY: 350, graphSize: 60, graphCategory: '整车制造', status: 'dormant' },
  { id: 'node_ev_vehicle', chainId: 'chain_auto', name: '新能源汽车制造', stage: 'midstream', scale: 550, activity: 92, bankRatio: 70, leaseRatio: 30, description: '纯电动/插电混动整车装配', shortName: '新能源', graphX: 600, graphY: 350, graphSize: 70, graphCategory: '整车制造', status: 'active' },
  { id: 'node_adb', chainId: 'chain_auto', name: '智能驾驶系统', stage: 'midstream', scale: 300, activity: 88, bankRatio: 72, leaseRatio: 28, description: 'ADAS、自动驾驶域控制器', shortName: '智驾', graphX: 900, graphY: 350, graphSize: 55, graphCategory: '智能网联', status: 'active' },
  { id: 'node_cockpit', chainId: 'chain_auto', name: '车联网与座舱', stage: 'midstream', scale: 250, activity: 85, bankRatio: 70, leaseRatio: 30, description: '智能座舱、车联网终端', shortName: '座舱', graphX: 1200, graphY: 350, graphSize: 50, graphCategory: '智能网联', status: 'active' },
  { id: 'node_4s', chainId: 'chain_auto', name: '整车销售4S店', stage: 'downstream', scale: 350, activity: 75, bankRatio: 80, leaseRatio: 20, description: '整车销售、售后服务、零配件、信息反馈', shortName: '4S店', graphX: 400, graphY: 500, graphSize: 55, graphCategory: '下游服务', status: 'active' },
  { id: 'node_after_market', chainId: 'chain_auto', name: '汽车后市场', stage: 'downstream', scale: 280, activity: 80, bankRatio: 75, leaseRatio: 25, description: '维修保养、改装、二手车', shortName: '后市场', graphX: 700, graphY: 500, graphSize: 48, graphCategory: '下游服务', status: 'active' },
  { id: 'node_finance', chainId: 'chain_auto', name: '汽车金融与保险', stage: 'downstream', scale: 200, activity: 78, bankRatio: 90, leaseRatio: 10, description: '车贷、车险、融资租赁', shortName: '金融', graphX: 1000, graphY: 500, graphSize: 45, graphCategory: '下游服务', status: 'active' },

  // ── 人形机器人产业链 ──
  // 第0层：最上游原材料
  { id: 'node_hr_rare_earth', chainId: 'chain_humanoid', name: '稀土矿开采', stage: 'upstream', scale: 80, activity: 72, bankRatio: 88, leaseRatio: 12, description: '镨钕镝铽等稀土矿开采与冶炼', shortName: '稀土矿', graphX: 100, graphY: 50, graphSize: 42, graphCategory: '上游原材料', status: 'active' },
  { id: 'node_hr_carbon', chainId: 'chain_humanoid', name: '碳纤维原丝', stage: 'upstream', scale: 60, activity: 68, bankRatio: 85, leaseRatio: 15, description: '碳纤维原丝生产与碳化处理', shortName: '碳纤维', graphX: 250, graphY: 50, graphSize: 38, graphCategory: '上游原材料', status: 'active' },
  { id: 'node_hr_aluminum', chainId: 'chain_humanoid', name: '高强度铝合金', stage: 'upstream', scale: 120, activity: 75, bankRatio: 90, leaseRatio: 10, description: '航空级高强度铝合金材料', shortName: '铝合金', graphX: 400, graphY: 50, graphSize: 48, graphCategory: '上游原材料', status: 'active' },
  { id: 'node_hr_steel', chainId: 'chain_humanoid', name: '特种钢材', stage: 'upstream', scale: 100, activity: 70, bankRatio: 92, leaseRatio: 8, description: '轴承钢、模具钢等特种钢材', shortName: '特钢', graphX: 550, graphY: 50, graphSize: 44, graphCategory: '上游原材料', status: 'active' },
  { id: 'node_hr_silicon', chainId: 'chain_humanoid', name: '硅片与晶圆', stage: 'upstream', scale: 150, activity: 74, bankRatio: 85, leaseRatio: 15, description: '12英寸晶圆制造，AI芯片基础材料', shortName: '晶圆', graphX: 700, graphY: 50, graphSize: 46, graphCategory: '上游原材料', status: 'active' },

  // 第1层：基础材料加工
  { id: 'node_hr_magnet', chainId: 'chain_humanoid', name: '永磁材料', stage: 'upstream', scale: 90, activity: 80, bankRatio: 82, leaseRatio: 18, description: '钕铁硼永磁体生产与表面处理', shortName: '永磁体', graphX: 100, graphY: 150, graphSize: 46, graphCategory: '基础材料', status: 'active' },
  { id: 'node_hr_aluminum_alloy', chainId: 'chain_humanoid', name: '铝合金型材', stage: 'upstream', scale: 110, activity: 78, bankRatio: 85, leaseRatio: 15, description: '轻量化铝合金型材挤压成型', shortName: '铝型材', graphX: 250, graphY: 150, graphSize: 48, graphCategory: '基础材料', status: 'active' },
  { id: 'node_hr_composite', chainId: 'chain_humanoid', name: '碳纤维复材', stage: 'upstream', scale: 70, activity: 74, bankRatio: 80, leaseRatio: 20, description: '碳纤维复合材料成型加工', shortName: '碳复材', graphX: 400, graphY: 150, graphSize: 40, graphCategory: '基础材料', status: 'active' },
  { id: 'node_hr_engineering_plastic', chainId: 'chain_humanoid', name: '工程塑料', stage: 'upstream', scale: 85, activity: 76, bankRatio: 88, leaseRatio: 12, description: 'PEEK、PPS等高性能工程塑料', shortName: '工程塑料', graphX: 550, graphY: 150, graphSize: 44, graphCategory: '基础材料', status: 'active' },
  { id: 'node_hr_wafer', chainId: 'chain_humanoid', name: '晶圆加工', stage: 'upstream', scale: 120, activity: 76, bankRatio: 82, leaseRatio: 18, description: '晶圆研磨、抛光、光刻胶涂覆等前道加工', shortName: '晶圆加工', graphX: 700, graphY: 150, graphSize: 44, graphCategory: '基础材料', status: 'active' },

  // 第2层：核心零部件制造
  { id: 'node_hr_motor', chainId: 'chain_humanoid', name: '伺服电机', stage: 'midstream', scale: 200, activity: 88, bankRatio: 75, leaseRatio: 25, description: '无框力矩电机、空心杯电机等', shortName: '伺服电机', graphX: 100, graphY: 250, graphSize: 55, graphCategory: '核心零部件', status: 'active' },
  { id: 'node_hr_gearbox', chainId: 'chain_humanoid', name: '精密减速器', stage: 'midstream', scale: 180, activity: 85, bankRatio: 78, leaseRatio: 22, description: '谐波减速器、RV减速器、行星减速器', shortName: '精密减速器', graphX: 280, graphY: 250, graphSize: 52, graphCategory: '核心零部件', status: 'active' },
  { id: 'node_hr_sensor', chainId: 'chain_humanoid', name: '传感器', stage: 'midstream', scale: 220, activity: 90, bankRatio: 72, leaseRatio: 28, description: '力传感器、IMU、视觉传感器、触觉传感器', shortName: '传感器', graphX: 460, graphY: 250, graphSize: 58, graphCategory: '核心零部件', status: 'active' },
  { id: 'node_hr_controller', chainId: 'chain_humanoid', name: '控制器', stage: 'midstream', scale: 160, activity: 86, bankRatio: 80, leaseRatio: 20, description: '主控制器、运动控制器、伺服驱动器', shortName: '控制器', graphX: 640, graphY: 250, graphSize: 50, graphCategory: '核心零部件', status: 'active' },
  { id: 'node_hr_ai_chip', chainId: 'chain_humanoid', name: 'AI芯片', stage: 'midstream', scale: 350, activity: 95, bankRatio: 65, leaseRatio: 35, description: '机器人SoC、异构计算芯片、边缘AI推理芯片', shortName: 'AI芯片', graphX: 820, graphY: 250, graphSize: 62, graphCategory: '核心零部件', status: 'active' },

  // 第3层：关键子系统
  { id: 'node_hr_joint', chainId: 'chain_humanoid', name: '关节模组', stage: 'midstream', scale: 280, activity: 92, bankRatio: 70, leaseRatio: 30, description: '一体化关节模组集成', shortName: '关节模组', graphX: 200, graphY: 350, graphSize: 65, graphCategory: '关键子系统', status: 'active' },
  { id: 'node_hr_hand', chainId: 'chain_humanoid', name: '灵巧手', stage: 'midstream', scale: 150, activity: 82, bankRatio: 75, leaseRatio: 25, description: '多指灵巧手与末端执行器', shortName: '灵巧手', graphX: 400, graphY: 350, graphSize: 48, graphCategory: '关键子系统', status: 'active' },
  { id: 'node_hr_perception', chainId: 'chain_humanoid', name: '感知系统', stage: 'midstream', scale: 200, activity: 88, bankRatio: 72, leaseRatio: 28, description: '视觉感知、语音交互、环境感知系统', shortName: '感知系统', graphX: 600, graphY: 350, graphSize: 52, graphCategory: '关键子系统', status: 'active' },
  { id: 'node_hr_power', chainId: 'chain_humanoid', name: '动力系统', stage: 'midstream', scale: 180, activity: 84, bankRatio: 78, leaseRatio: 22, description: '电池模组、电源管理系统、热管理系统', shortName: '动力系统', graphX: 820, graphY: 350, graphSize: 50, graphCategory: '关键子系统', status: 'active' },

  // 第4层：整机制造
  { id: 'node_hr_robot_body', chainId: 'chain_humanoid', name: '机器人本体', stage: 'downstream', scale: 350, activity: 90, bankRatio: 68, leaseRatio: 32, description: '人形机器人整机组装与测试', shortName: '机器人本体', graphX: 400, graphY: 450, graphSize: 70, graphCategory: '整机制造', status: 'active' },

  // 第5层：终端应用（新增巡检/协作机器人，调整位置）
  { id: 'node_hr_industrial', chainId: 'chain_humanoid', name: '工业制造', stage: 'terminal', scale: 300, activity: 85, bankRatio: 75, leaseRatio: 25, description: '汽车制造、电子装配、物流搬运等工业场景', shortName: '工业制造', graphX: 100, graphY: 550, graphSize: 52, graphCategory: '终端应用', status: 'active' },
  { id: 'node_hr_service', chainId: 'chain_humanoid', name: '商业服务', stage: 'terminal', scale: 250, activity: 82, bankRatio: 78, leaseRatio: 22, description: '导览接待、餐饮服务、酒店配送等商业场景', shortName: '商业服务', graphX: 640, graphY: 550, graphSize: 50, graphCategory: '终端应用', status: 'active' },
  { id: 'node_hr_medical', chainId: 'chain_humanoid', name: '医疗健康', stage: 'terminal', scale: 200, activity: 78, bankRatio: 82, leaseRatio: 18, description: '手术辅助、康复护理、医疗配送等医疗场景', shortName: '医疗健康', graphX: 820, graphY: 550, graphSize: 48, graphCategory: '终端应用', status: 'active' },
  { id: 'node_hr_special', chainId: 'chain_humanoid', name: '特种作业', stage: 'terminal', scale: 180, activity: 80, bankRatio: 85, leaseRatio: 15, description: '危险环境作业、应急救援等特种场景', shortName: '特种作业', graphX: 1000, graphY: 550, graphSize: 46, graphCategory: '终端应用', status: 'active' },

  // 第4.5层：整机代工（新增）
  { id: 'node_hr_odm', chainId: 'chain_humanoid', name: '整机代工', stage: 'downstream', scale: 250, activity: 85, bankRatio: 72, leaseRatio: 28, description: '为品牌商提供整机OEM/ODM代工服务', shortName: '代工', graphX: 600, graphY: 450, graphSize: 55, graphCategory: '整机制造', status: 'active' },

  // 第5层：终端应用（新增巡检/协作机器人）
  { id: 'node_hr_inspection', chainId: 'chain_humanoid', name: '巡检机器人', stage: 'terminal', scale: 180, activity: 82, bankRatio: 78, leaseRatio: 22, description: '电力巡检、工厂巡检、安防巡逻等场景', shortName: '巡检机器人', graphX: 280, graphY: 550, graphSize: 48, graphCategory: '终端应用', status: 'active' },
  { id: 'node_hr_collaborative', chainId: 'chain_humanoid', name: '协作机器人', stage: 'terminal', scale: 200, activity: 88, bankRatio: 70, leaseRatio: 30, description: '人机协作、精密装配、医疗辅助等场景', shortName: '协作机器人', graphX: 460, graphY: 550, graphSize: 50, graphCategory: '终端应用', status: 'active' },

  // 第6层：研发支撑（新增）
  { id: 'node_hr_test', chainId: 'chain_humanoid', name: '测试验证', stage: 'terminal', scale: 120, activity: 75, bankRatio: 80, leaseRatio: 20, description: '机器人性能测试、安全认证、可靠性测试服务', shortName: '测试验证', graphX: 100, graphY: 650, graphSize: 44, graphCategory: '研发支撑', status: 'active' },
  { id: 'node_hr_compute', chainId: 'chain_humanoid', name: '算力基础设施', stage: 'terminal', scale: 200, activity: 85, bankRatio: 75, leaseRatio: 25, description: '大模型训练和推理所需的算力服务', shortName: '算力', graphX: 300, graphY: 650, graphSize: 48, graphCategory: '研发支撑', status: 'active' },
  { id: 'node_hr_data', chainId: 'chain_humanoid', name: '数据基础设施', stage: 'terminal', scale: 150, activity: 80, bankRatio: 78, leaseRatio: 22, description: '数据存储、传输和处理服务', shortName: '数据基础设施', graphX: 500, graphY: 650, graphSize: 46, graphCategory: '研发支撑', status: 'active' },
  { id: 'node_hr_rd', chainId: 'chain_humanoid', name: '研发服务', stage: 'terminal', scale: 130, activity: 78, bankRatio: 82, leaseRatio: 18, description: '第三方研发机构、技术咨询公司', shortName: '研发服务', graphX: 700, graphY: 650, graphSize: 44, graphCategory: '研发支撑', status: 'active' },
  { id: 'node_hr_cert', chainId: 'chain_humanoid', name: '检测认证', stage: 'terminal', scale: 100, activity: 72, bankRatio: 85, leaseRatio: 15, description: '产品检测、安全认证、标准制定', shortName: '检测认证', graphX: 900, graphY: 650, graphSize: 42, graphCategory: '研发支撑', status: 'active' },
];

// 产业链节点关系（节点间的流向关系）
export const mockChainNodeRelations: ChainNodeRelation[] = [
  // ── 动力电池产业链 ──
  { id: 'rel_001', sourceNodeId: 'node_lithium', targetNodeId: 'node_cathode', chainId: 'chain_power_battery', relationType: 'flow', description: '锂矿供应', strength: 90, isPrimary: true },
  { id: 'rel_002', sourceNodeId: 'node_lithium', targetNodeId: 'node_anode', chainId: 'chain_power_battery', relationType: 'flow', description: '锂矿供应', strength: 85, isPrimary: true },
  { id: 'rel_003', sourceNodeId: 'node_cathode', targetNodeId: 'node_cell', chainId: 'chain_power_battery', relationType: 'flow', description: '正极材料供应', strength: 95, isPrimary: true },
  { id: 'rel_004', sourceNodeId: 'node_anode', targetNodeId: 'node_cell', chainId: 'chain_power_battery', relationType: 'flow', description: '负极材料供应', strength: 92, isPrimary: true },
  { id: 'rel_005', sourceNodeId: 'node_electrolyte', targetNodeId: 'node_cell', chainId: 'chain_power_battery', relationType: 'flow', description: '电解液供应', strength: 88, isPrimary: true },
  { id: 'rel_006', sourceNodeId: 'node_separator', targetNodeId: 'node_cell', chainId: 'chain_power_battery', relationType: 'flow', description: '隔膜供应', strength: 85, isPrimary: true },
  { id: 'rel_007', sourceNodeId: 'node_equipment', targetNodeId: 'node_cell', chainId: 'chain_power_battery', relationType: 'flow', description: '设备供应', strength: 80, isPrimary: false },
  { id: 'rel_008', sourceNodeId: 'node_cell', targetNodeId: 'node_bms', chainId: 'chain_power_battery', relationType: 'flow', description: '电芯供应', strength: 90, isPrimary: true },
  { id: 'rel_009', sourceNodeId: 'node_cell', targetNodeId: 'node_pack', chainId: 'chain_power_battery', relationType: 'flow', description: '电芯供应', strength: 95, isPrimary: true },
  { id: 'rel_010', sourceNodeId: 'node_bms', targetNodeId: 'node_pack', chainId: 'chain_power_battery', relationType: 'flow', description: 'BMS配套', strength: 88, isPrimary: true },
  { id: 'rel_011', sourceNodeId: 'node_pack', targetNodeId: 'node_storage', chainId: 'chain_power_battery', relationType: 'flow', description: '电池包供应', strength: 75, isPrimary: false },
  { id: 'rel_012', sourceNodeId: 'node_pack', targetNodeId: 'node_vehicle', chainId: 'chain_power_battery', relationType: 'flow', description: '电池包供应', strength: 90, isPrimary: true },
  // ── 汽车产业链 ──
  { id: 'rel_101', sourceNodeId: 'node_steel', targetNodeId: 'node_parts', chainId: 'chain_auto', relationType: 'flow', description: '钢材供应', strength: 85, isPrimary: true },
  { id: 'rel_102', sourceNodeId: 'node_tire', targetNodeId: 'node_parts', chainId: 'chain_auto', relationType: 'flow', description: '轮胎供应', strength: 80, isPrimary: true },
  { id: 'rel_103', sourceNodeId: 'node_glass', targetNodeId: 'node_parts', chainId: 'chain_auto', relationType: 'flow', description: '玻璃供应', strength: 78, isPrimary: true },
  { id: 'rel_104', sourceNodeId: 'node_electronics', targetNodeId: 'node_parts', chainId: 'chain_auto', relationType: 'flow', description: '电子元器件供应', strength: 82, isPrimary: true },
  { id: 'rel_105', sourceNodeId: 'node_engine', targetNodeId: 'node_ice_vehicle', chainId: 'chain_auto', relationType: 'flow', description: '发动机供应', strength: 90, isPrimary: true },
  { id: 'rel_106', sourceNodeId: 'node_parts', targetNodeId: 'node_ice_vehicle', chainId: 'chain_auto', relationType: 'flow', description: '零部件供应', strength: 88, isPrimary: true },
  { id: 'rel_107', sourceNodeId: 'node_parts', targetNodeId: 'node_ev_vehicle', chainId: 'chain_auto', relationType: 'flow', description: '零部件供应', strength: 92, isPrimary: true },
  { id: 'rel_108', sourceNodeId: 'node_bms', targetNodeId: 'node_ev_vehicle', chainId: 'chain_auto', relationType: 'flow', description: '电池系统供应', strength: 85, isPrimary: true },
  { id: 'rel_109', sourceNodeId: 'node_adb', targetNodeId: 'node_ev_vehicle', chainId: 'chain_auto', relationType: 'flow', description: '智驾系统供应', strength: 80, isPrimary: false },
  { id: 'rel_110', sourceNodeId: 'node_cockpit', targetNodeId: 'node_ev_vehicle', chainId: 'chain_auto', relationType: 'flow', description: '座舱系统供应', strength: 78, isPrimary: false },
  { id: 'rel_111', sourceNodeId: 'node_ev_vehicle', targetNodeId: 'node_4s', chainId: 'chain_auto', relationType: 'flow', description: '整车销售', strength: 95, isPrimary: true },
  { id: 'rel_112', sourceNodeId: 'node_4s', targetNodeId: 'node_after_market', chainId: 'chain_auto', relationType: 'flow', description: '售后服务', strength: 88, isPrimary: true },
  { id: 'rel_113', sourceNodeId: 'node_ev_vehicle', targetNodeId: 'node_finance', chainId: 'chain_auto', relationType: 'fund', description: '汽车金融', strength: 75, isPrimary: false },

  // ── 人形机器人产业链 ──
  // 第0层 → 第1层：原材料 → 基础材料
  { id: 'rel_hr_001', sourceNodeId: 'node_hr_rare_earth', targetNodeId: 'node_hr_magnet', chainId: 'chain_humanoid', relationType: 'flow', description: '稀土供应', strength: 92, isPrimary: true },
  { id: 'rel_hr_002', sourceNodeId: 'node_hr_carbon', targetNodeId: 'node_hr_composite', chainId: 'chain_humanoid', relationType: 'flow', description: '碳纤维供应', strength: 88, isPrimary: true },
  { id: 'rel_hr_003', sourceNodeId: 'node_hr_aluminum', targetNodeId: 'node_hr_aluminum_alloy', chainId: 'chain_humanoid', relationType: 'flow', description: '铝材供应', strength: 90, isPrimary: true },

  // 第1层 → 第2层：基础材料 → 核心零部件
  { id: 'rel_hr_011', sourceNodeId: 'node_hr_magnet', targetNodeId: 'node_hr_motor', chainId: 'chain_humanoid', relationType: 'flow', description: '永磁体供应', strength: 95, isPrimary: true },
  { id: 'rel_hr_012', sourceNodeId: 'node_hr_magnet', targetNodeId: 'node_hr_sensor', chainId: 'chain_humanoid', relationType: 'flow', description: '永磁体供应', strength: 85, isPrimary: false },
  { id: 'rel_hr_013', sourceNodeId: 'node_hr_aluminum_alloy', targetNodeId: 'node_hr_motor', chainId: 'chain_humanoid', relationType: 'flow', description: '铝合金供应', strength: 82, isPrimary: true },
  { id: 'rel_hr_014', sourceNodeId: 'node_hr_aluminum_alloy', targetNodeId: 'node_hr_joint', chainId: 'chain_humanoid', relationType: 'flow', description: '铝合金供应', strength: 88, isPrimary: true },
  { id: 'rel_hr_015', sourceNodeId: 'node_hr_composite', targetNodeId: 'node_hr_robot_body', chainId: 'chain_humanoid', relationType: 'flow', description: '碳纤维供应', strength: 80, isPrimary: false },
  { id: 'rel_hr_016', sourceNodeId: 'node_hr_engineering_plastic', targetNodeId: 'node_hr_controller', chainId: 'chain_humanoid', relationType: 'flow', description: '工程塑料供应', strength: 75, isPrimary: false },
  { id: 'rel_hr_017', sourceNodeId: 'node_hr_steel', targetNodeId: 'node_hr_gearbox', chainId: 'chain_humanoid', relationType: 'flow', description: '特种钢材供应', strength: 90, isPrimary: true },
  // 硅片→晶圆加工→AI芯片链路
  { id: 'rel_hr_018', sourceNodeId: 'node_hr_silicon', targetNodeId: 'node_hr_wafer', chainId: 'chain_humanoid', relationType: 'flow', description: '硅片供应', strength: 92, isPrimary: true },

  // 第1层 → 第2层：基础材料 → AI芯片
  { id: 'rel_hr_019', sourceNodeId: 'node_hr_wafer', targetNodeId: 'node_hr_ai_chip', chainId: 'chain_humanoid', relationType: 'flow', description: '晶圆加工供应', strength: 95, isPrimary: true },

  // 第2层 → 第3层：核心零部件内部关系（含AI芯片）
  { id: 'rel_hr_021', sourceNodeId: 'node_hr_motor', targetNodeId: 'node_hr_joint', chainId: 'chain_humanoid', relationType: 'flow', description: '伺服电机供应', strength: 95, isPrimary: true },
  { id: 'rel_hr_022', sourceNodeId: 'node_hr_motor', targetNodeId: 'node_hr_hand', chainId: 'chain_humanoid', relationType: 'flow', description: '伺服电机供应', strength: 85, isPrimary: true },
  { id: 'rel_hr_023', sourceNodeId: 'node_hr_gearbox', targetNodeId: 'node_hr_joint', chainId: 'chain_humanoid', relationType: 'flow', description: '精密减速器供应', strength: 95, isPrimary: true },
  { id: 'rel_hr_024', sourceNodeId: 'node_hr_gearbox', targetNodeId: 'node_hr_hand', chainId: 'chain_humanoid', relationType: 'flow', description: '精密减速器供应', strength: 88, isPrimary: true },
  { id: 'rel_hr_025', sourceNodeId: 'node_hr_sensor', targetNodeId: 'node_hr_perception', chainId: 'chain_humanoid', relationType: 'flow', description: '传感器供应', strength: 92, isPrimary: true },
  { id: 'rel_hr_026', sourceNodeId: 'node_hr_sensor', targetNodeId: 'node_hr_joint', chainId: 'chain_humanoid', relationType: 'flow', description: '力传感器供应', strength: 88, isPrimary: true },
  { id: 'rel_hr_027', sourceNodeId: 'node_hr_controller', targetNodeId: 'node_hr_joint', chainId: 'chain_humanoid', relationType: 'flow', description: '运动控制器供应', strength: 90, isPrimary: true },
  { id: 'rel_hr_028', sourceNodeId: 'node_hr_controller', targetNodeId: 'node_hr_hand', chainId: 'chain_humanoid', relationType: 'flow', description: '手指控制器供应', strength: 85, isPrimary: true },
  { id: 'rel_hr_029', sourceNodeId: 'node_hr_controller', targetNodeId: 'node_hr_perception', chainId: 'chain_humanoid', relationType: 'flow', description: '感知控制器供应', strength: 82, isPrimary: false },
  // AI芯片 → 各子系统（AI大脑）
  { id: 'rel_hr_030', sourceNodeId: 'node_hr_ai_chip', targetNodeId: 'node_hr_perception', chainId: 'chain_humanoid', relationType: 'flow', description: 'AI感知推理', strength: 95, isPrimary: true },
  { id: 'rel_hr_030b', sourceNodeId: 'node_hr_ai_chip', targetNodeId: 'node_hr_controller', chainId: 'chain_humanoid', relationType: 'flow', description: 'AI运动控制', strength: 92, isPrimary: true },
  { id: 'rel_hr_030c', sourceNodeId: 'node_hr_ai_chip', targetNodeId: 'node_hr_hand', chainId: 'chain_humanoid', relationType: 'flow', description: 'AI灵巧手控制', strength: 88, isPrimary: true },
  { id: 'rel_hr_030d', sourceNodeId: 'node_hr_ai_chip', targetNodeId: 'node_hr_joint', chainId: 'chain_humanoid', relationType: 'flow', description: 'AI关节控制', strength: 85, isPrimary: false },

  // 第3层 → 第4层：关键子系统 → 整机制造
  { id: 'rel_hr_031', sourceNodeId: 'node_hr_joint', targetNodeId: 'node_hr_robot_body', chainId: 'chain_humanoid', relationType: 'flow', description: '关节模组供应', strength: 95, isPrimary: true },
  { id: 'rel_hr_032', sourceNodeId: 'node_hr_hand', targetNodeId: 'node_hr_robot_body', chainId: 'chain_humanoid', relationType: 'flow', description: '灵巧手供应', strength: 90, isPrimary: true },
  { id: 'rel_hr_033', sourceNodeId: 'node_hr_perception', targetNodeId: 'node_hr_robot_body', chainId: 'chain_humanoid', relationType: 'flow', description: '感知系统供应', strength: 92, isPrimary: true },
  { id: 'rel_hr_034', sourceNodeId: 'node_hr_power', targetNodeId: 'node_hr_robot_body', chainId: 'chain_humanoid', relationType: 'flow', description: '动力系统供应', strength: 88, isPrimary: true },
  // AI芯片 → 机器人本体（核心算力）
  { id: 'rel_hr_035', sourceNodeId: 'node_hr_ai_chip', targetNodeId: 'node_hr_robot_body', chainId: 'chain_humanoid', relationType: 'flow', description: 'AI算力大脑', strength: 98, isPrimary: true },

  // 第4层 → 第4.5层：整机制造 → 整机代工
  { id: 'rel_hr_040', sourceNodeId: 'node_hr_robot_body', targetNodeId: 'node_hr_odm', chainId: 'chain_humanoid', relationType: 'flow', description: '品牌整机代工', strength: 90, isPrimary: true },

  // 第4层 → 第5层：整机制造 → 终端应用
  { id: 'rel_hr_041', sourceNodeId: 'node_hr_robot_body', targetNodeId: 'node_hr_industrial', chainId: 'chain_humanoid', relationType: 'flow', description: '机器人整机', strength: 85, isPrimary: true },
  { id: 'rel_hr_042', sourceNodeId: 'node_hr_robot_body', targetNodeId: 'node_hr_service', chainId: 'chain_humanoid', relationType: 'flow', description: '机器人整机', strength: 82, isPrimary: true },
  { id: 'rel_hr_043', sourceNodeId: 'node_hr_robot_body', targetNodeId: 'node_hr_medical', chainId: 'chain_humanoid', relationType: 'flow', description: '医疗机器人整机', strength: 80, isPrimary: true },
  { id: 'rel_hr_044', sourceNodeId: 'node_hr_robot_body', targetNodeId: 'node_hr_special', chainId: 'chain_humanoid', relationType: 'flow', description: '特种机器人整机', strength: 78, isPrimary: true },
  { id: 'rel_hr_045', sourceNodeId: 'node_hr_robot_body', targetNodeId: 'node_hr_inspection', chainId: 'chain_humanoid', relationType: 'flow', description: '巡检机器人整机', strength: 80, isPrimary: true },
  { id: 'rel_hr_046', sourceNodeId: 'node_hr_robot_body', targetNodeId: 'node_hr_collaborative', chainId: 'chain_humanoid', relationType: 'flow', description: '协作机器人整机', strength: 82, isPrimary: true },

  // 第4.5层 → 第5层：整机代工 → 终端应用
  { id: 'rel_hr_047', sourceNodeId: 'node_hr_odm', targetNodeId: 'node_hr_inspection', chainId: 'chain_humanoid', relationType: 'flow', description: '代工巡检机器人', strength: 85, isPrimary: true },
  { id: 'rel_hr_048', sourceNodeId: 'node_hr_odm', targetNodeId: 'node_hr_collaborative', chainId: 'chain_humanoid', relationType: 'flow', description: '代工协作机器人', strength: 85, isPrimary: true },

  // 第5层 → 第6层：终端应用 → 研发支撑
  { id: 'rel_hr_051', sourceNodeId: 'node_hr_inspection', targetNodeId: 'node_hr_test', chainId: 'chain_humanoid', relationType: 'flow', description: '测试认证需求', strength: 75, isPrimary: false },
  { id: 'rel_hr_052', sourceNodeId: 'node_hr_collaborative', targetNodeId: 'node_hr_test', chainId: 'chain_humanoid', relationType: 'flow', description: '测试认证需求', strength: 75, isPrimary: false },
  { id: 'rel_hr_053', sourceNodeId: 'node_hr_collaborative', targetNodeId: 'node_hr_cert', chainId: 'chain_humanoid', relationType: 'flow', description: '安全认证需求', strength: 72, isPrimary: false },

  // 研发支撑体系内部关系
  { id: 'rel_hr_061', sourceNodeId: 'node_hr_compute', targetNodeId: 'node_hr_rd', chainId: 'chain_humanoid', relationType: 'flow', description: '算力支持研发', strength: 88, isPrimary: true },
  { id: 'rel_hr_062', sourceNodeId: 'node_hr_data', targetNodeId: 'node_hr_compute', chainId: 'chain_humanoid', relationType: 'flow', description: '数据支撑算力', strength: 85, isPrimary: true },
  { id: 'rel_hr_063', sourceNodeId: 'node_hr_data', targetNodeId: 'node_hr_rd', chainId: 'chain_humanoid', relationType: 'flow', description: '数据支撑研发', strength: 82, isPrimary: false },
  { id: 'rel_hr_064', sourceNodeId: 'node_hr_rd', targetNodeId: 'node_hr_test', chainId: 'chain_humanoid', relationType: 'flow', description: '研发驱动测试', strength: 80, isPrimary: true },
  { id: 'rel_hr_065', sourceNodeId: 'node_hr_test', targetNodeId: 'node_hr_cert', chainId: 'chain_humanoid', relationType: 'flow', description: '测试支撑认证', strength: 85, isPrimary: true },
  { id: 'rel_hr_066', sourceNodeId: 'node_hr_cert', targetNodeId: 'node_hr_collaborative', chainId: 'chain_humanoid', relationType: 'flow', description: '认证支撑产品', strength: 78, isPrimary: false },
  { id: 'rel_hr_067', sourceNodeId: 'node_hr_cert', targetNodeId: 'node_hr_inspection', chainId: 'chain_humanoid', relationType: 'flow', description: '认证支撑产品', strength: 75, isPrimary: false },
];

// 动力电池产业链树形结构（用于树形图展示）
export const mockChainTreeData: Record<string, ChainTreeNode> = {
  'chain_power_battery': {
    nodeId: 'chain_power_battery',
    name: '动力电池产业链',
    value: 0,
    activity: 0,
    cat: '核心',
    level: 0,
    collapsed: false,
    children: [
      {
        nodeId: 'node_lithium',
        name: '锂矿开采',
        value: 120,
        activity: 70,
        cat: '上游',
        level: 1,
        children: [
          { nodeId: 'node_cathode', name: '正极材料', value: 80, activity: 85, cat: '上游', level: 2 },
          { nodeId: 'node_anode', name: '负极材料', value: 75, activity: 80, cat: '上游', level: 2 },
        ],
      },
      {
        nodeId: 'node_electrolyte',
        name: '电解液',
        value: 90,
        activity: 75,
        cat: '上游',
        level: 1,
      },
      {
        nodeId: 'node_separator',
        name: '隔膜',
        value: 110,
        activity: 74,
        cat: '上游',
        level: 1,
      },
      {
        nodeId: 'node_equipment',
        name: '锂电设备',
        value: 300,
        activity: 88,
        cat: '装备',
        level: 1,
      },
      {
        nodeId: 'node_cell',
        name: '电芯制造',
        value: 100,
        activity: 92,
        cat: '核心',
        level: 1,
        children: [
          { nodeId: 'node_bms', name: 'BMS系统', value: 140, activity: 82, cat: '中游', level: 2 },
          {
            nodeId: 'node_pack',
            name: '电池包组装',
            value: 85,
            activity: 80,
            cat: '中游',
            level: 2,
            children: [
              { nodeId: 'node_storage', name: '储能系统', value: 250, activity: 80, cat: '下游', level: 3 },
              { nodeId: 'node_vehicle', name: '新能源整车', value: 450, activity: 90, cat: '下游', level: 3 },
            ],
          },
        ],
      },
    ],
  },
  'chain_auto': {
    nodeId: 'chain_auto',
    name: '汽车产业链',
    value: 0,
    activity: 0,
    cat: '核心',
    level: 0,
    collapsed: false,
    children: [
      {
        nodeId: 'node_steel',
        name: '上游原材料',
        value: 180,
        activity: 72,
        cat: '上游',
        level: 1,
        children: [
          { nodeId: 'node_steel', name: '钢铁与铝合金', value: 180, activity: 72, cat: '上游', level: 2 },
          { nodeId: 'node_tire', name: '汽车轮胎', value: 120, activity: 75, cat: '上游', level: 2 },
          { nodeId: 'node_glass', name: '汽车玻璃', value: 100, activity: 70, cat: '上游', level: 2 },
          { nodeId: 'node_electronics', name: '汽车电子元器件', value: 220, activity: 82, cat: '上游', level: 2 },
        ],
      },
      {
        nodeId: 'node_parts',
        name: '核心零部件',
        value: 400,
        activity: 85,
        cat: '上游',
        level: 1,
        children: [
          { nodeId: 'node_engine', name: '发动机与变速箱', value: 350, activity: 78, cat: '上游', level: 2 },
          { nodeId: 'node_parts', name: '汽车零部件总成', value: 400, activity: 85, cat: '上游', level: 2 },
        ],
      },
      {
        nodeId: 'node_ev_vehicle',
        name: '整车制造',
        value: 500,
        activity: 85,
        cat: '核心',
        level: 1,
        children: [
          { nodeId: 'node_ice_vehicle', name: '传统燃油车', value: 500, activity: 65, cat: '中游', level: 2 },
          { nodeId: 'node_ev_vehicle', name: '新能源整车', value: 550, activity: 92, cat: '中游', level: 2 },
        ],
      },
      {
        nodeId: 'node_adb',
        name: '智能与网联',
        value: 300,
        activity: 86,
        cat: '中游',
        level: 1,
        children: [
          { nodeId: 'node_adb', name: '智能驾驶系统', value: 300, activity: 88, cat: '中游', level: 2 },
          { nodeId: 'node_cockpit', name: '车联网与座舱', value: 250, activity: 85, cat: '中游', level: 2 },
        ],
      },
      {
        nodeId: 'node_4s',
        name: '下游服务',
        value: 350,
        activity: 78,
        cat: '下游',
        level: 1,
        children: [
          { nodeId: 'node_4s', name: '整车销售4S店', value: 350, activity: 75, cat: '下游', level: 2 },
          { nodeId: 'node_after_market', name: '汽车后市场', value: 280, activity: 80, cat: '下游', level: 2 },
          { nodeId: 'node_finance', name: '汽车金融与保险', value: 200, activity: 78, cat: '下游', level: 2 },
        ],
      },
    ],
  },
  // ── 人形机器人产业链网状结构 ──
  // 产业链核心：从上游材料到终端应用的完整链路
  // 树形分支1：材料体系 → 机械核心零部件 → 机器人本体
  // 树形分支2：硅片 → 晶圆加工 → AI芯片 → 智能系统 → 机器人本体
  // 机器人本体作为核心汇聚节点，向下分叉至各终端应用
  'chain_humanoid': {
    nodeId: 'chain_humanoid_root',
    name: '人形机器人产业链',
    value: 0,
    activity: 0,
    cat: '核心',
    level: 0,
    collapsed: false,
    children: [
      // ── 分支一：四大材料体系 → 机械核心零部件 ──
      {
        nodeId: 'node_hr_material_group',
        name: '材料体系',
        value: 170,
        activity: 76,
        cat: '上游',
        level: 1,
        collapsed: false,
        children: [
          // 稀土材料体系
          {
            nodeId: 'node_hr_rare_earth_group',
            name: '稀土材料体系',
            value: 170,
            activity: 76,
            cat: '上游',
            level: 2,
            collapsed: false,
            children: [
              { nodeId: 'node_hr_rare_earth', name: '稀土矿开采', value: 80, activity: 72, cat: '上游', level: 3 },
              { nodeId: 'node_hr_magnet', name: '永磁材料', value: 90, activity: 80, cat: '基础材料', level: 3 },
            ],
          },
          // 碳纤维材料体系
          {
            nodeId: 'node_hr_carbon_group',
            name: '碳纤维材料体系',
            value: 130,
            activity: 71,
            cat: '上游',
            level: 2,
            collapsed: false,
            children: [
              { nodeId: 'node_hr_carbon', name: '碳纤维原丝', value: 60, activity: 68, cat: '上游', level: 3 },
              { nodeId: 'node_hr_composite', name: '碳纤维复材', value: 70, activity: 74, cat: '基础材料', level: 3 },
            ],
          },
          // 轻量化材料体系
          {
            nodeId: 'node_hr_aluminum_group',
            name: '轻量化材料体系',
            value: 230,
            activity: 77,
            cat: '上游',
            level: 2,
            collapsed: false,
            children: [
              { nodeId: 'node_hr_aluminum', name: '高强度铝合金', value: 120, activity: 75, cat: '上游', level: 3 },
              { nodeId: 'node_hr_aluminum_alloy', name: '铝合金型材', value: 110, activity: 78, cat: '基础材料', level: 3 },
            ],
          },
          // 特种钢材体系
          {
            nodeId: 'node_hr_steel_group',
            name: '特种钢材体系',
            value: 185,
            activity: 73,
            cat: '上游',
            level: 2,
            collapsed: false,
            children: [
              { nodeId: 'node_hr_steel', name: '特种钢材', value: 100, activity: 70, cat: '上游', level: 3 },
              { nodeId: 'node_hr_engineering_plastic', name: '工程塑料', value: 85, activity: 76, cat: '基础材料', level: 3 },
            ],
          },
          // 机械核心零部件
          {
            nodeId: 'node_hr_mechanical_parts',
            name: '机械核心零部件',
            value: 580,
            activity: 88,
            cat: '核心零部件',
            level: 2,
            collapsed: false,
            children: [
              { nodeId: 'node_hr_motor', name: '伺服电机', value: 200, activity: 88, cat: '核心零部件', level: 3 },
              { nodeId: 'node_hr_gearbox', name: '精密减速器', value: 180, activity: 85, cat: '核心零部件', level: 3 },
            ],
          },
        ],
      },

      // ── 分支二：半导体体系 → AI芯片 → 智能系统 ──
      {
        nodeId: 'node_hr_semiconductor_group',
        name: '半导体体系',
        value: 620,
        activity: 90,
        cat: '上游',
        level: 1,
        collapsed: false,
        children: [
          // 上游硅材料
          {
            nodeId: 'node_hr_silicon_group',
            name: '硅基材料',
            value: 270,
            activity: 75,
            cat: '上游',
            level: 2,
            collapsed: false,
            children: [
              { nodeId: 'node_hr_silicon', name: '硅片与晶圆', value: 150, activity: 74, cat: '上游', level: 3 },
              { nodeId: 'node_hr_wafer', name: '晶圆加工', value: 120, activity: 76, cat: '基础材料', level: 3 },
            ],
          },
          // AI芯片（核心节点）
          {
            nodeId: 'node_hr_ai_chip',
            name: 'AI芯片',
            value: 350,
            activity: 95,
            cat: '核心零部件',
            level: 2,
            collapsed: false,
            children: [
              { nodeId: 'node_hr_ai_chip_direct', name: 'AI SoC', value: 350, activity: 95, cat: '核心零部件', level: 3 },
            ],
          },
          // 智能系统
          {
            nodeId: 'node_hr_intelligent_systems',
            name: '智能系统',
            value: 510,
            activity: 88,
            cat: '关键子系统',
            level: 2,
            collapsed: false,
            children: [
              { nodeId: 'node_hr_sensor', name: '传感器', value: 220, activity: 90, cat: '核心零部件', level: 3 },
              { nodeId: 'node_hr_controller', name: '控制器', value: 160, activity: 86, cat: '核心零部件', level: 3 },
              { nodeId: 'node_hr_perception', name: '感知系统', value: 200, activity: 88, cat: '关键子系统', level: 3 },
            ],
          },
        ],
      },

      // ── 汇聚节点：关节模组 + 灵巧手 ──
      {
        nodeId: 'node_hr_body_parts',
        name: '执行系统',
        value: 430,
        activity: 88,
        cat: '关键子系统',
        level: 1,
        collapsed: false,
        children: [
          { nodeId: 'node_hr_joint', name: '关节模组', value: 280, activity: 92, cat: '关键子系统', level: 2 },
          { nodeId: 'node_hr_hand', name: '灵巧手', value: 150, activity: 82, cat: '关键子系统', level: 2 },
        ],
      },

      // ── 汇聚节点：机器人本体 ──
      {
        nodeId: 'node_hr_robot_body',
        name: '机器人本体',
        value: 350,
        activity: 90,
        cat: '整机制造',
        level: 1,
        collapsed: false,
        children: [
          { nodeId: 'node_hr_power', name: '动力系统', value: 180, activity: 84, cat: '关键子系统', level: 2 },
          { nodeId: 'node_hr_odm', name: '整机代工', value: 250, activity: 85, cat: '整机制造', level: 2 },
        ],
      },

      // ── 终端应用 ──
      {
        nodeId: 'node_hr_applications',
        name: '终端应用',
        value: 1130,
        activity: 83,
        cat: '终端应用',
        level: 1,
        collapsed: false,
        children: [
          { nodeId: 'node_hr_industrial', name: '工业制造', value: 300, activity: 85, cat: '终端应用', level: 2 },
          { nodeId: 'node_hr_inspection', name: '巡检机器人', value: 180, activity: 82, cat: '终端应用', level: 2 },
          { nodeId: 'node_hr_collaborative', name: '协作机器人', value: 200, activity: 88, cat: '终端应用', level: 2 },
          { nodeId: 'node_hr_service', name: '商业服务', value: 250, activity: 82, cat: '终端应用', level: 2 },
          { nodeId: 'node_hr_medical', name: '医疗健康', value: 200, activity: 78, cat: '终端应用', level: 2 },
        ],
      },
    ],
  },
};

// 链上企业汇总（节点关联的企业信息）
export const mockChainFirms: Record<string, Array<{
  nodeId: string;
  firmId: string;
  role: string;
  asset: string;
  manager?: string;
  managerId?: string;
}>> = {
  'chain_power_battery': [
    { nodeId: 'node_cathode', firmId: 'firm_004', role: '头部供应商', asset: '—' },
    { nodeId: 'node_separator', firmId: 'firm_010', role: '关注预警', asset: '3亿', manager: '陈磊', managerId: 'mgr_004' },
    { nodeId: 'node_equipment', firmId: 'firm_002', role: '扩产中（潜客）', asset: '—', manager: '李明', managerId: 'mgr_001' },
    { nodeId: 'node_equipment', firmId: 'firm_008', role: '存量客户', asset: '7亿', manager: '刘洋', managerId: 'mgr_002' },
    { nodeId: 'node_cell', firmId: 'firm_001', role: '链主（满产）', asset: '10亿', manager: '李明', managerId: 'mgr_001' },
    { nodeId: 'node_cell', firmId: 'firm_009', role: '行业龙头', asset: '12亿', manager: '陈磊', managerId: 'mgr_004' },
    { nodeId: 'node_pack', firmId: 'firm_005', role: '下游大客户', asset: '15亿', manager: '王芳', managerId: 'mgr_003' },
    { nodeId: 'node_storage', firmId: 'firm_006', role: '关注预警', asset: '5亿', manager: '张强', managerId: 'mgr_004' },
  ],
  'chain_auto': [
    { nodeId: 'node_ev_vehicle', firmId: 'firm_006', role: '龙头客户', asset: '200亿' },
    { nodeId: 'node_cockpit', firmId: 'firm_007', role: '存量客户', asset: '6亿', manager: '刘洋', managerId: 'mgr_002' },
  ],
  'chain_humanoid': [
    // 稀土矿
    { nodeId: 'node_hr_rare_earth', firmId: 'firm_hr_001', role: '稀土矿开采', asset: '—' },
    { nodeId: 'node_hr_rare_earth', firmId: 'firm_hr_002', role: '稀土矿开采', asset: '—' },
    // 永磁材料
    { nodeId: 'node_hr_magnet', firmId: 'firm_hr_003', role: '永磁材料供应商', asset: '—' },
    { nodeId: 'node_hr_magnet', firmId: 'firm_hr_004', role: '永磁材料供应商', asset: '—' },
    // 伺服电机
    { nodeId: 'node_hr_motor', firmId: 'firm_hr_005', role: '伺服电机供应商', asset: '—' },
    { nodeId: 'node_hr_motor', firmId: 'firm_hr_006', role: '伺服电机供应商', asset: '—' },
    // 精密减速器
    { nodeId: 'node_hr_gearbox', firmId: 'firm_hr_007', role: '精密减速器供应商', asset: '—' },
    { nodeId: 'node_hr_gearbox', firmId: 'firm_hr_008', role: '精密减速器供应商', asset: '—' },
    // 传感器
    { nodeId: 'node_hr_sensor', firmId: 'firm_hr_009', role: '传感器供应商', asset: '—' },
    { nodeId: 'node_hr_sensor', firmId: 'firm_hr_010', role: '传感器供应商', asset: '—' },
    // 控制器
    { nodeId: 'node_hr_controller', firmId: 'firm_hr_011', role: '控制器供应商', asset: '—' },
    { nodeId: 'node_hr_controller', firmId: 'firm_hr_012', role: '控制器供应商', asset: '—' },
    // AI芯片
    { nodeId: 'node_hr_ai_chip', firmId: 'firm_hr_013', role: 'AI芯片供应商', asset: '—' },
    { nodeId: 'node_hr_ai_chip', firmId: 'firm_hr_014', role: 'AI芯片供应商', asset: '—' },
    // 关节模组
    { nodeId: 'node_hr_joint', firmId: 'firm_hr_015', role: '关节模组供应商', asset: '—' },
    // 灵巧手
    { nodeId: 'node_hr_hand', firmId: 'firm_hr_016', role: '灵巧手供应商', asset: '—' },
    // 感知系统
    { nodeId: 'node_hr_perception', firmId: 'firm_hr_017', role: '感知系统供应商', asset: '—' },
    // 动力系统
    { nodeId: 'node_hr_power', firmId: 'firm_hr_018', role: '动力系统供应商', asset: '—' },
    // 机器人本体
    { nodeId: 'node_hr_robot_body', firmId: 'firm_hr_019', role: '人形机器人整机', asset: '—' },
    { nodeId: 'node_hr_robot_body', firmId: 'firm_hr_020', role: '人形机器人整机', asset: '—' },
    // 整机代工
    { nodeId: 'node_hr_odm', firmId: 'firm_hr_021', role: '整机代工', asset: '—' },
    { nodeId: 'node_hr_odm', firmId: 'firm_hr_022', role: '整机代工', asset: '—' },
    // 终端应用
    { nodeId: 'node_hr_industrial', firmId: 'firm_hr_023', role: '工业机器人', asset: '—' },
    { nodeId: 'node_hr_service', firmId: 'firm_hr_024', role: '服务机器人', asset: '—' },
    { nodeId: 'node_hr_collaborative', firmId: 'firm_hr_025', role: '协作机器人', asset: '—' },
  ],
};

// ─────────────────────────────────────────────────────────────
// 客户经理
// ─────────────────────────────────────────────────────────────

export const mockManagers: Manager[] = [
  { id: 'mgr_001', name: '李明', surname: '明', role: '客户经理', department: '营销拓展部', area: '华东', phone: '138xxxx0001', email: 'liming@company.com', leaderId: 'mgr_lead_001', workOrderCount: 3, opportunityCount: 2, visitCount: 5, status: 'active', joinedAt: '2023-01-15', avatar: '' },
  { id: 'mgr_002', name: '刘洋', surname: '洋', role: '客户经理', department: '营销拓展部', area: '华东', phone: '138xxxx0002', email: 'liuyang@company.com', leaderId: 'mgr_lead_001', workOrderCount: 5, opportunityCount: 3, visitCount: 8, status: 'active', joinedAt: '2022-06-01', avatar: '' },
  { id: 'mgr_003', name: '王芳', surname: '芳', role: '客户经理', department: '营销拓展部', area: '华东', phone: '138xxxx0003', email: 'wangfang@company.com', leaderId: 'mgr_lead_001', workOrderCount: 4, opportunityCount: 1, visitCount: 6, status: 'active', joinedAt: '2023-09-01', avatar: '' },
  { id: 'mgr_004', name: '张强', surname: '强', role: '客户经理', department: '营销拓展部', area: '华南', phone: '138xxxx0004', email: 'zhangqiang@company.com', leaderId: 'mgr_lead_001', workOrderCount: 2, opportunityCount: 4, visitCount: 4, status: 'active', joinedAt: '2022-11-15', avatar: '' },
  { id: 'mgr_lead_001', name: '赵总监', surname: '赵', role: '团队负责人', department: '营销拓展部', area: '华东', phone: '138xxxx0000', email: 'zhaodirector@company.com', leaderId: 'mgr_mgr_001', workOrderCount: 0, opportunityCount: 0, visitCount: 0, status: 'active', joinedAt: '2020-03-01', avatar: '' },
];

// ─────────────────────────────────────────────────────────────
// 园区
// ─────────────────────────────────────────────────────────────

export const mockParks: Park[] = [
  {
    id: 'park_wujin', name: '武进经开区', cityId: 'city_320400', districtId: 'dist_320412', streetId: 'street_wj',
    lng: 119.9, lat: 31.7, risk: 'low', scale: '国家级经开区',
    industries: ['ind_new_energy'], chainIds: ['chain_power_battery'],
    data: { '投放': 12, '融资租赁': 58, '企业贷款': 120, '全量融资': 280, '活力指数': 92, '开工率': 88, '金租渗透率': 8.5, '用电增速': 15.2, '设备投放': 8, '客户数': 24, '不良率': 0.28, '在园企业数': 120, '当年新注册': 15, '高新技术占比': 62 },
    firmIds: ['firm_001', 'firm_002', 'firm_003'], status: 'active', establishedYear: '2012',
  },
  {
    id: 'park_suqian', name: '苏州高新区', cityId: 'city_320500', districtId: 'dist_320505', streetId: 'street_sq',
    lng: 120.6, lat: 31.3, risk: 'low', scale: '国家级高新区',
    industries: ['ind_new_energy', 'ind_semi'], chainIds: ['chain_power_battery', 'chain_solar'],
    data: { '投放': 18, '融资租赁': 72, '企业贷款': 150, '全量融资': 360, '活力指数': 95, '开工率': 90, '金租渗透率': 9.2, '用电增速': 18.5, '设备投放': 12, '客户数': 35, '不良率': 0.22, '在园企业数': 180, '当年新注册': 22, '高新技术占比': 71 },
    firmIds: ['firm_004', 'firm_005'], status: 'active', establishedYear: '2008',
  },
  {
    id: 'park_tianhe', name: '天河软件园', cityId: 'city_440100', districtId: 'dist_440106', streetId: 'street_th',
    lng: 113.4, lat: 23.2, risk: 'medium', scale: '省级软件园',
    industries: ['ind_semi', 'ind_auto'], chainIds: ['chain_ev'],
    data: { '投放': 8, '融资租赁': 35, '企业贷款': 80, '全量融资': 180, '活力指数': 78, '开工率': 72, '金租渗透率': 5.8, '用电增速': 8.2, '设备投放': 5, '客户数': 16, '不良率': 0.65, '在园企业数': 85, '当年新注册': 8, '高新技术占比': 55 },
    firmIds: ['firm_006', 'firm_007'], status: 'active', establishedYear: '2015',
  },
];

// ─────────────────────────────────────────────────────────────
// 企业（核心示例数据，展示完整联动）
// ─────────────────────────────────────────────────────────────

const makeIndicators = (partial: Partial<import('./types').FirmIndicator> = {}): import('./types').FirmIndicator => ({
  bankLoan: 8000, leaseLoan: 2000, bond: 0, otherDebt: 3000, totalDebt: 13000,
  powerUsageKwh: 2500, powerGrowthRate: 12.5, operatingRate: 88,
  aiTokenMonthly: 3420000, annualRevenue: 200000, annualProfit: 18000,
  creditBalance: 30000, usedCredit: 13000,
  ...partial,
});

export const mockFirms: Firm[] = [
  {
    id: 'firm_001', name: '武进锂电', fullName: '江苏武进锂电设备有限公司', creditCode: '91320412MA1XXXXXX',
    parkIds: ['park_wujin'], locationIds: [], industryIds: ['ind_new_energy'], subIndustryIds: ['sub_li_battery'], chainNodeIds: ['node_cell'],
    rating: 'AA+', risk: 'normal', scale: '大型', asset: '50亿', revenue: '20亿', establishedYear: '2015',
    website: 'https://example.com', phone: '0519-8xxxxxxx',
    primaryManagerId: 'mgr_001', coManagerIds: [],
    creatorId: 'mgr_001', status: 'normal',
    createdAt: '2024-01-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z',
    indicators: makeIndicators({ bankLoan: 8000, leaseLoan: 2000, powerUsageKwh: 2500, powerGrowthRate: 12.5, operatingRate: 88, aiTokenMonthly: 3420000, annualRevenue: 200000, creditBalance: 30000, usedCredit: 13000 }),
  },
  {
    id: 'firm_002', name: '苏州星能', fullName: '苏州星能材料科技有限公司', creditCode: '91320512MA1YYYYYY',
    parkIds: ['park_suqian'], locationIds: [], industryIds: ['ind_new_energy'], subIndustryIds: ['sub_solar'], chainNodeIds: ['node_cathode'],
    rating: 'AA', risk: 'normal', scale: '中型', asset: '20亿', revenue: '8亿', establishedYear: '2018',
    website: '', phone: '',
    primaryManagerId: 'mgr_002', coManagerIds: ['mgr_003'],
    creatorId: 'mgr_002', status: 'normal',
    createdAt: '2024-01-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z',
    indicators: makeIndicators({ bankLoan: 4000, leaseLoan: 1000, powerUsageKwh: 1800, powerGrowthRate: 8.2, operatingRate: 82, aiTokenMonthly: 1200000, annualRevenue: 80000, creditBalance: 15000, usedCredit: 5000 }),
  },
  {
    id: 'firm_003', name: '常州精密', fullName: '常州精密机械制造有限公司', creditCode: '91320411MA2ZZZZZZ',
    parkIds: ['park_wujin'], locationIds: [], industryIds: ['ind_new_energy', 'ind_auto'], subIndustryIds: ['sub_auto_parts'], chainNodeIds: ['node_anode', 'node_engine'],
    rating: 'AA-', risk: 'normal', scale: '中型', asset: '15亿', revenue: '6亿', establishedYear: '2016',
    website: '', phone: '',
    primaryManagerId: 'mgr_001', coManagerIds: [],
    creatorId: 'mgr_001', status: 'normal',
    createdAt: '2024-01-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z',
    indicators: makeIndicators({ bankLoan: 3000, leaseLoan: 800, powerUsageKwh: 1200, powerGrowthRate: 5.5, operatingRate: 78, aiTokenMonthly: 450000, annualRevenue: 60000, creditBalance: 10000, usedCredit: 3800 }),
  },
  {
    id: 'firm_004', name: '广州储能', fullName: '广州储能系统有限公司', creditCode: '91440101MA5UUUUUU',
    parkIds: ['park_tianhe'], locationIds: [], industryIds: ['ind_new_energy'], subIndustryIds: ['sub_li_battery'], chainNodeIds: ['node_pack'],
    rating: 'A+', risk: 'warning', scale: '中型', asset: '12亿', revenue: '5亿', establishedYear: '2019',
    website: '', phone: '',
    primaryManagerId: 'mgr_004', coManagerIds: [],
    creatorId: 'mgr_004', status: 'warning',
    createdAt: '2024-01-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z',
    indicators: makeIndicators({ bankLoan: 2500, leaseLoan: 500, powerUsageKwh: 800, powerGrowthRate: -3.2, operatingRate: 62, aiTokenMonthly: 200000, annualRevenue: 50000, creditBalance: 8000, usedCredit: 3000 }),
  },
  {
    id: 'firm_005', name: '苏州半导体', fullName: '苏州华芯半导体有限公司', creditCode: '91320508MA3VVVVVV',
    parkIds: ['park_suqian'], locationIds: [], industryIds: ['ind_semi'], subIndustryIds: ['sub_chip'], chainNodeIds: [],
    rating: 'AA', risk: 'normal', scale: '大型', asset: '80亿', revenue: '30亿', establishedYear: '2013',
    website: '', phone: '',
    primaryManagerId: 'mgr_002', coManagerIds: [],
    creatorId: 'mgr_002', status: 'normal',
    createdAt: '2024-01-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z',
    indicators: makeIndicators({ bankLoan: 15000, leaseLoan: 5000, powerUsageKwh: 5000, powerGrowthRate: 22.0, operatingRate: 95, aiTokenMonthly: 8500000, annualRevenue: 300000, creditBalance: 60000, usedCredit: 20000 }),
  },
  {
    id: 'firm_006', name: '深圳新能源', fullName: '深圳新能源动力有限公司', creditCode: '91440300MA5WWWWWW',
    parkIds: ['park_tianhe'], locationIds: [], industryIds: ['ind_auto', 'ind_new_energy'], subIndustryIds: ['sub_ev', 'sub_auto_electronics'], chainNodeIds: ['node_ev_vehicle', 'node_adb'],
    rating: 'AAA', risk: 'normal', scale: '龙头', asset: '200亿', revenue: '80亿', establishedYear: '2010',
    website: '', phone: '',
    primaryManagerId: 'mgr_004', coManagerIds: ['mgr_002'],
    creatorId: 'mgr_004', status: 'normal',
    createdAt: '2024-01-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z',
    indicators: makeIndicators({ bankLoan: 35000, leaseLoan: 12000, powerUsageKwh: 12000, powerGrowthRate: 18.5, operatingRate: 92, aiTokenMonthly: 18000000, annualRevenue: 800000, creditBalance: 120000, usedCredit: 47000 }),
  },
  {
    id: 'firm_007', name: '成都汽车电子', fullName: '成都汽车电子股份有限公司', creditCode: '91510100MA6XXXXXX',
    parkIds: ['park_tianhe'], locationIds: [], industryIds: ['ind_auto'], subIndustryIds: ['sub_auto_electronics'], chainNodeIds: ['node_cockpit', 'node_electronics'],
    rating: 'BB+', risk: 'danger', scale: '中型', asset: '10亿', revenue: '4亿', establishedYear: '2017',
    website: '', phone: '',
    primaryManagerId: 'mgr_003', coManagerIds: [],
    creatorId: 'mgr_003', status: 'danger',
    createdAt: '2024-01-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z',
    indicators: makeIndicators({ bankLoan: 2000, leaseLoan: 200, powerUsageKwh: 600, powerGrowthRate: -8.5, operatingRate: 55, aiTokenMonthly: 80000, annualRevenue: 40000, creditBalance: 6000, usedCredit: 2200 }),
  },
  // ── 新增：汽车产业链相关企业 ──
  {
    id: 'firm_008', name: '上海宝钢汽车板', fullName: '上海宝钢汽车钢板有限公司', creditCode: '91310000MA1FXXXXX',
    parkIds: ['park_suqian'], locationIds: [], industryIds: ['ind_auto_parts'], subIndustryIds: ['sub_steel'], chainNodeIds: ['node_steel'],
    rating: 'AAA', risk: 'normal', scale: '龙头', asset: '300亿', revenue: '120亿', establishedYear: '2005',
    website: '', phone: '',
    primaryManagerId: 'mgr_002', coManagerIds: [],
    creatorId: 'mgr_002', status: 'normal',
    createdAt: '2024-01-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z',
    indicators: makeIndicators({ bankLoan: 50000, leaseLoan: 15000, powerUsageKwh: 25000, powerGrowthRate: 10.5, operatingRate: 90, aiTokenMonthly: 25000000, annualRevenue: 1200000, creditBalance: 200000, usedCredit: 65000 }),
  },
  {
    id: 'firm_009', name: '杭州中策轮胎', fullName: '杭州中策橡胶有限公司', creditCode: '91330100MA2BXXXXX',
    parkIds: ['park_wujin'], locationIds: [], industryIds: ['ind_auto_parts'], subIndustryIds: ['sub_tire'], chainNodeIds: ['node_tire'],
    rating: 'AA+', risk: 'normal', scale: '大型', asset: '150亿', revenue: '60亿', establishedYear: '2008',
    website: '', phone: '',
    primaryManagerId: 'mgr_001', coManagerIds: ['mgr_003'],
    creatorId: 'mgr_001', status: 'normal',
    createdAt: '2024-01-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z',
    indicators: makeIndicators({ bankLoan: 20000, leaseLoan: 6000, powerUsageKwh: 8000, powerGrowthRate: 8.2, operatingRate: 85, aiTokenMonthly: 8000000, annualRevenue: 600000, creditBalance: 80000, usedCredit: 28000 }),
  },
  {
    id: 'firm_010', name: '宁波均胜电子', fullName: '宁波均胜电子股份有限公司', creditCode: '91330200MA2CXXXXX',
    parkIds: ['park_tianhe'], locationIds: [], industryIds: ['ind_auto'], subIndustryIds: ['sub_auto_electronics'], chainNodeIds: ['node_adb', 'node_cockpit'],
    rating: 'AA', risk: 'normal', scale: '大型', asset: '180亿', revenue: '70亿', establishedYear: '2012',
    website: '', phone: '',
    primaryManagerId: 'mgr_004', coManagerIds: [],
    creatorId: 'mgr_004', status: 'normal',
    createdAt: '2024-01-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z',
    indicators: makeIndicators({ bankLoan: 25000, leaseLoan: 8000, powerUsageKwh: 6000, powerGrowthRate: 15.8, operatingRate: 88, aiTokenMonthly: 15000000, annualRevenue: 700000, creditBalance: 100000, usedCredit: 35000 }),
  },
  {
    id: 'firm_011', name: '武汉福耀玻璃', fullName: '武汉福耀玻璃有限公司', creditCode: '91420100MA4KXXXXX',
    parkIds: ['park_wujin'], locationIds: [], industryIds: ['ind_auto_parts'], subIndustryIds: ['sub_glass'], chainNodeIds: ['node_glass'],
    rating: 'AA', risk: 'normal', scale: '大型', asset: '80亿', revenue: '35亿', establishedYear: '2010',
    website: '', phone: '',
    primaryManagerId: 'mgr_001', coManagerIds: [],
    creatorId: 'mgr_001', status: 'normal',
    createdAt: '2024-01-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z',
    indicators: makeIndicators({ bankLoan: 12000, leaseLoan: 3500, powerUsageKwh: 4000, powerGrowthRate: 6.5, operatingRate: 82, aiTokenMonthly: 3500000, annualRevenue: 350000, creditBalance: 50000, usedCredit: 17000 }),
  },
  {
    id: 'firm_012', name: '广州华德汽配', fullName: '广州华德汽车零部件有限公司', creditCode: '91440101MA5DXXXXX',
    parkIds: ['park_tianhe'], locationIds: [], industryIds: ['ind_auto'], subIndustryIds: ['sub_auto_parts'], chainNodeIds: ['node_parts', 'node_engine'],
    rating: 'A+', risk: 'warning', scale: '中型', asset: '25亿', revenue: '12亿', establishedYear: '2015',
    website: '', phone: '',
    primaryManagerId: 'mgr_004', coManagerIds: [],
    creatorId: 'mgr_004', status: 'warning',
    createdAt: '2024-01-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z',
    indicators: makeIndicators({ bankLoan: 4500, leaseLoan: 1200, powerUsageKwh: 2200, powerGrowthRate: -2.8, operatingRate: 68, aiTokenMonthly: 600000, annualRevenue: 120000, creditBalance: 18000, usedCredit: 9000 }),
  },
  {
    id: 'firm_013', name: '重庆长安汽车', fullName: '重庆长安汽车股份有限公司', creditCode: '91500000MA5UXXXXX',
    parkIds: ['park_tianhe'], locationIds: [], industryIds: ['ind_auto'], subIndustryIds: ['sub_ev', 'sub_auto_parts'], chainNodeIds: ['node_ev_vehicle', 'node_ice_vehicle'],
    rating: 'AAA', risk: 'normal', scale: '龙头', asset: '1500亿', revenue: '800亿', establishedYear: '1996',
    website: '', phone: '',
    primaryManagerId: 'mgr_003', coManagerIds: ['mgr_002', 'mgr_004'],
    creatorId: 'mgr_003', status: 'normal',
    createdAt: '2024-01-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z',
    indicators: makeIndicators({ bankLoan: 200000, leaseLoan: 80000, powerUsageKwh: 80000, powerGrowthRate: 12.8, operatingRate: 95, aiTokenMonthly: 120000000, annualRevenue: 8000000, creditBalance: 800000, usedCredit: 250000 }),
  },
  {
    id: 'firm_014', name: '北京四维图新', fullName: '北京四维图新科技股份有限公司', creditCode: '91110000MA0XXXXXX',
    parkIds: ['park_suqian'], locationIds: [], industryIds: ['ind_auto'], subIndustryIds: ['sub_auto_electronics'], chainNodeIds: ['node_adb', 'node_cockpit'],
    rating: 'AA+', risk: 'normal', scale: '大型', asset: '100亿', revenue: '30亿', establishedYear: '2002',
    website: '', phone: '',
    primaryManagerId: 'mgr_002', coManagerIds: [],
    creatorId: 'mgr_002', status: 'normal',
    createdAt: '2024-01-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z',
    indicators: makeIndicators({ bankLoan: 15000, leaseLoan: 5000, powerUsageKwh: 3000, powerGrowthRate: 20.5, operatingRate: 92, aiTokenMonthly: 45000000, annualRevenue: 300000, creditBalance: 80000, usedCredit: 23000 }),
  },
  {
    id: 'firm_015', name: '成都精典汽车', fullName: '成都精典汽车销售服务有限公司', creditCode: '91510107MA6GXXXXX',
    parkIds: ['park_tianhe'], locationIds: [], industryIds: ['ind_auto'], subIndustryIds: ['sub_auto_parts'], chainNodeIds: ['node_4s', 'node_after_market'],
    rating: 'A', risk: 'normal', scale: '中型', asset: '8亿', revenue: '15亿', establishedYear: '2018',
    website: '', phone: '',
    primaryManagerId: 'mgr_003', coManagerIds: [],
    creatorId: 'mgr_003', status: 'normal',
    createdAt: '2024-01-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z',
    indicators: makeIndicators({ bankLoan: 1500, leaseLoan: 800, powerUsageKwh: 500, powerGrowthRate: 5.2, operatingRate: 80, aiTokenMonthly: 150000, annualRevenue: 150000, creditBalance: 5000, usedCredit: 1800 }),
  },
  {
    id: 'firm_016', name: '西安汽车金融', fullName: '西安汽车融资租赁有限公司', creditCode: '91610100MA6WXXXXX',
    parkIds: ['park_wujin'], locationIds: [], industryIds: ['ind_auto'], subIndustryIds: ['sub_auto_parts'], chainNodeIds: ['node_finance'],
    rating: 'AA-', risk: 'normal', scale: '中型', asset: '40亿', revenue: '5亿', establishedYear: '2016',
    website: '', phone: '',
    primaryManagerId: 'mgr_001', coManagerIds: [],
    creatorId: 'mgr_001', status: 'normal',
    createdAt: '2024-01-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z',
    indicators: makeIndicators({ bankLoan: 8000, leaseLoan: 25000, powerUsageKwh: 200, powerGrowthRate: 18.5, operatingRate: 95, aiTokenMonthly: 500000, annualRevenue: 50000, creditBalance: 30000, usedCredit: 12000 }),
  },
  // ── 人形机器人产业链相关企业 ──
  {
    id: 'firm_hr_001', name: '北方稀土', fullName: '中国北方稀土（集团）高科技股份有限公司', creditCode: '91150200MA0NXXXXX',
    parkIds: [], locationIds: [], industryIds: [], subIndustryIds: [], chainNodeIds: ['node_hr_rare_earth'],
    rating: 'AA+', risk: 'normal', scale: '龙头', asset: '500亿', revenue: '300亿', establishedYear: '1998',
    website: '', phone: '',
    primaryManagerId: 'mgr_001', coManagerIds: [],
    creatorId: 'mgr_001', status: 'normal',
    createdAt: '2024-01-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z',
    indicators: makeIndicators({ bankLoan: 80000, leaseLoan: 20000, powerUsageKwh: 50000, powerGrowthRate: 15.2, operatingRate: 92, aiTokenMonthly: 50000000, annualRevenue: 3000000, creditBalance: 200000, usedCredit: 65000 }),
  },
  {
    id: 'firm_hr_002', name: '广晟有色', fullName: '广晟有色金属股份有限公司', creditCode: '91440000MA5AXXXXX',
    parkIds: [], locationIds: [], industryIds: [], subIndustryIds: [], chainNodeIds: ['node_hr_rare_earth'],
    rating: 'AA', risk: 'normal', scale: '大型', asset: '120亿', revenue: '80亿', establishedYear: '2005',
    website: '', phone: '',
    primaryManagerId: 'mgr_002', coManagerIds: [],
    creatorId: 'mgr_002', status: 'normal',
    createdAt: '2024-01-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z',
    indicators: makeIndicators({ bankLoan: 20000, leaseLoan: 5000, powerUsageKwh: 12000, powerGrowthRate: 10.5, operatingRate: 88, aiTokenMonthly: 12000000, annualRevenue: 800000, creditBalance: 50000, usedCredit: 18000 }),
  },
  {
    id: 'firm_hr_003', name: '中科三安', fullName: '中科三安磁材科技有限公司', creditCode: '91110000MA0BXXXXX',
    parkIds: [], locationIds: [], industryIds: [], subIndustryIds: [], chainNodeIds: ['node_hr_magnet'],
    rating: 'AA', risk: 'normal', scale: '大型', asset: '80亿', revenue: '50亿', establishedYear: '2010',
    website: '', phone: '',
    primaryManagerId: 'mgr_001', coManagerIds: [],
    creatorId: 'mgr_001', status: 'normal',
    createdAt: '2024-01-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z',
    indicators: makeIndicators({ bankLoan: 15000, leaseLoan: 4000, powerUsageKwh: 8000, powerGrowthRate: 12.8, operatingRate: 90, aiTokenMonthly: 8000000, annualRevenue: 500000, creditBalance: 35000, usedCredit: 12000 }),
  },
  {
    id: 'firm_hr_004', name: '宁波韵升', fullName: '宁波韵升股份有限公司', creditCode: '91330200MA2CXXXXX',
    parkIds: [], locationIds: [], industryIds: [], subIndustryIds: [], chainNodeIds: ['node_hr_magnet'],
    rating: 'AA+', risk: 'normal', scale: '大型', asset: '100亿', revenue: '60亿', establishedYear: '2000',
    website: '', phone: '',
    primaryManagerId: 'mgr_002', coManagerIds: [],
    creatorId: 'mgr_002', status: 'normal',
    createdAt: '2024-01-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z',
    indicators: makeIndicators({ bankLoan: 18000, leaseLoan: 4500, powerUsageKwh: 10000, powerGrowthRate: 11.2, operatingRate: 89, aiTokenMonthly: 9500000, annualRevenue: 600000, creditBalance: 42000, usedCredit: 14000 }),
  },
  {
    id: 'firm_hr_005', name: '汇川技术', fullName: '深圳市汇川技术股份有限公司', creditCode: '91440300MA5DXXXXX',
    parkIds: [], locationIds: [], industryIds: [], subIndustryIds: [], chainNodeIds: ['node_hr_motor'],
    rating: 'AAA', risk: 'normal', scale: '龙头', asset: '300亿', revenue: '200亿', establishedYear: '2003',
    website: '', phone: '',
    primaryManagerId: 'mgr_003', coManagerIds: [],
    creatorId: 'mgr_003', status: 'normal',
    createdAt: '2024-01-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z',
    indicators: makeIndicators({ bankLoan: 50000, leaseLoan: 12000, powerUsageKwh: 25000, powerGrowthRate: 18.5, operatingRate: 95, aiTokenMonthly: 35000000, annualRevenue: 2000000, creditBalance: 120000, usedCredit: 42000 }),
  },
  {
    id: 'firm_hr_006', name: '步科股份', fullName: '深圳步科电气有限公司', creditCode: '91440300MA5FXXXXX',
    parkIds: [], locationIds: [], industryIds: [], subIndustryIds: [], chainNodeIds: ['node_hr_motor'],
    rating: 'AA', risk: 'normal', scale: '中型', asset: '40亿', revenue: '25亿', establishedYear: '2012',
    website: '', phone: '',
    primaryManagerId: 'mgr_004', coManagerIds: [],
    creatorId: 'mgr_004', status: 'normal',
    createdAt: '2024-01-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z',
    indicators: makeIndicators({ bankLoan: 8000, leaseLoan: 2000, powerUsageKwh: 4000, powerGrowthRate: 14.2, operatingRate: 88, aiTokenMonthly: 3500000, annualRevenue: 250000, creditBalance: 18000, usedCredit: 6500 }),
  },
  {
    id: 'firm_hr_007', name: '绿的谐波', fullName: '苏州绿的谐波传动科技有限公司', creditCode: '91320500MA1WXXXXX',
    parkIds: ['park_wujin'], locationIds: [], industryIds: [], subIndustryIds: [], chainNodeIds: ['node_hr_gearbox'],
    rating: 'AA+', risk: 'normal', scale: '大型', asset: '60亿', revenue: '35亿', establishedYear: '2011',
    website: '', phone: '',
    primaryManagerId: 'mgr_001', coManagerIds: [],
    creatorId: 'mgr_001', status: 'normal',
    createdAt: '2024-01-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z',
    indicators: makeIndicators({ bankLoan: 12000, leaseLoan: 3000, powerUsageKwh: 6000, powerGrowthRate: 16.8, operatingRate: 92, aiTokenMonthly: 6500000, annualRevenue: 350000, creditBalance: 28000, usedCredit: 9800 }),
  },
  {
    id: 'firm_hr_008', name: '来福谐波', fullName: '浙江来福谐波传动股份有限公司', creditCode: '91331000MA2DXXXXX',
    parkIds: [], locationIds: [], industryIds: [], subIndustryIds: [], chainNodeIds: ['node_hr_gearbox'],
    rating: 'AA', risk: 'normal', scale: '中型', asset: '35亿', revenue: '20亿', establishedYear: '2014',
    website: '', phone: '',
    primaryManagerId: 'mgr_002', coManagerIds: [],
    creatorId: 'mgr_002', status: 'normal',
    createdAt: '2024-01-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z',
    indicators: makeIndicators({ bankLoan: 6500, leaseLoan: 1500, powerUsageKwh: 3200, powerGrowthRate: 13.5, operatingRate: 86, aiTokenMonthly: 3200000, annualRevenue: 200000, creditBalance: 15000, usedCredit: 5200 }),
  },
  {
    id: 'firm_hr_009', name: '坤维科技', fullName: '坤维传感技术（深圳）有限公司', creditCode: '91440300MA5GXXXXX',
    parkIds: [], locationIds: [], industryIds: [], subIndustryIds: [], chainNodeIds: ['node_hr_sensor'],
    rating: 'A+', risk: 'normal', scale: '中型', asset: '20亿', revenue: '12亿', establishedYear: '2016',
    website: '', phone: '',
    primaryManagerId: 'mgr_003', coManagerIds: [],
    creatorId: 'mgr_003', status: 'normal',
    createdAt: '2024-01-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z',
    indicators: makeIndicators({ bankLoan: 4000, leaseLoan: 1000, powerUsageKwh: 2000, powerGrowthRate: 20.5, operatingRate: 90, aiTokenMonthly: 2800000, annualRevenue: 120000, creditBalance: 10000, usedCredit: 3800 }),
  },
  {
    id: 'firm_hr_010', name: '敏芯股份', fullName: '苏州敏芯微电子股份有限公司', creditCode: '91320500MA1XXXXXX',
    parkIds: ['park_suqian'], locationIds: [], industryIds: [], subIndustryIds: [], chainNodeIds: ['node_hr_sensor'],
    rating: 'AA-', risk: 'normal', scale: '中型', asset: '25亿', revenue: '15亿', establishedYear: '2015',
    website: '', phone: '',
    primaryManagerId: 'mgr_004', coManagerIds: [],
    creatorId: 'mgr_004', status: 'normal',
    createdAt: '2024-01-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z',
    indicators: makeIndicators({ bankLoan: 5000, leaseLoan: 1200, powerUsageKwh: 2500, powerGrowthRate: 18.2, operatingRate: 88, aiTokenMonthly: 3500000, annualRevenue: 150000, creditBalance: 12000, usedCredit: 4200 }),
  },
  {
    id: 'firm_hr_011', name: '英孚泰克', fullName: '英孚泰克信息科技股份有限公司', creditCode: '91440300MA5HXXXXX',
    parkIds: [], locationIds: [], industryIds: [], subIndustryIds: [], chainNodeIds: ['node_hr_controller'],
    rating: 'AA', risk: 'normal', scale: '中型', asset: '30亿', revenue: '18亿', establishedYear: '2013',
    website: '', phone: '',
    primaryManagerId: 'mgr_001', coManagerIds: [],
    creatorId: 'mgr_001', status: 'normal',
    createdAt: '2024-01-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z',
    indicators: makeIndicators({ bankLoan: 5500, leaseLoan: 1400, powerUsageKwh: 2800, powerGrowthRate: 15.8, operatingRate: 87, aiTokenMonthly: 4200000, annualRevenue: 180000, creditBalance: 14000, usedCredit: 4800 }),
  },
  {
    id: 'firm_hr_012', name: '研华科技', fullName: '研华科技（中国）有限公司', creditCode: '91320500MA2EXXXXX',
    parkIds: [], locationIds: [], industryIds: [], subIndustryIds: [], chainNodeIds: ['node_hr_controller'],
    rating: 'AA+', risk: 'normal', scale: '大型', asset: '80亿', revenue: '50亿', establishedYear: '2000',
    website: '', phone: '',
    primaryManagerId: 'mgr_002', coManagerIds: [],
    creatorId: 'mgr_002', status: 'normal',
    createdAt: '2024-01-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z',
    indicators: makeIndicators({ bankLoan: 15000, leaseLoan: 3800, powerUsageKwh: 7500, powerGrowthRate: 12.5, operatingRate: 89, aiTokenMonthly: 8800000, annualRevenue: 500000, creditBalance: 38000, usedCredit: 13000 }),
  },
  {
    id: 'firm_hr_013', name: '华为海思', fullName: '海思半导体有限公司', creditCode: '91440300MA5EXXXXX',
    parkIds: [], locationIds: [], industryIds: [], subIndustryIds: [], chainNodeIds: ['node_hr_ai_chip'],
    rating: 'AAA', risk: 'normal', scale: '龙头', asset: '500亿', revenue: '350亿', establishedYear: '2004',
    website: '', phone: '',
    primaryManagerId: 'mgr_003', coManagerIds: [],
    creatorId: 'mgr_003', status: 'normal',
    createdAt: '2024-01-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z',
    indicators: makeIndicators({ bankLoan: 100000, leaseLoan: 25000, powerUsageKwh: 80000, powerGrowthRate: 25.5, operatingRate: 98, aiTokenMonthly: 120000000, annualRevenue: 3500000, creditBalance: 250000, usedCredit: 85000 }),
  },
  {
    id: 'firm_hr_014', name: '寒武纪', fullName: '中科寒武纪科技股份有限公司', creditCode: '91110000MA0CXXXXX',
    parkIds: [], locationIds: [], industryIds: [], subIndustryIds: [], chainNodeIds: ['node_hr_ai_chip'],
    rating: 'AA-', risk: 'normal', scale: '中型', asset: '120亿', revenue: '50亿', establishedYear: '2016',
    website: '', phone: '',
    primaryManagerId: 'mgr_004', coManagerIds: [],
    creatorId: 'mgr_004', status: 'normal',
    createdAt: '2024-01-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z',
    indicators: makeIndicators({ bankLoan: 25000, leaseLoan: 6000, powerUsageKwh: 15000, powerGrowthRate: 35.2, operatingRate: 95, aiTokenMonthly: 45000000, annualRevenue: 500000, creditBalance: 60000, usedCredit: 22000 }),
  },
  {
    id: 'firm_hr_015', name: '清能德创', fullName: '清能德创电气技术（北京）有限公司', creditCode: '91110100MA0DXXXXX',
    parkIds: [], locationIds: [], industryIds: [], subIndustryIds: [], chainNodeIds: ['node_hr_joint'],
    rating: 'AA', risk: 'normal', scale: '中型', asset: '25亿', revenue: '15亿', establishedYear: '2015',
    website: '', phone: '',
    primaryManagerId: 'mgr_001', coManagerIds: [],
    creatorId: 'mgr_001', status: 'normal',
    createdAt: '2024-01-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z',
    indicators: makeIndicators({ bankLoan: 4800, leaseLoan: 1200, powerUsageKwh: 2400, powerGrowthRate: 22.8, operatingRate: 92, aiTokenMonthly: 3800000, annualRevenue: 150000, creditBalance: 12000, usedCredit: 4200 }),
  },
  {
    id: 'firm_hr_016', name: '因时机器人', fullName: '因时机器人科技有限公司', creditCode: '91110100MA0EXXXXX',
    parkIds: [], locationIds: [], industryIds: [], subIndustryIds: [], chainNodeIds: ['node_hr_hand'],
    rating: 'A+', risk: 'normal', scale: '小型', asset: '8亿', revenue: '5亿', establishedYear: '2019',
    website: '', phone: '',
    primaryManagerId: 'mgr_002', coManagerIds: [],
    creatorId: 'mgr_002', status: 'normal',
    createdAt: '2024-01-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z',
    indicators: makeIndicators({ bankLoan: 1500, leaseLoan: 400, powerUsageKwh: 800, powerGrowthRate: 28.5, operatingRate: 90, aiTokenMonthly: 1200000, annualRevenue: 50000, creditBalance: 4500, usedCredit: 1600 }),
  },
  {
    id: 'firm_hr_017', name: '奥比中光', fullName: '奥比中光科技集团股份有限公司', creditCode: '91440300MA5FXXXXX',
    parkIds: [], locationIds: [], industryIds: [], subIndustryIds: [], chainNodeIds: ['node_hr_perception'],
    rating: 'AA-', risk: 'normal', scale: '中型', asset: '60亿', revenue: '30亿', establishedYear: '2013',
    website: '', phone: '',
    primaryManagerId: 'mgr_003', coManagerIds: [],
    creatorId: 'mgr_003', status: 'normal',
    createdAt: '2024-01-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z',
    indicators: makeIndicators({ bankLoan: 12000, leaseLoan: 3000, powerUsageKwh: 6000, powerGrowthRate: 18.5, operatingRate: 91, aiTokenMonthly: 12000000, annualRevenue: 300000, creditBalance: 28000, usedCredit: 9800 }),
  },
  {
    id: 'firm_hr_018', name: '亿纬锂能', fullName: '惠州亿纬锂能股份有限公司', creditCode: '91441300MA4JXXXXX',
    parkIds: [], locationIds: [], industryIds: [], subIndustryIds: [], chainNodeIds: ['node_hr_power'],
    rating: 'AAA', risk: 'normal', scale: '龙头', asset: '400亿', revenue: '250亿', establishedYear: '2001',
    website: '', phone: '',
    primaryManagerId: 'mgr_004', coManagerIds: [],
    creatorId: 'mgr_004', status: 'normal',
    createdAt: '2024-01-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z',
    indicators: makeIndicators({ bankLoan: 75000, leaseLoan: 18000, powerUsageKwh: 60000, powerGrowthRate: 16.2, operatingRate: 94, aiTokenMonthly: 55000000, annualRevenue: 2500000, creditBalance: 180000, usedCredit: 62000 }),
  },
  {
    id: 'firm_hr_019', name: '智元机器人', fullName: '上海智元新创技术有限公司', creditCode: '91310000MA1FXXXXX',
    parkIds: [], locationIds: [], industryIds: [], subIndustryIds: [], chainNodeIds: ['node_hr_robot_body'],
    rating: 'A+', risk: 'normal', scale: '中型', asset: '50亿', revenue: '20亿', establishedYear: '2023',
    website: '', phone: '',
    primaryManagerId: 'mgr_001', coManagerIds: [],
    creatorId: 'mgr_001', status: 'normal',
    createdAt: '2024-01-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z',
    indicators: makeIndicators({ bankLoan: 10000, leaseLoan: 2500, powerUsageKwh: 5000, powerGrowthRate: 45.8, operatingRate: 88, aiTokenMonthly: 18000000, annualRevenue: 200000, creditBalance: 25000, usedCredit: 8500 }),
  },
  {
    id: 'firm_hr_020', name: '宇树科技', fullName: '杭州宇树科技有限公司', creditCode: '91330100MA2CXXXXX',
    parkIds: [], locationIds: [], industryIds: [], subIndustryIds: [], chainNodeIds: ['node_hr_robot_body'],
    rating: 'AA-', risk: 'normal', scale: '中型', asset: '40亿', revenue: '18亿', establishedYear: '2016',
    website: '', phone: '',
    primaryManagerId: 'mgr_002', coManagerIds: [],
    creatorId: 'mgr_002', status: 'normal',
    createdAt: '2024-01-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z',
    indicators: makeIndicators({ bankLoan: 8000, leaseLoan: 2000, powerUsageKwh: 4000, powerGrowthRate: 38.5, operatingRate: 92, aiTokenMonthly: 15000000, annualRevenue: 180000, creditBalance: 20000, usedCredit: 6800 }),
  },
  {
    id: 'firm_hr_021', name: '天奇股份', fullName: '天奇自动化工程股份有限公司', creditCode: '91320200MA1WXXXXX',
    parkIds: ['park_wujin'], locationIds: [], industryIds: [], subIndustryIds: [], chainNodeIds: ['node_hr_odm'],
    rating: 'AA', risk: 'normal', scale: '大型', asset: '80亿', revenue: '45亿', establishedYear: '1997',
    website: '', phone: '',
    primaryManagerId: 'mgr_003', coManagerIds: [],
    creatorId: 'mgr_003', status: 'normal',
    createdAt: '2024-01-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z',
    indicators: makeIndicators({ bankLoan: 15000, leaseLoan: 3800, powerUsageKwh: 8000, powerGrowthRate: 12.8, operatingRate: 89, aiTokenMonthly: 8000000, annualRevenue: 450000, creditBalance: 38000, usedCredit: 13000 }),
  },
  {
    id: 'firm_hr_022', name: '瑞松科技', fullName: '广州瑞松科技股份有限公司', creditCode: '91440101MA5AXXXXX',
    parkIds: [], locationIds: [], industryIds: [], subIndustryIds: [], chainNodeIds: ['node_hr_odm'],
    rating: 'AA-', risk: 'normal', scale: '中型', asset: '35亿', revenue: '20亿', establishedYear: '2012',
    website: '', phone: '',
    primaryManagerId: 'mgr_004', coManagerIds: [],
    creatorId: 'mgr_004', status: 'normal',
    createdAt: '2024-01-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z',
    indicators: makeIndicators({ bankLoan: 6500, leaseLoan: 1600, powerUsageKwh: 3500, powerGrowthRate: 15.2, operatingRate: 87, aiTokenMonthly: 4200000, annualRevenue: 200000, creditBalance: 16000, usedCredit: 5500 }),
  },
  {
    id: 'firm_hr_023', name: '埃斯顿', fullName: '南京埃斯顿自动化股份有限公司', creditCode: '91320100MA1MXXXXX',
    parkIds: [], locationIds: [], industryIds: [], subIndustryIds: [], chainNodeIds: ['node_hr_industrial'],
    rating: 'AA+', risk: 'normal', scale: '大型', asset: '120亿', revenue: '70亿', establishedYear: '1993',
    website: '', phone: '',
    primaryManagerId: 'mgr_001', coManagerIds: [],
    creatorId: 'mgr_001', status: 'normal',
    createdAt: '2024-01-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z',
    indicators: makeIndicators({ bankLoan: 22000, leaseLoan: 5500, powerUsageKwh: 12000, powerGrowthRate: 14.5, operatingRate: 91, aiTokenMonthly: 15000000, annualRevenue: 700000, creditBalance: 55000, usedCredit: 19000 }),
  },
  {
    id: 'firm_hr_024', name: '普渡科技', fullName: '深圳市普渡科技有限公司', creditCode: '91440300MA5GXXXXX',
    parkIds: [], locationIds: [], industryIds: [], subIndustryIds: [], chainNodeIds: ['node_hr_service'],
    rating: 'AA-', risk: 'normal', scale: '中型', asset: '30亿', revenue: '15亿', establishedYear: '2016',
    website: '', phone: '',
    primaryManagerId: 'mgr_002', coManagerIds: [],
    creatorId: 'mgr_002', status: 'normal',
    createdAt: '2024-01-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z',
    indicators: makeIndicators({ bankLoan: 5800, leaseLoan: 1400, powerUsageKwh: 3000, powerGrowthRate: 25.8, operatingRate: 90, aiTokenMonthly: 6500000, annualRevenue: 150000, creditBalance: 14000, usedCredit: 4800 }),
  },
  {
    id: 'firm_hr_025', name: '遨博智能', fullName: '遨博（北京）智能科技有限公司', creditCode: '91110100MA0GXXXXX',
    parkIds: [], locationIds: [], industryIds: [], subIndustryIds: [], chainNodeIds: ['node_hr_collaborative'],
    rating: 'AA', risk: 'normal', scale: '中型', asset: '25亿', revenue: '12亿', establishedYear: '2015',
    website: '', phone: '',
    primaryManagerId: 'mgr_003', coManagerIds: [],
    creatorId: 'mgr_003', status: 'normal',
    createdAt: '2024-01-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z',
    indicators: makeIndicators({ bankLoan: 4800, leaseLoan: 1200, powerUsageKwh: 2500, powerGrowthRate: 22.5, operatingRate: 89, aiTokenMonthly: 4200000, annualRevenue: 120000, creditBalance: 12000, usedCredit: 4200 }),
  },
];

// ─────────────────────────────────────────────────────────────
// 企业高管
// ─────────────────────────────────────────────────────────────

export const mockExecutives: Executive[] = [
  { id: 'exec_001', firmId: 'firm_001', name: '张总', title: '董事长', phone: '', email: '', isLegalRep: true },
  { id: 'exec_002', firmId: 'firm_001', name: '李总', title: '总经理', phone: '', email: '', isLegalRep: false },
  { id: 'exec_003', firmId: 'firm_001', name: '王总', title: '财务总监', phone: '', email: '', isLegalRep: false },
  { id: 'exec_004', firmId: 'firm_002', name: '陈总', title: '董事长', phone: '', email: '', isLegalRep: true },
  { id: 'exec_005', firmId: 'firm_002', name: '刘总', title: '总经理', phone: '', email: '', isLegalRep: false },
  { id: 'exec_006', firmId: 'firm_004', name: '赵总', title: '董事长', phone: '', email: '', isLegalRep: true },
  { id: 'exec_007', firmId: 'firm_005', name: '孙总', title: '董事长', phone: '', email: '', isLegalRep: true },
  { id: 'exec_008', firmId: 'firm_006', name: '周总', title: '董事长', phone: '', email: '', isLegalRep: true },
  { id: 'exec_009', firmId: 'firm_007', name: '吴总', title: '董事长', phone: '', email: '', isLegalRep: true },
  // ── 新增：汽车产业链企业高管 ──
  { id: 'exec_010', firmId: 'firm_008', name: '徐总', title: '董事长', phone: '', email: '', isLegalRep: true },
  { id: 'exec_011', firmId: 'firm_008', name: '郑总', title: '总经理', phone: '', email: '', isLegalRep: false },
  { id: 'exec_012', firmId: 'firm_009', name: '沈总', title: '董事长', phone: '', email: '', isLegalRep: true },
  { id: 'exec_013', firmId: 'firm_010', name: '唐总', title: '董事长', phone: '', email: '', isLegalRep: true },
  { id: 'exec_014', firmId: 'firm_011', name: '何总', title: '董事长', phone: '', email: '', isLegalRep: true },
  { id: 'exec_015', firmId: 'firm_012', name: '姜总', title: '董事长', phone: '', email: '', isLegalRep: true },
  { id: 'exec_016', firmId: 'firm_013', name: '朱总', title: '董事长', phone: '', email: '', isLegalRep: true },
  { id: 'exec_017', firmId: 'firm_014', name: '秦总', title: '董事长', phone: '', email: '', isLegalRep: true },
  { id: 'exec_018', firmId: 'firm_015', name: '许总', title: '董事长', phone: '', email: '', isLegalRep: true },
  { id: 'exec_019', firmId: 'firm_016', name: '冯总', title: '董事长', phone: '', email: '', isLegalRep: true },
  // ── 新增：人形机器人产业链企业高管 ──
  { id: 'exec_hr_001', firmId: 'firm_hr_001', name: '赵总', title: '董事长', phone: '', email: '', isLegalRep: true },
  { id: 'exec_hr_002', firmId: 'firm_hr_002', name: '张总', title: '董事长', phone: '', email: '', isLegalRep: true },
  { id: 'exec_hr_003', firmId: 'firm_hr_003', name: '李总', title: '董事长', phone: '', email: '', isLegalRep: true },
  { id: 'exec_hr_004', firmId: 'firm_hr_004', name: '竺总', title: '董事长', phone: '', email: '', isLegalRep: true },
  { id: 'exec_hr_005', firmId: 'firm_hr_005', name: '朱总', title: '董事长', phone: '', email: '', isLegalRep: true },
  { id: 'exec_hr_006', firmId: 'firm_hr_006', name: '唐总', title: '董事长', phone: '', email: '', isLegalRep: true },
  { id: 'exec_hr_007', firmId: 'firm_hr_007', name: '左总', title: '董事长', phone: '', email: '', isLegalRep: true },
  { id: 'exec_hr_008', firmId: 'firm_hr_008', name: '曲总', title: '董事长', phone: '', email: '', isLegalRep: true },
  { id: 'exec_hr_009', firmId: 'firm_hr_009', name: '贲总', title: '董事长', phone: '', email: '', isLegalRep: true },
  { id: 'exec_hr_010', firmId: 'firm_hr_010', name: '牛总', title: '董事长', phone: '', email: '', isLegalRep: true },
  { id: 'exec_hr_011', firmId: 'firm_hr_011', name: '封总', title: '董事长', phone: '', email: '', isLegalRep: true },
  { id: 'exec_hr_012', firmId: 'firm_hr_012', name: '何总', title: '董事长', phone: '', email: '', isLegalRep: true },
  { id: 'exec_hr_013', firmId: 'firm_hr_013', name: '徐总', title: '董事长', phone: '', email: '', isLegalRep: true },
  { id: 'exec_hr_014', firmId: 'firm_hr_014', name: '陈总', title: '董事长', phone: '', email: '', isLegalRep: true },
  { id: 'exec_hr_015', firmId: 'firm_hr_015', name: '王总', title: '董事长', phone: '', email: '', isLegalRep: true },
  { id: 'exec_hr_016', firmId: 'firm_hr_016', name: '刘总', title: '董事长', phone: '', email: '', isLegalRep: true },
  { id: 'exec_hr_017', firmId: 'firm_hr_017', name: '黄总', title: '董事长', phone: '', email: '', isLegalRep: true },
  { id: 'exec_hr_018', firmId: 'firm_hr_018', name: '刘总', title: '董事长', phone: '', email: '', isLegalRep: true },
  { id: 'exec_hr_019', firmId: 'firm_hr_019', name: '邵总', title: '董事长', phone: '', email: '', isLegalRep: true },
  { id: 'exec_hr_020', firmId: 'firm_hr_020', name: '王总', title: '董事长', phone: '', email: '', isLegalRep: true },
  { id: 'exec_hr_021', firmId: 'firm_hr_021', name: '黄总', title: '董事长', phone: '', email: '', isLegalRep: true },
  { id: 'exec_hr_022', firmId: 'firm_hr_022', name: '石总', title: '董事长', phone: '', email: '', isLegalRep: true },
  { id: 'exec_hr_023', firmId: 'firm_hr_023', name: '吴总', title: '董事长', phone: '', email: '', isLegalRep: true },
  { id: 'exec_hr_024', firmId: 'firm_hr_024', name: '张总', title: '董事长', phone: '', email: '', isLegalRep: true },
  { id: 'exec_hr_025', firmId: 'firm_hr_025', name: '魏总', title: '董事长', phone: '', email: '', isLegalRep: true },
];

// ─────────────────────────────────────────────────────────────
// 企业关系
// ─────────────────────────────────────────────────────────────

export const mockFirmRelations: FirmRelation[] = [
  { id: 'rel_001', sourceFirmId: 'firm_001', targetFirmId: 'firm_002', type: 'upstream', description: '正极材料供应战略合作', strength: 90, since: '2020-01-01' },
  { id: 'rel_002', sourceFirmId: 'firm_001', targetFirmId: 'firm_003', type: 'upstream', description: '负极材料采购', strength: 75, since: '2021-06-01' },
  { id: 'rel_003', sourceFirmId: 'firm_002', targetFirmId: 'firm_004', type: 'downstream', description: '储能电池包供应', strength: 80, since: '2022-03-01' },
  { id: 'rel_004', sourceFirmId: 'firm_004', targetFirmId: 'firm_006', type: 'downstream', description: '新能源汽车电池配套', strength: 95, since: '2021-01-01' },
  { id: 'rel_005', sourceFirmId: 'firm_001', targetFirmId: 'firm_006', type: 'same_chain', description: '同处动力电池产业链', strength: 60, since: '' },
  { id: 'rel_006', sourceFirmId: 'firm_001', targetFirmId: 'firm_003', type: 'same_park', description: '同在武进经开区', strength: 70, since: '' },
  // ── 新增：汽车产业链关系 ──
  { id: 'rel_007', sourceFirmId: 'firm_008', targetFirmId: 'firm_009', type: 'upstream', description: '汽车钢板供应战略合作', strength: 85, since: '2019-06-01' },
  { id: 'rel_008', sourceFirmId: 'firm_008', targetFirmId: 'firm_010', type: 'upstream', description: '汽车钢板供应', strength: 80, since: '2020-03-01' },
  { id: 'rel_009', sourceFirmId: 'firm_009', targetFirmId: 'firm_011', type: 'upstream', description: '轮胎供应', strength: 75, since: '2020-08-01' },
  { id: 'rel_010', sourceFirmId: 'firm_009', targetFirmId: 'firm_012', type: 'downstream', description: '汽车零部件总成供应', strength: 88, since: '2018-01-01' },
  { id: 'rel_011', sourceFirmId: 'firm_010', targetFirmId: 'firm_013', type: 'downstream', description: '智能驾驶系统配套', strength: 90, since: '2020-01-01' },
  { id: 'rel_012', sourceFirmId: 'firm_011', targetFirmId: 'firm_013', type: 'downstream', description: '汽车玻璃配套', strength: 85, since: '2019-06-01' },
  { id: 'rel_013', sourceFirmId: 'firm_010', targetFirmId: 'firm_014', type: 'same_chain', description: '同处汽车电子产业链', strength: 70, since: '' },
  { id: 'rel_014', sourceFirmId: 'firm_003', targetFirmId: 'firm_009', type: 'upstream', description: '发动机零部件供应', strength: 65, since: '2021-03-01' },
  { id: 'rel_015', sourceFirmId: 'firm_012', targetFirmId: 'firm_013', type: 'downstream', description: '汽车零部件总成供应', strength: 80, since: '2019-01-01' },
  { id: 'rel_016', sourceFirmId: 'firm_006', targetFirmId: 'firm_013', type: 'same_chain', description: '同处汽车产业链', strength: 60, since: '' },
  { id: 'rel_017', sourceFirmId: 'firm_015', targetFirmId: 'firm_013', type: 'downstream', description: '整车销售', strength: 90, since: '2018-01-01' },
  { id: 'rel_018', sourceFirmId: 'firm_016', targetFirmId: 'firm_008', type: 'guarantee', description: '融资担保合作', strength: 75, since: '2020-06-01' },
  { id: 'rel_019', sourceFirmId: 'firm_016', targetFirmId: 'firm_010', type: 'guarantee', description: '融资租赁合作', strength: 80, since: '2021-01-01' },
];

// ─────────────────────────────────────────────────────────────
// 拜访记录
// ─────────────────────────────────────────────────────────────

export const mockVisitRecords: VisitRecord[] = [
  {
    id: 'visit_001', targetType: 'firm', targetId: 'firm_001', targetName: '武进锂电',
    managerId: 'mgr_001', managerName: '李明', visitType: '定期回访',
    visitDate: '2026-04-08', visitTime: '14:00', duration: 90,
    location: '武进经开区创新园B座', lbsVerified: true,
    subject: 'Q2季度经营回访', summary: '客户表示订单饱满，Q2排产已满。当前用电量同比增长15%，AI协作工具活跃度飙升，显示扩张意愿强。近期有产线扩建融资需求。',
    nextStep: '整理融资方案建议，发送客户确认', nextVisitDate: '2026-05-08',
    tags: ['高意向', '融资需求'], createdAt: '2026-04-08T14:00:00Z', updatedAt: '2026-04-08T16:00:00Z',
  },
  {
    id: 'visit_002', targetType: 'firm', targetId: 'firm_004', targetName: '广州储能',
    managerId: 'mgr_004', managerName: '张强', visitType: '风险核查',
    visitDate: '2026-04-05', visitTime: '10:30', duration: 60,
    location: '天河软件园A栋', lbsVerified: true,
    subject: '关注类客户风险核查', summary: '用电量环比下降5%，开工率降至62%，订单减少。需重点关注流动性风险。已建议客户控制扩张节奏，压缩部分非核心设备采购。',
    nextStep: '两周后再次核查，若持续恶化建议降级', nextVisitDate: '2026-04-20',
    tags: ['风险核查', '关注'], createdAt: '2026-04-05T10:30:00Z', updatedAt: '2026-04-05T11:30:00Z',
  },
  {
    id: 'visit_003', targetType: 'firm', targetId: 'firm_005', targetName: '苏州半导体',
    managerId: 'mgr_002', managerName: '刘洋', visitType: '商机跟进',
    visitDate: '2026-04-03', visitTime: '15:00', duration: 120,
    location: '苏州高新区科技园', lbsVerified: true,
    subject: '二期产线融资方案洽谈', summary: '客户二期扩产计划确定，估算设备采购需求约8亿元。拟推荐「直租+保理」组合方案，预计IRR 7.2%。客户意向强烈。',
    nextStep: '发送详细方案初稿，安排法务尽调', nextVisitDate: '2026-04-18',
    tags: ['高意向', '商机跟进'], createdAt: '2026-04-03T15:00:00Z', updatedAt: '2026-04-03T17:00:00Z',
  },
  {
    id: 'visit_004', targetType: 'firm', targetId: 'firm_007', targetName: '成都汽车电子',
    managerId: 'mgr_003', managerName: '王芳', visitType: '贷后检查',
    visitDate: '2026-04-01', visitTime: '09:00', duration: 45,
    location: '天河软件园B栋', lbsVerified: true,
    subject: 'BB+评级客户贷后走访', summary: '客户评级已下调至BB+，经营状况下滑明显。用电量同比降8.5%，开工率仅55%。建议纳入关注名单，持续跟踪。',
    nextStep: '撰写贷后报告，提交风控会审议', nextVisitDate: '2026-04-15',
    tags: ['贷后检查', '风险'], createdAt: '2026-04-01T09:00:00Z', updatedAt: '2026-04-01T09:45:00Z',
  },
  {
    id: 'visit_005', targetType: 'park', targetId: 'park_wujin', targetName: '武进经开区',
    managerId: 'mgr_001', managerName: '李明', visitType: '定期回访',
    visitDate: '2026-03-28', visitTime: '14:00', duration: 180,
    location: '武进经开区管委会', lbsVerified: true,
    subject: '武进经开区年度座谈会', summary: '参加园区年度企业座谈会，了解到年内将新增3家锂电设备企业入驻，园区整体活力指数保持92高位。',
    nextStep: '梳理新入园企业名单，制定拓客计划', nextVisitDate: '',
    tags: ['园区走访'], createdAt: '2026-03-28T14:00:00Z', updatedAt: '2026-03-28T17:00:00Z',
  },
  // ── 新增：汽车产业链拜访记录 ──
  {
    id: 'visit_006', targetType: 'firm', targetId: 'firm_009', targetName: '杭州中策轮胎',
    managerId: 'mgr_001', managerName: '李明', visitType: '商机跟进',
    visitDate: '2026-04-10', visitTime: '10:00', duration: 90,
    location: '武进经开区中策工业园', lbsVerified: true,
    subject: '轮胎企业智能化产线改造需求洽谈', summary: '企业订单饱满，开工率维持85%，计划投资6000万进行智能化产线改造。客户对直租产品兴趣浓厚，初步意向较强。',
    nextStep: '准备详细融资方案，发送客户确认', nextVisitDate: '2026-04-22',
    tags: ['高意向', '商机跟进'], createdAt: '2026-04-10T10:00:00Z', updatedAt: '2026-04-10T11:30:00Z',
  },
  {
    id: 'visit_007', targetType: 'firm', targetId: 'firm_010', targetName: '宁波均胜电子',
    managerId: 'mgr_004', managerName: '张强', visitType: '定期回访',
    visitDate: '2026-04-11', visitTime: '14:00', duration: 120,
    location: '天河软件园均胜大厦', lbsVerified: true,
    subject: '智能驾驶系统扩产需求跟进', summary: '企业月均AI Token增长超200%，智能驾驶系统订单爆发。扩产需求强烈，预估1.5亿融资需求。客户已明确表示希望尽快推进。',
    nextStep: '安排尽调，准备详细融资方案', nextVisitDate: '2026-04-25',
    tags: ['高意向', '融资需求'], createdAt: '2026-04-11T14:00:00Z', updatedAt: '2026-04-11T16:00:00Z',
  },
  {
    id: 'visit_008', targetType: 'firm', targetId: 'firm_013', targetName: '重庆长安汽车',
    managerId: 'mgr_003', managerName: '王芳', visitType: '首次拜访',
    visitDate: '2026-04-12', visitTime: '09:30', duration: 150,
    location: '天河软件园长安汽车办公区', lbsVerified: true,
    subject: '龙头企业融资需求初次洽谈', summary: '重庆长安为行业龙头企业，产能扩张计划已确定，预计设备采购需求约8亿。初步接触，意向良好，建议安排高层拜访进一步推进。',
    nextStep: '联系采购部门，安排高层拜访', nextVisitDate: '2026-04-20',
    tags: ['高意向', '龙头客户'], createdAt: '2026-04-12T09:30:00Z', updatedAt: '2026-04-12T12:00:00Z',
  },
  {
    id: 'visit_009', targetType: 'firm', targetId: 'firm_011', targetName: '武汉福耀玻璃',
    managerId: 'mgr_001', managerName: '李明', visitType: '首次拜访',
    visitDate: '2026-04-13', visitTime: '11:00', duration: 60,
    location: '武进经开区福耀工业园', lbsVerified: true,
    subject: '汽车玻璃企业初次接触', summary: '企业汽车玻璃订单稳定增长，计划升级智能化产线，需求约3500万。初步介绍直租产品，客户表示有兴趣了解。',
    nextStep: '发送产品介绍资料，安排二次拜访', nextVisitDate: '2026-04-28',
    tags: ['中等意向'], createdAt: '2026-04-13T11:00:00Z', updatedAt: '2026-04-13T12:00:00Z',
  },
  {
    id: 'visit_010', targetType: 'firm', targetId: 'firm_012', targetName: '广州华德汽配',
    managerId: 'mgr_004', managerName: '张强', visitType: '风险核查',
    visitDate: '2026-04-12', visitTime: '15:30', duration: 60,
    location: '天河软件园华德大厦', lbsVerified: true,
    subject: '关注预警客户经营状况核查', summary: '客户评级为关注，用电量同比下降2.8%，开工率降至68%。与企业负责人沟通了解到订单略有下滑，但整体经营尚可，建议持续跟踪。',
    nextStep: '两周后再次核查，关注订单变化情况', nextVisitDate: '2026-04-26',
    tags: ['关注', '风险跟踪'], createdAt: '2026-04-12T15:30:00Z', updatedAt: '2026-04-12T16:30:00Z',
  },
  {
    id: 'visit_011', targetType: 'firm', targetId: 'firm_014', targetName: '北京四维图新',
    managerId: 'mgr_002', managerName: '刘洋', visitType: '定期回访',
    visitDate: '2026-04-14', visitTime: '10:00', duration: 90,
    location: '苏州高新区科技园四维图新', lbsVerified: true,
    subject: '车联网龙头企业扩产需求跟进', summary: '企业月均AI Token高达4500万，持续高增长态势。智能座舱订单饱满，计划扩产，预估需求5000万。客户意向强烈。',
    nextStep: '了解具体设备采购计划，准备方案', nextVisitDate: '2026-04-30',
    tags: ['高意向', '商机跟进'], createdAt: '2026-04-14T10:00:00Z', updatedAt: '2026-04-14T11:30:00Z',
  },
];

// ─────────────────────────────────────────────────────────────
// 工单
// ─────────────────────────────────────────────────────────────

export const mockWorkOrders: WorkOrder[] = [
  {
    id: 'WO-2026-0001', type: '拓客', level: 'green', title: '武进锂电设备企业回访',
    desc: '跟进Q2回访意向，制定融资方案', firmId: 'firm_001', firmName: '武进锂电',
    parkId: 'park_wujin', parkName: '武进经开区', ownerId: 'mgr_001', ownerName: '李明',
    creatorId: 'mgr_lead_001', creatorName: '赵总监', deadline: '2026-04-15',
    status: '待闭环', lbsRequired: true, lbsVerified: true, completedAt: '',
    relatedVisitId: 'visit_001', priority: 4,
    createdAt: '2026-04-01T00:00:00Z', updatedAt: '2026-04-08T16:00:00Z',
  },
  {
    id: 'WO-2026-0002', type: '排雷', level: 'red', title: '企业C风险核查',
    desc: '关注工单，客户评级下调，需全面核查', firmId: 'firm_007', firmName: '成都汽车电子',
    parkId: 'park_tianhe', parkName: '天河软件园', ownerId: 'mgr_003', ownerName: '王芳',
    creatorId: 'mgr_lead_001', creatorName: '赵总监', deadline: '2026-04-12',
    status: '进行中', lbsRequired: true, lbsVerified: false, completedAt: '',
    relatedVisitId: 'visit_004', priority: 5,
    createdAt: '2026-04-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z',
  },
  {
    id: 'WO-2026-0003', type: '贷后', level: 'yellow', title: '广州储能贷后检查',
    desc: '关注预警客户，需定期跟踪', firmId: 'firm_004', firmName: '广州储能',
    parkId: 'park_tianhe', parkName: '天河软件园', ownerId: 'mgr_004', ownerName: '张强',
    creatorId: 'mgr_lead_001', creatorName: '赵总监', deadline: '2026-04-20',
    status: '待拜访', lbsRequired: true, lbsVerified: false, completedAt: '',
    relatedVisitId: 'visit_002', priority: 3,
    createdAt: '2026-04-01T00:00:00Z', updatedAt: '2026-04-05T12:00:00Z',
  },
  {
    id: 'WO-2026-0004', type: '商机跟进', level: 'green', title: '苏州半导体二期融资推进',
    desc: '跟进苏州半导体扩产融资需求', firmId: 'firm_005', firmName: '苏州半导体',
    parkId: 'park_suqian', parkName: '苏州高新区', ownerId: 'mgr_002', ownerName: '刘洋',
    creatorId: 'mgr_002', creatorName: '刘洋', deadline: '2026-04-25',
    status: '进行中', lbsRequired: false, lbsVerified: false, completedAt: '',
    relatedVisitId: 'visit_003', priority: 4,
    createdAt: '2026-04-03T18:00:00Z', updatedAt: '2026-04-03T18:00:00Z',
  },
  {
    id: 'WO-2026-0005', type: '拓客', level: 'green', title: '武进经开区新入园企业拓客',
    desc: '园区年内新增3家锂电企业，制定拓客计划', firmId: undefined, firmName: undefined,
    parkId: 'park_wujin', parkName: '武进经开区', ownerId: 'mgr_001', ownerName: '李明',
    creatorId: 'mgr_lead_001', creatorName: '赵总监', deadline: '2026-04-30',
    status: '待领取', lbsRequired: false, lbsVerified: false, completedAt: '',
    relatedVisitId: 'visit_005', priority: 3,
    createdAt: '2026-04-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z',
  },
  // ── 新增：汽车产业链相关工单 ──
  {
    id: 'WO-2026-0006', type: '商机跟进', level: 'green', title: '杭州中策轮胎设备融资推进',
    desc: '跟进轮胎企业智能化产线改造融资需求', firmId: 'firm_009', firmName: '杭州中策轮胎',
    parkId: 'park_wujin', parkName: '武进经开区', ownerId: 'mgr_001', ownerName: '李明',
    creatorId: 'mgr_001', creatorName: '李明', deadline: '2026-04-25',
    status: '待拜访', lbsRequired: true, lbsVerified: false, completedAt: '',
    relatedVisitId: '', priority: 4,
    createdAt: '2026-04-10T10:00:00Z', updatedAt: '2026-04-10T10:00:00Z',
  },
  {
    id: 'WO-2026-0007', type: '商机跟进', level: 'green', title: '宁波均胜电子扩产尽调',
    desc: '安排尽调，准备智能驾驶系统扩产融资方案', firmId: 'firm_010', firmName: '宁波均胜电子',
    parkId: 'park_tianhe', parkName: '天河软件园', ownerId: 'mgr_004', ownerName: '张强',
    creatorId: 'mgr_004', creatorName: '张强', deadline: '2026-05-01',
    status: '进行中', lbsRequired: true, lbsVerified: false, completedAt: '',
    relatedVisitId: '', priority: 4,
    createdAt: '2026-04-11T14:00:00Z', updatedAt: '2026-04-11T14:00:00Z',
  },
  {
    id: 'WO-2026-0008', type: '排雷', level: 'yellow', title: '广州华德汽配关注核查',
    desc: '关注预警客户，用电量同比下降，需核查经营状况', firmId: 'firm_012', firmName: '广州华德汽配',
    parkId: 'park_tianhe', parkName: '天河软件园', ownerId: 'mgr_004', ownerName: '张强',
    creatorId: 'mgr_lead_001', creatorName: '赵总监', deadline: '2026-04-22',
    status: '待拜访', lbsRequired: true, lbsVerified: false, completedAt: '',
    relatedVisitId: '', priority: 3,
    createdAt: '2026-04-12T09:00:00Z', updatedAt: '2026-04-12T09:00:00Z',
  },
  {
    id: 'WO-2026-0009', type: '拓客', level: 'green', title: '重庆长安汽车高层拜访',
    desc: '龙头企业融资需求，制定拜访计划', firmId: 'firm_013', firmName: '重庆长安汽车',
    parkId: 'park_tianhe', parkName: '天河软件园', ownerId: 'mgr_003', ownerName: '王芳',
    creatorId: 'mgr_003', creatorName: '王芳', deadline: '2026-04-28',
    status: '待领取', lbsRequired: true, lbsVerified: false, completedAt: '',
    relatedVisitId: '', priority: 5,
    createdAt: '2026-04-12T09:00:00Z', updatedAt: '2026-04-12T09:00:00Z',
  },
  {
    id: 'WO-2026-0010', type: '拓客', level: 'green', title: '武汉福耀玻璃拜访',
    desc: '汽车玻璃企业，了解产线升级需求', firmId: 'firm_011', firmName: '武汉福耀玻璃',
    parkId: 'park_wujin', parkName: '武进经开区', ownerId: 'mgr_001', ownerName: '李明',
    creatorId: 'mgr_001', creatorName: '李明', deadline: '2026-05-05',
    status: '待领取', lbsRequired: false, lbsVerified: false, completedAt: '',
    relatedVisitId: '', priority: 3,
    createdAt: '2026-04-13T11:00:00Z', updatedAt: '2026-04-13T11:00:00Z',
  },
];

// ─────────────────────────────────────────────────────────────
// 商机
// ─────────────────────────────────────────────────────────────

export const mockOpportunities: Opportunity[] = [
  {
    id: 'OPP-2026-0001', title: '武进锂电产线扩张直租', level: 'high', source: '数据补录',
    desc: '企业因订单饱满启动二期产线建设，需采购设备，估算融资需求5000万',
    firmId: 'firm_001', firmName: '武进锂电', parkId: 'park_wujin',
    product: '直接租赁', amount: '5000万', irr: '6.8%', term: '3年', probability: 70,
    action: '发送方案初稿给客户', nextActionDate: '2026-04-20',
    ownerId: 'mgr_001', ownerName: '李明', status: '跟进中',
    createdAt: '2026-04-08T16:00:00Z', updatedAt: '2026-04-08T16:00:00Z',
  },
  {
    id: 'OPP-2026-0002', title: '苏州半导体扩产直租+保理', level: 'high', source: 'IOT监测',
    desc: '月均AI Token调用量达850万，同比增156%，扩产意愿极强，预估需求8亿',
    firmId: 'firm_005', firmName: '苏州半导体', parkId: 'park_suqian',
    product: '直接租赁', amount: '8亿', irr: '7.2%', term: '5年', probability: 60,
    action: '发送详细方案初稿，安排法务尽调', nextActionDate: '2026-04-18',
    ownerId: 'mgr_002', ownerName: '刘洋', status: '方案沟通',
    createdAt: '2026-04-03T18:00:00Z', updatedAt: '2026-04-03T18:00:00Z',
  },
  {
    id: 'OPP-2026-0003', title: '广州储能设备更新融资', level: 'medium', source: '园区推送',
    desc: '天河软件园推送，企业有旧设备更新需求，额度约3000万',
    firmId: 'firm_004', firmName: '广州储能', parkId: 'park_tianhe',
    product: '售后回租', amount: '3000万', irr: '6.5%', term: '2年', probability: 40,
    action: '了解具体设备清单及现金流情况', nextActionDate: '2026-04-25',
    ownerId: 'mgr_004', ownerName: '张强', status: '跟进中',
    createdAt: '2026-03-20T10:00:00Z', updatedAt: '2026-04-05T12:00:00Z',
  },
  {
    id: 'OPP-2026-0004', title: '常州精密新增产线直租', level: 'medium', source: '主动营销',
    desc: '客户同园区企业，武进锂电供应商，扩产需求约2000万',
    firmId: 'firm_003', firmName: '常州精密', parkId: 'park_wujin',
    product: '直接租赁', amount: '2000万', irr: '6.2%', term: '3年', probability: 55,
    action: '预约拜访，介绍直租产品', nextActionDate: '2026-04-28',
    ownerId: 'mgr_001', ownerName: '李明', status: '发现',
    createdAt: '2026-04-08T16:00:00Z', updatedAt: '2026-04-08T16:00:00Z',
  },
  // ── 新增：汽车产业链商机 ──
  {
    id: 'OPP-2026-0005', title: '杭州中策轮胎设备更新直租', level: 'high', source: 'IOT监测',
    desc: '企业订单饱满，开工率维持85%，近期有智能化产线改造需求，预估需求6000万',
    firmId: 'firm_009', firmName: '杭州中策轮胎', parkId: 'park_wujin',
    product: '直接租赁', amount: '6000万', irr: '6.5%', term: '3年', probability: 65,
    action: '预约拜访，了解具体需求', nextActionDate: '2026-04-22',
    ownerId: 'mgr_001', ownerName: '李明', status: '跟进中',
    createdAt: '2026-04-10T10:00:00Z', updatedAt: '2026-04-10T10:00:00Z',
  },
  {
    id: 'OPP-2026-0006', title: '宁波均胜电子扩产融资租赁', level: 'high', source: '数据补录',
    desc: '智能驾驶系统订单爆发式增长，月均AI Token增长超200%，扩产需求强烈',
    firmId: 'firm_010', firmName: '宁波均胜电子', parkId: 'park_tianhe',
    product: '直接租赁', amount: '1.5亿', irr: '6.8%', term: '4年', probability: 70,
    action: '安排尽调，准备方案', nextActionDate: '2026-04-25',
    ownerId: 'mgr_004', ownerName: '张强', status: '方案沟通',
    createdAt: '2026-04-11T14:00:00Z', updatedAt: '2026-04-11T14:00:00Z',
  },
  {
    id: 'OPP-2026-0007', title: '重庆长安汽车设备更新回租', level: 'high', source: '主动营销',
    desc: '龙头企业，产能扩张计划确定，预计设备采购需求约8亿元，推荐直租+保理组合方案',
    firmId: 'firm_013', firmName: '重庆长安汽车', parkId: 'park_tianhe',
    product: '售后回租', amount: '8亿', irr: '5.8%', term: '5年', probability: 75,
    action: '联系采购部门，安排高层拜访', nextActionDate: '2026-04-20',
    ownerId: 'mgr_003', ownerName: '王芳', status: '跟进中',
    createdAt: '2026-04-12T09:00:00Z', updatedAt: '2026-04-12T09:00:00Z',
  },
  {
    id: 'OPP-2026-0008', title: '武汉福耀玻璃产线升级直租', level: 'medium', source: '园区推送',
    desc: '汽车玻璃需求稳定增长，计划升级智能化产线，需求约3500万',
    firmId: 'firm_011', firmName: '武汉福耀玻璃', parkId: 'park_wujin',
    product: '直接租赁', amount: '3500万', irr: '6.3%', term: '3年', probability: 55,
    action: '发送产品介绍，安排拜访', nextActionDate: '2026-04-28',
    ownerId: 'mgr_001', ownerName: '李明', status: '发现',
    createdAt: '2026-04-13T11:00:00Z', updatedAt: '2026-04-13T11:00:00Z',
  },
  {
    id: 'OPP-2026-0009', title: '北京四维图新智能座舱直租', level: 'medium', source: '主动营销',
    desc: '车联网龙头企业，AI Token月均4500万，持续高增长，扩产需求约5000万',
    firmId: 'firm_014', firmName: '北京四维图新', parkId: 'park_suqian',
    product: '直接租赁', amount: '5000万', irr: '6.5%', term: '3年', probability: 60,
    action: '了解具体设备采购计划', nextActionDate: '2026-04-30',
    ownerId: 'mgr_002', ownerName: '刘洋', status: '跟进中',
    createdAt: '2026-04-14T15:00:00Z', updatedAt: '2026-04-14T15:00:00Z',
  },
  {
    id: 'OPP-2026-0010', title: '西安汽车金融设备直租', level: 'medium', source: '数据补录',
    desc: '融资租赁公司扩大设备采购规模，计划采购车辆检测设备，需求约2000万',
    firmId: 'firm_016', firmName: '西安汽车金融', parkId: 'park_wujin',
    product: '直接租赁', amount: '2000万', irr: '7.0%', term: '2年', probability: 50,
    action: '了解设备清单和合作方案', nextActionDate: '2026-05-05',
    ownerId: 'mgr_001', ownerName: '李明', status: '发现',
    createdAt: '2026-04-14T16:00:00Z', updatedAt: '2026-04-14T16:00:00Z',
  },
];

// ─────────────────────────────────────────────────────────────
// 投放计划
// ─────────────────────────────────────────────────────────────

export const mockPlans: DeployPlan[] = [
  {
    id: 'PLAN-2026-0001', title: '武进锂电直租项目推进',
    product: '直接租赁', firmId: 'firm_001', firmName: '武进锂电', parkId: 'park_wujin',
    targetAmount: 5000, targetDate: '2026-06', actualAmount: 0, actualDate: '',
    status: '执行中', progress: 30,
    milestones: [
      { name: '方案发送', plannedDate: '2026-04-20', actualDate: '2026-04-09', status: 'done' },
      { name: '客户确认', plannedDate: '2026-04-30', actualDate: '', status: 'pending' },
      { name: '尽调完成', plannedDate: '2026-05-15', actualDate: '', status: 'pending' },
      { name: '签约', plannedDate: '2026-05-31', actualDate: '', status: 'pending' },
      { name: '起租上账', plannedDate: '2026-06-15', actualDate: '', status: 'pending' },
    ],
    opportunityId: 'OPP-2026-0001', ownerId: 'mgr_001', ownerName: '李明',
    createdAt: '2026-04-08T16:00:00Z', updatedAt: '2026-04-09T10:00:00Z',
  },
  {
    id: 'PLAN-2026-0002', title: '苏州半导体扩产融资推进',
    product: '直接租赁', firmId: 'firm_005', firmName: '苏州半导体', parkId: 'park_suqian',
    targetAmount: 80000, targetDate: '2026-09', actualAmount: 0, actualDate: '',
    status: '执行中', progress: 20,
    milestones: [
      { name: '方案初稿', plannedDate: '2026-04-18', actualDate: '', status: 'pending' },
      { name: '客户确认', plannedDate: '2026-04-30', actualDate: '', status: 'pending' },
      { name: '尽调', plannedDate: '2026-05-31', actualDate: '', status: 'pending' },
      { name: '签约', plannedDate: '2026-07-15', actualDate: '', status: 'pending' },
      { name: '起租上账', plannedDate: '2026-09-01', actualDate: '', status: 'pending' },
    ],
    opportunityId: 'OPP-2026-0002', ownerId: 'mgr_002', ownerName: '刘洋',
    createdAt: '2026-04-03T18:00:00Z', updatedAt: '2026-04-03T18:00:00Z',
  },
  {
    id: 'PLAN-2026-0003', title: '深圳新能源设备更新回租',
    product: '售后回租', firmId: 'firm_006', firmName: '深圳新能源', parkId: 'park_tianhe',
    targetAmount: 12000, targetDate: '2026-05', actualAmount: 0, actualDate: '',
    status: '执行中', progress: 60,
    milestones: [
      { name: '方案发送', plannedDate: '2026-03-25', actualDate: '2026-03-25', status: 'done' },
      { name: '客户确认', plannedDate: '2026-04-05', actualDate: '2026-04-04', status: 'done' },
      { name: '尽调完成', plannedDate: '2026-04-20', actualDate: '', status: 'pending' },
      { name: '签约', plannedDate: '2026-04-30', actualDate: '', status: 'pending' },
      { name: '起租上账', plannedDate: '2026-05-15', actualDate: '', status: 'pending' },
    ],
    opportunityId: '', ownerId: 'mgr_004', ownerName: '张强',
    createdAt: '2026-03-20T10:00:00Z', updatedAt: '2026-04-05T10:00:00Z',
  },
  // ── 新增：汽车产业链相关投放计划 ──
  {
    id: 'PLAN-2026-0004', title: '杭州中策轮胎智能化产线直租',
    product: '直接租赁', firmId: 'firm_009', firmName: '杭州中策轮胎', parkId: 'park_wujin',
    targetAmount: 6000, targetDate: '2026-07', actualAmount: 0, actualDate: '',
    status: '执行中', progress: 15,
    milestones: [
      { name: '方案发送', plannedDate: '2026-04-22', actualDate: '', status: 'pending' },
      { name: '客户确认', plannedDate: '2026-05-05', actualDate: '', status: 'pending' },
      { name: '尽调完成', plannedDate: '2026-05-25', actualDate: '', status: 'pending' },
      { name: '签约', plannedDate: '2026-06-15', actualDate: '', status: 'pending' },
      { name: '起租上账', plannedDate: '2026-07-01', actualDate: '', status: 'pending' },
    ],
    opportunityId: 'OPP-2026-0005', ownerId: 'mgr_001', ownerName: '李明',
    createdAt: '2026-04-10T10:00:00Z', updatedAt: '2026-04-10T10:00:00Z',
  },
  {
    id: 'PLAN-2026-0005', title: '宁波均胜电子智能驾驶扩产直租',
    product: '直接租赁', firmId: 'firm_010', firmName: '宁波均胜电子', parkId: 'park_tianhe',
    targetAmount: 15000, targetDate: '2026-08', actualAmount: 0, actualDate: '',
    status: '执行中', progress: 25,
    milestones: [
      { name: '尽调安排', plannedDate: '2026-04-25', actualDate: '', status: 'pending' },
      { name: '方案发送', plannedDate: '2026-05-10', actualDate: '', status: 'pending' },
      { name: '客户确认', plannedDate: '2026-05-25', actualDate: '', status: 'pending' },
      { name: '签约', plannedDate: '2026-06-30', actualDate: '', status: 'pending' },
      { name: '起租上账', plannedDate: '2026-08-01', actualDate: '', status: 'pending' },
    ],
    opportunityId: 'OPP-2026-0006', ownerId: 'mgr_004', ownerName: '张强',
    createdAt: '2026-04-11T14:00:00Z', updatedAt: '2026-04-11T14:00:00Z',
  },
  {
    id: 'PLAN-2026-0006', title: '重庆长安汽车设备采购直租',
    product: '直接租赁', firmId: 'firm_013', firmName: '重庆长安汽车', parkId: 'park_tianhe',
    targetAmount: 80000, targetDate: '2026-10', actualAmount: 0, actualDate: '',
    status: '执行中', progress: 10,
    milestones: [
      { name: '高层拜访', plannedDate: '2026-04-20', actualDate: '', status: 'pending' },
      { name: '尽调启动', plannedDate: '2026-05-15', actualDate: '', status: 'pending' },
      { name: '方案确认', plannedDate: '2026-06-30', actualDate: '', status: 'pending' },
      { name: '签约', plannedDate: '2026-08-31', actualDate: '', status: 'pending' },
      { name: '起租上账', plannedDate: '2026-10-01', actualDate: '', status: 'pending' },
    ],
    opportunityId: 'OPP-2026-0007', ownerId: 'mgr_003', ownerName: '王芳',
    createdAt: '2026-04-12T09:00:00Z', updatedAt: '2026-04-12T09:00:00Z',
  },
  {
    id: 'PLAN-2026-0007', title: '武汉福耀玻璃产线升级直租',
    product: '直接租赁', firmId: 'firm_011', firmName: '武汉福耀玻璃', parkId: 'park_wujin',
    targetAmount: 3500, targetDate: '2026-08', actualAmount: 0, actualDate: '',
    status: '执行中', progress: 5,
    milestones: [
      { name: '产品介绍', plannedDate: '2026-04-28', actualDate: '', status: 'pending' },
      { name: '需求确认', plannedDate: '2026-05-15', actualDate: '', status: 'pending' },
      { name: '方案发送', plannedDate: '2026-06-01', actualDate: '', status: 'pending' },
      { name: '签约', plannedDate: '2026-07-15', actualDate: '', status: 'pending' },
      { name: '起租上账', plannedDate: '2026-08-01', actualDate: '', status: 'pending' },
    ],
    opportunityId: 'OPP-2026-0008', ownerId: 'mgr_001', ownerName: '李明',
    createdAt: '2026-04-13T11:00:00Z', updatedAt: '2026-04-13T11:00:00Z',
  },
  {
    id: 'PLAN-2026-0008', title: '北京四维图新智能座舱设备直租',
    product: '直接租赁', firmId: 'firm_014', firmName: '北京四维图新', parkId: 'park_suqian',
    targetAmount: 5000, targetDate: '2026-09', actualAmount: 0, actualDate: '',
    status: '执行中', progress: 8,
    milestones: [
      { name: '设备清单确认', plannedDate: '2026-04-30', actualDate: '', status: 'pending' },
      { name: '方案初稿', plannedDate: '2026-05-20', actualDate: '', status: 'pending' },
      { name: '客户确认', plannedDate: '2026-06-10', actualDate: '', status: 'pending' },
      { name: '签约', plannedDate: '2026-07-31', actualDate: '', status: 'pending' },
      { name: '起租上账', plannedDate: '2026-09-01', actualDate: '', status: 'pending' },
    ],
    opportunityId: 'OPP-2026-0009', ownerId: 'mgr_002', ownerName: '刘洋',
    createdAt: '2026-04-14T15:00:00Z', updatedAt: '2026-04-14T15:00:00Z',
  },
];

