// ═══════════════════════════════════════════════════════════════
// AI 机器人对话组件（RobotChat.tsx）
// 核心理念：提供 AI 问答演示，支持预设问答 + 打字机效果
// ═══════════════════════════════════════════════════════════════

import React, { useEffect, useRef, useState } from 'react';
import { X, Send, Bot, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import type { RobotConfig, ChatMessage } from '../../data/types';

interface RobotChatProps {
  config: RobotConfig;           // 机器人配置
  onClose: () => void;           // 关闭回调
  className?: string;            // 自定义样式
  collapsed?: boolean;           // 是否折叠显示
  onToggleCollapse?: () => void; // 折叠切换回调
  defaultOpen?: boolean;         // 默认展开
}

// 打字机效果 Hook
function useTypewriter(text: string, speed: number = 30, enabled: boolean = true) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    indexRef.current = 0;

    if (!enabled || !text) {
      setDisplayed(text);
      setDone(true);
      return;
    }

    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayed(text.slice(0, indexRef.current + 1));
        indexRef.current++;
      } else {
        setDone(true);
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, enabled]);

  return { displayed, done };
}

// 单条消息气泡
const MessageBubble: React.FC<{ msg: ChatMessage; typewriter?: boolean }> = ({ msg, typewriter = false }) => {
  const { displayed, done } = useTypewriter(msg.content, 25, typewriter && msg.role === 'bot');

  return (
    <div className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[9px] font-bold text-white ${msg.role === 'bot' ? 'bg-gradient-to-br from-blue-600 to-cyan-500' : 'bg-gradient-to-br from-purple-600 to-pink-500'}`}>
        {msg.role === 'bot' ? 'AI' : '我'}
      </div>
      <div className={`max-w-[75%] ${msg.role === 'user' ? 'text-right' : ''}`}>
        <div className={`inline-block p-2.5 rounded-xl text-[11px] leading-relaxed whitespace-pre-wrap ${msg.role === 'bot' ? 'rounded-tl-sm' : 'rounded-tr-sm'} ${msg.role === 'bot' ? 'bg-blue-600/15 text-gray-200' : 'bg-purple-600/15 text-gray-200'}`}
          style={msg.role === 'bot' ? { borderLeft: '2px solid rgba(59,130,246,0.3)' } : { borderRight: '2px solid rgba(168,85,247,0.3)' }}>
          {displayed}
          {!done && <span className="inline-block w-1.5 h-3 ml-0.5 animate-pulse bg-blue-400 rounded" />}
        </div>
        <div className={`text-[8px] mt-0.5 font-mono ${msg.role === 'user' ? 'text-right' : ''}`} style={{ color: 'var(--c-text-muted)' }}>
          {msg.timestamp}
        </div>
      </div>
    </div>
  );
};

export const RobotChat: React.FC<RobotChatProps> = ({
  config,
  onClose,
  className = '',
  collapsed = false,
  onToggleCollapse,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'bot',
      content: config.greeting,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [selectedQa, setSelectedQa] = useState<string | null>(null);
  const [typingId, setTypingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 点击预设问题
  const handlePresetClick = (qaId: string) => {
    const qa = config.presetQas.find(q => q.id === qaId);
    if (!qa) return;

    setSelectedQa(qaId);

    // 添加用户消息
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: qa.question,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMsg]);

    // 添加机器人回复（打字机效果）
    const botMsgId = `bot_${Date.now()}`;
    setTypingId(botMsgId);
    const botMsg: ChatMessage = {
      id: botMsgId,
      role: 'bot',
      content: qa.answer,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, botMsg]);
  };

  // 输入框回车发送
  const handleSend = () => {
    if (!input.trim()) return;
    const qa = config.presetQas.find(q => q.question.includes(input.trim()));
    if (qa) {
      handlePresetClick(qa.id);
    } else {
      const userMsg: ChatMessage = {
        id: `user_${Date.now()}`,
        role: 'user',
        content: input.trim(),
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, userMsg]);
      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        role: 'bot',
        content: `抱歉，当前仅支持预设问题回复。您可以点击右侧的快捷问题，或者切换到「预设问答」标签页选择问题。`,
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, botMsg]);
    }
    setInput('');
  };

  // 按分类组织预设问题
  const categories = Array.from(new Set(config.presetQas.map(q => q.category)));
  const categoryColors: Record<string, string> = {
    '企业概况': '#00E676',
    '经营状况': '#3B82F6',
    '财务分析': '#A78BFA',
    '风险提示': '#DC2626',
    '营销建议': '#F59E0B',
    '工作提醒': '#F97316',
    '数据管理': '#06B6D4',
    '团队协作': '#8B5CF6',
    '商机发现': '#10B981',
    '工作指引': '#64748B',
  };

  return (
    <div className={`flex flex-col rounded-xl overflow-hidden ${className}`}
      style={{ backgroundColor: 'var(--c-surface)', border: '1px solid var(--c-border)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
      {/* 头部 */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(6,182,212,0.1))', borderBottom: '1px solid rgba(59,130,246,0.2)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white text-[10px] font-bold shadow-lg shadow-blue-500/30">
            {config.avatar}
          </div>
          <div>
            <div className="text-xs font-bold" style={{ color: 'var(--c-text)' }}>{config.name}</div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[9px]" style={{ color: 'var(--c-text-muted)' }}>AI 问答助手</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {onToggleCollapse && (
            <button onClick={onToggleCollapse} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" title={collapsed ? '展开' : '折叠'}>
              {collapsed ? <ChevronUp className="w-4 h-4" style={{ color: 'var(--c-text-muted)' }} /> : <ChevronDown className="w-4 h-4" style={{ color: 'var(--c-text-muted)' }} />}
            </button>
          )}
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-4 h-4" style={{ color: 'var(--c-text-muted)' }} />
          </button>
        </div>
      </div>

      {!collapsed && (
        <>
          {/* 预设问题标签 */}
          <div className="px-4 py-2 flex gap-1.5 overflow-x-auto shrink-0" style={{ borderBottom: '1px solid var(--color-dark-border)' }}>
            {categories.map(cat => (
              <button key={cat} onClick={() => {
                const qa = config.presetQas.find(q => q.category === cat);
                if (qa) handlePresetClick(qa.id);
              }}
                className="px-2 py-1 rounded-full text-[9px] font-medium whitespace-nowrap transition-all hover:scale-105"
                style={{ backgroundColor: (categoryColors[cat] || '#64748B') + '15', color: categoryColors[cat] || '#64748B', border: `1px solid ${(categoryColors[cat] || '#64748B')}30` }}>
                {cat}
              </button>
            ))}
          </div>

          {/* 消息列表 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
            {messages.map(msg => (
              <MessageBubble key={msg.id} msg={msg} typewriter={msg.id === typingId} />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* 快捷问题面板 */}
          <div className="px-4 py-2 shrink-0" style={{ borderTop: '1px solid var(--color-dark-border)', backgroundColor: 'var(--c-bg)' }}>
            <div className="text-[9px] mb-1.5 flex items-center gap-1" style={{ color: 'var(--c-text-muted)' }}>
              <MessageSquare className="w-3 h-3" /> 快捷问题
            </div>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {config.presetQas.slice(0, 6).map(qa => (
                <button key={qa.id} onClick={() => handlePresetClick(qa.id)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[9px] transition-all hover:scale-[1.02] ${selectedQa === qa.id ? 'ring-1' : ''}`}
                  style={{
                    backgroundColor: selectedQa === qa.id ? 'rgba(59,130,246,0.15)' : 'var(--c-surface)',
                    border: `1px solid ${selectedQa === qa.id ? 'rgba(59,130,246,0.4)' : 'var(--c-border)'}`,
                    color: 'var(--c-text-secondary)',
                  }}>
                  <div className="flex items-center gap-1.5">
                    <Bot className="w-2.5 h-2.5 shrink-0" style={{ color: categoryColors[qa.category] || '#64748B' }} />
                    <span className="truncate">{qa.question}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 输入框 */}
          <div className="px-4 py-3 shrink-0 flex items-center gap-2" style={{ borderTop: '1px solid var(--color-dark-border)' }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="输入问题，按回车发送..."
              className="flex-1 bg-transparent text-[11px] outline-none"
              style={{ color: 'var(--c-text)' }}
            />
            <button onClick={handleSend} disabled={!input.trim()}
              className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <Send className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};
