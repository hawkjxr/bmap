import React, { useState } from 'react';
import { Settings, Database, GitBranch, Play, Plus, Trash2, ChevronRight, BarChart3, CheckCircle } from 'lucide-react';
import { useToast } from '../store/toast';
import { useDataStore } from '../store/data';

export const RuleConfig: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dict' | 'rules' | 'sandbox'>('rules');
  const [selectedRule, setSelectedRule] = useState<string>('R001');
  const toast = useToast();
  const dataFields = useDataStore(s => s.dataFields);
  const rules = useDataStore(s => s.businessRules);

  const currentRule = rules.find(r => r.id === selectedRule)!;

  return (
    <div className="h-full flex flex-col">
      <div className="shrink-0 px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-dark-border)' }}>
        <div className="flex items-center gap-3">
          <Settings className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-bold">数据字典与规则配置</h2>
          <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-500/15 text-yellow-400">管理员</span>
        </div>
        <div className="flex gap-1">
          {([['dict', '数据目录库', Database], ['rules', '业务规则画布', GitBranch], ['sandbox', '策略沙盒回测', BarChart3]] as const).map(([key, label, Icon]) => (
            <button key={key} onClick={() => setActiveTab(key)} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === key ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}>
              <Icon className="w-3.5 h-3.5" />{label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        {/* 数据目录库 */}
        {activeTab === 'dict' && (
          <div className="h-full p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-300">全域数据字典映射</h3>
              <button onClick={() => toast.show('新字段已添加到数据目录，请配置映射关系', 'info')} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 rounded-md text-xs text-white"><Plus className="w-3 h-3" /> 新增字段</button>
            </div>
            <div className="tech-panel overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ backgroundColor: 'rgba(10,26,47,0.8)' }}>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">原始字段</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">业务名称</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">格式</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">数据来源</th>
                    <th className="text-center px-4 py-3 text-gray-500 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {dataFields.map((f, i) => (
                    <tr key={f.key} style={{ borderBottom: '1px solid rgba(30,64,112,0.2)', backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(10,26,47,0.3)' }}>
                      <td className="px-4 py-3 font-mono text-blue-400">{f.key}</td>
                      <td className="px-4 py-3 text-gray-300">{f.name}</td>
                      <td className="px-4 py-3"><span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/15 text-blue-400">{f.type}</span></td>
                      <td className="px-4 py-3 text-gray-500">{f.source}</td>
                      <td className="px-4 py-3 text-center"><button onClick={() => toast.show(`字段「${f.name}」已移除`, 'error')} className="text-gray-600 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 业务规则画布 */}
        {activeTab === 'rules' && (
          <div className="h-full flex">
            {/* Rule list */}
            <div className="w-[280px] shrink-0 p-4 overflow-y-auto" style={{ borderRight: '1px solid var(--color-dark-border)' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500">规则列表</span>
                <button onClick={() => toast.show('新规则已创建，请在右侧画布编排条件', 'info')} className="flex items-center gap-1 px-2 py-1 bg-blue-600 rounded text-[10px] text-white"><Plus className="w-3 h-3" /> 新建</button>
              </div>
              {rules.map(r => (
                <div key={r.id} onClick={() => setSelectedRule(r.id)}
                  className={`p-3 rounded-lg mb-2 cursor-pointer transition-all ${selectedRule === r.id ? 'border-blue-500/50' : 'border-transparent hover:bg-white/5'}`}
                  style={{ backgroundColor: selectedRule === r.id ? 'rgba(59,130,246,0.1)' : 'transparent', border: `1px solid ${selectedRule === r.id ? 'rgba(59,130,246,0.3)' : 'transparent'}` }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-gray-300">{r.name}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded ${r.status === '已上线' ? 'bg-green-500/15 text-green-400' : 'bg-yellow-500/15 text-yellow-400'}`}>{r.status}</span>
                  </div>
                  <div className="text-[10px] text-gray-600 font-mono">{r.id}</div>
                </div>
              ))}
            </div>

            {/* Rule canvas */}
            <div className="flex-1 p-6 overflow-y-auto">
              <h3 className="text-sm font-bold text-gray-300 mb-4">{currentRule.name} <span className="text-gray-600 font-mono ml-2">{currentRule.id}</span></h3>
              
              <div className="flex items-start gap-4 mb-6">
                {/* Visual flow */}
                <div className="flex-1">
                  <div className="text-[10px] text-gray-500 mb-2 uppercase tracking-wider">条件编排</div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {currentRule.conditions.map((c, i) => (
                      <React.Fragment key={i}>
                        {c === 'AND' || c === 'OR' ? (
                          <div className="px-3 py-1.5 rounded-md text-xs font-bold text-purple-400" style={{ backgroundColor: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)' }}>{c}</div>
                        ) : (
                          <div className="px-4 py-2.5 rounded-lg text-xs font-mono text-cyan-300" style={{ backgroundColor: 'rgba(10,26,47,0.6)', border: '1px solid var(--color-dark-border)' }}>{c}</div>
                        )}
                        {i < currentRule.conditions.length - 1 && c !== 'AND' && c !== 'OR' && <ChevronRight className="w-4 h-4 text-gray-600" />}
                      </React.Fragment>
                    ))}
                  </div>

                  <div className="mt-4">
                    <div className="text-[10px] text-gray-500 mb-2 uppercase tracking-wider">触发动作</div>
                    <div className="px-4 py-3 rounded-lg text-xs" style={{ backgroundColor: 'rgba(0,230,118,0.06)', border: '1px solid rgba(0,230,118,0.2)' }}>
                      <span className="text-green-400">{currentRule.action}</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="w-[180px] shrink-0 space-y-3">
                  <div className="tech-panel p-3 text-center">
                    <div className="text-lg font-bold font-mono text-cyan-300">{currentRule.trigger}</div>
                    <div className="text-[9px] text-gray-600">近90天触发次数</div>
                  </div>
                  <div className="tech-panel p-3 text-center">
                    <div className="text-lg font-bold font-mono text-green-400">{currentRule.precision}</div>
                    <div className="text-[9px] text-gray-600">准确率估算</div>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-gray-500 mb-2 uppercase tracking-wider">变量标签库 (拖拽至画布)</div>
              <div className="flex flex-wrap gap-2">
                {dataFields.map(f => (
                  <div key={f.key} className="px-3 py-1.5 rounded-md text-[10px] cursor-grab hover:bg-blue-600/10 transition-colors" style={{ backgroundColor: 'rgba(10,26,47,0.5)', border: '1px solid var(--color-dark-border)' }}>
                    <span className="text-gray-400">{f.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 策略沙盒回测 */}
        {activeTab === 'sandbox' && (
          <div className="h-full p-6 overflow-y-auto">
            <div className="max-w-3xl mx-auto">
              <h3 className="text-sm font-bold text-gray-300 mb-4">策略沙盒 · 历史回测</h3>
              <div className="tech-panel p-4 mb-4">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="text-[10px] text-gray-500">选择规则</label>
                    <select className="w-full mt-1 bg-dark-bg border border-dark-border rounded p-2 text-xs text-gray-300 outline-none">
                      <option>R001 · 事实停工+隐性举债</option>
                      <option>R002 · 短贷长投识别</option>
                      <option>R003 · 扩张意愿强信号</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500">回测起始日期</label>
                    <input type="date" defaultValue="2025-12-01" className="w-full mt-1 bg-dark-bg border border-dark-border rounded p-2 text-xs text-gray-300 outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500">回测结束日期</label>
                    <input type="date" defaultValue="2026-03-01" className="w-full mt-1 bg-dark-bg border border-dark-border rounded p-2 text-xs text-gray-300 outline-none" />
                  </div>
                </div>
                <button onClick={() => toast.show('回测已完成，请查看下方报告')} className="flex items-center gap-2 px-6 py-2 bg-blue-600 rounded-lg text-sm font-bold hover:bg-blue-500 transition-colors"><Play className="w-4 h-4" /> 开始回测</button>
              </div>

              <div className="tech-panel p-4">
                <div className="flex items-center gap-2 mb-4"><CheckCircle className="w-4 h-4 text-green-400" /><span className="text-sm font-bold text-green-400">回测完成</span></div>
                <div className="grid grid-cols-4 gap-4 mb-4">
                  {[
                    { label: '预估触发频次', value: '42次', color: 'text-cyan-300' },
                    { label: '召回率', value: '89%', color: 'text-green-400' },
                    { label: '误报率', value: '13%', color: 'text-yellow-400' },
                    { label: '涉及客户数', value: '28', color: 'text-blue-400' },
                  ].map(s => (
                    <div key={s.label} className="text-center p-3 rounded-lg" style={{ backgroundColor: 'rgba(10,26,47,0.5)' }}>
                      <div className={`text-xl font-bold font-mono ${s.color}`}>{s.value}</div>
                      <div className="text-[9px] text-gray-600 mt-1">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-gray-400 p-3 rounded-lg" style={{ backgroundColor: 'rgba(10,26,47,0.5)', border: '1px solid var(--color-dark-border)' }}>
                  <b className="text-gray-300">调优建议:</b> 当前 IoT 开工率阈值 4h 较为敏感。建议降至 3h 可减少约 15% 误报。
                  <span className="text-blue-400 cursor-pointer ml-2" onClick={() => toast.show('阈值已调整为 3h，预计减少 15% 误报')}>应用建议 →</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
