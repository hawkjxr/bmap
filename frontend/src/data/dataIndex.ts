// ═══════════════════════════════════════════════════════════════
// 统一数据索引（dataIndex.ts）
// 核心理念：提供跨模块数据查询能力
// 索引关系图：
//
//   firm ←parkIds→ park ←chainIds→ chain
//                ↓
//            node（通过 chainNodeDetails[].chainId 归入 chain）
//
//   园区 → 节点：遍历 chainNodeDetails，按 chainId 归入园区所关联的 chain
//   企业 → 节点：firmId → chainId → chainNodeDetails
// ═══════════════════════════════════════════════════════════════

import { firmData, firmIdToName, firmIdToParkIds } from './firmData';
import { parkData, parkIdToName } from './parkData';
import { chainInfoList, chainNodeDetails, chainIdToName, nodeIdToName } from './chainData';
import { teamMembers, leaders, productManagers, memberIdToName, memberIdToInfo } from './teamData';
import type { DataIndex, FirmInfo, ParkInfo, ChainNodeInfo, TeamMember } from './types';

// ─── 索引构建（先构建独立数据，再组装为 dataIndex，避免循环引用） ───

const _provinceIdToName: Record<string, string> = {};
const _cityIdToName: Record<string, string> = {};
const _districtIdToName: Record<string, string> = {};
const _streetIdToName: Record<string, string> = {};
const _industryIdToName: Record<string, string> = {};
const _chainNodeIdToName: Record<string, string> = {};
const _firmIdToChainNodeIds: Record<string, string[]> = {};
const _firmIdToIndustryIds: Record<string, string[]> = {};
const _firmIdToManagerId: Record<string, string> = {};
const _firmIdToCoManagerIds: Record<string, string[]> = {};
const _chainNodeIdToFirmIds: Record<string, string[]> = {};
const _firmIdToVisitIds: Record<string, string[]> = {};
const _firmIdToWorkOrderIds: Record<string, string[]> = {};
const _firmIdToOpportunityIds: Record<string, string[]> = {};
const _managerIdToVisitIds: Record<string, string[]> = {};
const _managerIdToWorkOrderIds: Record<string, string[]> = {};
const _managerIdToOpportunityIds: Record<string, string[]> = {};
const _managerIdToPlanIds: Record<string, string[]> = {};

const _firmIdToChainIds: Record<string, string[]> = {};
const _parkIdToFirmIds: Record<string, string[]> = {};
const _parkIdToChainIds: Record<string, string[]> = {};
const _parkIdToNodeIds: Record<string, string[]> = {};  // 园区 → 节点（通过园区关联的产业链查找节点）
const _chainIdToFirmIds: Record<string, string[]> = {};
const _chainIdToNodeIds: Record<string, string[]> = {};
const _managerIdToFirms: Record<string, string[]> = {};

// Step 1: managerIdToFirms
firmData.forEach(firm => {
  const mgrId = firm.managerId;
  if (mgrId) {
    if (!_managerIdToFirms[mgrId]) {
      _managerIdToFirms[mgrId] = [];
    }
    _managerIdToFirms[mgrId].push(firm.id);
  }
});

// Step 2: parkIdToFirmIds, parkIdToChainIds
parkData.forEach(park => {
  _parkIdToFirmIds[park.id] = park.firmIds;
  _parkIdToChainIds[park.id] = park.chainIds;
});

// Step 3: chainIdToFirmIds, chainIdToNodeIds
Object.values(chainNodeDetails).forEach(node => {
  if (!_chainIdToFirmIds[node.chainId]) {
    _chainIdToFirmIds[node.chainId] = [];
    _chainIdToNodeIds[node.chainId] = [];
  }
  _chainIdToNodeIds[node.chainId].push(node.id);
  (node.firms || []).forEach(f => {
    if (!_chainIdToFirmIds[node.chainId].includes(f.firmId)) {
      _chainIdToFirmIds[node.chainId].push(f.firmId);
    }
  });
});

// Step 3.5: parkIdToNodeIds（通过园区关联的产业链，找到该产业链下的所有节点）
parkData.forEach(park => {
  const nodeIds: string[] = [];
  park.chainIds.forEach(chainId => {
    const ids = _chainIdToNodeIds[chainId] || [];
    ids.forEach(id => { if (!nodeIds.includes(id)) nodeIds.push(id); });
  });
  _parkIdToNodeIds[park.id] = nodeIds;
});

// Step 4: firmIdToChainIds（通过 chainIdToFirmIds 反推，此时已完成）
firmData.forEach(firm => {
  _firmIdToChainIds[firm.id] = Object.entries(_chainIdToFirmIds)
    .filter(([, firmIds]) => firmIds.includes(firm.id))
    .map(([chainId]) => chainId);
});

// ─── 统一索引对象（最后组装，无循环引用） ────────────────────

export const dataIndex: DataIndex = {
  provinceIdToName: _provinceIdToName,
  cityIdToName: _cityIdToName,
  districtIdToName: _districtIdToName,
  streetIdToName: _streetIdToName,
  industryIdToName: _industryIdToName,
  chainIdToName,
  chainNodeIdToName: _chainNodeIdToName,
  firmIdToParkIds,
  firmIdToChainNodeIds: _firmIdToChainNodeIds,
  firmIdToIndustryIds: _firmIdToIndustryIds,
  firmIdToManagerId: _firmIdToManagerId,
  firmIdToCoManagerIds: _firmIdToCoManagerIds,
  firmIdToChainIds: _firmIdToChainIds,
  parkIdToFirmIds: _parkIdToFirmIds,
  parkIdToChainIds: _parkIdToChainIds,
  parkIdToNodeIds: _parkIdToNodeIds,
  chainIdToFirmIds: _chainIdToFirmIds,
  chainIdToNodeIds: _chainIdToNodeIds,
  chainNodeIdToFirmIds: _chainNodeIdToFirmIds,
  managerIdToFirmIds: _managerIdToFirms,
  firmIdToVisitIds: _firmIdToVisitIds,
  firmIdToWorkOrderIds: _firmIdToWorkOrderIds,
  firmIdToOpportunityIds: _firmIdToOpportunityIds,
  managerIdToVisitIds: _managerIdToVisitIds,
  managerIdToWorkOrderIds: _managerIdToWorkOrderIds,
  managerIdToOpportunityIds: _managerIdToOpportunityIds,
  managerIdToPlanIds: _managerIdToPlanIds,
};

// ─── 跨模块查询函数（利用已构建的完整双向索引） ─────────────────

/** 获取园区关联的所有产业链节点
 *  路径：park.chainIds → chainId → chainNodeDetails[id].chainId === chainId
 */
export function getParkNodes(parkId: string): ChainNodeInfo[] {
  const nodeIds = _parkIdToNodeIds[parkId] || [];
  return nodeIds.map(id => chainNodeDetails[id]).filter(Boolean) as ChainNodeInfo[];
}

/** 获取企业所在的所有园区 */
export function getFirmParks(firmId: string): ParkInfo[] {
  const parkIds = firmIdToParkIds[firmId] || [];
  return parkIds.map(id => parkData.find(p => p.id === id)).filter(Boolean) as ParkInfo[];
}

/** 获取企业在某园区的地址 */
export function getFirmAddressInPark(firmId: string, parkId: string): string | undefined {
  const firm = firmData.find(f => f.id === firmId);
  return firm?.addresses?.find(a => a.parkId === parkId)?.address;
}

/** 获取园区所在的所有产业链 */
export function getParkChains(parkId: string): typeof chainInfoList {
  const park = parkData.find(p => p.id === parkId);
  if (!park) return [];
  return chainInfoList.filter(c => park.chainIds.includes(c.id));
}

/** 获取企业的所有关联企业（同链/同园） */
export function getRelatedFirms(firmId: string): FirmInfo[] {
  const firm = firmData.find(f => f.id === firmId);
  if (!firm) return [];

  const relatedIds = new Set<string>();

  // 同园区企业
  firm.parkIds.forEach(parkId => {
    const park = parkData.find(p => p.id === parkId);
    park?.firmIds.forEach(id => relatedIds.add(id));
  });

  // 同产业链企业（直接使用 dataIndex.firmIdToChainIds，无循环引用）
  const chainIds = dataIndex.firmIdToChainIds?.[firmId] || [];
  chainIds.forEach(chainId => {
    const firmIds = dataIndex.chainIdToFirmIds?.[chainId] || [];
    firmIds.forEach(id => relatedIds.add(id));
  });

  relatedIds.delete(firmId);
  return Array.from(relatedIds).map(id => firmData.find(f => f.id === id)).filter(Boolean) as FirmInfo[];
}

/** 获取企业的完整管户经理信息 */
export function getFirmManager(firmId: string): TeamMember | undefined {
  const firm = firmData.find(f => f.id === firmId);
  if (!firm?.managerId) return undefined;
  return memberIdToInfo[firm.managerId];
}

/** 获取企业全景统计 */
export function getFirmStats(firmId: string) {
  const firm = firmData.find(f => f.id === firmId);
  if (!firm) return null;

  return {
    firm,
    parks: getFirmParks(firmId),
    chains: (dataIndex.firmIdToChainIds?.[firmId] || []).map(id => chainIdToName[id]).filter(Boolean),
    manager: getFirmManager(firmId),
    relatedCount: getRelatedFirms(firmId).length,
  };
}

// ─── 导出原始数据 ────────────────────────────────────────────

export {
  firmData,
  parkData,
  chainInfoList,
  chainNodeDetails,
  teamMembers,
  leaders,
  productManagers,
};

export {
  firmIdToName,
  parkIdToName,
  chainIdToName,
  nodeIdToName,
  memberIdToName,
  memberIdToInfo,
};
