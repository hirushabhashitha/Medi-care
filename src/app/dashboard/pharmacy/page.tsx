'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';

export default function PharmacyPage() {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New Medicine Form
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    brand: '',
    category: 'Tablet',
    batchNumber: '',
    unitCost: 0,
    sellingPrice: 0,
    stockQty: 100,
    reorderLevel: 20,
    expiryDate: '',
    manufacturer: '',
    description: '',
  });

  useEffect(() => {
    fetchMedicines();
  }, [filterLowStock]);

  async function fetchMedicines() {
    setLoading(true);
    try {
      let url = '/api/pharmacy/medicines';
      const params = new URLSearchParams();
      if (search) params.append('q', search);
      if (filterLowStock) params.append('lowStock', 'true');
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) setMedicines(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddMedicine(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/pharmacy/medicines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        setFormData({
          name: '',
          genericName: '',
          brand: '',
          category: 'Tablet',
          batchNumber: '',
          unitCost: 0,
          sellingPrice: 0,
          stockQty: 100,
          reorderLevel: 20,
          expiryDate: '',
          manufacturer: '',
          description: '',
        });
        fetchMedicines();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  }

  async function updateStock(id: string, newStock: number) {
    try {
      await fetch('/api/pharmacy/medicines', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, stockQty: newStock }),
      });
      fetchMedicines();
    } catch (e) {
      console.error(e);
    }
  }

  const lowStockCount = medicines.filter((m) => m.stockQty <= m.reorderLevel).length;

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="card-header" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="page-title">Pharmacy & Drug Inventory</h2>
          <p className="card-subtitle">Manage medicine inventory, stock reorders, pricing, and dispensing</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link href="/dashboard/pharmacy/dispense" className="btn btn-secondary">
            <Icon name="local_pharmacy" size={18} />
            <span>Prescription Dispensing</span>
          </Link>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Icon name="add" size={18} color="white" />
            <span>Add New Medicine</span>
          </button>
        </div>
      </div>

      {/* Filter / Alert Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}>
              <Icon name="search" size={18} />
            </span>
            <input
              type="text"
              className="form-input"
              placeholder="Search by brand name, generic name, batch #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchMedicines()}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          <button
            className={`btn ${filterLowStock ? 'btn-danger' : 'btn-secondary'}`}
            onClick={() => setFilterLowStock(!filterLowStock)}
          >
            <Icon name="warning" size={16} />
            <span>Low Stock Only ({lowStockCount})</span>
          </button>

          <button className="btn btn-secondary" onClick={fetchMedicines}>
            <Icon name="refresh" size={16} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Medicine Name</th>
              <th>Category</th>
              <th>Batch #</th>
              <th>Stock Status</th>
              <th>Unit Cost</th>
              <th>Selling Price</th>
              <th>Expiry Date</th>
              <th style={{ textAlign: 'right' }}>Quick Stock Adj.</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '3rem' }}>
                  <div className="spinner spinner-lg" style={{ margin: '0 auto' }} />
                </td>
              </tr>
            ) : medicines.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '3rem' }}>
                  <Icon name="medication" size={48} color="var(--text-tertiary)" style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
                  <p style={{ fontWeight: 600 }}>No medicines found</p>
                </td>
              </tr>
            ) : (
              medicines.map((m) => {
                const isLowStock = m.stockQty <= m.reorderLevel;
                const isExpired = m.expiryDate && new Date(m.expiryDate) < new Date();

                return (
                  <tr key={m.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{m.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {m.genericName || 'No generic'} • {m.brand || 'Generic'}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-neutral">{m.category || 'Drug'}</span>
                    </td>
                    <td>{m.batchNumber || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{m.stockQty}</span>
                        {isLowStock && (
                          <span className="badge badge-danger">Low Stock (≤{m.reorderLevel})</span>
                        )}
                      </div>
                    </td>
                    <td>Rs. {m.unitCost.toFixed(2)}</td>
                    <td><strong>Rs. {m.sellingPrice.toFixed(2)}</strong></td>
                    <td>
                      {m.expiryDate ? (
                        <span style={{ color: isExpired ? 'var(--danger)' : 'inherit', fontWeight: isExpired ? 700 : 'normal' }}>
                          {new Date(m.expiryDate).toLocaleDateString()} {isExpired && '(Expired)'}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.375rem' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => updateStock(m.id, m.stockQty + 25)}
                          title="Add 25 units"
                        >
                          +25
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => updateStock(m.id, Math.max(0, m.stockQty - 10))}
                          title="Deduct 10 units"
                        >
                          -10
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Medicine Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Add Medicine to Inventory</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                <Icon name="close" size={20} />
              </button>
            </div>

            <form onSubmit={handleAddMedicine}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Brand / Commercial Name <span className="required">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      placeholder="e.g. Panadol, Amoxil"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Generic Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Paracetamol, Amoxicillin"
                      value={formData.genericName}
                      onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      {['Tablet', 'Capsule', 'Syrup', 'Injection', 'Ointment', 'Drops', 'Inhaler'].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Batch Number</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. BTH-2024-01"
                      value={formData.batchNumber}
                      onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Expiry Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Stock Qty</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.stockQty}
                      onChange={(e) => setFormData({ ...formData, stockQty: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Reorder Level</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.reorderLevel}
                      onChange={(e) => setFormData({ ...formData, reorderLevel: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Unit Cost (Rs.)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input"
                      value={formData.unitCost}
                      onChange={(e) => setFormData({ ...formData, unitCost: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Sell Price (Rs.)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input"
                      value={formData.sellingPrice}
                      onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Add to Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
