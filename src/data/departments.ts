export const departments = [
  'Emergency Department',
  'Intensive Care Unit',
  'General Ward A',
  'General Ward B',
  'Operating Theater',
  'Radiology',
  'Laboratory',
  'Pharmacy',
  'Neonatal Unit',
  'Outpatient Clinic',
] as const;

export type Department = typeof departments[number];
