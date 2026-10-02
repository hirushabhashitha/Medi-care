'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/Icon';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  async function fetchDepartments() {
    setLoading(true);
    try {
      const res = await fetch('/api/departments');
      const data = await res.json();
      if (Array.isArray(data)) setDepartments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      if (res.ok) {
        setShowModal(false);
        setName('');
        setDescription('');
        fetchDepartments();
      }
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="animate-fadeIn">
      <div className="card-header" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="page-title">Hospital Departments</h2>
          <p className="card-subtitle">Medical specialties, clinical divisions, and clinical staffing structure</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Icon name="add" size={18} color="white" />
          <span>Add Department</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {loading ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem' }}>
            <div className="spinner spinner-lg" style={{ margin: '0 auto' }} />
          </div>
        ) : (
          departments.map((dept) => (
            <div key={dept.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: 'var(--primary-100)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', color: 'var(--primary-700)'
                }}>
                  <Icon name="business" size={24} color="var(--primary-700)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{dept.name}</h3>
                  <span className="badge badge-success">Operational</span>
                </div>
              </div>

              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, minHeight: '40px' }}>
                {dept.description || 'Specialized clinical care unit and diagnostic division.'}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem', marginTop: 'auto', fontSize: '0.8125rem' }}>
                <div><strong>{dept._count?.doctors || 0}</strong> Doctors Assigned</div>
                <div><strong>{dept._count?.employees || 0}</strong> Staff Members</div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Create Hospital Department</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                <Icon name="close" size={20} />
              </button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Department Name <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="e.g. Oncology, ENT, Orthopedics"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description / Scope of Care</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Specialized medical treatments, procedures, and facilities..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Department</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
