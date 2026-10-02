'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';

export default function PatientProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'consultations' | 'prescriptions' | 'labs' | 'admissions' | 'billing'>('consultations');

  useEffect(() => {
    if (id) fetchPatientDetails();
  }, [id]);

  async function fetchPatientDetails() {
    try {
      const res = await fetch(`/api/patients/${id}`);
      if (!res.ok) throw new Error('Patient not found');
      const data = await res.json();
      setPatient(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <div className="spinner spinner-lg" style={{ margin: '0 auto' }} />
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading patient profile...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="empty-state">
        <Icon name="person_off" size={48} color="var(--text-tertiary)" />
        <h3 className="empty-state-title">Patient not found</h3>
        <button className="btn btn-secondary" onClick={() => router.push('/dashboard/patients')}>
          Back to Patients
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Back button & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <button className="btn btn-ghost" onClick={() => router.push('/dashboard/patients')} style={{ gap: '0.5rem' }}>
          <Icon name="arrow_back" size={18} />
          <span>Back to Patients</span>
        </button>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link href={`/dashboard/appointments?patientId=${patient.id}`} className="btn btn-secondary btn-sm">
            <Icon name="calendar_month" size={16} />
            <span>Book Appointment</span>
          </Link>
          <Link href={`/dashboard/consultations?patientId=${patient.id}`} className="btn btn-primary btn-sm">
            <Icon name="stethoscope" size={16} color="white" />
            <span>New Consultation</span>
          </Link>
        </div>
      </div>

      {/* Patient Header Card */}
      <div className="card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, var(--bg-elevated) 0%, var(--primary-50) 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            <div
              className="avatar avatar-lg"
              style={{
                background: patient.gender === 'Female' ? '#ec4899' : '#3391ff',
                fontSize: '1.5rem',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              {patient.firstName[0]}{patient.lastName[0]}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                  {patient.firstName} {patient.lastName}
                </h2>
                <span className="badge badge-primary">{patient.patientCode}</span>
                {patient.bloodGroup && (
                  <span className="badge badge-danger">Blood: {patient.bloodGroup}</span>
                )}
              </div>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                {patient.gender || 'Unknown Gender'} •{' '}
                {patient.dateOfBirth
                  ? `${new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} years old`
                  : 'DOB not recorded'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Phone</div>
              <div style={{ fontWeight: 600 }}>{patient.phone || 'N/A'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Emergency Contact</div>
              <div style={{ fontWeight: 600 }}>{patient.emergencyContact || 'None listed'}</div>
            </div>
            {patient.allergies && (
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--danger)', textTransform: 'uppercase', fontWeight: 600 }}>Allergies</div>
                <div style={{ fontWeight: 700, color: 'var(--danger)' }}>{patient.allergies}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'consultations' ? 'active' : ''}`}
          onClick={() => setActiveTab('consultations')}
        >
          Medical Records ({patient.medicalRecords?.length || 0})
        </button>
        <button
          className={`tab ${activeTab === 'prescriptions' ? 'active' : ''}`}
          onClick={() => setActiveTab('prescriptions')}
        >
          Prescriptions
        </button>
        <button
          className={`tab ${activeTab === 'labs' ? 'active' : ''}`}
          onClick={() => setActiveTab('labs')}
        >
          Laboratory ({patient.labOrders?.length || 0})
        </button>
        <button
          className={`tab ${activeTab === 'admissions' ? 'active' : ''}`}
          onClick={() => setActiveTab('admissions')}
        >
          Admissions ({patient.admissions?.length || 0})
        </button>
        <button
          className={`tab ${activeTab === 'billing' ? 'active' : ''}`}
          onClick={() => setActiveTab('billing')}
        >
          Invoices & Billing ({patient.invoices?.length || 0})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'consultations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {patient.medicalRecords?.length === 0 ? (
            <div className="card empty-state">
              <Icon name="stethoscope" size={40} color="var(--text-tertiary)" style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
              <div className="empty-state-title">No clinical records found</div>
              <p className="empty-state-desc">Create a new consultation record for this patient</p>
            </div>
          ) : (
            patient.medicalRecords.map((record: any) => (
              <div key={record.id} className="card" style={{ borderLeft: '4px solid var(--primary-500)' }}>
                <div className="card-header">
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.125rem' }}>
                      Diagnosis: {record.diagnosis || 'General Consultation'}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      Dr. {record.doctor?.user?.employee?.firstName} {record.doctor?.user?.employee?.lastName} •{' '}
                      {new Date(record.visitDate).toLocaleDateString('en-US', { dateStyle: 'long' })}
                    </div>
                  </div>
                  {record.diagnosisCode && <span className="badge badge-purple">ICD: {record.diagnosisCode}</span>}
                </div>

                {/* Vitals */}
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)', marginBottom: '1rem' }}>
                  {record.bloodPressure && <div><span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>BP: </span><strong>{record.bloodPressure}</strong></div>}
                  {record.pulse && <div><span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Pulse: </span><strong>{record.pulse} bpm</strong></div>}
                  {record.temperature && <div><span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Temp: </span><strong>{record.temperature}°F</strong></div>}
                  {record.spO2 && <div><span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>SpO2: </span><strong>{record.spO2}%</strong></div>}
                  {record.weight && <div><span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Weight: </span><strong>{record.weight} kg</strong></div>}
                </div>

                {record.symptoms && (
                  <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    <strong>Symptoms:</strong> {record.symptoms}
                  </p>
                )}
                {record.treatmentNotes && (
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <strong>Treatment Plan:</strong> {record.treatmentNotes}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'prescriptions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {patient.medicalRecords?.flatMap((r: any) => r.prescriptions).length === 0 ? (
            <div className="card empty-state">
              <Icon name="medication" size={40} color="var(--text-tertiary)" style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
              <div className="empty-state-title">No prescriptions on record</div>
            </div>
          ) : (
            patient.medicalRecords.map((r: any) =>
              r.prescriptions.map((p: any) => (
                <div key={p.id} className="card">
                  <div className="card-header">
                    <div>
                      <div className="card-title">Prescription #{p.id.slice(-6).toUpperCase()}</div>
                      <div className="card-subtitle">{new Date(p.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Medicine</th>
                        <th>Dosage</th>
                        <th>Frequency</th>
                        <th>Duration</th>
                        <th>Instructions</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {p.items?.map((item: any) => (
                        <tr key={item.id}>
                          <td style={{ fontWeight: 600 }}>{item.medicineName}</td>
                          <td>{item.dosage}</td>
                          <td>{item.frequency}</td>
                          <td>{item.duration}</td>
                          <td>{item.instructions}</td>
                          <td>
                            {item.isDispensed ? (
                              <span className="badge badge-success">Dispensed</span>
                            ) : (
                              <span className="badge badge-warning">Pending</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))
            )
          )}
        </div>
      )}

      {activeTab === 'labs' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order Date</th>
                <th>Ordered By</th>
                <th>Tests</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {patient.labOrders?.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>No lab orders</td>
                </tr>
              ) : (
                patient.labOrders.map((order: any) => (
                  <tr key={order.id}>
                    <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                    <td>{order.orderedBy}</td>
                    <td>
                      {order.items?.map((it: any) => (
                        <div key={it.id} style={{ fontSize: '0.875rem' }}>
                          • {it.labTest?.name} ({it.result ? `Result: ${it.result}` : 'Pending'})
                        </div>
                      ))}
                    </td>
                    <td>
                      <span className={`badge ${order.status === 'COMPLETED' ? 'badge-success' : 'badge-warning'}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'admissions' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ward & Bed</th>
                <th>Admission Date</th>
                <th>Discharge Date</th>
                <th>Diagnosis</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {patient.admissions?.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No admissions recorded</td>
                </tr>
              ) : (
                patient.admissions.map((adm: any) => (
                  <tr key={adm.id}>
                    <td style={{ fontWeight: 600 }}>
                      {adm.bed?.ward?.name} - {adm.bed?.bedNumber}
                    </td>
                    <td>{new Date(adm.admissionDate).toLocaleDateString()}</td>
                    <td>{adm.dischargeDate ? new Date(adm.dischargeDate).toLocaleDateString() : 'Ongoing'}</td>
                    <td>{adm.diagnosis || 'N/A'}</td>
                    <td>
                      <span className={`badge ${adm.status === 'ADMITTED' ? 'badge-warning' : 'badge-neutral'}`}>
                        {adm.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'billing' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Date</th>
                <th>Grand Total</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {patient.invoices?.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No invoices on file</td>
                </tr>
              ) : (
                patient.invoices.map((inv: any) => (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: 600 }}>{inv.invoiceNumber}</td>
                    <td>{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                    <td>Rs. {inv.grandTotal.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${inv.status === 'PAID' ? 'badge-success' : 'badge-warning'}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link href={`/dashboard/billing/${inv.id}`} className="btn btn-secondary btn-sm">
                        <Icon name="receipt_long" size={16} />
                        <span>View Invoice</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
