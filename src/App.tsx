import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Shell } from './components/layout/Shell';
import { Overview } from './pages/Overview';
import { Equipment } from './pages/Equipment';
import { LiveMonitoring } from './pages/LiveMonitoring';
import { Maintenance } from './pages/Maintenance';
import { AlertsEvents } from './pages/AlertsEvents';
import { ResourceStatus } from './pages/ResourceStatus';
import { Settings } from './pages/Settings';
import { useSimulation } from './hooks/useSimulation';
import { useSimulationStore } from './store/simulationStore';

function AppContent() {
  // Initialize the simulation lifecycle hook
  const { isRunning, toggle } = useSimulation();
  const setRunning = useSimulationStore((s) => s.setRunning);

  // Auto-start simulation on prototype initial load
  useEffect(() => {
    setRunning(true);
  }, [setRunning]);

  return (
    <Routes>
      <Route path="/" element={<Shell />}>
        <Route index element={<Overview />} />
        <Route path="equipment" element={<Equipment />} />
        <Route path="monitoring" element={<LiveMonitoring />} />
        <Route path="maintenance" element={<Maintenance />} />
        <Route path="alerts" element={<AlertsEvents />} />
        <Route path="resources" element={<ResourceStatus />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
