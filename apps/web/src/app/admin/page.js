/**
 * Admin page — user management, admin only.
 * Copilot Session 14: Implement per COPILOT_GUIDE.md Session 14 direction.
 *
 * Layout: Navbar + "User Management" heading + "Invite User" button
 *         + UserTable with role badges, status badges, action column
 * Guards: disable own row's action buttons, "Manage Permissions" link to /admin/roles
 * Data: useUsers() hook
 */
'use client';

import React, { useState } from 'react';
import ProtectedRoute from '../../micro-apps/auth/components/ProtectedRoute';
import { useUsers } from '../../micro-apps/admin/hooks/useUsers';
import { useRoles } from '../../micro-apps/admin/hooks/useRoles';
import { UserTable } from '../../micro-apps/admin/components/UserTable';
import { PermissionMatrix } from '../../micro-apps/admin/components/PermissionMatrix';
import { AuditLogViewer } from '../../micro-apps/admin/components/AuditLogViewer';
import { Tabs, Tab } from '../../shared/components/ui/Tabs';
import { Button } from '../../shared/components/ui';

export default function AdminPage() {
  const { users, loading: usersLoading, error: usersError, meta: usersMeta, filters: userFilters, setFilters: setUserFilters, deactivateUser } = useUsers();
  const { roles, permissions, auditLogs, loading: rolesLoading, auditLoading, error: rolesError, assignPermissions, auditFilters, setAuditFilters, auditMeta } = useRoles();

  const [activeTab, setActiveTab] = useState('users');

  const handleEditUser = (user) => {
    console.log('Edit user:', user);
  };

  const handleDeactivate = (userId) => {
    if (confirm('Are you sure you want to deactivate this user?')) {
      deactivateUser(userId);
    }
  };

  return (
    <ProtectedRoute requiredPermissions={['roles:read', 'users:read']}>
      <main style={{ padding: '2rem', background: 'var(--color-bg)', minHeight: '100vh', color: 'var(--color-text)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'Syne', color: 'var(--color-gold)', fontSize: '2rem' }}>Admin Dashboard</h1>
          {activeTab === 'users' && <Button onClick={() => console.log('invite')}>Invite User</Button>}
        </div>

        {(usersError || rolesError) && (
          <div style={{ padding: '1rem', background: 'rgba(255, 0, 0, 0.1)', color: 'red', borderRadius: '4px', marginBottom: '1rem' }}>
            {usersError || rolesError}
          </div>
        )}

        {/* Temporary tab buttons since Tabs component might not be fully styled for this route yet */}
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '2rem' }}>
          <button style={{ color: activeTab === 'users' ? 'var(--color-gold)' : 'var(--color-text-2)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', fontWeight: activeTab === 'users' ? 'bold' : 'normal' }} onClick={() => setActiveTab('users')}>User Management</button>
          <button style={{ color: activeTab === 'roles' ? 'var(--color-gold)' : 'var(--color-text-2)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', fontWeight: activeTab === 'roles' ? 'bold' : 'normal' }} onClick={() => setActiveTab('roles')}>Roles & Permissions</button>
          <button style={{ color: activeTab === 'audit' ? 'var(--color-gold)' : 'var(--color-text-2)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', fontWeight: activeTab === 'audit' ? 'bold' : 'normal' }} onClick={() => setActiveTab('audit')}>System Audit Logs</button>
        </div>

        {activeTab === 'users' && (
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <input 
                type="text" 
                placeholder="Search..." 
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', width: '250px' }}
                onChange={e => setUserFilters({ ...userFilters, search: e.target.value })}
              />
            </div>
            <UserTable 
              users={users} 
              loading={usersLoading} 
              onEdit={handleEditUser} 
              onDeactivate={handleDeactivate} 
            />
          </div>
        )}

        {activeTab === 'roles' && (
          <PermissionMatrix 
            roles={roles} 
            permissions={permissions} 
            onChangePermissions={assignPermissions} 
            loading={rolesLoading} 
          />
        )}

        {activeTab === 'audit' && (
          <AuditLogViewer 
            logs={auditLogs} 
            loading={auditLoading} 
            meta={auditMeta} 
            filters={auditFilters} 
            onFilterChange={setAuditFilters} 
          />
        )}
      </main>
    </ProtectedRoute>
  );
}
