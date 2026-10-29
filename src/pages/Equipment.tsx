import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  ArrowUpDown,
  SlidersHorizontal,
  Info,
  Calendar,
  Cpu,
  ShieldAlert,
  Activity,
  X,
  ExternalLink,
} from 'lucide-react';
import { useSimulationStore } from '../store/simulationStore';
import { Equipment as EquipmentType } from '../types/equipment';
import {
  connectivityBadge,
  operationalBadge,
  maintenanceFlagBadge,
} from '../components/ui/StatusBadge';
import { SearchInput } from '../components/ui/SearchInput';
import { FilterDropdown } from '../components/ui/FilterDropdown';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { format, parseISO } from 'date-fns';

type SortField = 'id' | 'name' | 'department' | 'connectivity' | 'operationalStatus' | 'lastCommunication';

export function Equipment() {
  const [searchParams, setSearchParams] = useSearchParams();
  const equipment = useSimulationStore((s) => s.equipment);
  const readings = useSimulationStore((s) => s.readings);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedConnectivity, setSelectedConnectivity] = useState('all');
  const [selectedOpStatus, setSelectedOpStatus] = useState('all');
  const [selectedMaintFlag, setSelectedMaintFlag] = useState('all');

  // Sorting state
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortAsc, setSortAsc] = useState(true);

  // Selected equipment for detail modal
  const selectedIdFromUrl = searchParams.get('id');
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType | null>(null);

  // Synchronize modal with URL param if present
  React.useEffect(() => {
    if (selectedIdFromUrl) {
      const match = equipment.find((e) => e.id === selectedIdFromUrl);
      if (match) setSelectedEquipment(match);
    }
  }, [selectedIdFromUrl, equipment]);

  // Unique departments for filter
  const departmentsList = useMemo(() => {
    const set = new Set(equipment.map((e) => e.department));
    return ['all', ...Array.from(set)];
  }, [equipment]);

  // Filtering & Sorting
  const filteredEquipment = useMemo(() => {
    return equipment
      .filter((eq) => {
        const matchesSearch =
          eq.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          eq.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          eq.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          eq.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDept = selectedDept === 'all' || eq.department === selectedDept;
        const matchesConn = selectedConnectivity === 'all' || eq.connectivity === selectedConnectivity;
        const matchesOp = selectedOpStatus === 'all' || eq.operationalStatus === selectedOpStatus;
        const matchesMaint = selectedMaintFlag === 'all' || eq.maintenanceFlag === selectedMaintFlag;

        return matchesSearch && matchesDept && matchesConn && matchesOp && matchesMaint;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (sortField === 'lastCommunication') {
          valA = new Date(valA).getTime() as any;
          valB = new Date(valB).getTime() as any;
        }
        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [
    equipment,
    searchTerm,
    selectedDept,
    selectedConnectivity,
    selectedOpStatus,
    selectedMaintFlag,
    sortField,
    sortAsc,
  ]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleOpenDetail = (eq: EquipmentType) => {
    setSelectedEquipment(eq);
    setSearchParams({ id: eq.id });
  };

  const handleCloseDetail = () => {
    setSelectedEquipment(null);
    setSearchParams({});
  };

  // Live telemetry for selected equipment
  const activeReading = selectedEquipment ? readings.get(selectedEquipment.id) : null;

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-neutral-200 pb-3">
        <div>
          <h1 className="text-xl font-semibold text-navy-900 tracking-tight">Equipment Inventory</h1>
          <p className="text-xs text-navy-500 mt-0.5">
            Operational registry of biomedical devices, telemetry link integrity, and maintenance schedules.
          </p>
        </div>
        <div className="text-xs text-navy-600 bg-white border border-neutral-200 px-3 py-1.5 rounded font-medium">
          Showing <span className="font-bold text-navy-900">{filteredEquipment.length}</span> of {equipment.length} assets
        </div>
      </div>

      {/* Control Toolbar: Search & Filters */}
      <div className="bg-white border border-neutral-200 rounded-md p-3 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="flex-1 max-w-md">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by ID, model, type, or serial number…"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <FilterDropdown
              label="Department"
              value={selectedDept}
              options={departmentsList.map((d) => ({
                value: d,
                label: d === 'all' ? 'All Departments' : d,
              }))}
              onChange={setSelectedDept}
            />

            <FilterDropdown
              label="Connectivity"
              value={selectedConnectivity}
              options={[
                { value: 'all', label: 'All Links' },
                { value: 'online', label: 'Online' },
                { value: 'offline', label: 'Offline' },
                { value: 'intermittent', label: 'Intermittent' },
              ]}
              onChange={setSelectedConnectivity}
            />

            <FilterDropdown
              label="Op Status"
              value={selectedOpStatus}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'normal', label: 'Normal' },
                { value: 'warning', label: 'Warning' },
                { value: 'critical', label: 'Critical' },
                { value: 'maintenance', label: 'In Maintenance' },
              ]}
              onChange={setSelectedOpStatus}
            />

            <FilterDropdown
              label="Maintenance"
              value={selectedMaintFlag}
              options={[
                { value: 'all', label: 'All Flags' },
                { value: 'up-to-date', label: 'Up to Date' },
                { value: 'due-soon', label: 'Due Soon' },
                { value: 'overdue', label: 'Overdue' },
                { value: 'in-progress', label: 'In Progress' },
              ]}
              onChange={setSelectedMaintFlag}
            />

            {(searchTerm ||
              selectedDept !== 'all' ||
              selectedConnectivity !== 'all' ||
              selectedOpStatus !== 'all' ||
              selectedMaintFlag !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedDept('all');
                  setSelectedConnectivity('all');
                  setSelectedOpStatus('all');
                  setSelectedMaintFlag('all');
                }}
                className="text-xs text-neutral-500 hover:text-navy-900 px-2 py-1 underline font-medium"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Equipment Data Table */}
      <div className="bg-white border border-neutral-200 rounded-md overflow-hidden">
        {filteredEquipment.length === 0 ? (
          <EmptyState
            title="No matching equipment found"
            description="Try adjusting your search terms or filter selections."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-navy-700 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th
                    className="px-4 py-3 cursor-pointer hover:bg-neutral-100/70"
                    onClick={() => toggleSort('id')}
                  >
                    <div className="flex items-center gap-1">
                      Equipment ID <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                    </div>
                  </th>
                  <th
                    className="px-3 py-3 cursor-pointer hover:bg-neutral-100/70"
                    onClick={() => toggleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      Device & Model <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                    </div>
                  </th>
                  <th
                    className="px-3 py-3 cursor-pointer hover:bg-neutral-100/70"
                    onClick={() => toggleSort('department')}
                  >
                    <div className="flex items-center gap-1">
                      Department / Room <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                    </div>
                  </th>
                  <th
                    className="px-3 py-3 cursor-pointer hover:bg-neutral-100/70"
                    onClick={() => toggleSort('connectivity')}
                  >
                    <div className="flex items-center gap-1">
                      Link Status <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                    </div>
                  </th>
                  <th
                    className="px-3 py-3 cursor-pointer hover:bg-neutral-100/70"
                    onClick={() => toggleSort('operationalStatus')}
                  >
                    <div className="flex items-center gap-1">
                      Operational State <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                    </div>
                  </th>
                  <th
                    className="px-3 py-3 cursor-pointer hover:bg-neutral-100/70"
                    onClick={() => toggleSort('lastCommunication')}
                  >
                    <div className="flex items-center gap-1">
                      Last Heartbeat <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                    </div>
                  </th>
                  <th className="px-3 py-3">Maintenance</th>
                  <th className="px-4 py-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredEquipment.map((eq) => (
                  <tr
                    key={eq.id}
                    onClick={() => handleOpenDetail(eq)}
                    className="hover:bg-neutral-50/80 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-semibold text-navy-900">{eq.id}</td>
                    <td className="px-3 py-3">
                      <div className="font-medium text-navy-800">{eq.name}</div>
                      <div className="text-neutral-500 text-[11px]">
                        {eq.model} • SN: {eq.serialNumber}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-navy-700">
                      <div>{eq.department}</div>
                      <div className="text-neutral-400 text-[11px]">{eq.location}</div>
                    </td>
                    <td className="px-3 py-3">{connectivityBadge(eq.connectivity)}</td>
                    <td className="px-3 py-3">{operationalBadge(eq.operationalStatus)}</td>
                    <td className="px-3 py-3 font-mono text-[11px] text-navy-600">
                      {format(parseISO(eq.lastCommunication), 'HH:mm:ss · dd MMM')}
                    </td>
                    <td className="px-3 py-3">{maintenanceFlagBadge(eq.maintenanceFlag)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetail(eq);
                        }}
                        className="text-teal-700 hover:text-teal-800 font-medium text-[11px] hover:underline"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Equipment Detail Modal */}
      {selectedEquipment && (
        <Modal
          open={!!selectedEquipment}
          onClose={handleCloseDetail}
          title={`Equipment Record — ${selectedEquipment.id} (${selectedEquipment.name})`}
          width="max-w-2xl"
        >
          <div className="space-y-5 text-xs">
            {/* Caution Banner about clinical validation */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-800 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Operator Notice:</span> A sensor reading, device
                heartbeat, or electrical connection alone does not prove that a medical device is
                clinically safe, functioning correctly, or ready for patient use. Technical link status
                must be verified independently by biomedical engineering before deployment.
              </div>
            </div>

            {/* General Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-neutral-50 border border-neutral-200 rounded">
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Equipment Type</span>
                <span className="font-medium text-navy-900">{selectedEquipment.type}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Model</span>
                <span className="font-medium text-navy-900">{selectedEquipment.model}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Serial Number</span>
                <span className="font-mono text-navy-900">{selectedEquipment.serialNumber}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Assigned Dept</span>
                <span className="font-medium text-navy-900">{selectedEquipment.department}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Room / Location</span>
                <span className="font-medium text-navy-900">{selectedEquipment.location}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Firmware Version</span>
                <span className="font-mono text-navy-900">{selectedEquipment.firmwareVersion}</span>
              </div>
            </div>

            {/* Status & Maintenance Overview */}
            <div className="grid grid-cols-3 gap-3 border border-neutral-200 rounded p-3">
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-semibold mb-1">Link Status</span>
                {connectivityBadge(selectedEquipment.connectivity)}
              </div>
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-semibold mb-1">Operational State</span>
                {operationalBadge(selectedEquipment.operationalStatus)}
              </div>
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-semibold mb-1">Maintenance Flag</span>
                {maintenanceFlagBadge(selectedEquipment.maintenanceFlag)}
              </div>
            </div>

            {/* Live Telemetry Readings if available */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-navy-900 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-teal-600" />
                  Live IoT Telemetry Channels
                </h4>
                {activeReading && (
                  <span className="text-[11px] text-neutral-400 font-mono">
                    Last sample: {format(parseISO(activeReading.timestamp), 'HH:mm:ss')}
                  </span>
                )}
              </div>

              {activeReading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(activeReading.metrics).map(([key, val]) => (
                    <div key={key} className="p-2.5 bg-neutral-50 border border-neutral-200 rounded">
                      <div className="text-[10px] uppercase text-neutral-500 font-semibold tracking-wider">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </div>
                      <div className="text-base font-bold text-navy-900 mt-1 tabular-nums">
                        {typeof val === 'number' ? val.toFixed(1) : val}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-neutral-50 border border-neutral-200 rounded text-center text-neutral-500">
                  No active telemetry stream configured or device is currently offline.
                </div>
              )}
            </div>

            {/* Maintenance & Installation history */}
            <div className="space-y-1.5 border-t border-neutral-200 pt-3">
              <div className="flex justify-between text-neutral-600">
                <span>Commission Date:</span>
                <span className="font-mono text-navy-900">{selectedEquipment.installDate}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Next Scheduled Maintenance:</span>
                <span className="font-mono text-navy-900">{selectedEquipment.nextMaintenanceDate}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Last Telemetry Heartbeat:</span>
                <span className="font-mono text-navy-900">{selectedEquipment.lastCommunication}</span>
              </div>
            </div>

            {/* Engineer Notes */}
            {selectedEquipment.notes && (
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded">
                <span className="text-neutral-400 block text-[10px] uppercase font-semibold mb-1">
                  Biomedical Engineering Notes
                </span>
                <p className="text-navy-800 leading-relaxed">{selectedEquipment.notes}</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
