'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchInvoice();
  }, [id]);

  async function fetchInvoice() {
    try {
      const res = await fetch(`/api/billing/invoices/${id}`);
      if (!res.ok) throw new Error('Invoice not found');
      const data = await res.json();
      setInvoice(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem' }}>
        <div className="spinner spinner-lg" style={{ margin: '0 auto' }} />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="empty-state">
        <Icon name="receipt_long" size={48} color="var(--text-tertiary)" />
        <h3 className="empty-state-title">Invoice Not Found</h3>
        <button className="btn btn-secondary" onClick={() => router.push('/dashboard/billing')}>
          Back to Billing
        </button>
      </div>
    );
  }

  const totalPaid = invoice.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0;
  const balanceDue = Math.max(0, invoice.grandTotal - totalPaid);

  return (
    <div className="animate-fadeIn" style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Top Action Buttons (Hidden on Print) */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <button className="btn btn-ghost" onClick={() => router.push('/dashboard/billing')} style={{ gap: '0.5rem' }}>
          <Icon name="arrow_back" size={18} />
          <span>Back to Billing</span>
        </button>
        <button className="btn btn-primary" onClick={() => window.print()} style={{ gap: '0.5rem' }}>
          <Icon name="print" size={18} color="white" />
          <span>Print Official Receipt</span>
        </button>
      </div>

      {/* Printable Invoice Sheet */}
      <div className="card printable-invoice" style={{ padding: '2.5rem', background: 'white', color: '#111827' }}>
        {/* Header Branding */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #e5e7eb', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #3391ff, #10b981)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
            }}>
              <Icon name="local_hospital" size={28} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#111827' }}>MediCore Hospital</h1>
              <p style={{ fontSize: '0.8125rem', color: '#6b7280', margin: '0.125rem 0 0' }}>
                Healthcare Excellence & Comprehensive Clinical Care
              </p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e40af' }}>INVOICE / RECEIPT</div>
            <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginTop: '0.25rem' }}>#{invoice.invoiceNumber}</div>
            <div style={{ fontSize: '0.8125rem', color: '#6b7280' }}>
              Date: {new Date(invoice.invoiceDate).toLocaleDateString('en-US', { dateStyle: 'medium' })}
            </div>
          </div>
        </div>

        {/* Billed To / Patient Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280', fontWeight: 700 }}>Billed To Patient:</div>
            <div style={{ fontSize: '1.125rem', fontWeight: 700, marginTop: '0.25rem' }}>
              {invoice.patient?.firstName} {invoice.patient?.lastName}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#4b5563', marginTop: '0.25rem' }}>
              MRN: <strong>{invoice.patient?.patientCode}</strong>
            </div>
            <div style={{ fontSize: '0.875rem', color: '#4b5563' }}>Phone: {invoice.patient?.phone || 'N/A'}</div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280', fontWeight: 700 }}>Payment Status:</div>
            <div style={{
              display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '9999px',
              fontSize: '0.875rem', fontWeight: 700, marginTop: '0.375rem',
              background: invoice.status === 'PAID' ? '#d1fae5' : '#fef3c7',
              color: invoice.status === 'PAID' ? '#065f46' : '#92400e'
            }}>
              {invoice.status}
            </div>
          </div>
        </div>

        {/* Itemized Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb', background: '#f9fafb' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase' }}>Description</th>
              <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.75rem', textTransform: 'uppercase' }}>Type</th>
              <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.75rem', textTransform: 'uppercase' }}>Qty</th>
              <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.75rem', textTransform: 'uppercase' }}>Unit Price (Rs.)</th>
              <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.75rem', textTransform: 'uppercase' }}>Total (Rs.)</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items?.map((item: any) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '0.75rem', fontWeight: 600 }}>{item.description}</td>
                <td style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.8125rem', color: '#6b7280' }}>
                  {item.itemType}
                </td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ padding: '0.75rem', textAlign: 'right' }}>{item.unitPrice.toFixed(2)}</td>
                <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 700 }}>
                  {item.totalPrice.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Financial Breakdown */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
          <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Subtotal:</span>
              <span>Rs. {invoice.subtotal.toFixed(2)}</span>
            </div>
            {invoice.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669' }}>
                <span>Discount:</span>
                <span>- Rs. {invoice.discount.toFixed(2)}</span>
              </div>
            )}
            {invoice.tax > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280' }}>
                <span>Tax / Service:</span>
                <span>+ Rs. {invoice.tax.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #e5e7eb', paddingTop: '0.5rem', fontWeight: 800, fontSize: '1.125rem', color: '#111827' }}>
              <span>Grand Total:</span>
              <span>Rs. {invoice.grandTotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: 600 }}>
              <span>Amount Paid:</span>
              <span>Rs. {totalPaid.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: balanceDue > 0 ? '#dc2626' : '#059669' }}>
              <span>Balance Due:</span>
              <span>Rs. {balanceDue.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payments Recorded */}
        {invoice.payments?.length > 0 && (
          <div style={{ borderTop: '1px dashed #e5e7eb', paddingTop: '1rem', marginBottom: '2rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.5rem' }}>Payments Ledger:</div>
            {invoice.payments.map((p: any) => (
              <div key={p.id} style={{ fontSize: '0.8125rem', color: '#4b5563', display: 'flex', justifyContent: 'space-between' }}>
                <span>{p.receiptNumber} ({p.paymentMethod}) - {new Date(p.paymentDate).toLocaleDateString()}</span>
                <strong>Rs. {p.amount.toFixed(2)}</strong>
              </div>
            ))}
          </div>
        )}

        {/* Footer Guarantee */}
        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem', textAlign: 'center', fontSize: '0.75rem', color: '#9ca3af' }}>
          Thank you for choosing MediCore Hospital Management System. This is a computer-generated official tax invoice.
        </div>
      </div>
    </div>
  );
}
