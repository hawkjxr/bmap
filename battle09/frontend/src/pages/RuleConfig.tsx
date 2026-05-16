import React, { useState, useMemo } from 'react';
import {
  Settings, Database, GitBranch, Search, ChevronRight,
  Plus, Edit2, Trash2, Eye
} from 'lucide-react';
import { useAppStore } from '../store/data';

const DATA_FIELDS = [
  { key: 'id', name: '唯一标识', format: 'string', source: '系统生成', desc: '全局唯一ID' },
  { key: 'name', name: '名称', format: 'string', source: '用户录入', desc: '实体名称' },
  { key: 'fullName', name: '全称', format: 'string', source: '用户录入', desc: '企业全称' },
  { key: 'creditCode', name: '统一社会信用代码', format: 'string', source: '企信API', desc: '18位统一编码' },
  { key: 'rating', name: '信用评级', format: 'enum', source: '风控系统', desc: 'AAA/AA+/AA...' },
  { key: 'risk', name: '风险状态', format: 'enum', source: '风控系统', desc: 'normal/warning/danger' },
  { key: 'asset', name: '资产规模', format: 'string', source: '财务数据', desc: '如"50亿"' },
  { key: 'revenue', name: '年营收', format: 'string', source: '财务数据', desc: '如"200亿"' },
  { key: 'establishedYear', name: '成立年份', format: 'year', source: '工商数据', desc: '4位年份' },
  { key: 'chainIds', name: '产业链关联', format: 'array', source: '用户录入', desc: '产业链ID列表' },
  { key: 'primaryManagerId', name: '主客户经理', format: 'ref', source: '系统分配', desc: '客户经理ID' },
  { key: 'indicators.creditScore', name: '信用评分', format: 'number', source: '风控系统', desc: '0-100分' },
  { key: 'indicators.nplRatio', name: '不良率', format: 'percent', source: '风控系统', desc: '百分比' },
  { key: 'indicators.electricityUsage', name: '用电量', format: 'number', source: 'IOT设备', desc: '千瓦时' },
  { key: 'indicators.operatingRate', name: '开工率', format: 'percent', source: 'IOT设备', desc: '百分比' },
];

const BUSINESS_RULES = [
  { id: 'rule001', name: '高风险企业自动派单', condition: 'firm.risk === "danger"', precision: 95, actions: ['创建排雷工单', '通知风控部门'], status: 'active' },
  { id: 'rule002', name: '低渗透率园区预警', condition: 'park.penetrationRate < 25', precision: 88, actions: ['生成关注工单', '推送团队长'], status: 'active' },
  { id: 'rule003', name: '逾期30天触发提醒', condition: 'workOrder.overdueDays >= 30', precision: 100, actions: ['升级工单优先级', '发送邮件通知'], status: 'active' },
  { id: 'rule004', name: 'IOT离线自动标记', condition: 'firm.iotStatus === "offline"', precision: 92, actions: ['创建预警', '关联风险记录'], status: 'active' },
  { id: 'rule005', name: '商机价值评估', condition: 'opportunity.amount > 500000000', precision: 78, actions: ['标记高价值', '推送高管'], status: 'draft' },
];

export const RuleConfig: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'fields' | 'rules'>('fields');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFields = useMemo(() => {
    if (!searchQuery) return DATA_FIELDS;
    const q = searchQuery.toLowerCase();
    return DATA_FIELDS.filter(f => f.name.toLowerCase().includes(q) || f.key.toLowerCase().includes(q));
  }, [searchQuery]);

  return (
    <div className="h-full flex flex-col bg-[var(--c-bg)]">
      <div className="h-14 px-6 flex items-center justify-between border-b border-[var(--c-border)] shrink-0 bg-[var(--c-bg-elevated)]">
        <div className="flex items-center gap-3">
          <Settings className="w-5 h-5 text-[var(--c-accent)]" />
          <h1 className="text-lg font-bold tech-title">规则配置</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[var(--c-surface)] rounded-lg p-1">
            <button onClick={() => setActiveTab('fields')} className={`px-3 py-1 rounded text-xs transition-colors ${activeTab === 'fields' ? 'badge-blue' : 'text-[var(--c-text-secondary)]'}`}>
              <Database className="w-3 h-3 inline mr-1" />数据目录
            </button>
            <button onClick={() => setActiveTab('rules')} className={`px-3 py-1 rounded text-xs transition-colors ${activeTab === 'rules' ? 'badge-blue' : 'text-[var(--c-text-secondary)]'}`}>
              <GitBranch className="w-3 h-3 inline mr-1" />策略画布
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {activeTab === 'fields' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--c-border)]">
              <div className="relative max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--c-text-muted)]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="搜索字段..."
                  className="w-full pl-9 pr-4 py-2 bg-[var(--c-surface)] border border-[var(--c-border)] rounded-lg text-xs text-[var(--c-text)] placeholder:text-[var(--c-text-muted)] focus:outline-none focus:border-[var(--c-accent)]"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
              <div className="tech-panel overflow-hidden">
                <table className="w-full">
                  <thead className="bg-[var(--c-surface)]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[var(--c-text-secondary)]">字段KEY</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[var(--c-text-secondary)]">业务名称</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[var(--c-text-secondary)]">格式</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[var(--c-text-secondary)]">数据来源</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[var(--c-text-secondary)]">说明</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--c-border)]">
                    {filteredFields.map(field => (
                      <tr key={field.key} className="hover:bg-[var(--c-accent)]/5 transition-colors">
                        <td className="px-4 py-3 text-xs font-mono text-[var(--c-accent)]">{field.key}</td>
                        <td className="px-4 py-3 text-xs text-[var(--c-text)]">{field.name}</td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] px-2 py-1 rounded bg-[var(--c-surface)] text-[var(--c-text-muted)]">{field.format}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-[var(--c-text-muted)]">{field.source}</td>
                        <td className="px-4 py-3 text-xs text-[var(--c-text-muted)]">{field.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
              <div className="space-y-4">
                {BUSINESS_RULES.map(rule => (
                  <div key={rule.id} className="tech-panel p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-[var(--c-text)]">{rule.name}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded ${rule.status === 'active' ? 'badge-green' : 'badge-yellow'}`}>
                            {rule.status === 'active' ? '已启用' : '草稿'}
                          </span>
                        </div>
                        <code className="text-[10px] px-2 py-1 rounded bg-[var(--c-bg)] text-[var(--c-accent)] font-mono">
                          {rule.condition}
                        </code>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 rounded hover:bg-[var(--c-accent)]/10 text-[var(--c-text-muted)] hover:text-[var(--c-accent)] transition-colors">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 rounded hover:bg-[var(--c-accent)]/10 text-[var(--c-text-muted)] hover:text-[var(--c-accent)] transition-colors">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-[var(--c-border)]">
                      <div>
                        <div className="text-[10px] text-[var(--c-text-muted)] mb-1">精度</div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-[var(--c-bg)] rounded-full overflow-hidden">
                            <div className="h-full bg-[var(--c-accent)] rounded-full" style={{ width: `${rule.precision}%` }} />
                          </div>
                          <span className="text-xs font-medium text-[var(--c-text)]">{rule.precision}%</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-[var(--c-text-muted)] mb-1">触发动作</div>
                        <div className="flex flex-wrap gap-1">
                          {rule.actions.map((action, i) => (
                            <span key={i} className="text-[9px] px-2 py-0.5 rounded bg-[var(--c-surface)] text-[var(--c-text-muted)]">{action}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RuleConfig;
