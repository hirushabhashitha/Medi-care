'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';

export default function LabCatalogPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Biochemistry',
    normalRange: '',
    unit: '',
    price: 1500,
    description: '',
  });

  useEffect(() => {
    fetchTests();
  }, []);

  async function fetchTests() {
    setLoading(true);
    try {
      const res = await fetch('/api/laboratory/tests');
      const data = await res.json();
      if (Array.isArray(data)) setTests(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddTest(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/laboratory/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        setFormData({
          name: '',
          category: 'Biochemistry',
          normalRange: '',
          unit: '',
          price: 1500,
          description: '',
        });
        fetchTests();
      }
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="animate-fadeIn">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Link href="/dashboard/laboratory" className="btn btn-ghost btn-sm" style={{ padding: '0.25rem' }}>
              <Icon name="arrow_back" size={18} />
            </Link>
            <h2 className="page-title">Diagnostic Test Catalog</h2>
          </div>
          <p className="card-subtitle">Manage laboratory test names, reference ranges, measurement units, and tariff prices</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Icon name="add" size={18} color="white" />
          <span>Add New Test</span>
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Test Name</th>
              <th>Category</th>
              <th>Normal Reference Range</th>
              <th>Unit</th>
              <th>Tariff Price</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}>
                  <div className="spinner spinner-lg" style={{ margin: '0 auto' }} />
                </td>
              </tr>
            ) : tests.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}>No lab tests registered</td>
              </tr>
            ) : (
              tests.map((test) => (
                <tr key={test.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{test.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{test.description}</div>
                  </td>
                  <td>
                    <span className="badge badge-info">{test.category}</span>
                  </td>
                  <td><strong>{test.normalRange}</strong></td>
                  <td>{test.unit || '—'}</td>
                  <td><strong>Rs. {test.price.toLocaleString()}</strong></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Add Diagnostic Test to Catalog</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                <Icon name="close" size={20} />
              </button>
            </div>
            <form onSubmit={handleAddTest}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Test Name <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="e.g. Full Blood Count (FBC), Serum Creatinine"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      {['Biochemistry', 'Hematology', 'Microbiology', 'Immunology', 'Radiology', 'Pathology'].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price (Rs.)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Normal Reference Range</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 70 - 99"
                      value={formData.normalRange}
                      onChange={(e) => setFormData({ ...formData, normalRange: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Unit</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="mg/dL, g/L"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add to Catalog</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
