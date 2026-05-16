import React, { useState } from 'react';
import { MessageSquare, Send, X, Bot, Loader2 } from 'lucide-react';

interface QA {
  q: string;
  a: string;
}

interface RobotConfig {
  name: string;
  presetQas: QA[];
}

const robotConfig: RobotConfig = {
  name: '小E助手',
  presetQas: [
    {
      q: '当前有多少待处理工单？',
      a: '当前共有 6 个待闭环工单，其中排雷工单 3 个，关注工单 2 个，拓客工单 1 个。请到个人工作台查看详情。',
    },
    {
      q: '哪些企业有风险预警？',
      a: '当前有 4 家企业触发风险预警：青岛力神（逾期超90天+ IOT离线）、协鑫科技（债务危机+IOT离线）、极氪汽车（逾期38天）、山东绿能（信用评分下降）。请到统帅驾驶舱查看详情。',
    },
    {
      q: '本月商机有哪些高价值机会？',
      a: '本月高价值商机包括：宁德时代欧洲工厂项目（15亿欧元，概率75%）、蜂巢能源马鞍山项目（8亿，概率60%）、四川时代宜宾三期（12亿，概率65%）。',
    },
    {
      q: '园区的渗透率情况如何？',
      a: '当前园区渗透率：常州滨江开发区 48%（超额完成）、宁波杭州湾新区 55%（超额完成）、武进国家高新区 35%（待提升）、苏州工业园区 52%（待提升）。',
    },
    {
      q: '如何新建工单？',
      a: '进入个人工作台，点击右上角「新建工单」按钮，填写工单类型、目标客户、执行人、期限等信息即可。新建后会自动分配给指定执行人。',
    },
    {
      q: '如何导入企业数据？',
      a: '进入个人工作台 → 数据补录 Tab，点击左侧「企业」类型，下载 CSV 模板，填写数据后上传即可。导入后所有页面数据会自动同步更新。',
    },
  ],
};

export const FloatingRobot: React.FC<{ mode?: 'float' | 'inline'; className?: string }> = ({
  mode = 'float',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: `您好！我是${robotConfig.name}，有什么可以帮您的吗？` },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handlePreset = (qa: QA) => {
    setMessages(prev => [...prev, { role: 'user', text: qa.q }]);
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'bot', text: qa.a }]);
      setIsTyping(false);
    }, 800);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { role: 'bot', text: '抱歉，我还在学习中。请尝试点击上方预设问题，或到个人工作台查看工单和商机详情。' },
      ]);
      setIsTyping(false);
    }, 1000);
  };

  if (mode === 'inline') {
    return (
      <div className={`tech-panel p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <Bot className="w-4 h-4 text-[var(--c-accent)]" />
          <span className="text-sm font-medium">{robotConfig.name}</span>
        </div>
        <div className="space-y-2">
          {robotConfig.presetQas.slice(0, 3).map((qa, i) => (
            <button
              key={i}
              onClick={() => handlePreset(qa)}
              className="w-full text-left text-xs px-3 py-2 rounded-lg bg-[var(--c-accent)]/5 hover:bg-[var(--c-accent)]/10 text-[var(--c-text-secondary)] transition-colors"
            >
              {qa.q}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-[var(--c-accent)] to-[var(--c-cyan)] shadow-lg flex items-center justify-center hover:scale-105 transition-transform z-50 ${className}`}
      >
        <MessageSquare className="w-6 h-6 text-white" />
        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--c-red)] text-white text-[10px] flex items-center justify-center animate-pulse">
          1
        </span>
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 h-[480px] tech-panel flex flex-col z-50 overflow-hidden">
          <div className="h-12 px-4 flex items-center justify-between border-b border-[var(--c-border)] shrink-0">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-[var(--c-accent)]" />
              <span className="text-sm font-medium">{robotConfig.name}</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-[var(--c-text-muted)] hover:text-[var(--c-text)]">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-lg text-xs ${
                    msg.role === 'user'
                      ? 'bg-[var(--c-accent)] text-white rounded-br-sm'
                      : 'bg-[var(--c-surface)] text-[var(--c-text)] rounded-bl-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-[var(--c-surface)] px-3 py-2 rounded-lg rounded-bl-sm flex items-center gap-1">
                  <Loader2 className="w-3 h-3 text-[var(--c-text-muted)] animate-spin" />
                  <span className="text-[10px] text-[var(--c-text-muted)]">思考中...</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-[var(--c-border)] shrink-0">
            <div className="text-[10px] text-[var(--c-text-muted)] mb-2">快捷问题：</div>
            <div className="flex flex-wrap gap-1 mb-2">
              {robotConfig.presetQas.slice(0, 4).map((qa, i) => (
                <button
                  key={i}
                  onClick={() => handlePreset(qa)}
                  className="text-[9px] px-2 py-1 rounded bg-[var(--c-accent)]/10 text-[var(--c-accent)] hover:bg-[var(--c-accent)]/20 transition-colors"
                >
                  {qa.q.substring(0, 10)}...
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="输入问题..."
                className="flex-1 bg-[var(--c-surface)] border border-[var(--c-border)] rounded-lg px-3 py-2 text-xs text-[var(--c-text)] placeholder:text-[var(--c-text-muted)] focus:outline-none focus:border-[var(--c-accent)]"
              />
              <button
                onClick={handleSend}
                className="w-8 h-8 rounded-lg bg-[var(--c-accent)] flex items-center justify-center hover:bg-[var(--c-accent)]/80 transition-colors"
              >
                <Send className="w-3 h-3 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
