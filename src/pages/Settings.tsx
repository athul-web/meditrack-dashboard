import React from 'react';
import {
  Settings as SettingsIcon,
  Radio,
  RotateCcw,
  Play,
  Pause,
  Server,
  Layers,
  Shield,
  FileCode,
  Info,
  CheckCircle,
} from 'lucide-react';
import { useSimulation } from '../hooks/useSimulation';
import { useSimulationStore } from '../store/simulationStore';
import { useAlertStore } from '../store/alertStore';
import { useMaintenanceStore } from '../store/maintenanceStore';

export function Settings() {
  const { isRunning, toggle, reset } = useSimulation();
  const resetAlerts = useAlertStore((s) => s.reset);
  const resetMaintenance = useMaintenanceStore((s) => s.reset);

  const handleFullReset = () => {
    reset();
    resetAlerts();
    resetMaintenance();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="border-b border-neutral-200 pb-3">
        <h1 className="text-xl font-semibold text-navy-900 tracking-tight">System & Prototype Settings</h1>
        <p className="text-xs text-navy-500 mt-0.5">
          Simulation parameters, edge broker emulation controls, and architecture boundary specifications.
        </p>
      </div>

      {/* Simulation Engine Controls */}
      <div className="bg-white border border-neutral-200 rounded-md p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2.5">
            <Radio className={`w-5 h-5 ${isRunning ? 'text-teal-600 animate-pulse' : 'text-neutral-400'}`} />
            <div>
              <h2 className="text-sm font-semibold text-navy-900">IoT Telemetry Engine State</h2>
              <p className="text-xs text-navy-500">
                Periodic edge device telemetry generator with bounded random walk models.
              </p>
            </div>
          </div>
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
                  <Pause className="w-3.5 h-3.5" /> Pause Generator
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" /> Start Generator
                </>
              )}
            </button>
            <button
              onClick={handleFullReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-200 hover:border-neutral-300 text-navy-700 text-xs font-medium rounded transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-neutral-500" />
              Reset All Demo State
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-neutral-50 rounded border border-neutral-200">
            <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Sampling Frequency</span>
            <span className="text-base font-bold text-navy-900">4.0 seconds</span>
            <span className="text-[11px] text-neutral-500 block mt-0.5">Configured heartbeat cadence</span>
          </div>

          <div className="p-3 bg-neutral-50 rounded border border-neutral-200">
            <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Incident Probability</span>
            <span className="text-base font-bold text-navy-900">~1.0% per tick</span>
            <span className="text-[11px] text-neutral-500 block mt-0.5">Smooth threshold excursions</span>
          </div>

          <div className="p-3 bg-neutral-50 rounded border border-neutral-200">
            <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Alert Deduplication</span>
            <span className="text-base font-bold text-teal-700">Active (Key-tracked)</span>
            <span className="text-[11px] text-neutral-500 block mt-0.5">No duplicate bursts</span>
          </div>
        </div>
      </div>

      {/* Hospital Site Configuration */}
      <div className="bg-white border border-neutral-200 rounded-md p-5 space-y-3">
        <h2 className="text-sm font-semibold text-navy-900">Facility Information</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-neutral-50 rounded border border-neutral-200">
            <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Hospital Name</span>
            <span className="font-semibold text-navy-900">Demo General Hospital</span>
          </div>
          <div className="p-3 bg-neutral-50 rounded border border-neutral-200">
            <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Facility Code</span>
            <span className="font-mono text-navy-900">DGH-EAST-01</span>
          </div>
          <div className="p-3 bg-neutral-50 rounded border border-neutral-200">
            <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Operating Zones</span>
            <span className="font-semibold text-navy-900">10 Departments</span>
          </div>
          <div className="p-3 bg-neutral-50 rounded border border-neutral-200">
            <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Environment</span>
            <span className="font-semibold text-teal-700">Local Prototype (Offline)</span>
          </div>
        </div>
      </div>

      {/* Production Architecture & Integration Mapping */}
      <div className="bg-white border border-neutral-200 rounded-md p-5 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-navy-900">Production Integration Mapping</h2>
          <p className="text-xs text-navy-500 mt-0.5">
            How this standalone prototype cleanly transitions to live IoT brokers and medical EHR/CMMS backends.
          </p>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded flex items-start gap-3">
            <Server className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-navy-900">Simulation Layer (`src/services/simulation.ts`)</span>
              <p className="text-neutral-600 mt-0.5">
                Replace with WebSocket / MQTT client subscribing to hospital broker topics (e.g.,{' '}
                <code className="text-navy-800 bg-neutral-200 px-1 py-0.2 rounded">devices/&#123;id&#125;/telemetry</code>).
              </p>
            </div>
          </div>

          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded flex items-start gap-3">
            <Layers className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-navy-900">Alert Engine (`src/services/alertEngine.ts`)</span>
              <p className="text-neutral-600 mt-0.5">
                Can either remain on the client for low-latency visual warnings or subscribe to backend CEP (Complex Event Processing) alerts via Server-Sent Events (SSE).
              </p>
            </div>
          </div>

          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded flex items-start gap-3">
            <FileCode className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-navy-900">Equipment & Maintenance Data (`src/data/`)</span>
              <p className="text-neutral-600 mt-0.5">
                Replace with REST or GraphQL endpoints interfacing with the hospital Computerized Maintenance Management System (CMMS) or HL7/FHIR Asset resources.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
