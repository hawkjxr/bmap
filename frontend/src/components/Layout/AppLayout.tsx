import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const AppLayout: React.FC = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden transition-colors" style={{ backgroundColor: 'var(--c-bg)', color: 'var(--c-text)' }}>
      <Sidebar />
      <main className="flex-1 overflow-auto relative">
        <Outlet />
      </main>
    </div>
  );
};
