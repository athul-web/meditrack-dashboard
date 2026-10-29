export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved';
export type AlertCategory = 'connectivity' | 'threshold' | 'maintenance' | 'system';

export interface Alert {
  id: string;
  equipmentId: string;
  equipmentName: string;
  severity: AlertSeverity;
  status: AlertStatus;
  category: AlertCategory;
  title: string;
  description: string;
  timestamp: string; // ISO timestamp
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}
