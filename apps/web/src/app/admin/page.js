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
import AppShell from '../../shared/components/layout/AppShell';
import { useAuth } from '../../micro-apps/auth/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Shield, Users, Activity } from 'lucide-react';
import LoadingSpinner from '../../shared/components/feedback/LoadingSpinner';

export default function AdminPage() {
  const { user, hasPermission, logout } = useAuth();
  const { users, loading: usersLoading, error: usersError, meta: usersMeta, filters: userFilters, setFilters: setUserFilters, deactivateUser } = useUsers();
  const { roles, permissions, auditLogs, loading: rolesLoading, auditLoading, error: rolesError, assignPermissions, auditFilters, setAuditFilters, auditMeta } = useRoles();

  const [activeTab, setActiveTab] = useState('users');

  const handleEditUser = (u) => {
    // Stub
    console.log('Edit user:', u);
  };

  const handleDeactivate = (userId) => {
    if (confirm('Are you sure you want to deactivate this user?')) {
      deactivateUser(userId);
    }
  };

  const tabs = [
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'roles', label: 'Roles & Permissions', icon: Shield },
    { id: 'audit', label: 'System Audit Logs', icon: Activity },
  ];

  return (
    <ProtectedRoute requiredPermissions={['roles:read', 'users:read']}>
      <AppShell user={user} onLogout={logout} hasPermission={hasPermission} pageTitle="Administration">
        <div className="flex flex-col h-full min-h-0 w-full animate-in fade-in duration-500">
          
          {/* Header Row */}
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-6 shrink-0">
            <h1 className="text-3xl font-syne font-bold text-gray-100 tracking-wide hidden md:block">
              Administration
            </h1>
            
            <div className="flex items-center justify-end w-full md:w-auto h-10">
              {activeTab === 'users' && hasPermission('users:write') && (
                <button 
                  onClick={() => console.log('Invite')}
                  className="btn-primary flex items-center justify-center gap-2 h-10 px-5 border border-[var(--color-primary)] rounded-lg font-medium shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.3)] hover:shadow-[0_0_25px_rgba(var(--color-primary-rgb),0.5)] transition-all bg-[var(--color-primary)] text-white whitespace-nowrap"
                >
                  <UserPlus size={18} />
                  Invite User
                </button>
              )}
            </div>
          </div>

          {(usersError || rolesError) && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 shrink-0"
            >
              <p className="text-sm font-medium text-red-200">{usersError || rolesError}</p>
            </motion.div>
          )}

          {/* Glow Tabs Navigation */}
          <div className="relative mb-6 flex items-center gap-2 overflow-x-auto hide-scrollbars-on-mobile shrink-0 border-b border-white/10 pb-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold tracking-wider uppercase transition-all duration-300 ${
                    isActive ? 'text-[var(--color-primary)]' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  }`}
                >
                  <Icon size={16} className={isActive ? "text-[var(--color-primary)]" : "text-gray-500"} />
                  {tab.label}
                  
                  {/* Animated Tab Indicator */}
                  {isActive && (
                    <motion.div 
                      layoutId="adminTabIndicator"
                      className="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-[var(--color-primary)] shadow-[0_0_10px_var(--color-primary)]"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Dynamic Content Panel */}
          <div className="flex-1 min-h-0 w-full rounded-2xl border border-[var(--color-border)] bg-[rgba(10,15,30,0.4)] backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex-1 flex flex-col h-full overflow-hidden"
              >
                {activeTab === 'users' && (
                  <UserTable 
                    users={users} 
                    loading={usersLoading} 
                    onEdit={handleEditUser} 
                    onDeactivate={handleDeactivate}
                    filters={userFilters}
                    onFilterChange={setUserFilters}
                    meta={usersMeta}
                  />
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
                    onFilterChange={setAuditFilters} users={users} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </AppShell>
    </ProtectedRoute>
  );
}


