'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/Icon';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New User Form
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'DOCTOR',
    firstName: '',
    lastName: '',
    departmentId: '',
    designation: '',
  });

  useEffect(() => {
    fetchUsers();
    fetch('/api/departments').then((r) => r.json()).then((d) => Array.isArray(d) && setDepartments(d));
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (Array.isArray(data)) setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        setFormData({
          username: '',
          email: '',
          password: '',
          role: 'DOCTOR',
          firstName: '',
          lastName: '',
          departmentId: '',
          designation: '',
        });
        fetchUsers();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to create user');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(userId: string, currentStatus: boolean) {
    try {
      await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, isActive: !currentStatus }),
      });
      fetchUsers();
    } catch (e) {
      console.error(e);
    }
  }

  const roleColors: Record<string, string> = {
    ADMINISTRATOR: 'badge-purple',
    DOCTOR: 'badge-success',
    NURSE: 'badge-primary',
    RECEPTIONIST: 'badge-warning',
    LAB_STAFF: 'badge-info',
    PHARMACIST: 'badge-danger',
    ACCOUNTANT: 'badge-neutral',
  };

  return (
    <div className="animate-fadeIn">
      <div className="card-header" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="page-title">User Accounts & Role Permissions</h2>
          <p className="card-subtitle">Manage system user credentials, active roles, and employee association</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Icon name="add" size={18} color="white" />
          <span>Create User Account</span>
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>System Role</th>
              <th>Linked Employee</th>
              <th>Department</th>
              <th>Created Date</th>
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
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>No users found</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>@{u.username}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{u.email}</div>
                  </td>
                  <td>
                    <span className={`badge ${roleColors[u.role] || 'badge-neutral'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    {u.employee ? (
                      <div>
                        <div style={{ fontWeight: 500 }}>{u.employee.firstName} {u.employee.lastName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{u.employee.designation || 'Staff'}</div>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-tertiary)' }}>No profile linked</span>
                    )}
                  </td>
                  <td>{u.employee?.department?.name || '—'}</td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {u.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ color: u.isActive ? 'var(--danger)' : 'var(--success)' }}
                      onClick={() => toggleActive(u.id, u.isActive)}
                    >
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create User Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Create System User Account</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                <Icon name="close" size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Username <span className="required">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      placeholder="e.g. dr.kamal"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address <span className="required">*</span></label>
                    <input
                      type="email"
                      className="form-input"
                      required
                      placeholder="kamal@medicore.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Password <span className="required">*</span></label>
                    <input
                      type="password"
                      className="form-input"
                      required
                      placeholder="Temporary password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">System Role <span className="required">*</span></label>
                    <select
                      className="form-select"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="ADMINISTRATOR">Administrator</option>
                      <option value="DOCTOR">Doctor</option>
                      <option value="NURSE">Nurse</option>
                      <option value="RECEPTIONIST">Receptionist</option>
                      <option value="LAB_STAFF">Laboratory Staff</option>
                      <option value="PHARMACIST">Pharmacist</option>
                      <option value="ACCOUNTANT">Accountant</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Assign Department</label>
                  <select
                    className="form-select"
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  >
                    <option value="">No Department / Admin Staff</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
