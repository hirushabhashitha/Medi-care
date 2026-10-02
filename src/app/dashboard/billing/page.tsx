'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';

export default function BillingPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [labTests, setLabTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // Generate Bill Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [billItems, setBillItems] = useState<any[]>([
    { itemType: 'CONSULTATION', description: 'Doctor Consultation Fee', quantity: 1, unitPrice: 2000 },
  ]);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Receive Payment Modal
  const [payInvoice, setPayInvoice] = useState<any>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState('CASH');

  useEffect(() => {
    fetchInvoices();
    fetch('/api/patients').then((r) => r.json()).then((d) => Array.isArray(d) && setPatients(d));
    fetch('/api/pharmacy/medicines').then((r) => r.json()).then((d) => Array.isArray(d) && setMedicines(d));
    fetch('/api/laboratory/tests').then((r) => r.json()).then((d) => Array.isArray(d) && setLabTests(d));
  }, [statusFilter]);

  async function fetchInvoices() {
    setLoading(true);
    try {
      const url = statusFilter ? `/api/billing/invoices?status=${statusFilter}` : '/api/billing/invoices';
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) setInvoices(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function addItemRow() {
    setBillItems([...billItems, { itemType: 'MEDICINE', description: 'Medication', quantity: 1, unitPrice: 500 }]);
  }

  function removeItemRow(idx: number) {
    setBillItems(billItems.filter((_, i) => i !== idx));
  }

  async function handleCreateInvoice(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPatientId) {
      alert('Please select a patient');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/billing/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatientId,
          items: billItems,
          discount,
          tax,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setSelectedPatientId('');
        setBillItems([{ itemType: 'CONSULTATION', description: 'Doctor Consultation Fee', quantity: 1, unitPrice: 2000 }]);
        fetchInvoices();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRecordPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!payInvoice || !payAmount) return;

    try {
      const res = await fetch('/api/billing/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: payInvoice.id,
          amount: payAmount,
          paymentMethod: payMethod,
        }),
      });

      if (res.ok) {
        setPayInvoice(null);
        fetchInvoices();
      }
    } catch (e) {
      console.error(e);
    }
  }

  const subtotal = billItems.reduce((sum, item) => sum + (Number(item.unitPrice) || 0) * (Number(item.quantity) || 1), 0);
  const grandTotal = Math.max(0, subtotal + Number(tax) - Number(discount));

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="card-header" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="page-title">Hospital Billing & Invoices</h2>
          <p className="card-subtitle">Generate bills, record patient payments, print official receipts</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Icon name="add" size={18} color="white" />
            <span>Generate New Bill</span>
          </button>
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
            <option value="">All Invoices</option>
            <option value="PENDING">Pending Payment</option>
            <option value="PAID">Paid</option>
            <option value="PARTIALLY_PAID">Partially Paid</option>
          </select>

          <button className="btn btn-secondary" onClick={fetchInvoices}>
            <Icon name="refresh" size={16} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Patient</th>
              <th>Date</th>
              <th>Grand Total</th>
              <th>Paid Amount</th>
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
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>
                  <Icon name="receipt_long" size={48} color="var(--text-tertiary)" style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
                  <p style={{ fontWeight: 600 }}>No invoices found</p>
                </td>
              </tr>
            ) : (
              invoices.map((inv) => {
                const totalPaid = inv.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0;
                const balance = Math.max(0, inv.grandTotal - totalPaid);

                return (
                  <tr key={inv.id}>
                    <td>
                      <span className="badge badge-primary">{inv.invoiceNumber}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{inv.patient?.firstName} {inv.patient?.lastName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{inv.patient?.patientCode}</div>
                    </td>
                    <td>{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                    <td>
                      <strong>Rs. {inv.grandTotal.toLocaleString()}</strong>
                    </td>
                    <td>
                      <span style={{ color: totalPaid > 0 ? 'var(--success)' : 'inherit' }}>
                        Rs. {totalPaid.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        inv.status === 'PAID' ? 'badge-success' :
                        inv.status === 'PARTIALLY_PAID' ? 'badge-info' : 'badge-warning'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        {balance > 0 && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                              setPayInvoice(inv);
                              setPayAmount(balance);
                            }}
                          >
                            Pay (Rs. {balance.toLocaleString()})
                          </button>
                        )}
                        <Link href={`/dashboard/billing/${inv.id}`} className="btn btn-secondary btn-sm">
                          <Icon name="print" size={16} />
                          <span>Print</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Generate Bill Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Generate Hospital Bill</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                <Icon name="close" size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Select Patient <span className="required">*</span></label>
                  <select
                    className="form-select"
                    required
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                  >
                    <option value="">Choose patient...</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.firstName} {p.lastName} ({p.patientCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Bill Line Items</div>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={addItemRow}>
                    <Icon name="add" size={16} />
                    <span>Add Item</span>
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '250px', overflowY: 'auto' }}>
                  {billItems.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1.2fr 2fr 0.8fr 1fr auto',
                        gap: '0.5rem',
                        alignItems: 'center',
                        padding: '0.5rem',
                        background: 'var(--bg-tertiary)',
                        borderRadius: 'var(--radius-lg)',
                      }}
                    >
                      <select
                        className="form-select"
                        value={item.itemType}
                        onChange={(e) => {
                          const upd = [...billItems];
                          upd[idx].itemType = e.target.value;
                          setBillItems(upd);
                        }}
                      >
                        <option value="CONSULTATION">Consultation</option>
                        <option value="MEDICINE">Medicine</option>
                        <option value="LAB_TEST">Lab Test</option>
                        <option value="BED_CHARGE">Bed Stay</option>
                        <option value="OTHER">Other</option>
                      </select>

                      <input
                        type="text"
                        className="form-input"
                        placeholder="Item Description"
                        value={item.description}
                        onChange={(e) => {
                          const upd = [...billItems];
                          upd[idx].description = e.target.value;
                          setBillItems(upd);
                        }}
                      />

                      <input
                        type="number"
                        className="form-input"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => {
                          const upd = [...billItems];
                          upd[idx].quantity = Number(e.target.value);
                          setBillItems(upd);
                        }}
                      />

                      <input
                        type="number"
                        className="form-input"
                        placeholder="Unit Price"
                        value={item.unitPrice}
                        onChange={(e) => {
                          const upd = [...billItems];
                          upd[idx].unitPrice = Number(e.target.value);
                          setBillItems(upd);
                        }}
                      />

                      <button
                        type="button"
                        className="btn btn-ghost btn-icon"
                        style={{ color: 'var(--danger)' }}
                        onClick={() => removeItemRow(idx)}
                      >
                        <Icon name="delete" size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                  <div className="form-group">
                    <label className="form-label">Discount (Rs.)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tax / Service Charge (Rs.)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={tax}
                      onChange={(e) => setTax(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div style={{ padding: '1rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div>Subtotal: <strong>Rs. {subtotal.toLocaleString()}</strong></div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Discount: Rs. {discount} • Tax: Rs. {tax}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Grand Total</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-600)' }}>
                      Rs. {grandTotal.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Generating...' : 'Issue Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receive Payment Modal */}
      {payInvoice && (
        <div className="modal-overlay" onClick={() => setPayInvoice(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Record Payment for {payInvoice.invoiceNumber}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setPayInvoice(null)}>
                <Icon name="close" size={20} />
              </button>
            </div>

            <form onSubmit={handleRecordPayment}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>Patient: <strong>{payInvoice.patient?.firstName} {payInvoice.patient?.lastName}</strong></div>
                <div>Invoice Total: <strong>Rs. {payInvoice.grandTotal.toLocaleString()}</strong></div>

                <div className="form-group">
                  <label className="form-label">Payment Amount (Rs.) <span className="required">*</span></label>
                  <input
                    type="number"
                    className="form-input"
                    required
                    value={payAmount}
                    onChange={(e) => setPayAmount(Number(e.target.value))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <select
                    className="form-select"
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                  >
                    <option value="CASH">Cash</option>
                    <option value="CARD">Credit / Debit Card</option>
                    <option value="INSURANCE">Insurance Claim</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setPayInvoice(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Receive Payment & Issue Receipt</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
