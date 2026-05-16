import React, { useState, useMemo } from 'react';
import {
  CheckCircle2, Circle, Clock, AlertTriangle, Search, Filter,
  Plus, ChevronRight, User, Building2, Calendar, MapPin,
  X, Send, FileText, Download, Upload, RotateCcw, Zap
} from 'lucide-react';
import { useAppStore } from '../store/data';
import { useToastStore } from '../store/toast';
import { importData, exportData, exportTemplate, exportToJson } from '../data/importer';
import { exportData as exportDataFn } from '../data/exporter';
import type { DataObjectType, WorkOrder, WorkOrderType, WorkOrderStatus } from '../data/types';
import { OBJECT_TYPE_META } from '../data/types';
import { FloatingRobot } from '../components/Robot/FloatingRobot';

type MainTab = 'todo' | 'all' | 'done' | 'assigned';
type SecondaryPanel = 'detail' | 'create' | 'import' | null;

export const TaskCenter: React.FC = () => {
  const workOrders = useAppStore(s => s.workOrders);
  const firms = useAppStore(s => s.firms);
  const parks = useAppStore(s => s.parks);
  const managers = useAppStore(s => s.managers);
  const opportunities = useAppStore(s => s.opportunities);
  const addToast = useToastStore(s => s.add);

  const [mainTab, setMainTab] = useState<MainTab>('todo');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [secondaryPanel, setSecondaryPanel] = useState<SecondaryPanel>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [importType, setImportType] = useState<DataObjectType>('firm');
  const [importFile, setImportFile] = useState<File | null>(null);

  const CURRENT_USER_ID = 'mgr002';

  const filteredOrders = useMemo(() => {
    let orders = [...workOrders];
    if (mainTab === 'todo') orders = orders.filter(w => w.ownerId === CURRENT_USER_ID && w.status !== '已完成');
    else if (mainTab === 'all') { /* no filter */ }
    else if (mainTab === 'done') orders = orders.filter(w => w.ownerId === CURRENT_USER_ID && w.status === '已完成');
    else if (mainTab === 'assigned') orders = orders.filter(w => w.creatorId === CURRENT_USER_ID);
    if (typeFilter) orders = orders.filter(w => w.type === typeFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      orders = orders.filter(w => w.title.toLowerCase().includes(q) || w.firmName?.toLowerCase().includes(q));
    }
    return orders.sort((a, b) => {
      const priorityOrder = { '排雷': 0, '关注': 1, '拓客': 2 };
      return (priorityOrder[a.type] || 2) - (priorityOrder[b.type] || 2);
    });
  }, [workOrders, mainTab, typeFilter, searchQuery, CURRENT_USER_ID]);

  const selectedOrder = workOrders.find(w => w.id === selectedTask);

  const handleImport = () => {
    if (!importFile) {
      addToast({ type: 'error', title: '请选择文件' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const fileType = importFile.name.endsWith('.json') ? 'json' : 'csv';
      const result = importData(importType, text, fileType, importFile.name, (data, log) => {
        useAppStore.getState().importData(importType, data as any[], log);
      });
      addToast({ type: result.success ? 'success' : 'error', title: result.message });
      if (result.success) {
        setShowImport(false);
        setImportFile(null);
      }
    };
    reader.readAsText(importFile);
  };

  const handleExportAll = () => {
    const state = useAppStore.getState();
    const allData: Record<string, unknown> = {
      provinces: state.provinces,
      cities: state.cities,
      districts: state.districts,
      industries: state.industries,
      parks: state.parks,
      firms: state.firms,
      managers: state.managers,
      workOrders: state.workOrders,
      opportunities: state.opportunities,
    };
    exportToJson(allData, `battlemap_all_${Date.now()}.json`);
    addToast({ type: 'success', title: '全量数据已导出' });
  };

  return (
    <div className="h-full flex flex-col bg-[var(--c-bg)]">
      <div className="h-14 px-6 flex items-center justify-between border-b border-[var(--c-border)] shrink-0 bg-[var(--c-bg-elevated)]">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-[var(--c-accent)]" />
          <h1 className="text-lg font-bold tech-title">个人工作台</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowImport(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--c-surface)] text-xs text-[var(--c-text-secondary)] hover:bg-[var(--c-accent)]/10 hover:text-[var(--c-accent)] transition-colors">
            <Upload className="w-3.5 h-3.5" />数据补录
          </button>
          <button onClick={handleExportAll} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--c-surface)] text-xs text-[var(--c-text-secondary)] hover:bg-[var(--c-accent)]/10 hover:text-[var(--c-accent)] transition-colors">
            <Download className="w-3.5 h-3.5" />导出全量
          </button>
          <button onClick={() => { setSelectedTask(null); setSecondaryPanel('create'); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--c-accent)] text-xs text-white hover:bg-[var(--c-accent)]/90 transition-colors">
            <Plus className="w-3.5 h-3.5" />新建工单
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 py-3 border-b border-[var(--c-border)] flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-1 bg-[var(--c-surface)] rounded-lg p-1">
              {[
                { key: 'todo' as MainTab, label: '我的待办', count: workOrders.filter(w => w.ownerId === CURRENT_USER_ID && w.status !== '已完成').length },
                { key: 'all' as MainTab, label: '全部任务', count: workOrders.length },
                { key: 'done' as MainTab, label: '我的已办', count: workOrders.filter(w => w.ownerId === CURRENT_USER_ID && w.status === '已完成').length },
                { key: 'assigned' as MainTab, label: '我的分配', count: workOrders.filter(w => w.creatorId === CURRENT_USER_ID).length },
              ].map(tab => (
                <button key={tab.key} onClick={() => setMainTab(tab.key)} className={`px-3 py-1.5 rounded text-xs transition-colors ${mainTab === tab.key ? 'bg-[var(--c-accent)] text-white' : 'text-[var(--c-text-secondary)] hover:text-[var(--c-text)]'}`}>
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--c-text-muted)]" />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="搜索工单..." className="w-48 pl-8 pr-3 py-1.5 bg-[var(--c-surface)] border border-[var(--c-border)] rounded-lg text-xs text-[var(--c-text)] placeholder:text-[var(--c-text-muted)] focus:outline-none focus:border-[var(--c-accent)]" />
            </div>
            <div className="flex items-center gap-1">
              {['排雷', '关注', '拓客'].map(type => (
                <button key={type} onClick={() => setTypeFilter(typeFilter === type ? null : type)} className={`px-2 py-1 rounded text-[10px] transition-colors ${typeFilter === type ? (type === '排雷' ? 'badge-red' : type === '关注' ? 'badge-yellow' : 'badge-green') : 'bg-[var(--c-surface)] text-[var(--c-text-muted)]'}`}>
                  {type}
                </button>
              ))}
              {typeFilter && <button onClick={() => setTypeFilter(null)} className="text-[10px] text-[var(--c-text-muted)] hover:text-[var(--c-text)] ml-1">清除</button>}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
            <div className="space-y-2">
              {filteredOrders.map(order => (
                <button
                  key={order.id}
                  onClick={() => { setSelectedTask(order.id); setSecondaryPanel('detail'); }}
                  className={`w-full p-4 rounded-lg text-left transition-colors ${selectedTask === order.id ? 'tech-panel border-[var(--c-accent)]/50' : 'bg-[var(--c-surface)] hover:bg-[var(--c-accent)]/5 border border-transparent'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 ${order.type === '排雷' ? 'text-[var(--c-red)]' : order.type === '关注' ? 'text-[var(--c-yellow)]' : 'text-[var(--c-green)]'}`}>
                        {order.status === '已完成' ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${order.type === '排雷' ? 'badge-red' : order.type === '关注' ? 'badge-yellow' : 'badge-green'}`}>{order.type}</span>
                          <span className="text-xs text-[var(--c-text-muted)]">{order.id}</span>
                        </div>
                        <div className="text-sm font-medium text-[var(--c-text)] mb-1">{order.title}</div>
                        <div className="flex items-center gap-3 text-[10px] text-[var(--c-text-muted)]">
                          {order.firmName && <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{order.firmName}</span>}
                          {order.parkName && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{order.parkName}</span>}
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{order.deadline}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <div className={`text-xs font-medium ${order.status === '已完成' ? 'text-[var(--c-green)]' : order.status === '进行中' ? 'text-[var(--c-yellow)]' : 'text-[var(--c-text-secondary)]'}`}>{order.status}</div>
                      <div className="text-[9px] text-[var(--c-text-muted)] mt-1">执行人: {order.ownerName}</div>
                    </div>
                  </div>
                </button>
              ))}
              {filteredOrders.length === 0 && (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-10 h-10 text-[var(--c-text-muted)] mx-auto mb-3" />
                  <div className="text-sm text-[var(--c-text-secondary)]">暂无工单</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {secondaryPanel === 'detail' && selectedOrder && (
          <div className="w-96 border-l border-[var(--c-border)] overflow-y-auto p-6 scrollbar-thin shrink-0 bg-[var(--c-bg-elevated)]">
            <div className="flex items-center justify-between mb-4">
              <span className={`text-[10px] px-2 py-1 rounded ${selectedOrder.type === '排雷' ? 'badge-red' : selectedOrder.type === '关注' ? 'badge-yellow' : 'badge-green'}`}>{selectedOrder.type}</span>
              <button onClick={() => setSecondaryPanel(null)} className="text-[var(--c-text-muted)] hover:text-[var(--c-text)]"><X className="w-4 h-4" /></button>
            </div>
            <h3 className="text-lg font-bold text-[var(--c-text)] mb-2">{selectedOrder.title}</h3>
            <div className="text-xs text-[var(--c-text-muted)] mb-4">{selectedOrder.id}</div>
            {selectedOrder.desc && <p className="text-sm text-[var(--c-text-secondary)] mb-4">{selectedOrder.desc}</p>}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between text-xs"><span className="text-[var(--c-text-muted)]">状态</span><span className="text-[var(--c-text)]">{selectedOrder.status}</span></div>
              <div className="flex items-center justify-between text-xs"><span className="text-[var(--c-text-muted)]">执行人</span><span className="text-[var(--c-text)]">{selectedOrder.ownerName}</span></div>
              <div className="flex items-center justify-between text-xs"><span className="text-[var(--c-text-muted)]">创建人</span><span className="text-[var(--c-text)]">{selectedOrder.creatorName}</span></div>
              <div className="flex items-center justify-between text-xs"><span className="text-[var(--c-text-muted)]">截止日期</span><span className="text-[var(--c-text)]">{selectedOrder.deadline}</span></div>
            </div>
            {selectedOrder.status !== '已完成' && (
              <button onClick={() => {
                useAppStore.getState().updateWorkOrder(selectedOrder.id, { status: '已完成', completedAt: new Date().toISOString() });
                addToast({ type: 'success', title: '工单已标记完成' });
              }} className="w-full py-2 rounded-lg bg-[var(--c-green)] text-white text-sm font-medium hover:bg-[var(--c-green)]/90 transition-colors">
                标记完成
              </button>
            )}
          </div>
        )}

        {secondaryPanel === 'create' && (
          <div className="w-96 border-l border-[var(--c-border)] p-6 shrink-0 bg-[var(--c-bg-elevated)] overflow-y-auto scrollbar-thin">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[var(--c-text)]">新建工单</h3>
              <button onClick={() => setSecondaryPanel(null)} className="text-[var(--c-text-muted)] hover:text-[var(--c-text)]"><X className="w-4 h-4" /></button>
            </div>
            <CreateOrderForm onClose={() => setSecondaryPanel(null)} />
          </div>
        )}
      </div>

      {showImport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowImport(false)}>
          <div className="tech-panel p-6 w-[600px] max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[var(--c-text)]">数据补录</h3>
              <button onClick={() => setShowImport(false)} className="text-[var(--c-text-muted)] hover:text-[var(--c-text)]"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[var(--c-text-secondary)] mb-2 block">选择数据类型</label>
                <div className="grid grid-cols-4 gap-2">
                  {OBJECT_TYPE_META.filter(m => ['firm', 'park', 'work_order', 'opportunity', 'manager'].includes(m.type)).map(m => (
                    <button key={m.type} onClick={() => setImportType(m.type)} className={`p-2 rounded-lg text-[10px] transition-colors ${importType === m.type ? 'badge-blue' : 'bg-[var(--c-surface)] text-[var(--c-text-secondary)] hover:bg-[var(--c-accent)]/10'}`}>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-[var(--c-text-secondary)] mb-2 block">上传文件 (CSV/JSON)</label>
                <div className="border-2 border-dashed border-[var(--c-border)] rounded-lg p-6 text-center hover:border-[var(--c-accent)] transition-colors cursor-pointer" onClick={() => document.getElementById('importFileInput')?.click()}>
                  <Upload className="w-8 h-8 text-[var(--c-text-muted)] mx-auto mb-2" />
                  <div className="text-xs text-[var(--c-text-secondary)]">{importFile ? importFile.name : '点击选择文件或拖放到此处'}</div>
                  <input id="importFileInput" type="file" accept=".csv,.json" className="hidden" onChange={e => setImportFile(e.target.files?.[0] || null)} />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => exportTemplate(importType, 'json')} className="flex-1 py-2 rounded-lg bg-[var(--c-surface)] text-xs text-[var(--c-text-secondary)] hover:bg-[var(--c-accent)]/10 transition-colors">JSON模板</button>
                <button onClick={() => exportTemplate(importType, 'csv')} className="flex-1 py-2 rounded-lg bg-[var(--c-surface)] text-xs text-[var(--c-text-secondary)] hover:bg-[var(--c-accent)]/10 transition-colors">CSV模板</button>
                <button onClick={handleImport} className="flex-1 py-2 rounded-lg bg-[var(--c-accent)] text-xs text-white hover:bg-[var(--c-accent)]/90 transition-colors">导入数据</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <FloatingRobot />
    </div>
  );
};

const CreateOrderForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const firms = useAppStore(s => s.firms);
  const managers = useAppStore(s => s.managers);
  const addToast = useToastStore(s => s.add);
  const [form, setForm] = useState({
    type: '拓客' as WorkOrderType,
    title: '',
    firmId: '',
    ownerId: managers[0]?.id || '',
    deadline: '',
    desc: '',
  });

  const handleSubmit = () => {
    if (!form.title || !form.firmId) {
      addToast({ type: 'error', title: '请填写必填项' });
      return;
    }
    const firm = firms.find(f => f.id === form.firmId);
    const owner = managers.find(m => m.id === form.ownerId);
    const newOrder: WorkOrder = {
      id: `WO-2026-${String(Date.now()).slice(-4)}`,
      type: form.type,
      level: form.type === '排雷' ? 'red' : form.type === '关注' ? 'yellow' : 'green',
      title: form.title,
      desc: form.desc,
      firmId: form.firmId,
      firmName: firm?.name,
      parkId: firm?.parkIds?.[0],
      parkName: firm?.parkIds?.[0] ? useAppStore.getState().parks.find(p => p.id === firm?.parkIds?.[0])?.name : undefined,
      ownerId: form.ownerId,
      ownerName: owner?.name,
      creatorId: 'mgr002',
      creatorName: '李娜',
      deadline: form.deadline || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      status: '待闭环',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    useAppStore.getState().addWorkOrder(newOrder);
    addToast({ type: 'success', title: '工单创建成功' });
    onClose();
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-[var(--c-text-secondary)] mb-1 block">工单类型 *</label>
        <div className="flex gap-2">
          {(['排雷', '关注', '拓客'] as WorkOrderType[]).map(t => (
            <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))} className={`flex-1 py-2 rounded-lg text-xs transition-colors ${form.type === t ? (t === '排雷' ? 'badge-red' : t === '关注' ? 'badge-yellow' : 'badge-green') : 'bg-[var(--c-surface)] text-[var(--c-text-secondary)]'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs text-[var(--c-text-secondary)] mb-1 block">工单标题 *</label>
        <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 bg-[var(--c-surface)] border border-[var(--c-border)] rounded-lg text-xs text-[var(--c-text)] focus:outline-none focus:border-[var(--c-accent)]" placeholder="输入工单标题" />
      </div>
      <div>
        <label className="text-xs text-[var(--c-text-secondary)] mb-1 block">目标企业 *</label>
        <select value={form.firmId} onChange={e => setForm(f => ({ ...f, firmId: e.target.value }))} className="w-full px-3 py-2 bg-[var(--c-surface)] border border-[var(--c-border)] rounded-lg text-xs text-[var(--c-text)] focus:outline-none focus:border-[var(--c-accent)]">
          <option value="">选择企业</option>
          {firms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs text-[var(--c-text-secondary)] mb-1 block">执行人</label>
        <select value={form.ownerId} onChange={e => setForm(f => ({ ...f, ownerId: e.target.value }))} className="w-full px-3 py-2 bg-[var(--c-surface)] border border-[var(--c-border)] rounded-lg text-xs text-[var(--c-text)] focus:outline-none focus:border-[var(--c-accent)]">
          {managers.map(m => <option key={m.id} value={m.id}>{m.name} ({m.role})</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs text-[var(--c-text-secondary)] mb-1 block">截止日期</label>
        <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} className="w-full px-3 py-2 bg-[var(--c-surface)] border border-[var(--c-border)] rounded-lg text-xs text-[var(--c-text)] focus:outline-none focus:border-[var(--c-accent)]" />
      </div>
      <div>
        <label className="text-xs text-[var(--c-text-secondary)] mb-1 block">说明</label>
        <textarea value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} rows={3} className="w-full px-3 py-2 bg-[var(--c-surface)] border border-[var(--c-border)] rounded-lg text-xs text-[var(--c-text)] focus:outline-none focus:border-[var(--c-accent)] resize-none" placeholder="输入说明" />
      </div>
      <button onClick={handleSubmit} className="w-full py-2 rounded-lg bg-[var(--c-accent)] text-white text-sm font-medium hover:bg-[var(--c-accent)]/90 transition-colors">创建工单</button>
    </div>
  );
};

export default TaskCenter;
