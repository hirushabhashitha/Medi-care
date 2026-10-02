'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';

interface Patient {
  id: string;
  patientCode: string;
  firstName: string;
  lastName: string;
  gender: string | null;
  bloodGroup: string | null;
  phone: string | null;
  email: string | null;
  allergies: string | null;
  createdAt: string;
  appointments: { date: string; status: string }[];
  admissions: { id: string; bed: { bedNumber: string; ward: { name: string } } }[];
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'Male',
    bloodGroup: 'O+',
    phone: '',
    email: '',
    address: '',
    emergencyContact: '',
    allergies: '',
    notes: '',
  });

  useEffect(() => {
    fetchPatients();
  }, [bloodGroupFilter]);

  async function fetchPatients() {
    setLoading(true);
    try {
      let url = '/api/patients';
      const params = new URLSearchParams();
      if (search) params.append('q', search);
      if (bloodGroupFilter) params.append('bloodGroup', bloodGroupFilter);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) {
        setPatients(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        setFormData({
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          gender: 'Male',
          bloodGroup: 'O+',
          phone: '',
          email: '',
          address: '',
          emergencyContact: '',
          allergies: '',
          notes: '',
        });
        fetchPatients();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="animate-fadeIn">
      {/* Header & Controls */}
      <div className="card-header" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="page-title">Patient Management</h2>
          <p className="card-subtitle">Register, search, and manage patient clinical records</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Icon name="add" size={18} color="white" />
          <span>Register New Patient</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}>
              <Icon name="search" size={18} />
            </span>
            <input
              type="text"
              className="form-input"
              placeholder="Search by Patient Name, MRN code, or phone number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchPatients()}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '160px' }}
            value={bloodGroupFilter}
            onChange={(e) => setBloodGroupFilter(e.target.value)}
          >
            <option value="">All Blood Groups</option>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>

          <button className="btn btn-secondary" onClick={fetchPatients}>
            <Icon name="refresh" size={18} />
            <span>Search</span>
          </button>
        </div>
      </div>

      {/* Patients Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Patient Code</th>
              <th>Patient Name</th>
              <th>Gender / Blood</th>
              <th>Contact Info</th>
              <th>Current Status</th>
              <th>Registered Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>
                  <div className="spinner spinner-lg" style={{ margin: '0 auto' }} />
                  <p style={{ marginTop: '0.75rem', color: 'var(--text-secondary)' }}>Loading patient records...</p>
                </td>
              </tr>
            ) : patients.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>
                  <Icon name="person_off" size={48} color="var(--text-tertiary)" style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
                  <p style={{ fontWeight: 600 }}>No patients found</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Register a new patient to get started</p>
                </td>
              </tr>
            ) : (
              patients.map((patient) => {
                const isAdmitted = patient.admissions && patient.admissions.length > 0;
                return (
                  <tr key={patient.id}>
                    <td>
                      <span className="badge badge-primary">{patient.patientCode}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>
                        {patient.firstName} {patient.lastName}
                      </div>
                      {patient.allergies && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>
                          ⚠️ Allergy: {patient.allergies}
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{ marginRight: '0.5rem' }}>{patient.gender || 'N/A'}</span>
                      {patient.bloodGroup && (
                        <span className="badge badge-danger">{patient.bloodGroup}</span>
                      )}
                    </td>
                    <td>
                      <div>{patient.phone || 'No phone'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{patient.email}</div>
                    </td>
                    <td>
                      {isAdmitted ? (
                        <span className="badge badge-warning">
                          Inpatient ({patient.admissions[0].bed.ward.name} - {patient.admissions[0].bed.bedNumber})
                        </span>
                      ) : (
                        <span className="badge badge-success">Outpatient</span>
                      )}
                    </td>
                    <td>
                      {new Date(patient.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link
                        href={`/dashboard/patients/${patient.id}`}
                        className="btn btn-secondary btn-sm"
                      >
                        <Icon name="visibility" size={16} />
                        <span>Medical Profile</span>
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Register Patient Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Register New Patient</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                <Icon name="close" size={20} />
              </button>
            </div>

            <form onSubmit={handleRegister}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">First Name <span className="required">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name <span className="required">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Date of Birth</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select
                      className="form-select"
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Blood Group</label>
                    <select
                      className="form-select"
                      value={formData.bloodGroup}
                      onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    >
                      {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="e.g. 0771234567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="patient@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Residential Address</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Street, City, Postal Code"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Emergency Contact Info</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Name - Relationship - Phone"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Known Allergies</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Penicillin, Peanuts, Sulfa drugs"
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Registering...' : 'Register Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
