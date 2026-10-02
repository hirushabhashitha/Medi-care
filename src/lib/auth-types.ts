import { Role } from '@prisma/client';

export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
  role: Role;
  employeeName?: string;
}

// Role-based permission check
export function hasPermission(userRole: Role, allowedRoles: Role[]): boolean {
  return allowedRoles.includes(userRole);
}

// Role display names
export const ROLE_LABELS: Record<Role, string> = {
  ADMINISTRATOR: 'Administrator',
  DOCTOR: 'Doctor',
  NURSE: 'Nurse',
  RECEPTIONIST: 'Receptionist',
  LAB_STAFF: 'Laboratory Staff',
  PHARMACIST: 'Pharmacist',
  ACCOUNTANT: 'Accountant',
};

// Role-based navigation items
export interface NavItem {
  label: string;
  href: string;
  icon: string;
}

export const ROLE_NAV_ITEMS: Record<Role, NavItem[]> = {
  ADMINISTRATOR: [
    { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
    { label: 'Users', href: '/dashboard/users', icon: 'people' },
    { label: 'Employees', href: '/dashboard/employees', icon: 'badge' },
    { label: 'Departments', href: '/dashboard/departments', icon: 'business' },
    { label: 'Patients', href: '/dashboard/patients', icon: 'personal_injury' },
    { label: 'Appointments', href: '/dashboard/appointments', icon: 'calendar_month' },
    { label: 'Doctors', href: '/dashboard/doctors', icon: 'stethoscope' },
    { label: 'Pharmacy', href: '/dashboard/pharmacy', icon: 'medication' },
    { label: 'Laboratory', href: '/dashboard/laboratory', icon: 'biotech' },
    { label: 'Billing', href: '/dashboard/billing', icon: 'receipt_long' },
    { label: 'Wards', href: '/dashboard/wards', icon: 'bed' },
    { label: 'Reports', href: '/dashboard/reports', icon: 'analytics' },
    { label: 'Audit Logs', href: '/dashboard/audit-logs', icon: 'shield' },
  ],
  DOCTOR: [
    { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
    { label: 'My Schedule', href: '/dashboard/appointments', icon: 'calendar_month' },
    { label: 'Patients', href: '/dashboard/patients', icon: 'personal_injury' },
    { label: 'Consultations', href: '/dashboard/consultations', icon: 'stethoscope' },
    { label: 'Lab Orders', href: '/dashboard/laboratory', icon: 'biotech' },
  ],
  NURSE: [
    { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
    { label: 'Patients', href: '/dashboard/patients', icon: 'personal_injury' },
    { label: 'Wards', href: '/dashboard/wards', icon: 'bed' },
    { label: 'Admissions', href: '/dashboard/admissions', icon: 'local_hospital' },
  ],
  RECEPTIONIST: [
    { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
    { label: 'Patients', href: '/dashboard/patients', icon: 'personal_injury' },
    { label: 'Appointments', href: '/dashboard/appointments', icon: 'calendar_month' },
    { label: 'Doctors', href: '/dashboard/doctors', icon: 'stethoscope' },
  ],
  LAB_STAFF: [
    { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
    { label: 'Lab Tests', href: '/dashboard/laboratory', icon: 'biotech' },
    { label: 'Test Catalog', href: '/dashboard/laboratory/catalog', icon: 'science' },
  ],
  PHARMACIST: [
    { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
    { label: 'Inventory', href: '/dashboard/pharmacy', icon: 'medication' },
    { label: 'Dispensing', href: '/dashboard/pharmacy/dispense', icon: 'local_pharmacy' },
  ],
  ACCOUNTANT: [
    { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
    { label: 'Billing', href: '/dashboard/billing', icon: 'receipt_long' },
    { label: 'Payments', href: '/dashboard/billing/payments', icon: 'payments' },
    { label: 'Reports', href: '/dashboard/reports', icon: 'analytics' },
  ],
};
