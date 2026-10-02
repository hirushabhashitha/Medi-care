'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';

export default function PaymentsPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/billing/invoices')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setInvoices(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const allPayments = invoices.flatMap((inv) =>
    (inv.payments || []).map((p: any) => ({
      ...p,
      patient: inv.patient,
      invoiceNumber: inv.invoiceNumber,
      invoiceId: inv.id,
    }))
  );

  const totalCollected = allPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="animate-fadeIn">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Link href="/dashboard/billing" className="btn btn-ghost btn-sm" style={{ padding: '0.25rem' }}>
              <Icon name="arrow_back" size={18} />
            </Link>
            <h2 className="page-title">Hospital Payments Ledger</h2>
          </div>
          <p className="card-subtitle">Complete ledger of cash, card, and insurance payments collected</p>
        </div>
        <div className="card" style={{ padding: '0.75rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Total Collections</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)' }}>
            Rs. {totalCollected.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Receipt #</th>
              <th>Invoice #</th>
              <th>Patient</th>
              <th>Date & Time</th>
              <th>Method</th>
              <th>Amount Paid</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>
                  <div className="spinner spinner-lg" style={{ margin: '0 auto' }} />
                </td>
              </tr>
            ) : allPayments.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>No payment records found</td>
              </tr>
            ) : (
              allPayments.map((pay) => (
                <tr key={pay.id}>
                  <td>
                    <span className="badge badge-success">{pay.receiptNumber}</span>
                  </td>
                  <td>
                    <span className="badge badge-primary">{pay.invoiceNumber}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{pay.patient?.firstName} {pay.patient?.lastName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{pay.patient?.patientCode}</div>
                  </td>
                  <td>{new Date(pay.paymentDate).toLocaleString()}</td>
                  <td>
                    <span className="badge badge-neutral">{pay.paymentMethod}</span>
                  </td>
                  <td>
                    <strong style={{ color: 'var(--success)' }}>Rs. {pay.amount.toLocaleString()}</strong>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Link href={`/dashboard/billing/${pay.invoiceId}`} className="btn btn-secondary btn-sm">
                      <Icon name="print" size={14} />
                      <span>Receipt</span>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
