import React, { useState, useMemo } from 'react';
import {
  Package,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Clock,
  UserCheck,
  Wind,
  Zap,
  ThermometerSnowflake,
  Droplets,
  Trash,
  Info,
} from 'lucide-react';
import { demoResources } from '../data/resources';
import { Resource, ResourceCategory, ResourceCondition } from '../types/resources';
import { StatusBadge } from '../components/ui/StatusBadge';
import { FilterDropdown } from '../components/ui/FilterDropdown';
import { Modal } from '../components/ui/Modal';
import { format, parseISO } from 'date-fns';

export function ResourceStatus() {
  const [resources, setResources] = useState<Resource[]>(demoResources);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterCondition, setFilterCondition] = useState('all');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  const filtered = useMemo(() => {
    return resources.filter((r) => {
      const matchCat = filterCategory === 'all' || r.category === filterCategory;
      const matchCond = filterCondition === 'all' || r.condition === filterCondition;
      return matchCat && matchCond;
    });
  }, [resources, filterCategory, filterCondition]);

  const getCategoryIcon = (cat: ResourceCategory) => {
    switch (cat) {
      case 'medical-gas':
        return <Wind className="w-4 h-4 text-blue-500" />;
      case 'power':
        return <Zap className="w-4 h-4 text-amber-500" />;
      case 'hvac':
        return <ThermometerSnowflake className="w-4 h-4 text-teal-500" />;
      case 'water':
        return <Droplets className="w-4 h-4 text-cyan-500" />;
      case 'waste-management':
        return <Trash className="w-4 h-4 text-neutral-500" />;
    }
  };

  const getConditionBadge = (cond: ResourceCondition) => {
    switch (cond) {
      case 'normal':
        return <StatusBadge variant="success">Normal</StatusBadge>;
      case 'attention-needed':
        return <StatusBadge variant="warning" dot>Attention Needed</StatusBadge>;
      case 'critical':
        return <StatusBadge variant="error" dot>Critical State</StatusBadge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-neutral-200 pb-3">
        <div>
          <h1 className="text-xl font-semibold text-navy-900 tracking-tight">Facility Resource Status</h1>
          <p className="text-xs text-navy-500 mt-0.5">
            Hospital plant utilities, gases, continuous power, and environmental differential isolation monitoring.
          </p>
        </div>
      </div>

      {/* Critical Disclaimer Banner */}
      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-900 space-y-1">
        <div className="flex items-center gap-2 font-semibold">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Fictional Demonstration Data — Mandatory Human Verification Protocol</span>
        </div>
        <p className="text-amber-800 leading-relaxed text-[11px]">
          Hospital clinical operations, patient bed capacity, blood bank supplies, ICU readiness, and emergency
          preparedness must <strong>never</strong> be inferred from IoT telemetry heartbeats alone. All facility parameters
          displayed below require certified physical log sign-offs by licensed facility engineers and nursing supervisors.
        </p>
      </div>

      {/* Toolbar / Filters */}
      <div className="bg-white border border-neutral-200 rounded-md p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-medium text-navy-600">
          <span>Infrastructure Utilities:</span>
          <span className="font-bold text-navy-900">{filtered.length} systems tracked</span>
        </div>

        <div className="flex items-center gap-2">
          <FilterDropdown
            label="Category"
            value={filterCategory}
            options={[
              { value: 'all', label: 'All Categories' },
              { value: 'medical-gas', label: 'Medical Gas' },
              { value: 'power', label: 'Power & Grid' },
              { value: 'hvac', label: 'HVAC & Air' },
              { value: 'water', label: 'Purified Water' },
              { value: 'waste-management', label: 'Medical Waste' },
            ]}
            onChange={setFilterCategory}
          />

          <FilterDropdown
            label="Condition"
            value={filterCondition}
            options={[
              { value: 'all', label: 'All Conditions' },
              { value: 'normal', label: 'Normal' },
              { value: 'attention-needed', label: 'Attention Needed' },
              { value: 'critical', label: 'Critical' },
            ]}
            onChange={setFilterCondition}
          />
        </div>
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map((res) => (
          <div
            key={res.id}
            onClick={() => setSelectedResource(res)}
            className="bg-white border border-neutral-200 rounded-md p-4 flex flex-col justify-between hover:border-navy-300 cursor-pointer transition-colors"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-neutral-100 rounded">{getCategoryIcon(res.category)}</div>
                  <div>
                    <h3 className="text-xs font-semibold text-navy-900">{res.name}</h3>
                    <span className="text-[10px] text-neutral-400 font-mono">{res.id}</span>
                  </div>
                </div>
                {getConditionBadge(res.condition)}
              </div>

              <div className="my-3">
                <div className="text-2xl font-bold text-navy-900 tabular-nums">
                  {res.currentValue}{' '}
                  <span className="text-xs font-normal text-neutral-500">{res.unit}</span>
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5">
                  Nominal range: {res.normalRange.min} – {res.normalRange.max} {res.unit}
                </div>
              </div>

              <div className="text-[11px] text-navy-600 bg-neutral-50 p-2 rounded border border-neutral-100 mb-3">
                <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Location</span>
                {res.location}
              </div>
            </div>

            {/* Verification Footer */}
            <div className="border-t border-neutral-100 pt-2.5 text-[10px] text-neutral-500 space-y-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-navy-600 font-medium">
                  <UserCheck className="w-3 h-3 text-teal-600" />
                  {res.verifiedBy}
                </span>
                <span className="font-mono">
                  {format(parseISO(res.lastVerified), 'HH:mm · dd MMM')}
                </span>
              </div>
              <div className="text-right text-[9px] text-teal-700 font-medium">
                Physical Log Verified
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Resource Detail Modal */}
      {selectedResource && (
        <Modal
          open={!!selectedResource}
          onClose={() => setSelectedResource(null)}
          title={`Resource Verification Record — ${selectedResource.name} (${selectedResource.id})`}
          width="max-w-lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded grid grid-cols-2 gap-3">
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Category</span>
                <span className="font-medium capitalize text-navy-900">{selectedResource.category.replace('-', ' ')}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Condition</span>
                {getConditionBadge(selectedResource.condition)}
              </div>
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Plant Location</span>
                <span className="font-medium text-navy-900">{selectedResource.location}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Current Value</span>
                <span className="font-bold text-navy-900 tabular-nums">
                  {selectedResource.currentValue} {selectedResource.unit}
                </span>
              </div>
            </div>

            <div className="p-3 bg-white border border-neutral-200 rounded space-y-1">
              <span className="text-neutral-400 block text-[10px] uppercase font-semibold">
                Facility Engineering Log Notes
              </span>
              <p className="text-navy-800 leading-relaxed">
                {selectedResource.notes || 'No current exceptions logged for this utility line.'}
              </p>
            </div>

            <div className="p-3 bg-teal-50/50 border border-teal-200 rounded space-y-1.5">
              <span className="text-teal-900 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                Staff Verification Sign-off
              </span>
              <div className="flex justify-between text-neutral-600">
                <span>Certified Engineer:</span>
                <span className="font-semibold text-navy-900">{selectedResource.verifiedBy}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Verified At:</span>
                <span className="font-mono text-navy-900">
                  {format(parseISO(selectedResource.lastVerified), 'yyyy-MM-dd HH:mm:ss')}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-neutral-200">
              <button
                onClick={() => setSelectedResource(null)}
                className="px-3 py-1.5 bg-navy-900 text-white rounded hover:bg-navy-800 text-xs font-medium"
              >
                Close Record
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
