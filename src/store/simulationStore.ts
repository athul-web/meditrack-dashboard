import { create } from 'zustand';
import { TelemetryReading, Equipment, ConnectivityStatus } from '../types/equipment';

interface SimulationState {
  isRunning: boolean;
  readings: Map<string, TelemetryReading>; // keyed by equipmentId
  equipment: Equipment[]; // live equipment state (connectivity updates from simulation)
  lastUpdate: string | null;

  // Actions
  setRunning: (running: boolean) => void;
  updateReadings: (readings: TelemetryReading[]) => void;
  updateEquipmentConnectivity: (
    equipmentId: string,
    connectivity: ConnectivityStatus,
    lastComm: string,
  ) => void;
  setEquipment: (equipment: Equipment[]) => void;
  reset: () => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  isRunning: false,
  readings: new Map(),
  equipment: [],
  lastUpdate: null,

  setRunning: (running) => set({ isRunning: running }),

  updateReadings: (readings) =>
    set((state) => {
      const next = new Map(state.readings);
      for (const r of readings) {
        next.set(r.equipmentId, r);
      }
      return { readings: next, lastUpdate: new Date().toISOString() };
    }),

  updateEquipmentConnectivity: (equipmentId, connectivity, lastComm) =>
    set((state) => ({
      equipment: state.equipment.map((eq) =>
        eq.id === equipmentId
          ? { ...eq, connectivity, lastCommunication: lastComm }
          : eq,
      ),
    })),

  setEquipment: (equipment) => set({ equipment }),

  reset: () =>
    set({
      isRunning: false,
      readings: new Map(),
      equipment: [],
      lastUpdate: null,
    }),
}));
