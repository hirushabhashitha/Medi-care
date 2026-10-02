'use client';

import { Role } from '@prisma/client';
import { ROLE_LABELS } from '@/lib/auth-types';
import Icon from '@/components/ui/Icon';

interface DashboardStats {
  totalPatients: number;
  totalDoctors: number;
  todayAppointments: number;
  totalMedicines: number;
  lowStockMedicines: number;
  pendingLabOrders: number;
  pendingInvoices: number;
  totalEmployees: number;
  totalAdmissions: number;
}

interface RecentPatient {
  id: string;
  patientCode: string;
  firstName: string;
  lastName: string;
  gender: string | null;
  phone: string | null;
  createdAt: string;
}

interface RecentAppointment {
  id: string;
  date: string;
  timeSlot: string;
  status: string;
  patientName: string;
  patientCode: string;
  doctorName: string;
}

interface DashboardClientProps {
  role: Role;
  employeeName: string;
  stats: DashboardStats;
  recentPatients: RecentPatient[];
  recentAppointments: RecentAppointment[];
}

const statusColors: Record<string, string> = {
  SCHEDULED: 'badge-info',
  CHECKED_IN: 'badge-warning',
  IN_CONSULTATION: 'badge-purple',
  COMPLETED: 'badge-success',
  CANCELLED: 'badge-danger',
  NO_SHOW: 'badge-neutral',
};

const statusLabels: Record<string, string> = {
  SCHEDULED: 'Scheduled',
  CHECKED_IN: 'Checked In',
  IN_CONSULTATION: 'In Consultation',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No Show',
};

export default function DashboardClient({
  role,
  employeeName,
  stats,
  recentPatients,
  recentAppointments,
}: DashboardClientProps) {
  const greeting = getGreeting();

  return (
    <div className="animate-fadeIn">
      {/* Welcome Banner */}
      <div style={styles.welcomeBanner}>
        <div>
          <h2 style={styles.welcomeTitle}>
            {greeting}, {employeeName.split(' ')[0]}! 👋
          </h2>
          <p style={styles.welcomeSubtitle}>
            Welcome to your {ROLE_LABELS[role]} dashboard. Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <div style={styles.dateDisplay}>
          <Icon name="calendar_month" size={18} color="var(--primary-500)" />
          <span style={styles.dateText}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {getStatCards(role, stats).map((stat, i) => (
          <div key={i} className={`stat-card animate-fadeInUp stagger-${i + 1}`}>
            <div className={`stat-icon ${stat.color}`}>
              <Icon name={stat.icon} size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value">{stat.value.toLocaleString()}</div>
              {stat.subtitle && (
                <div className="stat-change" style={{ color: 'var(--text-secondary)' }}>
                  {stat.subtitle}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Recent Appointments */}
        <div className="card animate-fadeInUp stagger-5">
          <div className="card-header">
            <div>
              <div className="card-title">Recent Appointments</div>
              <div className="card-subtitle">Latest appointment activity</div>
            </div>
            <Icon name="calendar_month" size={24} color="var(--primary-500)" />
          </div>

          {recentAppointments.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem 1rem' }}>
              <Icon name="event_busy" size={48} color="var(--text-tertiary)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <div className="empty-state-title">No appointments yet</div>
              <div className="empty-state-desc">Appointments will appear here once created</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentAppointments.map((apt) => (
                <div key={apt.id} style={styles.listItem}>
                  <div style={styles.listItemLeft}>
                    <div style={{ ...styles.listDot, background: getStatusDotColor(apt.status) }} />
                    <div>
                      <div style={styles.listItemTitle}>{apt.patientName}</div>
                      <div style={styles.listItemSub}>
                        {apt.doctorName} • {apt.timeSlot}
                      </div>
                    </div>
                  </div>
                  <div style={styles.listItemRight}>
                    <span className={`badge ${statusColors[apt.status] || 'badge-neutral'}`}>
                      {statusLabels[apt.status] || apt.status}
                    </span>
                    <div style={styles.listDate}>
                      {new Date(apt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Patients */}
        <div className="card animate-fadeInUp stagger-6">
          <div className="card-header">
            <div>
              <div className="card-title">Recent Patients</div>
              <div className="card-subtitle">Newly registered patients</div>
            </div>
            <Icon name="personal_injury" size={24} color="var(--accent-500)" />
          </div>

          {recentPatients.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem 1rem' }}>
              <Icon name="person_off" size={48} color="var(--text-tertiary)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <div className="empty-state-title">No patients yet</div>
              <div className="empty-state-desc">Patients will appear here once registered</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentPatients.map((patient) => (
                <div key={patient.id} style={styles.listItem}>
                  <div style={styles.listItemLeft}>
                    <div
                      className="avatar avatar-sm"
                      style={{
                        background: patient.gender === 'Male' ? '#3b82f6' : '#ec4899',
                        fontSize: '0.6875rem',
                      }}
                    >
                      {patient.firstName[0]}{patient.lastName[0]}
                    </div>
                    <div>
                      <div style={styles.listItemTitle}>
                        {patient.firstName} {patient.lastName}
                      </div>
                      <div style={styles.listItemSub}>
                        {patient.patientCode} • {patient.phone || 'No phone'}
                      </div>
                    </div>
                  </div>
                  <div style={styles.listItemRight}>
                    <span className={`badge ${patient.gender === 'Male' ? 'badge-info' : 'badge-purple'}`}>
                      {patient.gender || 'N/A'}
                    </span>
                    <div style={styles.listDate}>
                      {new Date(patient.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card animate-fadeInUp" style={{ marginTop: '1.5rem' }}>
        <div className="card-header">
          <div className="card-title">Quick Actions</div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {getQuickActions(role).map((action, i) => (
            <a
              key={i}
              href={action.href}
              className="btn btn-secondary"
              style={{ gap: '0.5rem' }}
            >
              <Icon name={action.icon} size={18} color={action.color} />
              {action.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getStatusDotColor(status: string): string {
  const colors: Record<string, string> = {
    SCHEDULED: '#3b82f6',
    CHECKED_IN: '#f59e0b',
    IN_CONSULTATION: '#7c3aed',
    COMPLETED: '#10b981',
    CANCELLED: '#ef4444',
    NO_SHOW: '#94a3b8',
  };
  return colors[status] || '#94a3b8';
}

function getStatCards(role: Role, stats: DashboardStats) {
  const allCards = [
    { label: 'Total Patients', value: stats.totalPatients, icon: 'personal_injury', color: 'blue', subtitle: 'Registered patients' },
    { label: "Today's Appointments", value: stats.todayAppointments, icon: 'calendar_month', color: 'green', subtitle: 'Scheduled for today' },
    { label: 'Active Doctors', value: stats.totalDoctors, icon: 'stethoscope', color: 'purple', subtitle: 'Available doctors' },
    { label: 'Pending Lab Orders', value: stats.pendingLabOrders, icon: 'biotech', color: 'yellow', subtitle: 'Awaiting results' },
    { label: 'Medicine Stock', value: stats.totalMedicines, icon: 'medication', color: 'red', subtitle: `${stats.lowStockMedicines} low stock alerts` },
    { label: 'Pending Invoices', value: stats.pendingInvoices, icon: 'receipt_long', color: 'teal', subtitle: 'Unpaid bills' },
    { label: 'Inpatients', value: stats.totalAdmissions, icon: 'bed', color: 'purple', subtitle: 'Currently admitted' },
    { label: 'Total Staff', value: stats.totalEmployees, icon: 'badge', color: 'blue', subtitle: 'Active employees' },
  ];

  const roleCards: Record<string, number[]> = {
    ADMINISTRATOR: [0, 1, 7, 5],
    DOCTOR: [1, 0, 3, 6],
    NURSE: [6, 0, 1, 2],
    RECEPTIONIST: [0, 1, 2, 3],
    LAB_STAFF: [3, 0, 1, 4],
    PHARMACIST: [4, 0, 3, 5],
    ACCOUNTANT: [5, 0, 1, 4],
  };

  const indices = roleCards[role] || [0, 1, 2, 3];
  return indices.map((i) => allCards[i]);
}

function getQuickActions(role: Role) {
  const actions: Record<string, { label: string; href: string; icon: string; color: string }[]> = {
    ADMINISTRATOR: [
      { label: 'Add User', href: '/dashboard/users', icon: 'person_add', color: '#3b82f6' },
      { label: 'Add Department', href: '/dashboard/departments', icon: 'domain_add', color: '#7c3aed' },
      { label: 'View Reports', href: '/dashboard/reports', icon: 'analytics', color: '#059669' },
      { label: 'Audit Logs', href: '/dashboard/audit-logs', icon: 'shield', color: '#d97706' },
    ],
    DOCTOR: [
      { label: 'View Schedule', href: '/dashboard/appointments', icon: 'calendar_month', color: '#3b82f6' },
      { label: 'Start Consultation', href: '/dashboard/consultations', icon: 'stethoscope', color: '#059669' },
      { label: 'Order Lab Test', href: '/dashboard/laboratory', icon: 'biotech', color: '#7c3aed' },
    ],
    NURSE: [
      { label: 'Ward Overview', href: '/dashboard/wards', icon: 'bed', color: '#3b82f6' },
      { label: 'Patient Vitals', href: '/dashboard/patients', icon: 'monitor_heart', color: '#dc2626' },
      { label: 'Admissions', href: '/dashboard/admissions', icon: 'local_hospital', color: '#059669' },
    ],
    RECEPTIONIST: [
      { label: 'Register Patient', href: '/dashboard/patients', icon: 'person_add', color: '#3b82f6' },
      { label: 'Book Appointment', href: '/dashboard/appointments', icon: 'event', color: '#059669' },
      { label: 'Find Doctor', href: '/dashboard/doctors', icon: 'search', color: '#7c3aed' },
    ],
    LAB_STAFF: [
      { label: 'Pending Tests', href: '/dashboard/laboratory', icon: 'science', color: '#3b82f6' },
      { label: 'Enter Results', href: '/dashboard/laboratory', icon: 'edit_note', color: '#059669' },
      { label: 'Test Catalog', href: '/dashboard/laboratory/catalog', icon: 'list_alt', color: '#7c3aed' },
    ],
    PHARMACIST: [
      { label: 'Dispense Medicine', href: '/dashboard/pharmacy/dispense', icon: 'local_pharmacy', color: '#3b82f6' },
      { label: 'Add Stock', href: '/dashboard/pharmacy', icon: 'add_box', color: '#059669' },
      { label: 'Expiry Alerts', href: '/dashboard/pharmacy', icon: 'warning', color: '#d97706' },
    ],
    ACCOUNTANT: [
      { label: 'Create Invoice', href: '/dashboard/billing', icon: 'add', color: '#3b82f6' },
      { label: 'Record Payment', href: '/dashboard/billing/payments', icon: 'payments', color: '#059669' },
      { label: 'Financial Reports', href: '/dashboard/reports', icon: 'analytics', color: '#7c3aed' },
    ],
  };

  return actions[role] || [];
}

const styles: Record<string, React.CSSProperties> = {
  welcomeBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  welcomeTitle: {
    fontSize: '1.625rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    lineHeight: 1.3,
  },
  welcomeSubtitle: {
    fontSize: '0.9375rem',
    color: 'var(--text-secondary)',
    marginTop: '0.25rem',
  },
  dateDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    background: 'var(--bg-elevated)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border-light)',
  },
  dateText: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--text-secondary)',
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem',
    borderRadius: 'var(--radius-lg)',
    background: 'var(--bg-tertiary)',
    transition: 'background 150ms ease',
  },
  listItemLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flex: 1,
    minWidth: 0,
  },
  listDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  listItemTitle: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  listItemSub: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    marginTop: '1px',
  },
  listItemRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.25rem',
    flexShrink: 0,
  },
  listDate: {
    fontSize: '0.6875rem',
    color: 'var(--text-tertiary)',
  },
};
