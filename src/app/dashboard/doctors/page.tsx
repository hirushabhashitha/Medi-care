'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/Icon';

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartments();
    fetchDoctors();
  }, [selectedDept]);

  async function fetchDepartments() {
    try {
      const res = await fetch('/api/departments');
      const data = await res.json();
      if (Array.isArray(data)) setDepartments(data);
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchDoctors() {
    setLoading(true);
    try {
      const url = selectedDept ? `/api/doctors?departmentId=${selectedDept}` : '/api/doctors';
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) setDoctors(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fadeIn">
      <div className="card-header" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="page-title">Doctor Management</h2>
          <p className="card-subtitle">Hospital medical specialists, departments, and consultation fees</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '200px' }}
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div className="spinner spinner-lg" style={{ margin: '0 auto' }} />
        </div>
      ) : doctors.length === 0 ? (
        <div className="card empty-state">
          <Icon name="stethoscope" size={48} color="var(--text-tertiary)" style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
          <div className="empty-state-title">No doctors found</div>
          <p className="empty-state-desc">No medical doctors match the selected department filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {doctors.map((doc) => {
            const emp = doc.user?.employee;
            const name = emp ? `Dr. ${emp.firstName} ${emp.lastName}` : `Dr. ${doc.user?.username}`;
            return (
              <div key={doc.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div
                    className="avatar avatar-lg"
                    style={{ background: 'linear-gradient(135deg, #059669, #10b981)', fontSize: '1.25rem' }}
                  >
                    {emp ? `${emp.firstName[0]}${emp.lastName[0]}` : 'DR'}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{name}</h3>
                    <span className="badge badge-success">{doc.department?.name || 'General Practice'}</span>
                  </div>
                </div>

                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  <div><strong>Specialization:</strong> {doc.specialization || 'Consultant'}</div>
                  <div><strong>Qualification:</strong> {doc.qualification || 'MBBS, MD'}</div>
                  <div><strong>Consultation Fee:</strong> Rs. {doc.consultationFee.toLocaleString()}</div>
                  <div><strong>Appointments Handled:</strong> {doc._count?.appointments || 0}</div>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-primary">Active</span>
                  <a href={`/dashboard/appointments?doctorId=${doc.id}`} className="btn btn-secondary btn-sm">
                    View Schedule
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
