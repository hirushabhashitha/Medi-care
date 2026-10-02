'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/Icon';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/audit-logs')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setLogs(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const actionColors: Record<string, string> = {
    CREATE: 'badge-success',
    UPDATE: 'badge-info',
    DELETE: 'badge-danger',
    LOGIN: 'badge-primary',
    LOGOUT: 'badge-neutral',
  };

  return (
    <div className="animate-fadeIn">
      <div className="card-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2 className="page-title">System Security & Audit Trail</h2>
          <p className="card-subtitle">Real-time immutable logging of user activities, data modifications, and security events</p>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Action</th>
              <th>Target Entity</th>
              <th>User</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}>
                  <div className="spinner spinner-lg" style={{ margin: '0 auto' }} />
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}>
                  <Icon name="shield" size={48} color="var(--text-tertiary)" style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
                  <p style={{ fontWeight: 600 }}>No audit logs recorded</p>
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{new Date(log.createdAt).toLocaleTimeString()}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {new Date(log.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${actionColors[log.action] || 'badge-neutral'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td>
                    <strong>{log.entity}</strong>
                    {log.entityId && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '0.25rem' }}>#{log.entityId.slice(-4)}</span>}
                  </td>
                  <td>
                    <div>@{log.user?.username || 'System'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{log.user?.role}</div>
                  </td>
                  <td>
                    <code style={{ fontSize: '0.75rem', background: 'var(--bg-tertiary)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                      {log.details || '—'}
                    </code>
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
