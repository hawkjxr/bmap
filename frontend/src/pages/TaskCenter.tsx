import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as echarts from 'echarts';
import { ClipboardList, MapPin, Camera, AlertTriangle, CheckCircle, Clock, ArrowRight, MessageSquare, Send, UserPlus, ChevronDown, Lightbulb, Search, ExternalLink, ListChecks, CheckCheck, Share2, Inbox, Filter, PenLine, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChartTheme } from '../hooks/useChartTheme';
import { useToast } from '../store/toast';
import { useDataStore } from '../store/data';
import { FloatingRobot } from '../components/Robot/FloatingRobot';
import { workspaceRobotConfig } from '../data/robotData';
import type { WorkOrder } from '../data/types';
import { memberIdToName } from '../data/mockData';

const CURRENT_USER_ID = 'member_002';  // 李明的ID

type MainTab = 'todo' | 'all' | 'done' | 'assigned';
type SecondaryPanel = 'detail' | 'dispatch' | 'opportunity' | 'search' | null;

const typeConfig: Record<string, { bg: string; border: string; label: string; labelHex: string }> = {
  red: { bg: 'rgba(127,29,29,0.15)', border: 'rgba(239,68,68,0.3)', label: '排雷', labelHex: '#DC2626' },
  yellow: { bg: 'rgba(113,63,18,0.1)', border: 'rgba(234,179,8,0.3)', label: '关注', labelHex: '#B45309' },
  green: { bg: 'rgba(4,120,87,0.08)', border: 'rgba(34,197,94,0.3)', label: '拓客', labelHex: '#15803D' },
};

const typeIcon: Record<string, string> = { '系统预警': '🔴', '自动操作': '⚙️', '电话跟进': '📞', '商机发现': '💡', '方案发送': '📄', '数据核查': '🔍', '现场拜访': '📍', '方案提交': '📋', '审批通过': '✅', '已放款': '💰', '关注预警': '⚠️' };

const statusIcon = (s: string) => {
  if (s === '已完成') return <CheckCircle className="w-3.5 h-3.5" style={{ color: '#15803D' }} />;
  if (s === '进行中') return <Clock className="w-3.5 h-3.5" style={{ color: '#B45309' }} />;
  return <AlertTriangle className="w-3.5 h-3.5" style={{ color: '#DC2626' }} />;
};

const FunnelChart: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const tc = useChartTheme();
  useEffect(() => {
    if (!ref.current) return;
    const chart = echarts.init(ref.current);
    chart.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item', backgroundColor: tc.tooltipBg, borderColor: tc.tooltipBorder, textStyle: { color: tc.textWhite } },
      series: [{
        type: 'funnel', left: '15%', top: 10, bottom: 10, width: '70%', min: 0, max: 100,
        gap: 4, label: { show: true, position: 'inside', color: tc.textWhite, fontSize: 11 },
        itemStyle: { borderWidth: 0 },
        data: [
          { value: 100, name: '线索池 (86)', itemStyle: { color: '#3B82F6' } },
          { value: 75, name: '拜访中 (42)', itemStyle: { color: '#06B6D4' } },
          { value: 50, name: '方案阶段 (18)', itemStyle: { color: '#00E676' } },
          { value: 30, name: '审批中 (8)', itemStyle: { color: '#FAAD14' } },
          { value: 15, name: '已放款 (5)', itemStyle: { color: '#A78BFA' } },
        ],
      }],
    });
    const h = () => chart.resize();
    window.addEventListener('resize', h);
    return () => { window.removeEventListener('resize', h); chart.dispose(); };
  }, [tc]);
  return <div ref={ref} style={{ width: '100%', height: 200 }} />;
};

// ─── 主组件 ─────────────────────────────────────────────────

const TaskCard: React.FC<{ task: WorkOrder; onClick: () => void; showCreator?: boolean }> = ({ task, onClick, showCreator }) => {
  const navigate = useNavigate();
  const cfg = typeConfig[task.type];
  return (
    <div onClick={onClick} className="p-4 rounded-lg transition-all hover:translate-x-1 cursor-pointer" style={{ backgroundColor: cfg.bg, border: `1px solid ${cfg.border}` }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className="text-[10px] px-2 py-0.5 rounded font-bold" style={{ backgroundColor: cfg.bg, color: cfg.labelHex }}>{cfg.label}</span>
          <span className="text-sm font-bold" style={{ color: 'var(--c-text)' }}>{task.title}</span>
          <span className="text-[10px] font-mono" style={{ color: 'var(--c-text-muted)' }}>{task.id}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {statusIcon(task.status)}
          <span style={{ color: 'var(--c-text-secondary)' }}>{task.status}</span>
          <ArrowRight className="w-3 h-3 ml-1" style={{ color: 'var(--c-text-muted)' }} />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs cursor-pointer hover:text-blue-400 hover:underline transition-colors" style={{ color: 'var(--c-text-secondary)' }} onClick={e => { e.stopPropagation(); navigate('/customer'); }}>{task.customer}</div>
          <div className="text-[11px] mt-0.5" style={{ color: 'var(--c-text-muted)' }}>{task.desc}</div>
        </div>
        <div className="text-right text-[10px] space-y-1">
          <div style={{ color: 'var(--c-text-muted)' }}>{showCreator ? '创建人' : '执行人'}: <span style={{ color: 'var(--c-text-secondary)' }}>{showCreator ? task.creator : task.owner}</span></div>
          <div style={{ color: 'var(--c-text-muted)' }}>限期: <span className="font-bold" style={{ color: task.type === 'red' ? '#DC2626' : 'var(--c-text-secondary)' }}>{task.deadline}</span></div>
        </div>
      </div>
      {task.lbs && (
        <div className="mt-2 pt-2 flex items-center gap-4 text-[10px]" style={{ borderTop: `1px solid ${cfg.border}` }}>
          <span className="flex items-center gap-1" style={{ color: '#DC2626' }}><MapPin className="w-3 h-3" /> 需LBS强制打卡</span>
          <span className="flex items-center gap-1" style={{ color: '#DC2626' }}><Camera className="w-3 h-3" /> 需现场拍照上传</span>
          <span className="ml-auto text-red-300 font-bold">24h 强制闭环</span>
        </div>
      )}
    </div>
  );
};

export const TaskCenter: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const followRecords = useDataStore(s => s.followRecords);
  const teamMembers = useDataStore(s => s.teamMembers);
  const tasks = useDataStore(s => s.workOrders);
  const opportunities = useDataStore(s => s.opportunities);
  const customerSearchItems = useDataStore(s => s.customerSearchItems);

  // 状态定义
  const [mainTab, setMainTab] = useState<MainTab>('todo');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [secondaryPanel, setSecondaryPanel] = useState<SecondaryPanel>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const myTodo = useMemo(() => tasks.filter(t => t.owner === CURRENT_USER_ID && t.status !== '已完成'), [tasks]);
  const allTasks = useMemo(() => tasks, [tasks]);
  const myDone = useMemo(() => tasks.filter(t => t.owner === CURRENT_USER_ID && t.status === '已完成'), [tasks]);
  const myAssigned = useMemo(() => tasks.filter(t => t.creator === CURRENT_USER_ID), [tasks]);

  const currentList = useMemo(() => {
    let list: WorkOrder[];
    switch (mainTab) {
      case 'todo': list = myTodo; break;
      case 'all': list = allTasks; break;
      case 'done': list = myDone; break;
      case 'assigned': list = myAssigned; break;
    }
    if (typeFilter) list = list.filter(t => t.type === typeFilter);
    return list;
  }, [mainTab, myTodo, allTasks, myDone, myAssigned, typeFilter]);

  const selectedTaskData = tasks.find(t => t.id === selectedTask);
  const selectedRecords = selectedTaskData?.firmId ? followRecords[selectedTaskData.firmId] || [] : [];

  const tabCounts = useMemo(() => ({
    todo: myTodo.length,
    all: allTasks.length,
    done: myDone.length,
    assigned: myAssigned.length,
  }), [myTodo, allTasks, myDone, myAssigned]);

  const typeCounts = useMemo(() => ({
    all: currentList.length,
    red: currentList.filter(t => t.type === 'red').length,
    yellow: currentList.filter(t => t.type === 'yellow').length,
    green: currentList.filter(t => t.type === 'green').length,
  }), [currentList]);

  const handleTaskClick = (taskId: string) => {
    setSelectedTask(taskId);
    setSecondaryPanel('detail');
  };

  const mainTabs: { key: MainTab; label: string; icon: React.ElementType; color: string }[] = [
    { key: 'todo', label: '我的待办', icon: Inbox, color: '#F97316' },
    { key: 'all', label: '全部任务', icon: ListChecks, color: '#3B82F6' },
    { key: 'done', label: '我的已办', icon: CheckCheck, color: '#00E676' },
    { key: 'assigned', label: '我的分配', icon: Share2, color: '#A78BFA' },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="shrink-0 px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-dark-border)' }}>
        <div className="flex items-center gap-3">
          <ClipboardList className="w-5 h-5" style={{ color: '#2563EB' }} />
          <h2 className="text-lg font-bold">个人工作台</h2>
          <span className="text-[10px] px-2 py-0.5 rounded-md" style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: '#3B82F6' }}>{memberIdToName[CURRENT_USER_ID] || CURRENT_USER_ID}</span>
          {/* 内联机器人助手（与顶部卡片对齐） */}
          <FloatingRobot config={workspaceRobotConfig} mode="inline" inlineHeight={40} showLabel={false} />
        </div>
        <div className="flex items-center gap-2">
          {/* 辅助功能入口 */}
          {([
            ['dispatch', '任务分发', Send, '#2563EB'],
            ['opportunity', '商机发现', Lightbulb, '#00E676'],
            ['search', '客户检索', Search, '#A78BFA'],
            ['supplement', '数据补录', PenLine, '#F59E0B'],
          ] as const).map(([key, label, Icon, color]) => (
            <button key={key} onClick={() => {
              if (key === 'supplement') {
                navigate('/supplement');
              } else {
                setSecondaryPanel(secondaryPanel === key ? null : key);
              }
            }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${secondaryPanel === key || key === 'supplement' ? 'text-white' : 'hover:bg-white/5'}`}
              style={secondaryPanel === key ? { backgroundColor: color } : { border: '1px solid var(--c-border)', color: 'var(--c-text-secondary)' }}>
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* 主 Tab 导航 */}
      <div className="shrink-0 px-6 py-2 flex items-center gap-1" style={{ borderBottom: '1px solid var(--color-dark-border)' }}>
        {mainTabs.map(tab => {
          const Icon = tab.icon;
          const active = mainTab === tab.key;
          return (
            <button key={tab.key} onClick={() => { setMainTab(tab.key); setTypeFilter(null); setSelectedTask(null); setSecondaryPanel(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${active ? 'text-white' : 'hover:bg-white/5'}`}
              style={active ? { backgroundColor: tab.color + '20', color: tab.color, boxShadow: `inset 0 -2px 0 ${tab.color}` } : { color: 'var(--c-text-secondary)' }}>
              <Icon className="w-4 h-4" />
              {tab.label}
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md" style={{ backgroundColor: active ? tab.color + '20' : 'var(--c-bg)', color: active ? tab.color : 'var(--c-text-muted)' }}>
                {tabCounts[tab.key]}
              </span>
            </button>
          );
        })}
        <div className="mx-3 w-px h-5" style={{ backgroundColor: 'var(--c-border)' }} />
        {/* 类型过滤 */}
        <div className="flex items-center gap-1 text-[10px]">
          <Filter className="w-3 h-3 mr-1" style={{ color: 'var(--c-text-muted)' }} />
          <button onClick={() => setTypeFilter(null)} className={`px-2 py-1 rounded transition-colors ${!typeFilter ? 'bg-blue-600 text-white' : 'hover:bg-white/5'}`} style={typeFilter ? { color: 'var(--c-text-secondary)' } : {}}>
            全部 ({typeCounts.all})
          </button>
          {[['red', '排雷', typeCounts.red], ['yellow', '关注', typeCounts.yellow], ['green', '拓客', typeCounts.green]].map(([key, label, cnt]) => (
            <button key={key as string} onClick={() => setTypeFilter(typeFilter === key ? null : key as string)}
              className={`px-2 py-1 rounded transition-colors ${typeFilter === key ? 'text-white' : 'hover:bg-white/5'}`}
              style={typeFilter === key ? { backgroundColor: typeConfig[key as string].labelHex } : { color: typeConfig[key as string].labelHex }}>
              {label as string} ({cnt as number})
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* 主列表 */}
        <div className="flex-1 p-6 overflow-y-auto">
          {currentList.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center" style={{ color: 'var(--c-text-muted)' }}>
                <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <div className="text-sm">{mainTab === 'todo' ? '暂无待办任务' : mainTab === 'done' ? '暂无已办任务' : '暂无任务'}</div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {currentList.map(task => (
                <TaskCard key={task.id} task={task} onClick={() => handleTaskClick(task.id)} showCreator={mainTab === 'assigned'} />
              ))}
            </div>
          )}
        </div>

        {/* 右侧面板 */}
        <div className="w-[320px] shrink-0 flex flex-col overflow-y-auto" style={{ borderLeft: '1px solid var(--color-dark-border)' }}>
          {/* === 跟进详情 === */}
          {secondaryPanel === 'detail' && selectedTaskData ? (
            <div className="p-4 flex flex-col flex-1">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-bold" style={{ color: typeConfig[selectedTaskData.type].labelHex }}>{typeConfig[selectedTaskData.type].label}</span>
                  <h3 className="text-sm font-bold" style={{ color: 'var(--c-text)' }}>{selectedTaskData.title}</h3>
                </div>
                <div className="text-[10px] space-y-0.5" style={{ color: 'var(--c-text-muted)' }}>
                  <div><span className="cursor-pointer hover:text-blue-400 hover:underline" onClick={() => navigate('/customer')}>{selectedTaskData.customer}</span></div>
                  <div>执行人: <b style={{ color: 'var(--c-text-secondary)' }}>{memberIdToName[selectedTaskData.ownerId ?? ''] || selectedTaskData.ownerId}</b> · 创建人: <b style={{ color: 'var(--c-text-secondary)' }}>{memberIdToName[selectedTaskData.creatorId ?? ''] || selectedTaskData.creatorId}</b></div>
                  <div>限期: <b style={{ color: selectedTaskData.type === 'red' ? '#DC2626' : 'var(--c-text-secondary)' }}>{selectedTaskData.deadline}</b></div>
                </div>
              </div>
              <div className="text-[10px] font-bold mb-2 flex items-center gap-1.5" style={{ color: 'var(--c-text-secondary)' }}>
                <MessageSquare className="w-3.5 h-3.5" style={{ color: '#2563EB' }} /> 跟进时间线 ({selectedRecords.length})
              </div>
              <div className="flex-1 overflow-y-auto">
                {selectedRecords.length === 0 ? (
                  <div className="text-center py-8 text-[10px]" style={{ color: 'var(--c-text-muted)' }}>暂无跟进记录</div>
                ) : (
                  <div className="relative pl-5">
                    <div className="absolute left-[7px] top-2 bottom-2 w-px" style={{ backgroundColor: 'var(--c-border)' }} />
                    {selectedRecords.map((r, i) => (
                      <div key={i} className="relative mb-3">
                        <div className="absolute -left-5 top-1 w-[14px] h-[14px] rounded-full flex items-center justify-center text-[8px]" style={{ backgroundColor: 'var(--c-surface)', border: '2px solid var(--c-border)' }}>
                          {typeIcon[r.type] || '📝'}
                        </div>
                        <div className="tech-panel p-2.5">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold" style={{ color: 'var(--c-text)' }}>{r.user}</span>
                              <span className="text-[8px] px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--c-accent-glow, rgba(59,130,246,0.1))', color: 'var(--c-accent)' }}>{r.type}</span>
                            </div>
                            <span className="text-[9px] font-mono" style={{ color: 'var(--c-text-muted)' }}>{r.date}</span>
                          </div>
                          <p className="text-[10px] leading-relaxed" style={{ color: 'var(--c-text-secondary)' }}>{r.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-3 tech-panel p-2 flex items-center gap-2">
                <input type="text" placeholder="添加跟进..." className="flex-1 bg-transparent text-[10px] outline-none" style={{ color: 'var(--c-text)' }} />
                <button onClick={() => toast.show('跟进记录已添加')} className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 rounded text-[10px] text-white hover:bg-blue-500 transition-colors">
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </div>
          ) : secondaryPanel === 'dispatch' ? (
            /* === 任务分发 === */
            <div className="p-4 flex flex-col flex-1 overflow-y-auto">
              <h3 className="text-xs font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--c-text)' }}>
                <Send className="w-4 h-4" style={{ color: '#2563EB' }} /> 新建任务分发
              </h3>
              <div className="space-y-2.5 flex-1">
                {[
                  { label: '任务类型', options: ['拓客工单', '排雷工单', '关注预警', '尽调任务', '回访任务'] },
                  { label: '目标客户', options: ['企业B · 武进锂电设备', '企业F · 成都高新', '企业H · 合肥经开', '企业G · 武汉东湖'] },
                ].map(field => (
                  <div key={field.label}>
                    <label className="text-[9px] mb-1 block" style={{ color: 'var(--c-text-muted)' }}>{field.label}</label>
                    <div className="relative">
                      <select className="w-full p-1.5 rounded text-[10px] outline-none appearance-none" style={{ backgroundColor: 'var(--c-bg)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }}>
                        {field.options.map(o => <option key={o}>{o}</option>)}
                      </select>
                      <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3" style={{ color: 'var(--c-text-muted)' }} />
                    </div>
                  </div>
                ))}
                <div>
                  <label className="text-[9px] mb-1 block" style={{ color: 'var(--c-text-muted)' }}>指派执行人</label>
                  <div className="relative">
                    <select className="w-full p-1.5 rounded text-[10px] outline-none appearance-none" style={{ backgroundColor: 'var(--c-bg)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }}>
                      {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name} · {m.role}</option>)}
                    </select>
                    <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3" style={{ color: 'var(--c-text-muted)' }} />
                  </div>
                </div>
                <div>
                  <label className="text-[9px] mb-1 block" style={{ color: 'var(--c-text-muted)' }}>完成期限</label>
                  <input type="date" defaultValue="2026-04-10" className="w-full p-1.5 rounded text-[10px] outline-none" style={{ backgroundColor: 'var(--c-bg)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }} />
                </div>
                <div>
                  <label className="text-[9px] mb-1 block" style={{ color: 'var(--c-text-muted)' }}>任务说明</label>
                  <textarea rows={3} placeholder="输入任务详情..." className="w-full p-1.5 rounded text-[10px] outline-none resize-none" style={{ backgroundColor: 'var(--c-bg)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }} />
                </div>
                <div className="flex gap-3 text-[9px]">
                  {['需LBS打卡', '需拍照上传', '强制24h闭环'].map(opt => (
                    <label key={opt} className="flex items-center gap-1 cursor-pointer" style={{ color: 'var(--c-text-secondary)' }}>
                      <input type="checkbox" className="rounded" /> {opt}
                    </label>
                  ))}
                </div>
                <button onClick={() => { toast.show('工单已下发，已推送至执行人'); setSecondaryPanel(null); setMainTab('assigned'); }}
                  className="w-full py-2 bg-blue-600 rounded-lg text-xs font-bold text-white hover:bg-blue-500 transition-colors flex items-center justify-center gap-2">
                  <Send className="w-3.5 h-3.5" /> 立即下发
                </button>
              </div>
              {/* 团队负载 */}
              <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--color-dark-border)' }}>
                <div className="text-[10px] font-bold mb-2 flex items-center gap-1.5" style={{ color: 'var(--c-text-muted)' }}>
                  <UserPlus className="w-3.5 h-3.5" style={{ color: '#15803D' }} /> 团队负载
                </div>
                {teamMembers.map(m => (
                  <div key={m.name} className="flex items-center gap-2 py-1.5">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0" style={{ backgroundColor: (m.load ?? 0) >= 5 ? '#EF4444' : (m.load ?? 0) >= 3 ? '#F59E0B' : '#10B981' }}>{m.name[0]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-[10px]">
                        <span style={{ color: 'var(--c-text)' }}>{m.name}</span>
                        <span className="font-mono" style={{ color: (m.load ?? 0) >= 5 ? '#EF4444' : (m.load ?? 0) >= 3 ? '#F59E0B' : '#10B981' }}>{m.load}件</span>
                      </div>
                      <div className="w-full h-1 rounded-full overflow-hidden mt-0.5" style={{ backgroundColor: 'var(--c-bg)' }}>
                        <div className="h-full rounded-full" style={{ width: `${((m.load ?? 0) / 6) * 100}%`, backgroundColor: (m.load ?? 0) >= 5 ? '#EF4444' : (m.load ?? 0) >= 3 ? '#F59E0B' : '#10B981' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : secondaryPanel === 'opportunity' ? (
            /* === 商机发现 === */
            <div className="p-4 flex flex-col flex-1 overflow-y-auto">
              <h3 className="text-xs font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--c-text)' }}>
                <Lightbulb className="w-4 h-4" style={{ color: '#00E676' }} /> 商机发现 ({opportunities.length})
              </h3>
              <div className="space-y-2.5">
                {opportunities.map((opp, i) => {
                  const lcfg = opp.level === 'high' ? { color: '#00E676', bg: 'rgba(0,230,118,0.06)', label: '高价值' }
                    : opp.level === 'medium' ? { color: '#3B82F6', bg: 'rgba(59,130,246,0.06)', label: '中价值' }
                    : { color: '#FAAD14', bg: 'rgba(250,173,20,0.06)', label: '待培育' };
                  return (
                    <div key={i} className="tech-panel p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <Lightbulb className="w-3 h-3" style={{ color: lcfg.color }} />
                          <span className="text-[11px] font-bold" style={{ color: 'var(--c-text)' }}>{opp.title}</span>
                        </div>
                        <span className="text-[8px] px-1 py-0.5 rounded font-bold" style={{ backgroundColor: lcfg.bg, color: lcfg.color }}>{lcfg.label} {opp.score}分</span>
                      </div>
                      <p className="text-[10px] mb-2 leading-relaxed" style={{ color: 'var(--c-text-secondary)' }}>{opp.desc}</p>
                      <div className="flex items-center justify-between text-[9px]">
                        <span style={{ color: 'var(--c-text-muted)' }}>{opp.action} · {opp.amount}</span>
                        <div className="flex gap-1.5">
                          <button className="px-1.5 py-0.5 rounded hover:bg-white/5 transition-colors" style={{ border: '1px solid var(--c-border)', color: 'var(--c-text-secondary)' }} onClick={() => navigate('/customer')}>
                            详情 <ExternalLink className="w-2.5 h-2.5 inline" />
                          </button>
                          <button onClick={() => toast.show(`已为「${opp.title}」生成工单`)} className="px-1.5 py-0.5 rounded bg-blue-600 text-white hover:bg-blue-500 transition-colors">
                            生成工单
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : secondaryPanel === 'search' ? (
            /* === 客户检索 === */
            <div className="p-4 flex flex-col flex-1 overflow-hidden">
              <div className="flex items-center gap-2 tech-panel px-2.5 mb-3" style={{ border: '1px solid var(--c-border)' }}>
                <Search className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--c-text-muted)' }} />
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="搜索企业名称..."
                  className="flex-1 bg-transparent py-2 text-[10px] outline-none" style={{ color: 'var(--c-text)' }} />
                {searchQuery && <button onClick={() => setSearchQuery('')}><X className="w-3 h-3" style={{ color: 'var(--c-text-muted)' }} /></button>}
              </div>
              <div className="flex-1 overflow-y-auto space-y-1.5">
                {customerSearchItems
                  .filter(c => !searchQuery || c.name.includes(searchQuery) || c.park.includes(searchQuery) || c.industry.includes(searchQuery))
                  .map((c, i) => (
                    <div key={i} className="tech-panel p-2.5 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => navigate('/customer')}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[11px] font-bold" style={{ color: 'var(--c-text)' }}>{c.name}</span>
                        <span className="text-[8px] px-1 py-0.5 rounded font-bold" style={{ backgroundColor: c.ratingColor + '15', color: c.ratingColor }}>{c.rating}</span>
                      </div>
                      <div className="flex items-center justify-between text-[9px]" style={{ color: 'var(--c-text-muted)' }}>
                        <span>{c.park} · {c.industry}</span>
                        <span className="font-mono" style={{ color: c.vi >= 80 ? '#00E676' : c.vi >= 60 ? '#FAAD14' : '#FF4D4F' }}>VI:{c.vi}</span>
                      </div>
                      <div className="flex items-center justify-between text-[9px] mt-0.5" style={{ color: 'var(--c-text-muted)' }}>
                        <span>投放: {c.invest} · 融资: {c.total}</span>
                        <span style={{ color: c.riskColor }}>{c.risk}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            /* === 默认：统计面板 === */
            <div className="p-4 flex flex-col gap-3 flex-1 overflow-y-auto">
              <div className="tech-panel p-3">
                <div className="tech-title text-xs mb-2">任务转化漏斗</div>
                <FunnelChart />
              </div>
              <div className="tech-panel p-3">
                <div className="tech-title text-xs mb-2">执行概览</div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: '我的待办', value: String(tabCounts.todo), hex: '#F97316' },
                    { label: '我的已办', value: String(tabCounts.done), hex: '#00E676' },
                    { label: '我的分配', value: String(tabCounts.assigned), hex: '#A78BFA' },
                    { label: '全部任务', value: String(tabCounts.all), hex: '#3B82F6' },
                    { label: '超时未闭环', value: '1', hex: '#DC2626' },
                    { label: '平均响应', value: '4.2h', hex: '#0891B2' },
                  ].map(s => (
                    <div key={s.label} className="text-center p-2 rounded-lg" style={{ backgroundColor: 'var(--c-bg)' }}>
                      <div className="text-lg font-bold font-mono" style={{ color: s.hex }}>{s.value}</div>
                      <div className="text-[9px]" style={{ color: 'var(--c-text-muted)' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 工作台浮动智能助手（已移除右下角浮动按钮，仅保留头部内联入口） */}
    </div>
  );
};
