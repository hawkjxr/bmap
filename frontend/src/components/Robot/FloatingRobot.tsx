// ═══════════════════════════════════════════════════════════════
// 浮动机器人按钮组件（FloatingRobot.tsx）
// 核心理念：支持两种模式——
  // 1. fixed 浮动模式（右下角固定，点击展开对话）
  // 2. inline 内联模式（嵌入页面指定位置，固定显示机器人卡片）
// ═══════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { Bot, X } from 'lucide-react';
import { RobotChat } from './RobotChat';
import type { RobotConfig } from '../../data/types';

interface FloatingRobotProps {
  config: RobotConfig;
  /** 展示模式：float=右下角悬浮 / inline=内联嵌入页面 */
  mode?: 'float' | 'inline';
  /** 仅 inline 模式生效：传入容器高度以保持视觉对齐 */
  inlineHeight?: number;
  /** 仅 inline 模式生效：是否显示标签文字 */
  showLabel?: boolean;
}

/**
 * FloatingRobot — 工作台/客户全景的 AI 智能助手入口
 *
 * mode='float'    → 页面右下角悬浮按钮（带脉冲点），点击展开对话窗
 * mode='inline'   → 嵌入页面 header，固定宽度按钮卡片，与周围元素对齐
 */
export const FloatingRobot: React.FC<FloatingRobotProps> = ({
  config,
  mode = 'float',
  inlineHeight = 40,
  showLabel = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (mode === 'inline') {
    // ═══ 内联模式 ═══
    // 嵌入到页面头部，与其他卡片并排显示，尺寸与相邻按钮对齐
    return (
      <>
        <div
          className="tech-panel flex items-center gap-2 px-3 shrink-0 cursor-pointer select-none"
          style={{
            height: inlineHeight,
            borderColor: 'rgba(59,130,246,0.25)',
            boxShadow: '0 0 12px rgba(59,130,246,0.12)',
          }}
          onClick={() => setIsOpen(true)}
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
            <Bot className="w-4 h-4 text-white" />
          </div>
          {showLabel && (
            <div className="flex flex-col justify-center">
              <div className="text-[10px] text-gray-500 leading-tight">{config.name}</div>
              <div className="text-[11px] font-medium leading-tight" style={{ color: '#60A5FA' }}>
                智能助手
              </div>
            </div>
          )}
          {/* 脉冲提示点 */}
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"
            style={{ display: isOpen ? 'none' : undefined }} />
        </div>

        {/* 弹窗 */}
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={() => setIsOpen(false)}>
            <div onClick={e => e.stopPropagation()} className="w-[440px] h-[600px]">
              <RobotChat config={config} onClose={() => setIsOpen(false)} defaultOpen />
            </div>
          </div>
        )}
      </>
    );
  }

  // ═══ 浮动模式（默认） ═══
  return (
    <>
      {/* 浮动按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed z-50 w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-xl shadow-blue-500/30 hover:scale-110 active:scale-95 transition-all"
        style={{ bottom: 24, right: 24 }}
        title={config.name}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Bot className="w-7 h-7 text-white" />
        )}
        {/* 未读消息提示 */}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[9px] font-bold border-2 border-white animate-pulse">
            ！
          </span>
        )}
      </button>

      {/* 机器人对话窗口 */}
      {isOpen && (
        <div className="fixed z-50 w-80 h-[500px] flex flex-col" style={{ bottom: 90, right: 24 }}>
          <RobotChat
            config={config}
            onClose={() => setIsOpen(false)}
            defaultOpen
          />
        </div>
      )}
    </>
  );
};