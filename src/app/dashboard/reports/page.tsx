'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/Icon';

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports')
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem' }}>
        <div className="spinner spinner-lg" style={{ margin: '0 auto' }} />
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Compiling hospital analytics...</p>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="card-header" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="page-title">Executive Reports & Hospital Analytics</h2>
          <p className="card-subtitle">Operational metrics, financial performance, clinical throughput, and inventory health</p>
        </div>
        <button className="btn btn-primary" onClick={() => window.print()} style={{ gap: '0.5rem' }}>
          <Icon name="print" size={18} color="white" />
          <span>Export / Print Report</span>
        </button>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-4 gap-6" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-icon green">
            <Icon name="payments" size={24} color="#059669" />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Revenue Collected</div>
            <div className="stat-value" style={{ color: 'var(--success)' }}>
              Rs. {data?.totalRevenue ? data.totalRevenue.toLocaleString() : 0}
            </div>
            <div className="stat-change" style={{ color: 'var(--text-secondary)' }}>
              Pending billing: Rs. {data?.pendingBilling?.toLocaleString() || 0}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">
            <Icon name="personal_injury" size={24} color="#2563eb" />
          </div>
          <div className="stat-content">
            <div className="stat-label">Registered Patients</div>
            <div className="stat-value">{data?.totalPatients || 0}</div>
            <div className="stat-change" style={{ color: 'var(--text-secondary)' }}>Active clinical files</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <Icon name="calendar_month" size={24} color="#7c3aed" />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Appointments</div>
            <div className="stat-value">{data?.totalAppointments || 0}</div>
            <div className="stat-change" style={{ color: 'var(--success)' }}>
              {data?.completedAppointments || 0} consultations completed
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon red">
            <Icon name="bed" size={24} color="#dc2626" />
          </div>
          <div className="stat-content">
            <div className="stat-label">Bed Occupancy</div>
            <div className="stat-value">{data?.occupancyRate || 0}%</div>
            <div className="stat-change" style={{ color: 'var(--text-secondary)' }}>
              {data?.occupiedBeds || 0} of {data?.totalBeds || 0} beds occupied
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analysis Cards */}
      <div className="grid grid-cols-2 gap-6" style={{ marginBottom: '2rem' }}>
        {/* Pharmacy Drug Health */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Pharmacy & Drug Inventory Analysis</div>
              <div className="card-subtitle">Stock health and critical replenishment metrics</div>
            </div>
            <Icon name="medication" size={24} color="var(--primary-500)" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)' }}>
              <div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Total Registered Medicines</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{data?.totalMedicines || 0} items</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8125rem', color: 'var(--danger)' }}>Low Stock Warnings</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--danger)' }}>{data?.lowStockCount || 0} drugs</div>
              </div>
            </div>

            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              All essential antibiotics, analgesics, and intravenous fluids are tracked automatically with automated threshold alerts for reordering.
            </div>
          </div>
        </div>

        {/* Laboratory Workload */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Laboratory Diagnostic Throughput</div>
              <div className="card-subtitle">Ordered vs. processed test orders</div>
            </div>
            <Icon name="biotech" size={24} color="var(--accent-600)" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)' }}>
              <div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Total Test Orders</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{data?.totalLabOrders || 0} orders</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8125rem', color: 'var(--success)' }}>Completed Tests</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--success)' }}>{data?.completedLabOrders || 0} finalized</div>
              </div>
            </div>

            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Average turnaround time for routine biochemistry and hematology tests is under 45 minutes with automated normal range comparison.
            </div>
          </div>
        </div>
      </div>

      {/* Hospital Quality Summary */}
      <div className="card" style={{ background: 'linear-gradient(135deg, var(--bg-elevated) 0%, var(--primary-50) 100%)' }}>
        <div className="card-title" style={{ marginBottom: '0.75rem' }}>Hospital Quality & Clinical Governance Statement</div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          MediCore Hospital Management System automates clinical data integrity, electronic prescription auditing, real-time inpatient admission workflows, and integrated tax invoicing. All clinical modifications are cryptographically logged in the immutable audit trail to ensure full regulatory compliance.
        </p>
      </div>
    </div>
  );
}
