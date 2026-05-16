import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/Layout/AppLayout';
import { MacroPanel } from './pages/MacroPanel';
import { IndustryChain } from './pages/IndustryChain';
import { CustomerView } from './pages/CustomerView';
import { TaskCenter } from './pages/TaskCenter';
import { CommanderDashboard } from './pages/CommanderDashboard';
import { BattleField } from './pages/BattleField';
import { RuleConfig } from './pages/RuleConfig';
import { ToastContainer } from './components/Toast';

export default function App() {
  return (
    <>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<MacroPanel />} />
          <Route path="/chain" element={<IndustryChain />} />
          <Route path="/customer" element={<CustomerView />} />
          <Route path="/tasks" element={<TaskCenter />} />
          <Route path="/commander" element={<CommanderDashboard />} />
          <Route path="/battlefield" element={<BattleField />} />
          <Route path="/rules" element={<RuleConfig />} />
        </Route>
      </Routes>
      <ToastContainer />
    </>
  );
}
