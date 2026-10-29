export type MaintenancePriority = 'low' | 'medium' | 'high' | 'critical';
export type MaintenanceStatus = 'scheduled' | 'in-progress' | 'completed' | 'overdue' | 'cancelled';
export type MaintenanceType = 'preventive' | 'corrective' | 'calibration' | 'inspection';

export interface MaintenanceTask {
  id: string;
  equipmentId: string;
  equipmentName: string;
  type: MaintenanceType;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  title: string;
  description: string;
  assignedTo: string;
  dueDate: string; // ISO date
  createdDate: string; // ISO date
  completedDate?: string; // ISO date
  notes: string;
}
