import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/Layout/AppLayout';
import { MacroPanel } from './pages/MacroPanel';
import IndustryChainV2 from './pages/IndustryChainV2';
import { CustomerView } from './pages/CustomerView';
import { TaskCenter } from './pages/TaskCenter';
import { RuleConfig } from './pages/RuleConfig';
import { Supplement } from './pages/Supplement';
import { useToast } from './store/toast';
import { CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContainer = () => {
  const { toasts, dismiss } = useToast();
  if (toasts.length === 0) return null;
  const icons = { success: <CheckCircle className="w-4 h-4 text-green-400" />, info: <Info className="w-4 h-4 text-blue-400" />, error: <AlertTriangle className="w-4 h-4 text-red-400" /> };
  const borders = { success: 'rgba(34,197,94,0.4)', info: 'rgba(59,130,246,0.4)', error: 'rgba(239,68,68,0.4)' };
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2" style={{ maxWidth: 360 }}>
      {toasts.map(t => (
        <div key={t.id} className="tech-panel px-4 py-3 flex items-center gap-3 animate-[slideIn_0.3s_ease]" style={{ border: `1px solid ${borders[t.type]}` }}>
          {icons[t.type]}
          <span className="text-sm flex-1" style={{ color: 'var(--c-text)' }}>{t.message}</span>
          <button onClick={() => dismiss(t.id)}><X className="w-3.5 h-3.5" style={{ color: 'var(--c-text-muted)' }} /></button>
        </div>
      ))}
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<MacroPanel />} />
          <Route path="/chain" element={<IndustryChainV2 />} />
          <Route path="/customer" element={<CustomerView />} />
          <Route path="/tasks" element={<TaskCenter />} />
          <Route path="/rules" element={<RuleConfig />} />
          <Route path="/supplement" element={<Supplement />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
