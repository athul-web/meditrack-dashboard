import { useEffect, useRef, useCallback } from 'react';
import { SimulationEngine } from '../services/simulation';
import { AlertEngine } from '../services/alertEngine';
import { useSimulationStore } from '../store/simulationStore';
import { useAlertStore } from '../store/alertStore';
import { telemetryConfigs, demoEquipment } from '../data/equipment';

/** Interval between simulation ticks in milliseconds. */
const TICK_INTERVAL_MS = 4_000;

/**
 * React hook that manages the full simulation lifecycle — ticking the
 * SimulationEngine, evaluating alerts, and pushing updates into Zustand
 * stores.
 *
 * Returns controls to toggle (pause / resume) and reset the simulation,
 * as well as a reference to the underlying engine for advanced use.
 */
export function useSimulation() {
  const engineRef = useRef<SimulationEngine | null>(null);
  const alertEngineRef = useRef<AlertEngine | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Store selectors — keep references stable
  const isRunning = useSimulationStore((s) => s.isRunning);
  const setRunning = useSimulationStore((s) => s.setRunning);
  const updateReadings = useSimulationStore((s) => s.updateReadings);
  const updateEquipmentConnectivity = useSimulationStore((s) => s.updateEquipmentConnectivity);
  const setEquipment = useSimulationStore((s) => s.setEquipment);
  const addAlerts = useAlertStore((s) => s.addAlerts);

  // Build a stable name-lookup map for alert descriptions
  const equipmentNamesRef = useRef<Map<string, string>>(new Map());

  // ---------------------------------------------------------------------------
  // Initialise engines + seed equipment on first mount
  // ---------------------------------------------------------------------------
  useEffect(() => {
    // Create engines once
    if (!engineRef.current) {
      engineRef.current = new SimulationEngine(telemetryConfigs);
    }
    if (!alertEngineRef.current) {
      alertEngineRef.current = new AlertEngine(telemetryConfigs);
    }

    // Seed the simulation store with demo equipment
    setEquipment([...demoEquipment]);

    // Build the name map
    const nameMap = new Map<string, string>();
    for (const eq of demoEquipment) {
      nameMap.set(eq.id, eq.name);
    }
    equipmentNamesRef.current = nameMap;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // Tick function
  // ---------------------------------------------------------------------------
  const performTick = useCallback(() => {
    const engine = engineRef.current;
    const alertEngine = alertEngineRef.current;
    if (!engine || !alertEngine) return;

    // 1. Advance simulation
    const readings = engine.tick();

    // 2. Push readings into the store
    updateReadings(readings);

    // 3. Determine which devices are offline
    const offlineIds: string[] = [];
    for (const eq of demoEquipment) {
      const state = engine.getDeviceState(eq.id);
      if (state?.isOffline) {
        offlineIds.push(eq.id);
      }
    }

    // 4. Evaluate alerts
    const newAlerts = alertEngine.evaluate(
      readings,
      offlineIds,
      equipmentNamesRef.current,
    );
    if (newAlerts.length > 0) {
      addAlerts(newAlerts);
    }

    // 5. Update equipment connectivity in store
    const now = new Date().toISOString();
    for (const eq of demoEquipment) {
      const state = engine.getDeviceState(eq.id);
      if (state) {
        const connectivity = state.isOffline ? 'offline' : 'online';
        const lastComm = state.isOffline ? (state.offlineSince ?? now) : now;
        updateEquipmentConnectivity(eq.id, connectivity, lastComm);
      }
    }
  }, [updateReadings, addAlerts, updateEquipmentConnectivity]);

  // ---------------------------------------------------------------------------
  // Manage the interval based on isRunning
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (isRunning) {
      // Run an immediate first tick so the UI isn't blank for 4 s
      performTick();

      intervalRef.current = setInterval(performTick, TICK_INTERVAL_MS);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, performTick]);

  // ---------------------------------------------------------------------------
  // Controls
  // ---------------------------------------------------------------------------
  const toggle = useCallback(() => {
    setRunning(!isRunning);
  }, [isRunning, setRunning]);

  const reset = useCallback(() => {
    // Stop the simulation
    setRunning(false);

    // Reset engines
    engineRef.current?.reset();
    alertEngineRef.current?.reset();

    // Reset stores
    useSimulationStore.getState().reset();
    useAlertStore.getState().reset();

    // Re-seed equipment
    setEquipment([...demoEquipment]);
  }, [setRunning, setEquipment]);

  return {
    isRunning,
    toggle,
    reset,
    engine: engineRef.current,
  };
}
