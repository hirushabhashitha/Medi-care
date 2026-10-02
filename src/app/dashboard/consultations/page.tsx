'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';

export default function ConsultationsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialPatientId = searchParams.get('patientId') || '';
  const initialApptId = searchParams.get('appointmentId') || '';

  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [labTests, setLabTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [patientId, setPatientId] = useState(initialPatientId);
  const [doctorId, setDoctorId] = useState('');
  const [appointmentId, setAppointmentId] = useState(initialApptId);

  // Vitals
  const [bloodPressure, setBloodPressure] = useState('120/80');
  const [pulse, setPulse] = useState('72');
  const [temperature, setTemperature] = useState('98.6');
  const [weight, setWeight] = useState('68');
  const [spO2, setSpO2] = useState('99');

  // Clinical
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [diagnosisCode, setDiagnosisCode] = useState('');
  const [treatmentNotes, setTreatmentNotes] = useState('');

  // Prescriptions
  const [prescriptions, setPrescriptions] = useState<any[]>([
    { medicineId: '', medicineName: '', dosage: '500mg', frequency: 'TID (3x daily)', duration: '5 days', instructions: 'After meals', quantity: 15 },
  ]);

  // Selected Lab Tests
  const [selectedLabTests, setSelectedLabTests] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/patients').then((r) => r.json()),
      fetch('/api/doctors').then((r) => r.json()),
      fetch('/api/pharmacy/medicines').then((r) => r.json()),
      fetch('/api/laboratory/tests').then((r) => r.json()),
    ]).then(([pData, dData, mData, lData]) => {
      if (Array.isArray(pData)) setPatients(pData);
      if (Array.isArray(dData)) {
        setDoctors(dData);
        if (dData.length > 0) setDoctorId(dData[0].id);
      }
      if (Array.isArray(mData)) setMedicines(mData);
      if (Array.isArray(lData)) setLabTests(lData);
      setLoading(false);
    });
  }, []);

  function addPrescriptionRow() {
    setPrescriptions([
      ...prescriptions,
      { medicineId: '', medicineName: '', dosage: '', frequency: 'BID (2x daily)', duration: '7 days', instructions: '', quantity: 14 },
    ]);
  }

  function removePrescriptionRow(index: number) {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  }

  function handleMedicineSelect(index: number, medId: string) {
    const med = medicines.find((m) => m.id === medId);
    const updated = [...prescriptions];
    updated[index].medicineId = medId;
    if (med) updated[index].medicineName = med.name;
    setPrescriptions(updated);
  }

  function toggleLabTest(testId: string) {
    if (selectedLabTests.includes(testId)) {
      setSelectedLabTests(selectedLabTests.filter((id) => id !== testId));
    } else {
      setSelectedLabTests([...selectedLabTests, testId]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!patientId || !doctorId) {
      alert('Please select both a patient and attending doctor');
      return;
    }

    setSubmitting(true);
    setSuccessMsg('');

    try {
      const res = await fetch('/api/medical-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          doctorId,
          appointmentId: appointmentId || undefined,
          bloodPressure,
          pulse,
          temperature,
          weight,
          spO2,
          symptoms,
          diagnosis,
          diagnosisCode,
          treatmentNotes,
          prescriptions: prescriptions.filter((p) => p.medicineName.trim() !== ''),
          labTests: selectedLabTests,
        }),
      });

      if (res.ok) {
        setSuccessMsg('Consultation and prescriptions recorded successfully!');
        setTimeout(() => {
          router.push(`/dashboard/patients/${patientId}`);
        }, 1200);
      } else {
        alert('Failed to save consultation');
      }
    } catch (e) {
      console.error(e);
      alert('Network error while saving consultation');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem' }}>
        <div className="spinner spinner-lg" style={{ margin: '0 auto' }} />
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading clinical workbench...</p>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="card-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2 className="page-title">Doctor Consultation Workbench (EMR)</h2>
          <p className="card-subtitle">Record clinical examination, vitals, electronic prescriptions, and lab requests</p>
        </div>
      </div>

      {successMsg && (
        <div style={{
          padding: '1rem', background: 'var(--success-light)', color: '#065f46',
          borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem'
        }}>
          <Icon name="check_circle" size={20} color="#065f46" />
          <span style={{ fontWeight: 600 }}>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* 1. Patient & Doctor Selection */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: '1rem' }}>Patient & Attending Doctor</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Select Patient <span className="required">*</span></label>
              <select
                className="form-select"
                required
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
              >
                <option value="">Select patient...</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} ({p.patientCode} - Blood: {p.bloodGroup || 'N/A'})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Attending Doctor <span className="required">*</span></label>
              <select
                className="form-select"
                required
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
              >
                {doctors.map((d) => {
                  const emp = d.user?.employee;
                  return (
                    <option key={d.id} value={d.id}>
                      {emp ? `Dr. ${emp.firstName} ${emp.lastName}` : d.user?.username} ({d.department?.name})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        {/* 2. Patient Vitals */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: '1rem' }}>Vital Signs Recording</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Blood Pressure</label>
              <input
                type="text"
                className="form-input"
                placeholder="120/80"
                value={bloodPressure}
                onChange={(e) => setBloodPressure(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Pulse (bpm)</label>
              <input
                type="number"
                className="form-input"
                placeholder="72"
                value={pulse}
                onChange={(e) => setPulse(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Temperature (°F)</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                placeholder="98.6"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">SpO2 (%)</label>
              <input
                type="number"
                className="form-input"
                placeholder="98"
                value={spO2}
                onChange={(e) => setSpO2(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Weight (kg)</label>
              <input
                type="number"
                step="0.5"
                className="form-input"
                placeholder="70"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* 3. Clinical Examination & Diagnosis */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: '1rem' }}>Clinical Diagnosis & Symptoms</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Reported Symptoms</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Acute sore throat, dry cough, mild fatigue for 3 days"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Primary Diagnosis <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Acute Upper Respiratory Tract Infection (URTI)"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">ICD-10 Code</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. J06.9"
                  value={diagnosisCode}
                  onChange={(e) => setDiagnosisCode(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Clinical Observations & Treatment Advice</label>
              <textarea
                className="form-textarea"
                placeholder="Rest, hydration, follow-up in 5 days if fever persists..."
                value={treatmentNotes}
                onChange={(e) => setTreatmentNotes(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* 4. Electronic Prescription Pad */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div className="card-title">Electronic Prescription (Rx)</div>
            <button type="button" className="btn btn-secondary btn-sm" onClick={addPrescriptionRow}>
              <Icon name="add" size={16} />
              <span>Add Medication</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {prescriptions.map((p, idx) => (
              <div
                key={idx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto',
                  gap: '0.5rem',
                  alignItems: 'center',
                  padding: '0.75rem',
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                <div>
                  <select
                    className="form-select"
                    value={p.medicineId}
                    onChange={(e) => handleMedicineSelect(idx, e.target.value)}
                  >
                    <option value="">Select from inventory or type...</option>
                    {medicines.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.genericName || m.category}) - Stock: {m.stockQty}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Dosage (500mg)"
                    value={p.dosage}
                    onChange={(e) => {
                      const upd = [...prescriptions];
                      upd[idx].dosage = e.target.value;
                      setPrescriptions(upd);
                    }}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Frequency (TID)"
                    value={p.frequency}
                    onChange={(e) => {
                      const upd = [...prescriptions];
                      upd[idx].frequency = e.target.value;
                      setPrescriptions(upd);
                    }}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Duration (5d)"
                    value={p.duration}
                    onChange={(e) => {
                      const upd = [...prescriptions];
                      upd[idx].duration = e.target.value;
                      setPrescriptions(upd);
                    }}
                  />
                </div>
                <div>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Qty"
                    value={p.quantity}
                    onChange={(e) => {
                      const upd = [...prescriptions];
                      upd[idx].quantity = e.target.value;
                      setPrescriptions(upd);
                    }}
                  />
                </div>
                <div>
                  <button
                    type="button"
                    className="btn btn-ghost btn-icon"
                    style={{ color: 'var(--danger)' }}
                    onClick={() => removePrescriptionRow(idx)}
                    title="Remove item"
                  >
                    <Icon name="delete" size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Laboratory Test Requests */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: '1rem' }}>Order Diagnostic Lab Tests</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            {labTests.map((test) => {
              const isSelected = selectedLabTests.includes(test.id);
              return (
                <div
                  key={test.id}
                  onClick={() => toggleLabTest(test.id)}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-lg)',
                    border: `1.5px solid ${isSelected ? 'var(--primary-500)' : 'var(--border-light)'}`,
                    background: isSelected ? 'var(--primary-50)' : 'var(--bg-elevated)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 150ms ease',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{test.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {test.category} • Rs. {test.price}
                    </div>
                  </div>
                  {isSelected && <Icon name="check_circle" size={18} color="var(--primary-600)" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button type="button" className="btn btn-secondary" onClick={() => router.back()}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
            {submitting ? 'Recording Consultation...' : 'Complete & Save Medical Record'}
          </button>
        </div>
      </form>
    </div>
  );
}
