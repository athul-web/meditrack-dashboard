import React, { useState, useMemo } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
  Clock,
  ShieldCheck,
  Check,
  RotateCcw,
  User,
  Filter,
} from 'lucide-react';
import { useAlertStore } from '../store/alertStore';
import { useSimulationStore } from '../store/simulationStore';
import { Alert, AlertSeverity, AlertStatus } from '../types/alerts';
import {
  severityBadge,
  alertStatusBadge,
} from '../components/ui/StatusBadge';
import { SearchInput } from '../components/ui/SearchInput';
import { FilterDropdown } from '../components/ui/FilterDropdown';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { format, parseISO } from 'date-fns';

export function AlertsEvents() {
  const alerts = useAlertStore((s) => s.alerts);
  const acknowledgeAlert = useAlertStore((s) => s.acknowledgeAlert);
  const resolveAlert = useAlertStore((s) => s.resolveAlert);
  const clearResolved = useAlertStore((s) => s.clearResolved);
  const equipment = useSimulationStore((s) => s.equipment);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterEquipment, setFilterEquipment] = useState('all');

  // Selected Alert for modal
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  // Metrics
  const activeCount = alerts.filter((a) => a.status === 'active').length;
  const criticalCount = alerts.filter((a) => a.severity === 'critical' && a.status === 'active').length;
  const acknowledgedCount = alerts.filter((a) => a.status === 'acknowledged').length;
  const resolvedCount = alerts.filter((a) => a.status === 'resolved').length;

  // Equipment options for filter
  const equipmentList = useMemo(() => {
    const ids = Array.from(new Set(alerts.map((a) => a.equipmentId)));
    return ['all', ...ids];
  }, [alerts]);

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      const matchesSearch =
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.equipmentId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSeverity = filterSeverity === 'all' || a.severity === filterSeverity;
      const matchesStatus = filterStatus === 'all' || a.status === filterStatus;
      const matchesEquip = filterEquipment === 'all' || a.equipmentId === filterEquipment;

      return matchesSearch && matchesSeverity && matchesStatus && matchesEquip;
    });
  }, [alerts, searchTerm, filterSeverity, filterStatus, filterEquipment]);

  const handleAcknowledge = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    acknowledgeAlert(id, 'Current Operator');
    if (selectedAlert?.id === id) {
      setSelectedAlert((prev) =>
        prev
          ? {
              ...prev,
              status: 'acknowledged',
              acknowledgedAt: new Date().toISOString(),
              acknowledgedBy: 'Current Operator',
            }
          : null
      );
    }
  };

  const handleResolve = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    resolveAlert(id, 'Current Operator');
    if (selectedAlert?.id === id) {
      setSelectedAlert((prev) =>
        prev
          ? {
              ...prev,
              status: 'resolved',
              resolvedAt: new Date().toISOString(),
              resolvedBy: 'Current Operator',
            }
          : null
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-neutral-200 pb-3">
        <div>
          <h1 className="text-xl font-semibold text-navy-900 tracking-tight">Alerts & System Events</h1>
          <p className="text-xs text-navy-500 mt-0.5">
            Real-time telemetry threshold violations, connectivity anomalies, and operator acknowledgement log.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {resolvedCount > 0 && (
            <button
              onClick={clearResolved}
              className="text-xs text-neutral-600 hover:text-navy-900 bg-white border border-neutral-200 px-2.5 py-1.5 rounded transition-colors"
            >
              Clear Resolved ({resolvedCount})
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-neutral-200 rounded p-3">
          <span className="text-[10px] text-neutral-400 uppercase font-semibold">Active Alerts</span>
          <div className="text-lg font-bold text-red-600 mt-0.5">{activeCount}</div>
        </div>
        <div className="bg-white border border-neutral-200 rounded p-3">
          <span className="text-[10px] text-neutral-400 uppercase font-semibold">Critical Priority</span>
          <div className="text-lg font-bold text-red-700 mt-0.5">{criticalCount}</div>
        </div>
        <div className="bg-white border border-neutral-200 rounded p-3">
          <span className="text-[10px] text-neutral-400 uppercase font-semibold">Acknowledged</span>
          <div className="text-lg font-bold text-amber-600 mt-0.5">{acknowledgedCount}</div>
        </div>
        <div className="bg-white border border-neutral-200 rounded p-3">
          <span className="text-[10px] text-neutral-400 uppercase font-semibold">Resolved in Session</span>
          <div className="text-lg font-bold text-teal-700 mt-0.5">{resolvedCount}</div>
        </div>
      </div>

      {/* Toolbar: Search and Filters */}
      <div className="bg-white border border-neutral-200 rounded-md p-3 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex-1 max-w-sm">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search alerts by title, device, or ID…"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FilterDropdown
            label="Severity"
            value={filterSeverity}
            options={[
              { value: 'all', label: 'All Severities' },
              { value: 'critical', label: 'Critical' },
              { value: 'warning', label: 'Warning' },
              { value: 'info', label: 'Info' },
            ]}
            onChange={setFilterSeverity}
          />

          <FilterDropdown
            label="Status"
            value={filterStatus}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'active', label: 'Active' },
              { value: 'acknowledged', label: 'Acknowledged' },
              { value: 'resolved', label: 'Resolved' },
            ]}
            onChange={setFilterStatus}
          />

          <FilterDropdown
            label="Device"
            value={filterEquipment}
            options={equipmentList.map((id) => ({
              value: id,
              label: id === 'all' ? 'All Devices' : id,
            }))}
            onChange={setFilterEquipment}
          />
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-white border border-neutral-200 rounded-md overflow-hidden">
        {filteredAlerts.length === 0 ? (
          <EmptyState
            title="No alerts match the filter criteria"
            description="Active simulation conditions will automatically register here as threshold breaches occur."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-navy-700 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">Severity</th>
                  <th className="px-3 py-3">Event Title & Details</th>
                  <th className="px-3 py-3">Source Equipment</th>
                  <th className="px-3 py-3">Category</th>
                  <th className="px-3 py-3">Timestamp</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredAlerts.map((alert) => (
                  <tr
                    key={alert.id}
                    onClick={() => setSelectedAlert(alert)}
                    className="hover:bg-neutral-50/80 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">{severityBadge(alert.severity)}</td>
                    <td className="px-3 py-3">
                      <div className="font-semibold text-navy-900">{alert.title}</div>
                      <div className="text-neutral-500 text-[11px] max-w-md truncate">
                        {alert.description}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-medium text-navy-900">{alert.equipmentName}</div>
                      <div className="font-mono text-neutral-400 text-[11px]">{alert.equipmentId}</div>
                    </td>
                    <td className="px-3 py-3 capitalize text-navy-600">{alert.category}</td>
                    <td className="px-3 py-3 font-mono text-[11px] text-navy-600">
                      {format(parseISO(alert.timestamp), 'HH:mm:ss · dd MMM')}
                    </td>
                    <td className="px-3 py-3">{alertStatusBadge(alert.status)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {alert.status === 'active' && (
                          <button
                            onClick={(e) => handleAcknowledge(alert.id, e)}
                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded text-[11px] font-medium"
                          >
                            Acknowledge
                          </button>
                        )}
                        {alert.status !== 'resolved' && (
                          <button
                            onClick={(e) => handleResolve(alert.id, e)}
                            className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded text-[11px] font-medium"
                          >
                            Resolve
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedAlert(alert)}
                          className="px-2 py-1 text-neutral-500 hover:text-navy-900 text-[11px] underline"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <Modal
          open={!!selectedAlert}
          onClose={() => setSelectedAlert(null)}
          title={`Incident Audit Log — ${selectedAlert.id}`}
          width="max-w-lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {severityBadge(selectedAlert.severity)}
                  <span className="font-semibold text-navy-900 text-sm">{selectedAlert.title}</span>
                </div>
                {alertStatusBadge(selectedAlert.status)}
              </div>
              <p className="text-navy-700 leading-relaxed">{selectedAlert.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 border border-neutral-200 rounded">
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Source Device</span>
                <span className="font-semibold text-navy-900">{selectedAlert.equipmentName}</span>
                <span className="text-neutral-500 block font-mono">ID: {selectedAlert.equipmentId}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Classification</span>
                <span className="font-medium capitalize text-navy-800">{selectedAlert.category}</span>
              </div>
            </div>

            {/* Lifecycle Audit Timestamps */}
            <div className="space-y-2 border-t border-neutral-200 pt-3">
              <span className="text-neutral-400 block text-[10px] uppercase font-semibold">
                Event Lifecycle History
              </span>
              <div className="space-y-1.5 text-neutral-600">
                <div className="flex justify-between">
                  <span>Triggered:</span>
                  <span className="font-mono text-navy-900">
                    {format(parseISO(selectedAlert.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Acknowledged:</span>
                  <span className="font-mono text-navy-900">
                    {selectedAlert.acknowledgedAt
                      ? `${format(parseISO(selectedAlert.acknowledgedAt), 'yyyy-MM-dd HH:mm:ss')} (${selectedAlert.acknowledgedBy})`
                      : 'Not yet acknowledged'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Resolved:</span>
                  <span className="font-mono text-navy-900">
                    {selectedAlert.resolvedAt
                      ? `${format(parseISO(selectedAlert.resolvedAt), 'yyyy-MM-dd HH:mm:ss')} (${selectedAlert.resolvedBy})`
                      : 'Unresolved / In progress'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons in Modal */}
            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200">
              {selectedAlert.status === 'active' && (
                <button
                  onClick={() => handleAcknowledge(selectedAlert.id)}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded font-medium"
                >
                  Acknowledge Incident
                </button>
              )}
              {selectedAlert.status !== 'resolved' && (
                <button
                  onClick={() => handleResolve(selectedAlert.id)}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded font-medium"
                >
                  Mark as Resolved
                </button>
              )}
              <button
                onClick={() => setSelectedAlert(null)}
                className="px-3 py-1.5 border border-neutral-200 text-neutral-600 rounded hover:bg-neutral-50"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
