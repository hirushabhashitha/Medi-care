'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';

export default function LaboratoryPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [resultVal, setResultVal] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  async function fetchOrders() {
    setLoading(true);
    try {
      const url = statusFilter ? `/api/laboratory/orders?status=${statusFilter}` : '/api/laboratory/orders';
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveResult(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedItem) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/laboratory/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: selectedItem.id,
          orderId: selectedItem.labOrderId,
          result: resultVal,
          remarks,
          status: 'COMPLETED',
        }),
      });

      if (res.ok) {
        setSelectedItem(null);
        setResultVal('');
        setRemarks('');
        fetchOrders();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="card-header" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="page-title">Laboratory Diagnostic Orders</h2>
          <p className="card-subtitle">Sample collection, diagnostic test execution, and clinical result reporting</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link href="/dashboard/laboratory/catalog" className="btn btn-secondary">
            <Icon name="science" size={18} />
            <span>Test Catalog & Reference Ranges</span>
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '180px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Orders Status</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <button className="btn btn-secondary" onClick={fetchOrders}>
            <Icon name="refresh" size={16} />
            <span>Refresh Queue</span>
          </button>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div className="spinner spinner-lg" style={{ margin: '0 auto' }} />
        </div>
      ) : orders.length === 0 ? (
        <div className="card empty-state">
          <Icon name="biotech" size={48} color="var(--text-tertiary)" style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
          <div className="empty-state-title">No laboratory orders found</div>
          <p className="empty-state-desc">Lab orders requested by doctors will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map((order) => (
            <div key={order.id} className="card">
              <div className="card-header">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                      {order.patient?.firstName} {order.patient?.lastName}
                    </h3>
                    <span className="badge badge-primary">{order.patient?.patientCode}</span>
                    <span className={`badge ${order.status === 'COMPLETED' ? 'badge-success' : 'badge-warning'}`}>
                      {order.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    Ordered: {new Date(order.orderDate).toLocaleString()} • Ordered by: {order.orderedBy || 'Doctor'}
                  </div>
                </div>
              </div>

              <table className="data-table">
                <thead>
                  <tr>
                    <th>Test Name</th>
                    <th>Category</th>
                    <th>Reference Range</th>
                    <th>Reported Result</th>
                    <th>Remarks</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item: any) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600 }}>{item.labTest?.name}</td>
                      <td>{item.labTest?.category}</td>
                      <td>
                        {item.labTest?.normalRange} {item.labTest?.unit}
                      </td>
                      <td>
                        <strong>{item.result || 'Pending Result'}</strong>
                      </td>
                      <td>{item.remarks || '—'}</td>
                      <td>
                        <span className={`badge ${item.status === 'COMPLETED' ? 'badge-success' : 'badge-warning'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setSelectedItem({ ...item, labOrderId: order.id });
                            setResultVal(item.result || '');
                            setRemarks(item.remarks || '');
                          }}
                        >
                          <Icon name="edit" size={14} />
                          <span>{item.result ? 'Edit Result' : 'Enter Result'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {/* Enter Result Modal */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Enter Test Result</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setSelectedItem(null)}>
                <Icon name="close" size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveResult}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.125rem' }}>{selectedItem.labTest?.name}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    Standard Reference: <strong>{selectedItem.labTest?.normalRange} {selectedItem.labTest?.unit}</strong>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Observed Test Result <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder={`e.g. 14.2 ${selectedItem.labTest?.unit || ''}`}
                    value={resultVal}
                    onChange={(e) => setResultVal(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Technician Remarks & Observations</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Normal findings, elevated counts, sample hemolysis, etc."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedItem(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Finalize & Approve Result'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
