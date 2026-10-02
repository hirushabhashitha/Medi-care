'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';

export default function WardsPage() {
  const [wards, setWards] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Admit Modal State
  const [selectedBed, setSelectedBed] = useState<any>(null);
  const [patientId, setPatientId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchWards();
    fetch('/api/patients').then((r) => r.json()).then((d) => Array.isArray(d) && setPatients(d));
    fetch('/api/doctors').then((r) => r.json()).then((d) => {
      if (Array.isArray(d)) {
        setDoctors(d);
        if (d.length > 0) setDoctorId(d[0].id);
      }
    });
  }, []);

  async function fetchWards() {
    setLoading(true);
    try {
      const res = await fetch('/api/wards');
      const data = await res.json();
      if (Array.isArray(data)) setWards(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedBed || !patientId || !doctorId) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/admissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          doctorId,
          bedId: selectedBed.id,
          diagnosis,
          notes,
        }),
      });

      if (res.ok) {
        setSelectedBed(null);
        setPatientId('');
        setDiagnosis('');
        setNotes('');
        fetchWards();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDischarge(admissionId: string, bedId: string) {
    if (!confirm('Are you sure you want to discharge this inpatient and release the bed?')) return;
    try {
      const res = await fetch('/api/admissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: admissionId,
          bedId,
          dischargeNotes: 'Discharged in stable condition',
        }),
      });
      if (res.ok) fetchWards();
    } catch (e) {
      console.error(e);
    }
  }

  const totalBeds = wards.reduce((sum, w) => sum + (w.beds?.length || 0), 0);
  const occupiedBeds = wards.reduce(
    (sum, w) => sum + (w.beds?.filter((b: any) => b.isOccupied).length || 0),
    0
  );
  const occupancyPercent = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="card-header" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="page-title">Inpatient Wards & Bed Occupancy Map</h2>
          <p className="card-subtitle">Real-time visual bed management, patient admissions, and ward capacity</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link href="/dashboard/admissions" className="btn btn-secondary">
            <Icon name="personal_injury" size={18} />
            <span>Admissions Register</span>
          </Link>
          <button className="btn btn-secondary" onClick={fetchWards}>
            <Icon name="refresh" size={16} />
            <span>Refresh Beds</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-4 gap-6" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-icon blue">
            <Icon name="bed" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Ward Beds</div>
            <div className="stat-value">{totalBeds}</div>
            <div className="stat-change" style={{ color: 'var(--text-secondary)' }}>Across {wards.length} Wards</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon red">
            <Icon name="personal_injury" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Occupied Beds</div>
            <div className="stat-value" style={{ color: 'var(--danger)' }}>{occupiedBeds}</div>
            <div className="stat-change" style={{ color: 'var(--danger)' }}>Patients currently admitted</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <Icon name="check_circle" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Available Beds</div>
            <div className="stat-value" style={{ color: 'var(--success)' }}>{totalBeds - occupiedBeds}</div>
            <div className="stat-change" style={{ color: 'var(--success)' }}>Ready for admission</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <Icon name="analytics" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Occupancy Rate</div>
            <div className="stat-value">{occupancyPercent}%</div>
            <div className="stat-change" style={{ color: 'var(--text-secondary)' }}>Current capacity load</div>
          </div>
        </div>
      </div>

      {/* Ward Cards with Interactive Bed Grids */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div className="spinner spinner-lg" style={{ margin: '0 auto' }} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {wards.map((ward) => {
            const wardOccupied = ward.beds?.filter((b: any) => b.isOccupied).length || 0;
            const wardTotal = ward.beds?.length || 0;

            return (
              <div key={ward.id} className="card">
                <div className="card-header" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{ward.name}</h3>
                      <span className="badge badge-info">{ward.type || 'General'}</span>
                      {ward.floor && <span className="badge badge-neutral">{ward.floor}</span>}
                    </div>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                    Occupancy: <span style={{ color: wardOccupied === wardTotal ? 'var(--danger)' : 'var(--success)' }}>{wardOccupied} / {wardTotal}</span>
                  </div>
                </div>

                {/* Bed Grid */}
                <div className="bed-grid">
                  {ward.beds?.map((bed: any) => {
                    const currentAdm = bed.admissions && bed.admissions.length > 0 ? bed.admissions[0] : null;

                    return (
                      <div
                        key={bed.id}
                        className={`bed-card ${bed.isOccupied ? 'occupied' : 'available'}`}
                        onClick={() => {
                          if (!bed.isOccupied) {
                            setSelectedBed(bed);
                          }
                        }}
                      >
                        <Icon name="bed" size={24} color={bed.isOccupied ? '#ef4444' : '#10b981'} />
                        <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '0.25rem' }}>{bed.bedNumber}</div>
                        <div style={{ fontSize: '0.6875rem', marginTop: '0.25rem' }}>
                          Rs. {bed.dailyRate.toLocaleString()} / day
                        </div>

                        {bed.isOccupied ? (
                          <div style={{ marginTop: '0.5rem', width: '100%' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {currentAdm?.patient?.firstName} {currentAdm?.patient?.lastName}
                            </div>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ width: '100%', marginTop: '0.375rem', fontSize: '0.6875rem', padding: '0.2rem' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (currentAdm) handleDischarge(currentAdm.id, bed.id);
                              }}
                            >
                              Discharge
                            </button>
                          </div>
                        ) : (
                          <span className="badge badge-success" style={{ marginTop: '0.5rem', fontSize: '0.6875rem' }}>
                            + Admit
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Admit Patient Modal */}
      {selectedBed && (
        <div className="modal-overlay" onClick={() => setSelectedBed(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Admit Patient to Bed {selectedBed.bedNumber}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setSelectedBed(null)}>
                <Icon name="close" size={20} />
              </button>
            </div>

            <form onSubmit={handleAdmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)' }}>
                  <div>Bed Number: <strong>{selectedBed.bedNumber}</strong></div>
                  <div>Daily Bed Rate: <strong>Rs. {selectedBed.dailyRate.toLocaleString()}</strong></div>
                </div>

                <div className="form-group">
                  <label className="form-label">Select Patient <span className="required">*</span></label>
                  <select
                    className="form-select"
                    required
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                  >
                    <option value="">Choose patient for inpatient admission...</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.firstName} {p.lastName} ({p.patientCode} - Blood: {p.bloodGroup || 'N/A'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Attending Doctor <span className="required">*</span></label>
                  <select
                    className="form-select"
                    required
                    value={doctorId}
                    onChange={(e) => setDoctorId(e.target.value)}
                  >
                    {doctors.map((d) => {
                      const emp = d.user?.employee;
                      return (
                        <option key={d.id} value={d.id}>
                          {emp ? `Dr. ${emp.firstName} ${emp.lastName}` : d.user?.username} ({d.department?.name})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Admission Diagnosis</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Acute Appendicitis, Post-operative Observation"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Clinical Notes</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Care instructions, dietary restrictions, vitals monitoring..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedBed(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Admitting...' : 'Confirm Inpatient Admission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
