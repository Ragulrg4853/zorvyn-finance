/**
 * Admin page â€” user management, admin only.
 * Copilot Session 14: Implement per COPILOT_GUIDE.md Session 14 direction.
 *
 * Layout: Navbar + "User Management" heading + "Create User" button
 *         + UserTable with role badges, status badges, action column
 * Guards: disable own row's action buttons, "Manage Permissions" link to /admin/roles
 * Data: useUsers() hook
 */
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import ProtectedRoute from '../../micro-apps/auth/components/ProtectedRoute';
import { useUsers } from '../../micro-apps/admin/hooks/useUsers';
import { useRoles } from '../../micro-apps/admin/hooks/useRoles';
import { UserTable } from '../../micro-apps/admin/components/UserTable';
import { PermissionMatrix } from '../../micro-apps/admin/components/PermissionMatrix';
import { AuditLogViewer } from '../../micro-apps/admin/components/AuditLogViewer';
import { InviteUserModal } from '../../micro-apps/admin/components/InviteUserModal';
import AppShell from '../../shared/components/layout/AppShell';
import SuccessToast from '../../shared/components/ui/SuccessToast';
import { getErrorMessage } from '@/shared/lib/errorHandler';
import { useAuth } from '../../micro-apps/auth/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Shield, Users, Activity } from 'lucide-react';
import LoadingSpinner from '../../shared/components/feedback/LoadingSpinner';
import { useSearchParams, useRouter } from 'next/navigation';

import * as UserService from '../../micro-apps/admin/services/UserService';

function AdminPageContent() {
  const { user, hasPermission, logout } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const { users, setUsers, loading: usersLoading, error: usersError, meta: usersMeta, filters: userFilters, setFilters: setUserFilters, deactivateUser, createUser } = useUsers();
  const { roles, permissions, auditLogs, loading: rolesLoading, auditLoading, error: rolesError, assignPermissions, auditFilters, setAuditFilters, auditMeta } = useRoles();

  const urlTab = searchParams.get('tab') || 'users';
  const [activeTab, setActiveTab] = useState(urlTab);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (urlTab !== activeTab) {
      setActiveTab(urlTab);
    }
  }, [urlTab]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    router.push(`/admin?tab=${tabId}`, { scroll: false });
  };

  const handleRoleChange = async (userId, newRole) => {
    const originalUsers = [...users];
    setUsers(prev => prev.map(u => u.id === userId ? {...u, role: newRole} : u));
    try {
      await UserService.updateUser(userId, { role: newRole });
      setToastMessage(`Role updated to ${newRole} successfully`);
    } catch (err) {
      setUsers(originalUsers);
      alert(getErrorMessage(err));
    }
  };

  const handleToggleActive = async (userId, isActive) => {
    try {
      await users.updateUser(userId, { is_active: isActive });
      setToastMessage(isActive ? 'User activated successfully' : 'User deactivated successfully');
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };;

  const handleCreateUser = async (payload) => {
    await createUser(payload);
    setToastMessage('User created successfully');
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
              }
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
                  onClick={() => handleTabChange(tab.id)}
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
                      onRoleChange={handleRoleChange} 
                    onToggleActive={handleToggleActive}
                    filters={userFilters}
                    onFilterChange={setUserFilters}
                    meta={usersMeta}
                    onCreateUser={() => setInviteModalOpen(true)}
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

        <InviteUserModal 
          open={inviteModalOpen} 
          onClose={() => setInviteModalOpen(false)}
          onSubmit={handleCreateUser}
        />
        <SuccessToast show={!!toastMessage} message={toastMessage} onClose={() => setToastMessage('')} />
      </AppShell>
    </ProtectedRoute>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-full flex items-center justify-center bg-[#050811]">
        <LoadingSpinner />
      </div>
    }>
      <AdminPageContent />
    </Suspense>
  );
}





