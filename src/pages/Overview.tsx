import React, { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Monitor,
  CheckCircle2,
  WifiOff,
  AlertTriangle,
  Wrench,
  Activity,
  ArrowRight,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { useSimulationStore } from '../store/simulationStore';
import { useAlertStore } from '../store/alertStore';
import { useMaintenanceStore } from '../store/maintenanceStore';
import { MetricCard } from '../components/ui/MetricCard';
import {
  connectivityBadge,
  operationalBadge,
  maintenanceFlagBadge,
  severityBadge,
  alertStatusBadge,
} from '../components/ui/StatusBadge';
import { TrendChart } from '../components/charts/TrendChart';
import { formatDistanceToNow, parseISO } from 'date-fns';

export function Overview() {
  const navigate = useNavigate();
  const equipment = useSimulationStore((s) => s.equipment);
  const readings = useSimulationStore((s) => s.readings);
  const alerts = useAlertStore((s) => s.alerts);
  const tasks = useMaintenanceStore((s) => s.tasks);

  // Operational metrics calculated strictly from live store state
  const totalEquipment = equipment.length;
  const reportingNormally = equipment.filter(
    (e) => e.connectivity === 'online' && e.operationalStatus === 'normal'
  ).length;
  const offlineOrStale = equipment.filter(
    (e) => e.connectivity === 'offline' || e.connectivity === 'intermittent'
  ).length;
  const activeAlerts = alerts.filter((a) => a.status === 'active').length;
  const maintenanceDueCount = tasks.filter(
    (t) => t.status === 'scheduled' || t.status === 'overdue'
  ).length;

  // Equipment requiring attention:
  // Offline, or operationalStatus != 'normal', or maintenanceFlag overdue/due-soon
  const attentionEquipment = useMemo(() => {
    return equipment
      .filter(
        (e) =>
          e.connectivity === 'offline' ||
          e.connectivity === 'intermittent' ||
          e.operationalStatus === 'warning' ||
          e.operationalStatus === 'critical' ||
          e.maintenanceFlag === 'overdue' ||
          e.maintenanceFlag === 'due-soon'
      )
      .slice(0, 6);
  }, [equipment]);

  // Recent events (latest 5 alerts or state changes)
  const recentAlerts = useMemo(() => {
    return [...alerts]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
  }, [alerts]);

  // Sample trend points for Medical Refrigerator MR-001 (or Patient Monitor PM-001)
  const [refrigeratorHistory, setRefrigeratorHistory] = useState<{ time: string; value: number }[]>([]);

  useEffect(() => {
    const mrReading = readings.get('MR-001');
    if (mrReading && mrReading.metrics.temperature !== undefined) {
      const nowStr = new Date(mrReading.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setRefrigeratorHistory((prev) => {
        const next = [...prev, { time: nowStr, value: mrReading.metrics.temperature }];
        return next.slice(-12); // keep last 12 readings
      });
    }
  }, [readings]);

  // Status breakdown calculations
  const operationalBreakdown = useMemo(() => {
    const counts: Record<string, number> = {
      normal: 0,
      warning: 0,
      critical: 0,
      maintenance: 0,
    };
    for (const e of equipment) {
      if (counts[e.operationalStatus] !== undefined) {
        counts[e.operationalStatus]++;
      }
    }
    return counts;
  }, [equipment]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-neutral-200 pb-4">
        <div>
          <h1 className="text-xl font-semibold text-navy-900 tracking-tight">Operations Overview</h1>
          <p className="text-xs text-navy-500 mt-0.5">
            Real-time equipment readiness, telemetry status, and open maintenance tasks across hospital zones.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/monitoring"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-200 hover:border-navy-300 text-navy-700 text-xs font-medium rounded transition-colors"
          >
            <Activity className="w-3.5 h-3.5 text-teal-600" />
            Live Telemetry
          </Link>
          <Link
            to="/alerts"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-navy-900 hover:bg-navy-800 text-white text-xs font-medium rounded transition-colors"
          >
            Review Alerts ({activeAlerts})
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Operational Summary Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <MetricCard
          label="Registered Equipment"
          value={totalEquipment}
          icon={Monitor}
          iconColor="text-navy-500"
          subtitle="All inventoried units"
          onClick={() => navigate('/equipment')}
        />
        <MetricCard
          label="Reporting Normally"
          value={reportingNormally}
          icon={CheckCircle2}
          iconColor="text-teal-600"
          subtitle="Online & nominal status"
          onClick={() => navigate('/equipment')}
        />
        <MetricCard
          label="Offline / Stale"
          value={offlineOrStale}
          icon={WifiOff}
          iconColor="text-amber-600"
          subtitle="Missing heartbeats"
          onClick={() => navigate('/equipment')}
        />
        <MetricCard
          label="Active Alerts"
          value={activeAlerts}
          icon={AlertTriangle}
          iconColor={activeAlerts > 0 ? 'text-red-600' : 'text-neutral-400'}
          subtitle={activeAlerts > 0 ? 'Action required' : 'All clear'}
          onClick={() => navigate('/alerts')}
        />
        <MetricCard
          label="Maintenance Due"
          value={maintenanceDueCount}
          icon={Wrench}
          iconColor="text-navy-600"
          subtitle="Scheduled / overdue"
          onClick={() => navigate('/maintenance')}
        />
      </div>

      {/* Main Grid: Equipment Requiring Attention & Monitoring Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Equipment Requiring Attention */}
        <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-md">
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
            <div>
              <h2 className="text-sm font-semibold text-navy-900">Equipment Requiring Attention</h2>
              <p className="text-xs text-navy-500">
                Units with abnormal operational state, broken heartbeats, or overdue maintenance.
              </p>
            </div>
            <Link
              to="/equipment"
              className="text-xs text-teal-700 hover:text-teal-800 font-medium inline-flex items-center gap-1"
            >
              View inventory <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            {attentionEquipment.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-500">
                All tracked equipment units are currently operating within nominal parameters.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-navy-600 font-medium">
                  <tr>
                    <th className="px-4 py-2">ID & Name</th>
                    <th className="px-3 py-2">Department / Room</th>
                    <th className="px-3 py-2">Connectivity</th>
                    <th className="px-3 py-2">Op Status</th>
                    <th className="px-3 py-2">Maintenance</th>
                    <th className="px-3 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {attentionEquipment.map((eq) => (
                    <tr key={eq.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="px-4 py-2.5">
                        <div className="font-semibold text-navy-900">{eq.id}</div>
                        <div className="text-neutral-500 text-[11px]">{eq.name}</div>
                      </td>
                      <td className="px-3 py-2.5 text-navy-700">
                        <div>{eq.department}</div>
                        <div className="text-neutral-400 text-[11px]">{eq.location}</div>
                      </td>
                      <td className="px-3 py-2.5">{connectivityBadge(eq.connectivity)}</td>
                      <td className="px-3 py-2.5">{operationalBadge(eq.operationalStatus)}</td>
                      <td className="px-3 py-2.5">{maintenanceFlagBadge(eq.maintenanceFlag)}</td>
                      <td className="px-3 py-2.5 text-right">
                        <Link
                          to={`/equipment?id=${eq.id}`}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-teal-700 hover:text-teal-800 hover:underline"
                        >
                          Inspect <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Column: Status Breakdown & Live Telemetry Sample */}
        <div className="space-y-6">
          {/* Status Breakdown card */}
          <div className="bg-white border border-neutral-200 rounded-md p-4">
            <h2 className="text-sm font-semibold text-navy-900 mb-1">Equipment Operational Breakdown</h2>
            <p className="text-xs text-navy-500 mb-3">Health distribution across all {totalEquipment} active devices.</p>
            
            <div className="space-y-2.5">
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-teal-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-teal-500" /> Normal Operation
                  </span>
                  <span className="text-navy-900 font-semibold tabular-nums">
                    {operationalBreakdown.normal} ({Math.round((operationalBreakdown.normal / totalEquipment) * 100 || 0)}%)
                  </span>
                </div>
                <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-teal-500 h-1.5 rounded-full"
                    style={{ width: `${(operationalBreakdown.normal / totalEquipment) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-amber-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" /> Warning Thresholds
                  </span>
                  <span className="text-navy-900 font-semibold tabular-nums">
                    {operationalBreakdown.warning} ({Math.round((operationalBreakdown.warning / totalEquipment) * 100 || 0)}%)
                  </span>
                </div>
                <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-amber-500 h-1.5 rounded-full"
                    style={{ width: `${(operationalBreakdown.warning / totalEquipment) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-red-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500" /> Critical Condition
                  </span>
                  <span className="text-navy-900 font-semibold tabular-nums">
                    {operationalBreakdown.critical} ({Math.round((operationalBreakdown.critical / totalEquipment) * 100 || 0)}%)
                  </span>
                </div>
                <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-red-500 h-1.5 rounded-full"
                    style={{ width: `${(operationalBreakdown.critical / totalEquipment) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-purple-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-500" /> Under Maintenance
                  </span>
                  <span className="text-navy-900 font-semibold tabular-nums">
                    {operationalBreakdown.maintenance} ({Math.round((operationalBreakdown.maintenance / totalEquipment) * 100 || 0)}%)
                  </span>
                </div>
                <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-purple-500 h-1.5 rounded-full"
                    style={{ width: `${(operationalBreakdown.maintenance / totalEquipment) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Telemetry Trend Widget */}
          <div className="bg-white border border-neutral-200 rounded-md p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-xs font-semibold text-navy-900">Cold Storage Telemetry</h3>
                <p className="text-[11px] text-navy-400">MR-001 (Pharmacy Refrigerator)</p>
              </div>
              <span className="text-[10px] bg-teal-50 text-teal-700 border border-teal-200 px-1.5 py-0.5 rounded font-mono">
                Live stream
              </span>
            </div>
            <div className="pt-2">
              <TrendChart
                data={
                  refrigeratorHistory.length > 0
                    ? refrigeratorHistory
                    : [
                        { time: '12:00', value: 4.1 },
                        { time: '12:01', value: 4.2 },
                        { time: '12:02', value: 4.0 },
                        { time: '12:03', value: 4.3 },
                      ]
                }
                label="Chamber Temperature"
                unit="°C"
                color="#1fa88a"
                warningHigh={6.0}
                criticalHigh={8.0}
                height={130}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lower Section: Recent Operational Events */}
      <div className="bg-white border border-neutral-200 rounded-md">
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
          <div>
            <h2 className="text-sm font-semibold text-navy-900">Recent Alerts & System Events</h2>
            <p className="text-xs text-navy-500">Live chronological feed of threshold breaches and connectivity signals.</p>
          </div>
          <Link
            to="/alerts"
            className="text-xs text-teal-700 hover:text-teal-800 font-medium inline-flex items-center gap-1"
          >
            All alerts & audit trail <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="divide-y divide-neutral-200 text-xs">
          {recentAlerts.length === 0 ? (
            <div className="py-6 text-center text-xs text-neutral-500">
              No recent events logged in current demo session.
            </div>
          ) : (
            recentAlerts.map((alert) => (
              <div key={alert.id} className="p-3 px-4 flex items-start justify-between gap-4 hover:bg-neutral-50/70">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {severityBadge(alert.severity)}
                    <span className="font-semibold text-navy-900">{alert.title}</span>
                    <span className="text-neutral-400">•</span>
                    <span className="text-navy-500 font-medium">{alert.equipmentName}</span>
                  </div>
                  <p className="text-navy-600 text-xs">{alert.description}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0 text-right">
                  <div>{alertStatusBadge(alert.status)}</div>
                  <div className="flex items-center gap-1 text-[11px] text-neutral-400 tabular-nums">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(parseISO(alert.timestamp), { addSuffix: true })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
