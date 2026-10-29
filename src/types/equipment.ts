export type ConnectivityStatus = 'online' | 'offline' | 'intermittent';
export type OperationalStatus = 'normal' | 'warning' | 'critical' | 'maintenance' | 'decommissioned';
export type MaintenanceFlag = 'up-to-date' | 'due-soon' | 'overdue' | 'in-progress';

export interface Equipment {
  id: string;
  name: string;
  type: string; // e.g., 'Patient Monitor', 'Infusion Pump'
  model: string;
  serialNumber: string;
  department: string;
  location: string; // room or area
  connectivity: ConnectivityStatus;
  operationalStatus: OperationalStatus;
  maintenanceFlag: MaintenanceFlag;
  lastCommunication: string; // ISO timestamp
  installDate: string; // ISO date
  nextMaintenanceDate: string; // ISO date
  firmwareVersion: string;
  notes: string;
}

export interface TelemetryReading {
  equipmentId: string;
  timestamp: string; // ISO timestamp
  metrics: Record<string, number>; // e.g., { temperature: 4.2, batteryLevel: 87 }
}

export interface TelemetryConfig {
  equipmentId: string;
  metrics: MetricConfig[];
}

export interface MetricConfig {
  key: string;
  label: string;
  unit: string;
  baseline: number;
  min: number;
  max: number;
  warningLow?: number;
  warningHigh?: number;
  criticalLow?: number;
  criticalHigh?: number;
  variationRate: number; // max change per tick
}
