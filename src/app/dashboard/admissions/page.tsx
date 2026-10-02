'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';

export default function AdmissionsPage() {
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ADMITTED');

  useEffect(() => {
    fetchAdmissions();
  }, [statusFilter]);

  async function fetchAdmissions() {
    setLoading(true);
    try {
      const url = statusFilter ? `/api/admissions?status=${statusFilter}` : '/api/admissions';
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) setAdmissions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleDischarge(admId: string, bedId: string | null) {
    if (!confirm('Are you sure you want to discharge this patient?')) return;
    try {
      const res = await fetch('/api/admissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: admId,
          bedId,
          dischargeNotes: 'Patient discharged safely',
        }),
      });
      if (res.ok) fetchAdmissions();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="animate-fadeIn">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Link href="/dashboard/wards" className="btn btn-ghost btn-sm" style={{ padding: '0.25rem' }}>
              <Icon name="arrow_back" size={18} />
            </Link>
            <h2 className="page-title">Inpatient Admissions Log</h2>
          </div>
          <p className="card-subtitle">Active and historical hospital admissions, attending physicians, and bed assignments</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Admissions</option>
            <option value="ADMITTED">Currently Admitted</option>
            <option value="DISCHARGED">Discharged</option>
          </select>
          <button className="btn btn-secondary" onClick={fetchAdmissions}>
            <Icon name="refresh" size={16} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Ward & Bed</th>
              <th>Attending Doctor</th>
              <th>Admission Date</th>
              <th>Diagnosis & Notes</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>
                  <div className="spinner spinner-lg" style={{ margin: '0 auto' }} />
                </td>
              </tr>
            ) : admissions.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>
                  <Icon name="personal_injury" size={48} color="var(--text-tertiary)" style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
                  <p style={{ fontWeight: 600 }}>No admissions found</p>
                </td>
              </tr>
            ) : (
              admissions.map((adm) => {
                const doc = adm.doctor?.user?.employee;
                const docName = doc ? `Dr. ${doc.firstName} ${doc.lastName}` : 'Attending Doctor';

                return (
                  <tr key={adm.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{adm.patient?.firstName} {adm.patient?.lastName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{adm.patient?.patientCode}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{adm.bed?.ward?.name || 'General Ward'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Bed {adm.bed?.bedNumber}</div>
                    </td>
                    <td>{docName}</td>
                    <td>
                      <div>{new Date(adm.admissionDate).toLocaleDateString()}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {adm.dischargeDate ? `Discharged: ${new Date(adm.dischargeDate).toLocaleDateString()}` : 'Ongoing'}
                      </div>
                    </td>
                    <td>
                      <div>{adm.diagnosis || 'General Observation'}</div>
                      {adm.notes && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{adm.notes}</div>}
                    </td>
                    <td>
                      <span className={`badge ${adm.status === 'ADMITTED' ? 'badge-warning' : 'badge-success'}`}>
                        {adm.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {adm.status === 'ADMITTED' && (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleDischarge(adm.id, adm.bedId)}
                        >
                          Discharge Patient
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
