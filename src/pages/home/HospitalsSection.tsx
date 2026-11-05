import React, { useState, useMemo } from 'react';
import {
  MapPin,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Building,
  RotateCcw,
  Activity,
  CheckCircle2,
  X,
  Radio,
  Sparkles,
} from 'lucide-react';
import { HospitalCard } from './HospitalCard';
import { HospitalFilterSidebar } from './HospitalFilterSidebar';
import { HospitalDetailsModal } from './HospitalDetailsModal';
import type { DemoHospital, SortOption, FilterState } from '../../types/hospital';

interface HospitalsSectionProps {
  hospitals: DemoHospital[];
  rightSidebar?: React.ReactNode;
}

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'Nearest', label: 'Nearest First' },
  { id: 'Farthest', label: 'Farthest First' },
  { id: 'Highest Availability', label: 'Highest Availability' },
  { id: 'Recently Updated', label: 'Recently Updated' },
];

const DEFAULT_FILTERS: FilterState = {
  resourceTypes: [],
  availabilityStatus: 'all',
  maxDistanceKm: null,
};

export function HospitalsSection({ hospitals, rightSidebar }: HospitalsSectionProps) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState<SortOption>('Nearest');
  const [sortOpen, setSortOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<DemoHospital | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(4);

  // Reset to page 1 whenever filters or sorting changes
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
  };

  // Filter and sort hospitals
  const filteredAndSortedHospitals = useMemo(() => {
    let list = [...hospitals];

    // Filter by resource types
    if (filters.resourceTypes.length > 0) {
      list = list.filter((h) =>
        filters.resourceTypes.every((type) => h.tags.includes(type))
      );
    }

    // Filter by availability status
    if (filters.availabilityStatus === 'available') {
      list = list.filter((h) => {
        const icu = h.resources.find((r) => r.tag === 'ICU');
        return icu ? icu.available > 3 : true;
      });
    } else if (filters.availabilityStatus === 'limited') {
      list = list.filter((h) => {
        const icu = h.resources.find((r) => r.tag === 'ICU');
        return icu ? icu.available <= 3 : false;
      });
    }

    // Filter by distance
    if (filters.maxDistanceKm !== null) {
      list = list.filter((h) => h.distanceKm <= (filters.maxDistanceKm as number));
    }

    // Sorting
    if (sortBy === 'Nearest') {
      list.sort((a, b) => a.distanceKm - b.distanceKm);
    } else if (sortBy === 'Farthest') {
      list.sort((a, b) => b.distanceKm - a.distanceKm);
    } else if (sortBy === 'Highest Availability') {
      list.sort((a, b) => {
        const totalA = a.resources.reduce((sum, r) => sum + r.available, 0);
        const totalB = b.resources.reduce((sum, r) => sum + r.available, 0);
        return totalB - totalA;
      });
    } else if (sortBy === 'Recently Updated') {
      list.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
    }

    return list;
  }, [hospitals, filters, sortBy]);

  // Paginated items
  const totalCount = filteredAndSortedHospitals.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalCount);
  const currentHospitals = filteredAndSortedHospitals.slice(startIndex, endIndex);

  // Active filter chips
  const activeChips: { id: string; label: string; onRemove: () => void }[] = [];

  filters.resourceTypes.forEach((type) => {
    activeChips.push({
      id: `resource-${type}`,
      label: type === 'ICU' ? 'ICU Beds' : type === 'Emergency' ? '24/7 Emergency' : type,
      onRemove: () => {
        handleFilterChange({
          ...filters,
          resourceTypes: filters.resourceTypes.filter((t) => t !== type),
        });
      },
    });
  });

  if (filters.availabilityStatus === 'available') {
    activeChips.push({
      id: 'avail-available',
      label: 'Status: Available Now',
      onRemove: () => handleFilterChange({ ...filters, availabilityStatus: 'all' }),
    });
  } else if (filters.availabilityStatus === 'limited') {
    activeChips.push({
      id: 'avail-limited',
      label: 'Status: Limited Capacity',
      onRemove: () => handleFilterChange({ ...filters, availabilityStatus: 'all' }),
    });
  }

  if (filters.maxDistanceKm !== null) {
    activeChips.push({
      id: `dist-${filters.maxDistanceKm}`,
      label: `Within ${filters.maxDistanceKm} km`,
      onRemove: () => handleFilterChange({ ...filters, maxDistanceKm: null }),
    });
  }

  return (
    <section id="hospitals" className="scroll-mt-24 space-y-6">
      {/* 4. PAGE HEADER: Professional Healthcare SaaS Banner */}
      <div
        className="rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-[#087D91]/30"
        style={{
          background: 'linear-gradient(135deg, #001525 0%, #063B56 50%, #073B55 100%)',
        }}
      >
        {/* Subtle decorative medical cross accent background */}
        <div
          className="absolute -right-8 -top-8 w-64 h-64 rounded-full pointer-events-none opacity-10"
          style={{
            background: 'radial-gradient(circle, #00D5E8 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            {/* Live Network Status Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#00D5E8]/15 border border-[#00D5E8]/40 text-[#00D5E8] mb-3 backdrop-blur-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D5E8] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00D5E8]" />
              </span>
              <span>Network Live • 24/7 Monitoring</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
              Verified Healthcare Facilities
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Real-time resource discovery for intensive care, ventilators, oxygen supplies, and critical emergency units.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-4 sm:gap-6 bg-white/5 border border-white/10 rounded-xl px-5 py-3 backdrop-blur-xs shrink-0">
            <div>
              <div className="text-2xl font-black text-[#00D5E8]">{hospitals.length}</div>
              <div className="text-[11px] text-slate-300 font-medium uppercase tracking-wider">
                Facilities
              </div>
            </div>
            <div className="w-px h-8 bg-white/15" />
            <div>
              <div className="text-2xl font-black text-white">99.8%</div>
              <div className="text-[11px] text-slate-300 font-medium uppercase tracking-wider">
                Uptime
              </div>
            </div>
            <div className="w-px h-8 bg-white/15" />
            <div>
              <div className="text-2xl font-black text-emerald-400">Live</div>
              <div className="text-[11px] text-slate-300 font-medium uppercase tracking-wider">
                Telemetry
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Emergency & Staff sidebars if provided */}
        {rightSidebar && (
          <aside className="lg:col-span-3 flex flex-col gap-6 lg:sticky lg:top-24 w-full">
            {rightSidebar}
          </aside>
        )}
      </div>

      {/* Main Discovery Interface Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 2. FILTER SIDEBAR: Left column on desktop */}
        <div className={`hidden lg:block ${rightSidebar ? 'lg:col-span-3' : 'lg:col-span-4'} sticky top-24`}>
          <HospitalFilterSidebar
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
            hospitals={hospitals}
          />
        </div>

        {/* Results Column */}
        <div className={`${rightSidebar ? 'lg:col-span-6' : 'lg:col-span-8'} space-y-4`}>
          {/* 5. CONTROLS BAR: Result Count, Mobile Filter Trigger, and Unified Sorting */}
          <div className="bg-white rounded-2xl border border-[#D9E6EE] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            {/* Dynamic result count display */}
            <div className="flex items-center gap-3">
              {/* Mobile Filter Button */}
              <button
                type="button"
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#E4F6FA] text-[#073B55] border border-[#BCEBF5] hover:bg-[#D4F0F7] cursor-pointer transition-colors"
              >
                <SlidersHorizontal size={14} />
                <span>Filters {activeChips.length > 0 && `(${activeChips.length})`}</span>
              </button>

              <div className="text-xs font-semibold text-[#60778C]">
                {totalCount > 0 ? (
                  <span>
                    Showing <strong className="text-[#122B43]">{startIndex + 1}–{endIndex}</strong> of{' '}
                    <strong className="text-[#122B43]">{totalCount}</strong> verified facilities
                  </span>
                ) : (
                  <span>0 facilities found</span>
                )}
              </div>
            </div>

            {/* Sorting & Page Size Controls */}
            <div className="flex items-center gap-3 self-end sm:self-auto">
              {/* Items per page selector */}
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#60778C]">
                <span>Show:</span>
                <select
                  aria-label="Items per page"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-slate-50 border border-[#D9E6EE] rounded-lg text-xs font-semibold text-[#122B43] px-2 py-1 focus:ring-1 focus:ring-[#00D5E8] cursor-pointer"
                >
                  <option value={4}>4</option>
                  <option value={6}>6</option>
                  <option value={8}>8</option>
                </select>
              </div>

              {/* Unified Sorting Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setSortOpen(!sortOpen)}
                  aria-expanded={sortOpen}
                  aria-haspopup="listbox"
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-[#D9E6EE] bg-white text-xs font-bold text-[#122B43] hover:border-[#073B55] transition-colors cursor-pointer shadow-2xs focus-visible:ring-2 focus-visible:ring-[#00D5E8]"
                >
                  <span className="text-[#60778C] font-normal">Sort:</span>
                  <span>{SORT_OPTIONS.find((s) => s.id === sortBy)?.label}</span>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>

                {sortOpen && (
                  <div
                    role="listbox"
                    className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl shadow-xl border border-[#D9E6EE] py-1 z-30 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        role="option"
                        aria-selected={sortBy === opt.id}
                        onClick={() => {
                          setSortBy(opt.id);
                          setSortOpen(false);
                          setCurrentPage(1);
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs transition-colors cursor-pointer flex items-center justify-between ${
                          sortBy === opt.id
                            ? 'bg-[#E4F6FA] text-[#073B55] font-bold'
                            : 'text-[#60778C] hover:bg-slate-50 hover:text-[#122B43]'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {sortBy === opt.id && <CheckCircle2 size={13} className="text-[#087D91]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Active Filter Removable Chips */}
          {activeChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 py-1">
              <span className="text-xs text-[#60778C] font-semibold">Active:</span>
              {activeChips.map((chip) => (
                <span
                  key={chip.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E4F6FA] text-[#073B55] border border-[#BCEBF5]"
                >
                  <span>{chip.label}</span>
                  <button
                    type="button"
                    onClick={chip.onRemove}
                    aria-label={`Remove filter ${chip.label}`}
                    className="hover:text-red-600 transition-colors cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-semibold text-[#087D91] hover:underline ml-1 cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Hospital Listing Cards */}
          <div className="space-y-4">
            {currentHospitals.length > 0 ? (
              currentHospitals.map((hospital) => (
                <HospitalCard
                  key={hospital.id}
                  hospital={hospital}
                  onViewDetails={(h) => setSelectedHospital(h)}
                />
              ))
            ) : (
              <div className="bg-white rounded-2xl border border-[#D9E6EE] p-12 text-center shadow-xs">
                <Building size={40} className="text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-[#122B43] mb-1">
                  No matching healthcare facilities
                </h3>
                <p className="text-xs text-[#60778C] max-w-sm mx-auto mb-4">
                  We could not find any hospitals matching your current filter criteria. Try expanding the distance radius or clearing tags.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#073B55] hover:bg-[#052F4B] transition-colors shadow-xs cursor-pointer inline-flex items-center gap-2"
                >
                  <RotateCcw size={13} />
                  <span>Reset All Filters</span>
                </button>
              </div>
            )}
          </div>

          {/* 5. INTUITIVE PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <div className="bg-white rounded-2xl border border-[#D9E6EE] p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
              <div className="text-xs text-[#60778C]">
                Page <strong className="text-[#122B43]">{currentPage}</strong> of{' '}
                <strong className="text-[#122B43]">{totalPages}</strong>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#D9E6EE] text-xs font-semibold text-[#122B43] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  <ChevronLeft size={14} />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    const isActive = pageNum === currentPage;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#073B55] text-white shadow-xs'
                            : 'text-[#60778C] hover:bg-slate-100 hover:text-[#122B43]'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#D9E6EE] text-xs font-semibold text-[#122B43] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Emergency & Staff sidebars if provided */}
        {rightSidebar && (
          <aside className="lg:col-span-3 flex flex-col gap-6 lg:sticky lg:top-24 w-full">
            {rightSidebar}
          </aside>
        )}
      </div>

      {/* Mobile Drawer Filter Dialog */}
      {mobileFilterOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setMobileFilterOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl max-h-[85vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-200"
          >
            <HospitalFilterSidebar
              filters={filters}
              onChange={handleFilterChange}
              onReset={handleResetFilters}
              hospitals={hospitals}
              isMobileDrawer={true}
              onCloseMobileDrawer={() => setMobileFilterOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Hospital Full Details Modal */}
      <HospitalDetailsModal
        hospital={selectedHospital}
        onClose={() => setSelectedHospital(null)}
      />
    </section>
  );
}