import React, { useState, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, Download, FileJson, FileSpreadsheet, RotateCcw,
  ChevronRight, ChevronDown, CheckCircle2, Search, X, Package,
  Globe, Layers, Factory, Link, ClipboardList, BarChart2, Database,
  PenLine, History, ArrowLeft, Trash2, Plus, Edit3,
} from 'lucide-react';
import { useDataStore } from '../store/data';
import { importFile, OBJECT_TYPE_META, OBJECT_GROUPS, type DataObjectType, type ImportResult } from '../data/importer';
import { exportTemplateJSON, exportTemplateCSV, exportCurrentData, exportAllData } from '../data/exporter';
import { useToast } from '../store/toast';
import { memberIdToName } from '../data/mockData';
import type { SupplementType, SupplementFieldChange } from '../data/types';

const CURRENT_USER_ID = 'member_002';

type SupplementSubTab = 'create' | 'history' | 'import';

const GROUP_ICONS: Record<string, React.ReactNode> = {
  '行政区划': <Globe className="w-4 h-4" />,
  '行业与产业': <Layers className="w-4 h-4" />,
  '核心实体': <Factory className="w-4 h-4" />,
  '关系数据': <Link className="w-4 h-4" />,
  '事件记录': <ClipboardList className="w-4 h-4" />,
  '指标数据': <BarChart2 className="w-4 h-4" />,
};

export const Supplement: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  // 数据录入相关状态
  const [importTab, setImportTab] = useState<SupplementSubTab>('import');
  const [selectedType, setSelectedType] = useState<DataObjectType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set([OBJECT_GROUPS[0]]));
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 发起补录相关状态
  const [supplementType, setSupplementType] = useState<SupplementType>('update');
  const [supplementFirmId, setSupplementFirmId] = useState<string>('');
  const [supplementChanges, setSupplementChanges] = useState<SupplementFieldChange[]>([
    { field: '', oldValue: null as unknown, newValue: null as unknown },
  ]);

  // 补录历史相关状态
  const [supplementSearch, setSupplementSearch] = useState('');

  const getObjectCount = useDataStore(s => s.getObjectCount);
  const importLogs = useDataStore(s => s.importLogs);
  const sourceType = useDataStore(s => s.sourceType);
  const resetCategory = useDataStore(s => s.resetCategory);
  const supplementData = useDataStore(s => s.supplementData);
  const firmData = useDataStore(s => s.firmData);
  const addSupplementAction = useDataStore(s => s.addSupplement);

  // 过滤类型列表
  const filteredGroups = OBJECT_GROUPS.map(group => ({
    name: group,
    types: OBJECT_TYPE_META.filter(t => t.group === group &&
      (!searchQuery || t.label.includes(searchQuery) || t.description.includes(searchQuery))),
  })).filter(g => g.types.length > 0);

  // 展开/折叠组
  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  // 解析并导入文件
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
        toast.show(`导入成功：${label} — ${result.count} 条`, 'success');
      } else {
        toast.show(`导入失败：${result.errors.join('；')}`, 'error');
      }
    };
    reader.onerror = () => toast.show('文件读取失败', 'error');
    reader.readAsText(file);
  }, [selectedType, toast]);

  // 拖放处理
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileImport(file);
  }, [handleFileImport]);

  // 模板下载
  const handleDownloadTemplate = (type: DataObjectType, fmt: 'json' | 'csv') => {
    if (fmt === 'json') exportTemplateJSON(type);
    else exportTemplateCSV(type);
    toast.show(`模板已下载：${OBJECT_TYPE_META.find(m => m.type === type)?.label}（${fmt.toUpperCase()}）`, 'success');
  };

  // 导出当前数据
  const handleExportCurrent = (type: DataObjectType) => {
    exportCurrentData(type);
    toast.show(`已导出：${OBJECT_TYPE_META.find(m => m.type === type)?.label}`, 'success');
  };

  // 重置数据
  const handleReset = (type: DataObjectType) => {
    resetCategory(type);
    toast.show(`已重置：${OBJECT_TYPE_META.find(m => m.type === type)?.label}（恢复示例数据）`, 'info');
  };

  // 全量导出
  const handleExportAll = () => {
    exportAllData();
    toast.show('全量数据已导出', 'success');
  };

  // 最近导入时间
  const getLastImport = (type: DataObjectType) => {
    const log = importLogs.find(l => l.objectType === type);
    if (!log) return null;
    const date = new Date(log.timestamp);
    return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  // 当前选中信息
  const selectedMeta = selectedType ? OBJECT_TYPE_META.find(m => m.type === selectedType) : null;
  const selectedCount = selectedType ? getObjectCount(selectedType) : 0;
  const selectedSource = selectedType ? (sourceType[selectedType] || 'mock') : 'mock';
  const lastImport = selectedType ? getLastImport(selectedType) : null;

  // 当前用户的补录记录
  const mySupplements = useMemo(() =>
    supplementData.filter(s => s.creatorId === CURRENT_USER_ID)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [supplementData]
  );

  // 补录提交函数
  const handleSubmitSupplement = () => {
    const firm = firmData.find(f => f.id === supplementFirmId);
    if (!firm) {
      toast.show('请选择要补录的企业', 'error');
      return;
    }
    const validChanges = supplementChanges.filter(c => c.field.trim() !== '');
    if (validChanges.length === 0) {
      toast.show('请至少填写一个字段变更', 'error');
      return;
    }
    const typeLabel = { create: '新增', update: '更新', delete: '删除' }[supplementType];
    const changesSummary = validChanges.map(c => `${c.field}: ${c.oldValue ?? '—'} → ${c.newValue ?? '—'}`).join('；');
    addSupplementAction({
      firmId: supplementFirmId,
      firmName: firm.name,
      creatorId: CURRENT_USER_ID,
      creatorName: memberIdToName[CURRENT_USER_ID] || CURRENT_USER_ID,
      action: supplementType,
      targetType: 'firm',
      targetId: supplementFirmId,
      targetLabel: firm.name,
      type: supplementType,
      changes: validChanges,
      summary: `${typeLabel}「${firm.name}」：${changesSummary}`,
      status: 'approved',
    });
    toast.show(`数据补录成功：${firm.name} — ${typeLabel}`);
    setSupplementFirmId('');
    setSupplementChanges([{ field: '', oldValue: null as unknown, newValue: null as unknown }]);
    setImportTab('history');
  };

  return (
    <div className="h-full flex flex-col" onDrop={handleDrop} onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}>

      {/* 顶部导航栏 */}
      <div className="shrink-0 px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--c-border)' }}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/tasks')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all hover:bg-white/5"
            style={{ border: '1px solid var(--c-border)', color: 'var(--c-text-secondary)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            返回工作台
          </button>
          <div className="w-px h-6" style={{ backgroundColor: 'var(--c-border)' }} />
          <div className="flex items-center gap-2">
            <PenLine className="w-5 h-5" style={{ color: '#F59E0B' }} />
            <h2 className="text-lg font-bold" style={{ color: 'var(--c-text)' }}>数据补录</h2>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}>
            {memberIdToName[CURRENT_USER_ID]}
          </span>
        </div>
      </div>

      {/* 子 Tab 导航 */}
      <div className="shrink-0 px-6 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--c-border)' }}>
        <button onClick={() => setImportTab('import')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${importTab === 'import' ? 'text-white' : 'hover:bg-white/5'}`}
          style={importTab === 'import' ? { backgroundColor: 'rgba(34,211,238,0.15)', color: '#22D3EE' } : { color: 'var(--c-text-secondary)' }}>
          <Database className="w-4 h-4" /> 数据录入
        </button>
        <button onClick={() => setImportTab('create')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${importTab === 'create' ? 'text-white' : 'hover:bg-white/5'}`}
          style={importTab === 'create' ? { backgroundColor: 'rgba(245,158,11,0.15)', color: '#F59E0B' } : { color: 'var(--c-text-secondary)' }}>
          <PenLine className="w-4 h-4" /> 发起补录
        </button>
        <button onClick={() => setImportTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${importTab === 'history' ? 'text-white' : 'hover:bg-white/5'}`}
          style={importTab === 'history' ? { backgroundColor: 'rgba(245,158,11,0.15)', color: '#F59E0B' } : { color: 'var(--c-text-secondary)' }}>
          <History className="w-4 h-4" /> 补录历史 ({mySupplements.length})
        </button>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 overflow-hidden">

        {/* ===== 数据录入 ===== */}
        {importTab === 'import' && (
          <div className="h-full flex">
            {/* 左侧：类型选择器 */}
            <div className="w-72 flex flex-col shrink-0" style={{ borderRight: '1px solid var(--c-border)' }}>
              <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: 'var(--c-border)' }}>
                <Database className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>数据类型</span>
              </div>

              {/* 搜索 */}
              <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--c-border)' }}>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--c-bg)', border: '1px solid var(--c-border)' }}>
                  <Search className="w-4 h-4 shrink-0" style={{ color: 'var(--c-text-muted)' }} />
                  <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    placeholder="搜索数据类型..."
                    className="flex-1 bg-transparent text-sm outline-none"
                    style={{ color: 'var(--c-text)' }} />
                  {searchQuery && <button onClick={() => setSearchQuery('')}><X className="w-4 h-4" style={{ color: 'var(--c-text-muted)' }} /></button>}
                </div>
              </div>

              {/* 分组列表 */}
              <div className="flex-1 overflow-y-auto py-2">
                {filteredGroups.map(group => (
                  <div key={group.name}>
                    <button
                      onClick={() => toggleGroup(group.name)}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/5"
                      style={{ color: 'var(--c-text-secondary)' }}
                    >
                      <span style={{ color: 'var(--c-accent)' }}>{GROUP_ICONS[group.name]}</span>
                      <span className="flex-1 text-left">{group.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--c-bg)', color: 'var(--c-text-muted)' }}>
                        {group.types.length}
                      </span>
                      {expandedGroups.has(group.name)
                        ? <ChevronDown className="w-4 h-4" style={{ color: 'var(--c-text-muted)' }} />
                        : <ChevronRight className="w-4 h-4" style={{ color: 'var(--c-text-muted)' }} />
                      }
                    </button>

                    {expandedGroups.has(group.name) && (
                      <div className="ml-6">
                        {group.types.map(meta => {
                          const count = getObjectCount(meta.type);
                          const isSource = sourceType[meta.type] === 'imported';
                          const isSelected = selectedType === meta.type;
                          return (
                            <button
                              key={meta.type}
                              onClick={() => setSelectedType(meta.type)}
                              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-all mb-1 ${
                                isSelected ? '' : 'hover:bg-white/5'
                              }`}
                              style={isSelected
                                ? { backgroundColor: 'rgba(34,211,238,0.12)', color: '#22D3EE', borderLeft: '3px solid #22D3EE' }
                                : { color: 'var(--c-text-secondary)', borderLeft: '3px solid transparent' }
                              }
                            >
                              <span className="flex-1 min-w-0 truncate">{meta.label}</span>
                              <span className={`shrink-0 text-xs px-2 py-0.5 rounded ${isSource ? 'bg-cyan-500/10 text-cyan-400' : 'bg-white/5 text-gray-500'}`}>
                                {count > 0 ? count : isSource ? '已' : '—'}
                              </span>
                              {isSource && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* 底部：全量导出 */}
              <div className="p-3 border-t" style={{ borderColor: 'var(--c-border)' }}>
                <button
                  onClick={handleExportAll}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-90"
                  style={{ backgroundColor: 'rgba(34,211,238,0.12)', color: '#22D3EE', border: '1px solid rgba(34,211,238,0.25)' }}
                >
                  <Download className="w-4 h-4" />
                  导出全量数据
                </button>
              </div>
            </div>

            {/* 右侧：详情面板 */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {selectedMeta ? (
                <>
                  {/* 顶部信息栏 */}
                  <div className="px-6 py-4 border-b flex items-start gap-4" style={{ borderColor: 'var(--c-border)' }}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base font-bold" style={{ color: 'var(--c-text)' }}>{selectedMeta.label}</span>
                        <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--c-bg)', color: 'var(--c-text-muted)' }}>{selectedMeta.group}</span>
                        {selectedSource === 'imported' && <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400">已导入</span>}
                        {selectedSource === 'mock' && <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-gray-500">示例</span>}
                      </div>
                      <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>{selectedMeta.description}</p>
                      {lastImport && <p className="text-xs mt-1" style={{ color: 'var(--c-text-muted)' }}>最近导入：{lastImport}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-2xl font-bold tabular-nums" style={{ color: '#22D3EE' }}>{selectedCount}</div>
                      <div className="text-xs" style={{ color: 'var(--c-text-muted)' }}>条</div>
                    </div>
                  </div>

                  {/* 操作区 */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">

                    {/* CSV 必需列 */}
                    <div className="tech-panel p-4">
                      <div className="text-sm font-semibold mb-2" style={{ color: 'var(--c-text-secondary)' }}>CSV 必需列</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedMeta.csvRequiredHeaders.map(col => (
                          <span key={col} className="text-sm px-3 py-1.5 rounded-lg" style={{ backgroundColor: 'var(--c-bg)', color: 'var(--c-text-muted)', border: '1px solid var(--c-border)' }}>
                            {col}
                          </span>
                        ))}
                      </div>
                      <div className="text-sm mt-2" style={{ color: 'var(--c-text-muted)' }}>
                        示例：{selectedMeta.csvExample}
                      </div>
                    </div>

                    {/* 文件上传区 */}
                    <div
                      className={`tech-panel p-6 border-2 border-dashed transition-all ${dragOver ? 'border-cyan-400/50 bg-cyan-500/5' : ''}`}
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
                      <div className="flex flex-col items-center gap-3 text-center">
                        <Upload className="w-10 h-10" style={{ color: 'var(--c-text-muted)' }} />
                        <div className="text-base" style={{ color: 'var(--c-text)' }}>
                          点击上传或拖放文件
                        </div>
                        <div className="text-sm" style={{ color: 'var(--c-text-muted)' }}>
                          支持 .json 和 .csv，覆盖式导入
                        </div>
                      </div>
                    </div>

                    {/* 操作按钮组 */}
                    <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => handleDownloadTemplate(selectedMeta.type, 'json')}
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all hover:opacity-85"
                        style={{ backgroundColor: 'rgba(0,230,118,0.08)', color: '#00E676', border: '1px solid rgba(0,230,118,0.2)' }}>
                        <FileJson className="w-5 h-5" /> JSON 模板
                      </button>
                      <button onClick={() => handleDownloadTemplate(selectedMeta.type, 'csv')}
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all hover:opacity-85"
                        style={{ backgroundColor: 'rgba(0,230,118,0.08)', color: '#00E676', border: '1px solid rgba(0,230,118,0.2)' }}>
                        <FileSpreadsheet className="w-5 h-5" /> CSV 模板
                      </button>
                      <button onClick={() => handleExportCurrent(selectedMeta.type)}
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all hover:opacity-85"
                        style={{ backgroundColor: 'rgba(34,211,238,0.08)', color: '#22D3EE', border: '1px solid rgba(34,211,238,0.2)' }}>
                        <Download className="w-5 h-5" /> 导出当前
                      </button>
                      <button onClick={() => handleReset(selectedMeta.type)}
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all hover:opacity-85"
                        style={{ backgroundColor: 'rgba(239,68,68,0.08)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                        <RotateCcw className="w-5 h-5" /> 恢复示例
                      </button>
                    </div>

                    {/* 导入说明 */}
                    <div className="tech-panel p-4" style={{ border: '1px solid var(--c-border)' }}>
                      <div className="text-sm font-semibold mb-2" style={{ color: 'var(--c-text-secondary)' }}>导入说明</div>
                      <ul className="text-sm space-y-1" style={{ color: 'var(--c-text-muted)' }}>
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
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                  <Package className="w-16 h-16 opacity-30" style={{ color: 'var(--c-text-muted)' }} />
                  <div className="text-center">
                    <div className="text-base font-medium mb-1" style={{ color: 'var(--c-text-secondary)' }}>请从左侧选择数据类型</div>
                    <div className="text-sm" style={{ color: 'var(--c-text-muted)' }}>选择后可导入 / 导出 / 下载模板</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== 发起补录 ===== */}
        {importTab === 'create' && (
          <div className="h-full overflow-y-auto">
            <div className="max-w-4xl mx-auto p-8">
              <div className="tech-panel p-6 space-y-6">

                {/* 补录类型 */}
                <div>
                  <label className="text-sm font-medium mb-3 block" style={{ color: 'var(--c-text-secondary)' }}>补录类型</label>
                  <div className="flex gap-3">
                    {(['create', 'update', 'delete'] as SupplementType[]).map(t => {
                      const cfg = { create: { color: '#00E676', label: '新增企业' }, update: { color: '#3B82F6', label: '更新数据' }, delete: { color: '#DC2626', label: '删除企业' } }[t];
                      return (
                        <button key={t} onClick={() => setSupplementType(t)}
                          className="flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all border"
                          style={supplementType === t
                            ? { backgroundColor: cfg.color + '15', borderColor: cfg.color + '50', color: cfg.color }
                            : { borderColor: 'var(--c-border)', color: 'var(--c-text-secondary)' }}>
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 选择企业 */}
                <div>
                  <label className="text-sm font-medium mb-3 block" style={{ color: 'var(--c-text-secondary)' }}>目标企业</label>
                  <select value={supplementFirmId} onChange={e => setSupplementFirmId(e.target.value)}
                    className="w-full p-3 rounded-lg text-sm outline-none appearance-none" style={{ backgroundColor: 'var(--c-bg)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }}>
                    <option value="">— 请选择企业 —</option>
                    {firmData.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>

                {/* 字段变更 */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium" style={{ color: 'var(--c-text-secondary)' }}>字段变更</label>
                    <button onClick={() => setSupplementChanges(prev => [...prev, { field: '', oldValue: null, newValue: null }])}
                      className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
                      style={{ color: '#00E676', border: '1px solid rgba(0,230,118,0.3)' }}>
                      <Plus className="w-4 h-4" /> 添加字段
                    </button>
                  </div>

                  {/* 表头 */}
                  <div className="grid grid-cols-[1fr_120px_40px_120px_40px] gap-2 mb-2 text-xs font-medium px-1" style={{ color: 'var(--c-text-muted)' }}>
                    <div>字段名</div>
                    <div>旧值</div>
                    <div className="text-center"></div>
                    <div>新值</div>
                    <div></div>
                  </div>

                  <div className="space-y-2">
                    {supplementChanges.map((change, idx) => (
                      <div key={idx} className="grid grid-cols-[1fr_120px_40px_120px_40px] gap-2 items-center">
                        <input value={change.field} onChange={e => {
                          const next = [...supplementChanges];
                          next[idx] = { ...next[idx], field: e.target.value };
                          setSupplementChanges(next);
                        }} placeholder="例如：评级、资产规模" className="p-3 rounded-lg text-sm outline-none" style={{ backgroundColor: 'var(--c-bg)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }} />
                        <input value={String(change.oldValue ?? '')} onChange={e => {
                          const next = [...supplementChanges];
                          next[idx] = { ...next[idx], oldValue: e.target.value || null };
                          setSupplementChanges(next);
                        }} placeholder="旧值" className="p-3 rounded-lg text-sm outline-none" style={{ backgroundColor: 'var(--c-bg)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }} />
                        <div className="text-center text-sm" style={{ color: 'var(--c-text-muted)' }}>→</div>
                        <input value={String(change.newValue ?? '')} onChange={e => {
                          const next = [...supplementChanges];
                          next[idx] = { ...next[idx], newValue: e.target.value || null };
                          setSupplementChanges(next);
                        }} placeholder="新值" className="p-3 rounded-lg text-sm outline-none" style={{ backgroundColor: 'var(--c-bg)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }} />
                        <button onClick={() => setSupplementChanges(prev => prev.filter((_, i) => i !== idx))}
                          className="p-2 rounded-lg hover:bg-red-500/10 transition-colors flex items-center justify-center">
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 提交按钮 */}
                <button onClick={handleSubmitSupplement}
                  className="w-full py-3 rounded-lg text-base font-bold text-white bg-yellow-500 hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2">
                  <PenLine className="w-5 h-5" /> 提交补录
                </button>

                {/* 提示信息 */}
                <div className="text-sm rounded-lg p-4" style={{ backgroundColor: 'rgba(245,158,11,0.06)', color: 'var(--c-text-muted)', border: '1px solid rgba(245,158,11,0.15)' }}>
                  <div className="font-medium mb-2" style={{ color: '#F59E0B' }}>补录说明</div>
                  <div>• 补录数据将直接生效并记录变更历史</div>
                  <div>• 提交后将自动推送至上级领导</div>
                  <div>• 支持新增 / 更新 / 删除三种补录类型</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== 补录历史 ===== */}
        {importTab === 'history' && (
          <div className="h-full overflow-y-auto">
            <div className="max-w-4xl mx-auto p-8 space-y-4">

              {/* 搜索过滤 */}
              <div className="flex items-center gap-3 tech-panel px-4 py-3" style={{ border: '1px solid var(--c-border)' }}>
                <Search className="w-5 h-5 shrink-0" style={{ color: 'var(--c-text-muted)' }} />
                <input value={supplementSearch} onChange={e => setSupplementSearch(e.target.value)} placeholder="搜索补录记录..."
                  className="flex-1 bg-transparent text-sm outline-none" style={{ color: 'var(--c-text)' }} />
                {supplementSearch && <button onClick={() => setSupplementSearch('')}><X className="w-5 h-5" style={{ color: 'var(--c-text-muted)' }} /></button>}
              </div>

              {/* 统计概览 */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: '总补录', value: mySupplements.length, hex: '#F59E0B' },
                  { label: '本月新增', value: mySupplements.filter(s => s.type === 'create').length, hex: '#00E676' },
                  { label: '本月更新', value: mySupplements.filter(s => s.type === 'update').length, hex: '#3B82F6' },
                ].map(s => (
                  <div key={s.label} className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--c-bg)' }}>
                    <div className="text-2xl font-bold font-mono" style={{ color: s.hex }}>{s.value}</div>
                    <div className="text-sm mt-1" style={{ color: 'var(--c-text-muted)' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {mySupplements.length === 0 ? (
                <div className="text-center py-16">
                  <PenLine className="w-16 h-16 mx-auto mb-4 opacity-20" style={{ color: 'var(--c-text-muted)' }} />
                  <div className="text-base" style={{ color: 'var(--c-text-muted)' }}>暂无补录记录</div>
                </div>
              ) : (
                mySupplements
                  .filter(s => !supplementSearch || (s.firmName && s.firmName.includes(supplementSearch)) || s.summary.includes(supplementSearch))
                  .map(s => {
                    const typeCfg = { create: { color: '#00E676', label: '新增', bg: 'rgba(0,230,118,0.06)' }, update: { color: '#3B82F6', label: '更新', bg: 'rgba(59,130,246,0.06)' }, delete: { color: '#DC2626', label: '删除', bg: 'rgba(220,38,38,0.06)' } }[s.type ?? 'update'];
                    return (
                      <div key={s.id} className="tech-panel p-5">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-sm px-3 py-1 rounded-lg font-medium" style={{ backgroundColor: typeCfg.bg, color: typeCfg.color }}>{typeCfg.label}</span>
                            <span className="text-base font-bold" style={{ color: 'var(--c-text)' }}>{s.firmName}</span>
                          </div>
                          <span className={`text-xs px-3 py-1 rounded-lg ${s.status === 'approved' ? 'bg-green-500/15 text-green-400' : 'bg-yellow-500/15 text-yellow-400'}`}>
                            {s.status === 'approved' ? '已生效' : '待审核'}
                          </span>
                        </div>
                        <div className="text-sm mb-2 leading-relaxed" style={{ color: 'var(--c-text-secondary)' }}>{s.summary}</div>
                        <div className="text-sm font-mono" style={{ color: 'var(--c-text-muted)' }}>{s.createdAt}</div>
                        {s.changes.length > 0 && (
                          <div className="mt-3 pt-3 space-y-2" style={{ borderTop: '1px solid var(--c-border)' }}>
                            {s.changes.map((c, ci) => (
                              <div key={ci} className="text-sm flex items-center gap-2">
                                <Edit3 className="w-4 h-4 shrink-0" style={{ color: '#F59E0B' }} />
                                <span style={{ color: '#F59E0B' }}>{c.field}</span>
                                <span style={{ color: 'var(--c-text-muted)' }}>{String(c.oldValue ?? '—')}</span>
                                <span>→</span>
                                <span style={{ color: '#00E676' }}>{String(c.newValue ?? '—')}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
