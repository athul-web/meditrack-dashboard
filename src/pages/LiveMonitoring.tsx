import React, { useState, useMemo } from 'react';
import {
  Activity,
  Play,
  Pause,
  RotateCcw,
  Wifi,
  WifiOff,
  AlertTriangle,
  Radio,
  Clock,
  ShieldAlert,
  Search,
} from 'lucide-react';
import { useSimulationStore } from '../store/simulationStore';
import { useSimulation } from '../hooks/useSimulation';
import { telemetryConfigs } from '../data/equipment';
import { connectivityBadge, operationalBadge } from '../components/ui/StatusBadge';
import { FilterDropdown } from '../components/ui/FilterDropdown';
import { format, parseISO } from 'date-fns';

export function LiveMonitoring() {
  const { isRunning, toggle, reset } = useSimulation();
  const equipment = useSimulationStore((s) => s.equipment);
  const readings = useSimulationStore((s) => s.readings);
  const lastUpdate = useSimulationStore((s) => s.lastUpdate);

  const [filterType, setFilterType] = useState('all');
  const [filterDept, setFilterDept] = useState('all');

  // Map config by equipmentId
  const configMap = useMemo(() => {
    const map = new Map();
    for (const conf of telemetryConfigs) {
      map.set(conf.equipmentId, conf);
    }
    return map;
  }, []);

  // Filtered list of monitored devices
  const monitoredDevices = useMemo(() => {
    return equipment.filter((eq) => {
      const hasConfig = configMap.has(eq.id);
      if (!hasConfig) return false;

      const matchesType = filterType === 'all' || eq.type === filterType;
      const matchesDept = filterDept === 'all' || eq.department === filterDept;
      return matchesType && matchesDept;
    });
  }, [equipment, configMap, filterType, filterDept]);

  // Unique types and departments for filtering
  const availableTypes = useMemo(() => {
    const types = new Set(
      equipment.filter((e) => configMap.has(e.id)).map((e) => e.type)
    );
    return ['all', ...Array.from(types)];
  }, [equipment, configMap]);

  const availableDepts = useMemo(() => {
    const depts = new Set(
      equipment.filter((e) => configMap.has(e.id)).map((e) => e.department)
    );
    return ['all', ...Array.from(depts)];
  }, [equipment, configMap]);

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-neutral-200 pb-3">
        <div>
          <h1 className="text-xl font-semibold text-navy-900 tracking-tight">Live IoT Telemetry Monitoring</h1>
          <p className="text-xs text-navy-500 mt-0.5">
            Real-time simulated telemetry feeds, connection heartbeats, and parameter threshold monitoring.
          </p>
        </div>

        {/* Global Simulation Engine Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              isRunning
                ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                : 'bg-teal-600 hover:bg-teal-700 text-white'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5" /> Pause Stream
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" /> Resume Stream
              </>
            )}
          </button>

          <button
            onClick={reset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-200 hover:border-neutral-300 text-navy-700 text-xs font-medium rounded transition-colors"
            title="Reset telemetry baselines and alert engine"
          >
            <RotateCcw className="w-3.5 h-3.5 text-neutral-500" />
            Reset Data
          </button>
        </div>
      </div>

      {/* Simulator Control & Telemetry Status Bar */}
      <div className="bg-white border border-neutral-200 rounded-md p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <Radio className={`w-3.5 h-3.5 ${isRunning ? 'text-teal-600 animate-pulse' : 'text-neutral-400'}`} />
            <span className="font-semibold text-navy-900">
              {isRunning ? 'Simulation Running' : 'Simulation Paused'}
            </span>
            <span className="text-neutral-400">(4s cycle)</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-navy-600">
            <Clock className="w-3 h-3 text-neutral-400" />
            <span>Last sample:</span>
            <span className="font-mono text-navy-800">
              {lastUpdate ? format(parseISO(lastUpdate), 'HH:mm:ss') : 'Awaiting tick…'}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <FilterDropdown
            label="Type"
            value={filterType}
            options={availableTypes.map((t) => ({
              value: t,
              label: t === 'all' ? 'All Monitored Types' : t,
            }))}
            onChange={setFilterType}
          />
          <FilterDropdown
            label="Zone"
            value={filterDept}
            options={availableDepts.map((d) => ({
              value: d,
              label: d === 'all' ? 'All Departments' : d,
            }))}
            onChange={setFilterDept}
          />
        </div>
      </div>

      {/* Important Safety Protocol Notice */}
      <div className="p-3 bg-neutral-100 border border-neutral-200 rounded text-xs text-navy-700 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-navy-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-navy-900">Notice for Operators:</span> This screen visualizes
          raw edge device telemetry. Nominal readings or active heartbeats do not constitute clinical
          clearance. Operational readiness requires manual verification by qualified healthcare engineering personnel.
        </div>
      </div>

      {/* Monitored Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {monitoredDevices.map((eq) => {
          const config = configMap.get(eq.id);
          const currentReading = readings.get(eq.id);
          const isOffline = eq.connectivity === 'offline';

          return (
            <div
              key={eq.id}
              className={`bg-white border rounded-md transition-shadow ${
                isOffline
                  ? 'border-neutral-200 bg-neutral-50/50'
                  : eq.operationalStatus === 'critical'
                  ? 'border-red-300 shadow-sm'
                  : eq.operationalStatus === 'warning'
                  ? 'border-amber-300 shadow-sm'
                  : 'border-neutral-200'
              }`}
            >
              {/* Card Header */}
              <div className="p-3 border-b border-neutral-200 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-navy-900 text-xs">{eq.id}</span>
                    <span className="text-[11px] text-neutral-400">•</span>
                    <span className="text-[11px] font-medium text-navy-600">{eq.type}</span>
                  </div>
                  <div className="text-xs font-semibold text-navy-800 mt-0.5">{eq.name}</div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">
                    {eq.department} — {eq.location}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {connectivityBadge(eq.connectivity)}
                  {operationalBadge(eq.operationalStatus)}
                </div>
              </div>

              {/* Card Body: Metric Readings */}
              <div className="p-3 space-y-2.5">
                {isOffline ? (
                  <div className="py-6 text-center">
                    <WifiOff className="w-6 h-6 text-neutral-300 mx-auto mb-1.5" />
                    <p className="text-xs font-medium text-navy-600">Telemetry Feed Offline</p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Last heartbeat:{' '}
                      {eq.lastCommunication ? format(parseISO(eq.lastCommunication), 'HH:mm:ss') : 'Unknown'}
                    </p>
                  </div>
                ) : !currentReading ? (
                  <div className="py-6 text-center text-xs text-neutral-400">
                    Awaiting telemetry packet…
                  </div>
                ) : (
                  config?.metrics.map((m: any) => {
                    const value = currentReading.metrics[m.key];
                    const numVal = typeof value === 'number' ? value : 0;

                    // Evaluate threshold status for this metric
                    let statusColor = 'text-navy-900';
                    let statusLabel = 'Normal';
                    let bgBadge = 'bg-neutral-100 text-neutral-600';

                    if (
                      (m.criticalHigh !== undefined && numVal >= m.criticalHigh) ||
                      (m.criticalLow !== undefined && numVal <= m.criticalLow)
                    ) {
                      statusColor = 'text-red-700 font-bold';
                      statusLabel = 'Critical';
                      bgBadge = 'bg-red-50 text-red-700 border border-red-200';
                    } else if (
                      (m.warningHigh !== undefined && numVal >= m.warningHigh) ||
                      (m.warningLow !== undefined && numVal <= m.warningLow)
                    ) {
                      statusColor = 'text-amber-700 font-semibold';
                      statusLabel = 'Warning';
                      bgBadge = 'bg-amber-50 text-amber-700 border border-amber-200';
                    }

                    // Progress bar calculation within min/max
                    const range = m.max - m.min || 1;
                    const percent = Math.min(100, Math.max(0, ((numVal - m.min) / range) * 100));

                    return (
                      <div key={m.key} className="p-2 bg-neutral-50 rounded border border-neutral-100">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-navy-600 font-medium">{m.label}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${bgBadge}`}>
                            {statusLabel}
                          </span>
                        </div>

                        <div className="flex items-baseline justify-between mt-1">
                          <span className={`text-base font-bold tabular-nums ${statusColor}`}>
                            {numVal.toFixed(1)} <span className="text-xs font-normal text-navy-400">{m.unit}</span>
                          </span>
                          <span className="text-[10px] text-neutral-400 font-mono">
                            Nominal: {m.baseline} {m.unit}
                          </span>
                        </div>

                        {/* Visual Range Indicator Bar */}
                        <div className="w-full bg-neutral-200 rounded-full h-1 mt-1.5 overflow-hidden">
                          <div
                            className={`h-1 rounded-full ${
                              statusLabel === 'Critical'
                                ? 'bg-red-500'
                                : statusLabel === 'Warning'
                                ? 'bg-amber-500'
                                : 'bg-teal-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Card Footer */}
              <div className="px-3 py-2 bg-neutral-50/70 border-t border-neutral-200 flex items-center justify-between text-[11px] text-neutral-500">
                <span>Model: {eq.model}</span>
                <span className="font-mono">SN: {eq.serialNumber}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
