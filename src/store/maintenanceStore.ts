import { create } from 'zustand';
import { MaintenanceTask } from '../types/maintenance';
import { demoMaintenanceTasks } from '../data/maintenance';

interface MaintenanceState {
  tasks: MaintenanceTask[];

  addTask: (task: MaintenanceTask) => void;
  updateTask: (taskId: string, updates: Partial<MaintenanceTask>) => void;
  deleteTask: (taskId: string) => void;
  reset: () => void;
}

export const useMaintenanceStore = create<MaintenanceState>((set) => ({
  tasks: [...demoMaintenanceTasks],

  addTask: (task) =>
    set((state) => ({
      tasks: [...state.tasks, task],
    })),

  updateTask: (taskId, updates) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId ? { ...task, ...updates } : task,
      ),
    })),

  deleteTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== taskId),
    })),

  reset: () => set({ tasks: [...demoMaintenanceTasks] }),
}));
