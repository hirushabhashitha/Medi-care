'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { JWTPayload, ROLE_NAV_ITEMS, ROLE_LABELS } from '@/lib/auth-types';
import Icon from '@/components/ui/Icon';

interface DashboardShellProps {
  session: JWTPayload;
  children: React.ReactNode;
}

export default function DashboardShell({ session, children }: DashboardShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const navItems = ROLE_NAV_ITEMS[session.role] || [];

  const initials = session.employeeName
    ? session.employeeName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : session.username[0].toUpperCase();

  const avatarColors: Record<string, string> = {
    ADMINISTRATOR: '#7c3aed',
    DOCTOR: '#059669',
    NURSE: '#ec4899',
    RECEPTIONIST: '#d97706',
    LAB_STAFF: '#0891b2',
    PHARMACIST: '#dc2626',
    ACCOUNTANT: '#2563eb',
  };

  const avatarColor = avatarColors[session.role] || '#3391ff';

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  }

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  }

  return (
    <div>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 99,
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Icon name="local_hospital" size={20} color="white" />
          </div>
          <div className="sidebar-brand">
            <span className="sidebar-brand-name">MediCore</span>
            <span className="sidebar-brand-sub">HMS Platform</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon name={item.icon} size={18} color="currentColor" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            className="nav-item"
            onClick={handleLogout}
            disabled={loggingOut}
            style={{ color: '#ef4444' }}
          >
            <Icon name="logout" size={18} color="#ef4444" />
            <span>{loggingOut ? 'Signing out...' : 'Sign Out'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <header className="main-header">
          <div className="main-header-left">
            {/* Mobile Menu Toggle */}
            <button
              className="btn btn-ghost btn-icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ display: 'none' }}
              id="mobile-menu-btn"
              aria-label="Toggle navigation menu"
            >
              <Icon name="menu" size={20} />
            </button>
            <h1 className="page-title">
              {navItems.find((n) => isActive(n.href))?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="main-header-right">
            <div className="user-menu">
              <div className="user-info">
                <div className="user-name">{session.employeeName || session.username}</div>
                <div className="user-role">{ROLE_LABELS[session.role]}</div>
              </div>
              <div
                className="avatar"
                style={{ background: avatarColor, fontSize: '0.8125rem' }}
              >
                {initials}
              </div>
            </div>
          </div>
        </header>

        <main className="page-content">{children}</main>
      </div>

      {/* Mobile Menu Button CSS Override */}
      <style>{`
        @media (max-width: 768px) {
          #mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
