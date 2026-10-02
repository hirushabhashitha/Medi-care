'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/Icon';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [attendances, setAttendances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'directory' | 'attendance'>('directory');
  const [markingId, setMarkingId] = useState<string | null>(null);

  useEffect(() => {
    fetchEmployees();
    fetchAttendance();
  }, []);

  async function fetchEmployees() {
    try {
      const res = await fetch('/api/employees');
      const data = await res.json();
      if (Array.isArray(data)) setEmployees(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAttendance() {
    try {
      const res = await fetch('/api/attendance');
      const data = await res.json();
      if (Array.isArray(data)) setAttendances(data);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleMarkAttendance(employeeId: string, status: string) {
    setMarkingId(employeeId);
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, status }),
      });
      if (res.ok) fetchAttendance();
    } catch (e) {
      console.error(e);
    } finally {
      setMarkingId(null);
    }
  }

  return (
    <div className="animate-fadeIn">
      <div className="card-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2 className="page-title">Hospital Staff & Employee Directory</h2>
          <p className="card-subtitle">Manage medical personnel, administration staff, and daily attendance logs</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'directory' ? 'active' : ''}`}
          onClick={() => setActiveTab('directory')}
        >
          Staff Directory ({employees.length})
        </button>
        <button
          className={`tab ${activeTab === 'attendance' ? 'active' : ''}`}
          onClick={() => setActiveTab('attendance')}
        >
          Daily Attendance Tracker
        </button>
      </div>

      {activeTab === 'directory' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee Code</th>
                <th>Full Name</th>
                <th>Department</th>
                <th>Designation / Role</th>
                <th>Contact</th>
                <th>Joined Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>
                    <div className="spinner spinner-lg" style={{ margin: '0 auto' }} />
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>No staff records registered</td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <span className="badge badge-primary">{emp.employeeCode}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{emp.firstName} {emp.lastName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>@{emp.user?.username}</div>
                    </td>
                    <td>
                      <span className="badge badge-neutral">{emp.department?.name || 'General Staff'}</span>
                    </td>
                    <td>{emp.designation || emp.user?.role}</td>
                    <td>
                      <div>{emp.phone || 'No phone'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{emp.user?.email}</div>
                    </td>
                    <td>{new Date(emp.joinDate).toLocaleDateString()}</td>
                    <td>
                      <span className="badge badge-success">Active</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Staff Member</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Today&apos;s Status</th>
                <th style={{ textAlign: 'right' }}>Mark Attendance</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => {
                const todayAtt = attendances.find((a) => a.employeeId === emp.id);

                return (
                  <tr key={emp.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{emp.firstName} {emp.lastName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{emp.employeeCode}</div>
                    </td>
                    <td>{emp.department?.name || 'General'}</td>
                    <td>{emp.designation || 'Staff'}</td>
                    <td>
                      {todayAtt ? (
                        <span className={`badge ${
                          todayAtt.status === 'PRESENT' ? 'badge-success' :
                          todayAtt.status === 'LATE' ? 'badge-warning' : 'badge-danger'
                        }`}>
                          {todayAtt.status} {todayAtt.checkIn && `(${new Date(todayAtt.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`}
                        </span>
                      ) : (
                        <span className="badge badge-neutral">Not Marked</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.375rem' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ color: 'var(--success)', borderColor: 'var(--success)' }}
                          disabled={markingId === emp.id}
                          onClick={() => handleMarkAttendance(emp.id, 'PRESENT')}
                        >
                          Present
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ color: 'var(--warning)', borderColor: 'var(--warning)' }}
                          disabled={markingId === emp.id}
                          onClick={() => handleMarkAttendance(emp.id, 'LATE')}
                        >
                          Late
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                          disabled={markingId === emp.id}
                          onClick={() => handleMarkAttendance(emp.id, 'ABSENT')}
                        >
                          Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
