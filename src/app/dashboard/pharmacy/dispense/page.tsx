'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';

export default function DispensingPage() {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dispensingId, setDispensingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  async function fetchPrescriptions() {
    setLoading(true);
    try {
      const res = await fetch('/api/pharmacy/dispense');
      const data = await res.json();
      if (Array.isArray(data)) setPrescriptions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleDispense(itemId: string, medicineId: string | null, quantity: number) {
    setDispensingId(itemId);
    try {
      const res = await fetch('/api/pharmacy/dispense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prescriptionItemId: itemId,
          medicineId,
          quantity,
        }),
      });

      if (res.ok) {
        fetchPrescriptions();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDispensingId(null);
    }
  }

  return (
    <div className="animate-fadeIn">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Link href="/dashboard/pharmacy" className="btn btn-ghost btn-sm" style={{ padding: '0.25rem' }}>
              <Icon name="arrow_back" size={18} />
            </Link>
            <h2 className="page-title">Prescription Dispensing Queue</h2>
          </div>
          <p className="card-subtitle">Fulfill active doctor prescriptions and auto-deduct pharmacy inventory</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchPrescriptions}>
          <Icon name="refresh" size={16} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div className="spinner spinner-lg" style={{ margin: '0 auto' }} />
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="card empty-state">
          <Icon name="check_circle" size={48} color="var(--success)" style={{ opacity: 0.8, marginBottom: '0.5rem' }} />
          <div className="empty-state-title">All prescriptions fulfilled</div>
          <p className="empty-state-desc">There are currently no pending prescriptions waiting for drug dispensing.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {prescriptions.map((p) => {
            const patient = p.medicalRecord?.patient;
            const doc = p.medicalRecord?.doctor?.user?.employee;
            const docName = doc ? `Dr. ${doc.firstName} ${doc.lastName}` : 'Attending Doctor';

            return (
              <div key={p.id} className="card">
                <div className="card-header">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                        {patient ? `${patient.firstName} ${patient.lastName}` : 'Patient'}
                      </h3>
                      <span className="badge badge-primary">{patient?.patientCode}</span>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      Prescribed by {docName} • {new Date(p.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <span className="badge badge-warning">Pending Dispense</span>
                </div>

                <div className="table-container" style={{ border: 'none' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Medication</th>
                        <th>Dosage & Instructions</th>
                        <th>Qty to Dispense</th>
                        <th>Current Stock</th>
                        <th style={{ textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {p.items?.map((item: any) => {
                        const stock = item.medicine?.stockQty ?? 'N/A';
                        const isOutOfStock = item.medicine && item.medicine.stockQty < item.quantity;

                        return (
                          <tr key={item.id}>
                            <td>
                              <div style={{ fontWeight: 600 }}>{item.medicineName}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                {item.frequency} • {item.duration}
                              </div>
                            </td>
                            <td>
                              <div>{item.dosage}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.instructions || 'As directed'}</div>
                            </td>
                            <td>
                              <strong>{item.quantity} units</strong>
                            </td>
                            <td>
                              <span style={{ color: isOutOfStock ? 'var(--danger)' : 'inherit', fontWeight: 600 }}>
                                {stock} available
                              </span>
                              {isOutOfStock && <span className="badge badge-danger" style={{ marginLeft: '0.5rem' }}>Insufficient</span>}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              {item.isDispensed ? (
                                <span className="badge badge-success">Dispensed</span>
                              ) : (
                                <button
                                  className="btn btn-primary btn-sm"
                                  disabled={dispensingId === item.id || isOutOfStock}
                                  onClick={() => handleDispense(item.id, item.medicineId, item.quantity)}
                                >
                                  {dispensingId === item.id ? 'Dispensing...' : 'Dispense & Deduct'}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
