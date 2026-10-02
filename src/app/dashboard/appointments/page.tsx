'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/Icon';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Booking Form State
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '09:00 - 09:30',
    reason: '',
    notes: '',
  });

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
    fetchPatients();
  }, [statusFilter, dateFilter]);

  async function fetchAppointments() {
    setLoading(true);
    try {
      let url = '/api/appointments';
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (dateFilter) params.append('date', dateFilter);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) setAppointments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchDoctors() {
    try {
      const res = await fetch('/api/doctors');
      const data = await res.json();
      if (Array.isArray(data)) setDoctors(data);
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchPatients() {
    try {
      const res = await fetch('/api/patients');
      const data = await res.json();
      if (Array.isArray(data)) setPatients(data);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        setFormData({
          patientId: '',
          doctorId: '',
          date: new Date().toISOString().split('T')[0],
          timeSlot: '09:00 - 09:30',
          reason: '',
          notes: '',
        });
        fetchAppointments();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchAppointments();
    } catch (e) {
      console.error(e);
    }
  }

  const timeSlots = [
    '08:30 - 09:00', '09:00 - 09:30', '09:30 - 10:00', '10:00 - 10:30',
    '10:30 - 11:00', '11:00 - 11:30', '11:30 - 12:00', '14:00 - 14:30',
    '14:30 - 15:00', '15:00 - 15:30', '15:30 - 16:00', '16:00 - 16:30',
  ];

  return (
    <div className="animate-fadeIn">
      {/* Header & Controls */}
      <div className="card-header" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="page-title">Appointment Scheduling</h2>
          <p className="card-subtitle">Manage doctor consultation queues, patient bookings, and tokens</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Icon name="add" size={18} color="white" />
          <span>Book Appointment</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="form-group" style={{ minWidth: '180px' }}>
            <input
              type="date"
              className="form-input"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '180px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="CHECKED_IN">Checked In</option>
            <option value="IN_CONSULTATION">In Consultation</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <button className="btn btn-secondary" onClick={() => { setDateFilter(''); setStatusFilter(''); }}>
            <Icon name="refresh" size={16} />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Token #</th>
              <th>Patient</th>
              <th>Doctor & Dept</th>
              <th>Date & Time</th>
              <th>Reason for Visit</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>
                  <div className="spinner spinner-lg" style={{ margin: '0 auto' }} />
                </td>
              </tr>
            ) : appointments.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>
                  <Icon name="event_busy" size={48} color="var(--text-tertiary)" style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
                  <p style={{ fontWeight: 600 }}>No appointments scheduled</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Book a consultation slot to begin</p>
                </td>
              </tr>
            ) : (
              appointments.map((apt) => {
                const docName = apt.doctor?.user?.employee
                  ? `Dr. ${apt.doctor.user.employee.firstName} ${apt.doctor.user.employee.lastName}`
                  : 'Assigned Doctor';

                return (
                  <tr key={apt.id}>
                    <td>
                      <span className="badge badge-purple" style={{ fontSize: '0.875rem' }}>
                        Token #{apt.tokenNumber || '—'}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{apt.patient.firstName} {apt.patient.lastName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{apt.patient.patientCode} • {apt.patient.phone}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{docName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{apt.doctor.department?.name || 'General'}</div>
                    </td>
                    <td>
                      <div>{new Date(apt.date).toLocaleDateString()}</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--primary-600)', fontWeight: 600 }}>{apt.timeSlot}</div>
                    </td>
                    <td>{apt.reason || 'Routine Checkup'}</td>
                    <td>
                      <span className={`badge ${
                        apt.status === 'COMPLETED' ? 'badge-success' :
                        apt.status === 'IN_CONSULTATION' ? 'badge-primary' :
                        apt.status === 'CHECKED_IN' ? 'badge-info' :
                        apt.status === 'CANCELLED' ? 'badge-danger' : 'badge-warning'
                      }`}>
                        {apt.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.375rem' }}>
                        {apt.status === 'SCHEDULED' && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => updateStatus(apt.id, 'CHECKED_IN')}
                          >
                            Check In
                          </button>
                        )}
                        {apt.status === 'CHECKED_IN' && (
                          <a
                            href={`/dashboard/consultations?patientId=${apt.patient.id}&appointmentId=${apt.id}`}
                            className="btn btn-primary btn-sm"
                          >
                            Consult
                          </a>
                        )}
                        {apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED' && (
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--danger)' }}
                            onClick={() => updateStatus(apt.id, 'CANCELLED')}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Book Appointment Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Schedule New Appointment</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                <Icon name="close" size={20} />
              </button>
            </div>

            <form onSubmit={handleBook}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Select Patient <span className="required">*</span></label>
                  <select
                    className="form-select"
                    required
                    value={formData.patientId}
                    onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  >
                    <option value="">Choose a patient...</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.firstName} {p.lastName} ({p.patientCode} - {p.phone || 'No phone'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Select Doctor <span className="required">*</span></label>
                  <select
                    className="form-select"
                    required
                    value={formData.doctorId}
                    onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                  >
                    <option value="">Choose a doctor...</option>
                    {doctors.map((d) => {
                      const emp = d.user?.employee;
                      return (
                        <option key={d.id} value={d.id}>
                          {emp ? `Dr. ${emp.firstName} ${emp.lastName}` : d.user?.username} ({d.department?.name} - Fee: Rs. {d.consultationFee})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Appointment Date <span className="required">*</span></label>
                    <input
                      type="date"
                      className="form-input"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Time Slot <span className="required">*</span></label>
                    <select
                      className="form-select"
                      required
                      value={formData.timeSlot}
                      onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                    >
                      {timeSlots.map((slot) => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Reason for Visit</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Fever and headache, Chest tightness, Checkup"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Booking...' : 'Confirm Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
