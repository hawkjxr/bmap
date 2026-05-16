// ═══════════════════════════════════════════════════════════════
// 数据录入面板（TaskDataImport.tsx）
// 重用自 DataManager.tsx，用于个人工作台「数据补录 → 数据录入」Tab
// 核心理念：按对象类型统一管理数据导入、导出、模板下载
// ═══════════════════════════════════════════════════════════════

import React, { useState, useCallback, useRef } from 'react';
import {
  Upload, Download, FileJson, FileSpreadsheet, RotateCcw,
  ChevronRight, ChevronDown, CheckCircle2,
  Search, X, Package, Globe, Layers, Factory,
  Link, ClipboardList, BarChart2, Database,
} from 'lucide-react';
import { useDataStore } from '../store/data';
import { importFile, OBJECT_TYPE_META, OBJECT_GROUPS, type DataObjectType, type ImportResult } from '../data/importer';
import { exportTemplateJSON, exportTemplateCSV, exportCurrentData, exportAllData } from '../data/exporter';
import { useToast } from '../store/toast';

// ── 图标映射（按分组）─────────────────────
const GROUP_ICONS: Record<string, React.ReactNode> = {
  '行政区划': <Globe className="w-3 h-3" />,
  '行业与产业': <Layers className="w-3 h-3" />,
  '核心实体': <Factory className="w-3 h-3" />,
  '关系数据': <Link className="w-3 h-3" />,
  '事件记录': <ClipboardList className="w-3 h-3" />,
  '指标数据': <BarChart2 className="w-3 h-3" />,
};

// ── Props ──────────────────────
interface TaskDataImportProps {
  selectedType: DataObjectType | null;
  onSelectType: (type: DataObjectType | null) => void;
}

export const TaskDataImport: React.FC<TaskDataImportProps> = ({ selectedType, onSelectType }) => {
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set([OBJECT_GROUPS[0]]));
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getObjectCount = useDataStore(s => s.getObjectCount);
  const importLogs = useDataStore(s => s.importLogs);
  const sourceType = useDataStore(s => s.sourceType);
  const resetCategory = useDataStore(s => s.resetCategory);

  // ── 过滤类型列表 ──────────────────────
  const filteredGroups = OBJECT_GROUPS.map(group => ({
    name: group,
    types: OBJECT_TYPE_META.filter(t => t.group === group &&
      (!searchQuery || t.label.includes(searchQuery) || t.description.includes(searchQuery))),
  })).filter(g => g.types.length > 0);

  // ── 展开/折叠组 ──────────────────────
  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  // ── 解析并导入文件 ──────────────────────
  const handleFileImport = useCallback((file: File) => {
    if (!selectedType) {
      toast.show('请先从左侧选择一个数据类型', 'error');
      return;
    }
    const fileType = file.name.endsWith('.json') ? 'json' : file.name.endsWith('.csv') ? 'csv' : null;
    if (!fileType) {
      toast.show(`不支持的文件格式：${file.name}，仅支持 .json 或 .csv`, 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const result: ImportResult = importFile(selectedType, text, fileType, file.name);
      const label = OBJECT_TYPE_META.find(m => m.type === selectedType)?.label || selectedType;
      if (result.success) {
        toast.show(`✅ 导入成功：${label} — ${result.count} 条`, 'success');
      } else {
        toast.show(`❌ 导入失败：${result.errors.join('；')}`, 'error');
      }
    };
    reader.onerror = () => toast.show('文件读取失败', 'error');
    reader.readAsText(file);
  }, [selectedType, toast]);

  // ── 拖放处理 ──────────────────────
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileImport(file);
  }, [handleFileImport]);

  // ── 模板下载 ──────────────────────
  const handleDownloadTemplate = (type: DataObjectType, fmt: 'json' | 'csv') => {
    if (fmt === 'json') exportTemplateJSON(type);
    else exportTemplateCSV(type);
    toast.show(`📥 模板已下载：${OBJECT_TYPE_META.find(m => m.type === type)?.label}（${fmt.toUpperCase()}）`, 'success');
  };

  // ── 导出当前数据 ──────────────────────
  const handleExportCurrent = (type: DataObjectType) => {
    exportCurrentData(type);
    toast.show(`📤 已导出：${OBJECT_TYPE_META.find(m => m.type === type)?.label}`, 'success');
  };

  // ── 重置数据 ──────────────────────
  const handleReset = (type: DataObjectType) => {
    resetCategory(type);
    toast.show(`🔄 已重置：${OBJECT_TYPE_META.find(m => m.type === type)?.label}（恢复示例数据）`, 'info');
  };

  // ── 全量导出 ──────────────────────
  const handleExportAll = () => {
    exportAllData();
    toast.show('📤 全量数据已导出', 'success');
  };

  // ── 最近导入时间 ──────────────────────
  const getLastImport = (type: DataObjectType) => {
    const log = importLogs.find(l => l.objectType === type);
    if (!log) return null;
    const date = new Date(log.timestamp);
    return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  // ── 当前选中信息 ──────────────────────
  const selectedMeta = selectedType ? OBJECT_TYPE_META.find(m => m.type === selectedType) : null;
  const selectedCount = selectedType ? getObjectCount(selectedType) : 0;
  const selectedSource = selectedType ? (sourceType[selectedType] || 'mock') : 'mock';
  const lastImport = selectedType ? getLastImport(selectedType) : null;

  return (
    <div className="flex h-full overflow-hidden" onDrop={handleDrop} onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}>

      {/* ── 左侧：类型选择器 ────────────────────── */}
      <div className="w-56 flex flex-col shrink-0" style={{ borderRight: '1px solid var(--c-border)' }}>
        {/* 标题 */}
        <div className="px-3 py-2.5 border-b flex items-center gap-2" style={{ borderColor: 'var(--c-border)' }}>
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[10px] font-semibold" style={{ color: 'var(--c-text)' }}>数据类型</span>
          <span className="ml-auto text-[8px] px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--c-bg)', color: 'var(--c-text-muted)' }}>
            {Object.values(sourceType).filter(v => v === 'imported').length}/{Object.keys(sourceType).filter(k => !k.startsWith('metric') && !k.startsWith('chain') && !k.startsWith('customer') && !k.startsWith('follow') && !k.startsWith('data') && !k.startsWith('business') && !k.startsWith('firmData') && !k.startsWith('chainInfo') && !k.startsWith('supplement') && !k.startsWith('daily')).length}
          </span>
        </div>

        {/* 搜索 */}
        <div className="px-2 py-1.5 border-b" style={{ borderColor: 'var(--c-border)' }}>
          <div className="flex items-center gap-1 px-1.5 py-1 rounded" style={{ backgroundColor: 'var(--c-bg)', border: '1px solid var(--c-border)' }}>
            <Search className="w-2.5 h-2.5 shrink-0" style={{ color: 'var(--c-text-muted)' }} />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索..."
              className="flex-1 bg-transparent text-[9px] outline-none"
              style={{ color: 'var(--c-text)' }} />
            {searchQuery && <button onClick={() => setSearchQuery('')}><X className="w-2 h-2" style={{ color: 'var(--c-text-muted)' }} /></button>}
          </div>
        </div>

        {/* 分组列表 */}
        <div className="flex-1 overflow-y-auto py-0.5">
          {filteredGroups.map(group => (
            <div key={group.name}>
              <button
                onClick={() => toggleGroup(group.name)}
                className="w-full flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-semibold transition-colors hover:bg-white/5"
                style={{ color: 'var(--c-text-secondary)' }}
              >
                <span style={{ color: 'var(--c-accent)' }}>{GROUP_ICONS[group.name]}</span>
                <span className="flex-1 text-left">{group.name}</span>
                <span className="text-[7px] px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--c-bg)', color: 'var(--c-text-muted)' }}>
                  {group.types.length}
                </span>
                {expandedGroups.has(group.name)
                  ? <ChevronDown className="w-2.5 h-2.5" style={{ color: 'var(--c-text-muted)' }} />
                  : <ChevronRight className="w-2.5 h-2.5" style={{ color: 'var(--c-text-muted)' }} />
                }
              </button>

              {expandedGroups.has(group.name) && (
                <div className="ml-3">
                  {group.types.map(meta => {
                    const count = getObjectCount(meta.type);
                    const isSource = sourceType[meta.type] === 'imported';
                    const isSelected = selectedType === meta.type;
                    return (
                      <button
                        key={meta.type}
                        onClick={() => onSelectType(meta.type)}
                        className={`w-full flex items-center gap-1.5 px-2 py-1 rounded text-[9px] text-left transition-all mb-0.5 ${
                          isSelected ? '' : 'hover:bg-white/5'
                        }`}
                        style={isSelected
                          ? { backgroundColor: 'rgba(34,211,238,0.12)', color: '#22D3EE', borderLeft: '2px solid #22D3EE' }
                          : { color: 'var(--c-text-secondary)', borderLeft: '2px solid transparent' }
                        }
                      >
                        <span className="flex-1 min-w-0 truncate">{meta.label}</span>
                        <span className={`shrink-0 text-[7px] px-1 py-0.5 rounded ${isSource ? 'bg-cyan-500/10 text-cyan-400' : 'bg-white/5 text-gray-500'}`}>
                          {count > 0 ? count : isSource ? '已' : '—'}
                        </span>
                        {isSource && <CheckCircle2 className="w-2 h-2 text-cyan-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 底部：全量导出 */}
        <div className="p-2 border-t" style={{ borderColor: 'var(--c-border)' }}>
          <button
            onClick={handleExportAll}
            className="w-full flex items-center justify-center gap-1 px-2 py-1.5 rounded text-[9px] font-medium transition-all hover:opacity-90"
            style={{ backgroundColor: 'rgba(34,211,238,0.12)', color: '#22D3EE', border: '1px solid rgba(34,211,238,0.25)' }}
          >
            <Download className="w-3 h-3" />
            导出全量数据
          </button>
        </div>
      </div>

      {/* ── 右侧：详情面板 ────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedMeta ? (
          <>
            {/* 顶部信息栏 */}
            <div className="px-4 py-2.5 border-b flex items-start gap-3" style={{ borderColor: 'var(--c-border)' }}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[11px] font-bold" style={{ color: 'var(--c-text)' }}>{selectedMeta.label}</span>
                  <span className="text-[7px] px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--c-bg)', color: 'var(--c-text-muted)' }}>{selectedMeta.group}</span>
                  {selectedSource === 'imported' && <span className="text-[7px] px-1 py-0.5 rounded bg-cyan-500/10 text-cyan-400">已导入</span>}
                  {selectedSource === 'mock' && <span className="text-[7px] px-1 py-0.5 rounded bg-white/5 text-gray-500">示例</span>}
                </div>
                <p className="text-[9px]" style={{ color: 'var(--c-text-muted)' }}>{selectedMeta.description}</p>
                {lastImport && <p className="text-[8px] mt-0.5" style={{ color: 'var(--c-text-muted)' }}>最近导入：{lastImport}</p>}
              </div>
              <div className="text-right shrink-0">
                <div className="text-[18px] font-bold tabular-nums" style={{ color: '#22D3EE' }}>{selectedCount}</div>
                <div className="text-[7px]" style={{ color: 'var(--c-text-muted)' }}>条</div>
              </div>
            </div>

            {/* 操作区 */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">

              {/* CSV 必需列 */}
              <div className="tech-panel p-2">
                <div className="text-[8px] font-semibold mb-1" style={{ color: 'var(--c-text-secondary)' }}>CSV 必需列</div>
                <div className="flex flex-wrap gap-0.5">
                  {selectedMeta.csvRequiredHeaders.map(col => (
                    <span key={col} className="text-[7px] px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--c-bg)', color: 'var(--c-text-muted)', border: '1px solid var(--c-border)' }}>
                      {col}
                    </span>
                  ))}
                </div>
                <div className="text-[7px] mt-1" style={{ color: 'var(--c-text-muted)' }}>
                  示例：{selectedMeta.csvExample}
                </div>
              </div>

              {/* 文件上传区 */}
              <div
                className={`tech-panel p-3 border-2 border-dashed transition-all ${dragOver ? 'border-cyan-400/50 bg-cyan-500/5' : ''}`}
                style={{ borderColor: dragOver ? undefined : 'var(--c-border)' }}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.csv"
                  className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFileImport(f); e.target.value = ''; }}
                />
                <div className="flex flex-col items-center gap-1.5 text-center">
                  <Upload className="w-5 h-5" style={{ color: 'var(--c-text-muted)' }} />
                  <div className="text-[10px]" style={{ color: 'var(--c-text)' }}>
                    点击上传或拖放文件
                  </div>
                  <div className="text-[8px]" style={{ color: 'var(--c-text-muted)' }}>
                    支持 .json 和 .csv，覆盖式导入
                  </div>
                </div>
              </div>

              {/* 操作按钮组 */}
              <div className="grid grid-cols-2 gap-1.5">
                <button onClick={() => handleDownloadTemplate(selectedMeta.type, 'json')}
                  className="flex items-center justify-center gap-1 px-2 py-2 rounded text-[9px] font-medium transition-all hover:opacity-85"
                  style={{ backgroundColor: 'rgba(0,230,118,0.08)', color: '#00E676', border: '1px solid rgba(0,230,118,0.2)' }}>
                  <FileJson className="w-3 h-3" /> JSON 模板
                </button>
                <button onClick={() => handleDownloadTemplate(selectedMeta.type, 'csv')}
                  className="flex items-center justify-center gap-1 px-2 py-2 rounded text-[9px] font-medium transition-all hover:opacity-85"
                  style={{ backgroundColor: 'rgba(0,230,118,0.08)', color: '#00E676', border: '1px solid rgba(0,230,118,0.2)' }}>
                  <FileSpreadsheet className="w-3 h-3" /> CSV 模板
                </button>
                <button onClick={() => handleExportCurrent(selectedMeta.type)}
                  className="flex items-center justify-center gap-1 px-2 py-2 rounded text-[9px] font-medium transition-all hover:opacity-85"
                  style={{ backgroundColor: 'rgba(34,211,238,0.08)', color: '#22D3EE', border: '1px solid rgba(34,211,238,0.2)' }}>
                  <Download className="w-3 h-3" /> 导出当前
                </button>
                <button onClick={() => handleReset(selectedMeta.type)}
                  className="flex items-center justify-center gap-1 px-2 py-2 rounded text-[9px] font-medium transition-all hover:opacity-85"
                  style={{ backgroundColor: 'rgba(239,68,68,0.08)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <RotateCcw className="w-3 h-3" /> 恢复示例
                </button>
              </div>

              {/* 导入说明 */}
              <div className="tech-panel p-2" style={{ border: '1px solid var(--c-border)' }}>
                <div className="text-[8px] font-semibold mb-1" style={{ color: 'var(--c-text-secondary)' }}>导入说明</div>
                <ul className="text-[7px] space-y-0.5" style={{ color: 'var(--c-text-muted)' }}>
                  <li>• 覆盖式导入，替换该类型全部数据</li>
                  <li>• 推荐顺序：行政区划 → 行业 → 园区 → 客户经理 → 企业 → 事件记录</li>
                  <li>• 导入后宏观面板 / 产业链 / 客户全景 / 工作台自动联动</li>
                  <li>• 修改前建议先「导出当前」备份</li>
                </ul>
              </div>
            </div>
          </>
        ) : (
          /* 未选中 */
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <Package className="w-8 h-8 opacity-30" style={{ color: 'var(--c-text-muted)' }} />
            <div className="text-center">
              <div className="text-[10px] font-medium mb-0.5" style={{ color: 'var(--c-text-secondary)' }}>请从左侧选择数据类型</div>
              <div className="text-[8px]" style={{ color: 'var(--c-text-muted)' }}>选择后可导入 / 导出 / 下载模板</div>
            </div>
            <div className="flex flex-wrap justify-center gap-1 max-w-[220px]">
              {OBJECT_GROUPS.map(g => (
                <button key={g} onClick={() => { setExpandedGroups(prev => { const n = new Set(prev); n.add(g); return n; }); }}
                  className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[7px] transition-all hover:opacity-80"
                  style={{ backgroundColor: 'var(--c-bg)', color: 'var(--c-text-secondary)', border: '1px solid var(--c-border)' }}>
                  {GROUP_ICONS[g]} {g}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
