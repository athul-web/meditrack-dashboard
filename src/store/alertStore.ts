import { create } from 'zustand';
import { Alert } from '../types/alerts';
import { initialDemoAlerts } from '../data/alerts';

interface AlertState {
  alerts: Alert[];

  addAlerts: (newAlerts: Alert[]) => void;
  acknowledgeAlert: (alertId: string, by?: string) => void;
  resolveAlert: (alertId: string, by?: string) => void;
  clearResolved: () => void;
  reset: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  alerts: [...initialDemoAlerts],

  addAlerts: (newAlerts) =>
    set((state) => ({
      alerts: [...newAlerts, ...state.alerts], // newer alerts first
    })),

  acknowledgeAlert: (alertId, by) =>
    set((state) => ({
      alerts: state.alerts.map((alert) =>
        alert.id === alertId
          ? {
              ...alert,
              status: 'acknowledged' as const,
              acknowledgedAt: new Date().toISOString(),
              acknowledgedBy: by ?? 'Operator',
            }
          : alert,
      ),
    })),

  resolveAlert: (alertId, by) =>
    set((state) => ({
      alerts: state.alerts.map((alert) =>
        alert.id === alertId
          ? {
              ...alert,
              status: 'resolved' as const,
              resolvedAt: new Date().toISOString(),
              resolvedBy: by ?? 'Operator',
            }
          : alert,
      ),
    })),

  clearResolved: () =>
    set((state) => ({
      alerts: state.alerts.filter((alert) => alert.status !== 'resolved'),
    })),

  reset: () => set({ alerts: [...initialDemoAlerts] }),
}));
