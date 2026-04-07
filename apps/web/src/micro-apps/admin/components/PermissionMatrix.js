import React, { useState, useEffect } from 'react';
import { Lock, Shield, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { invalidateCache } from '../services/RoleService';

export const PermissionMatrix = React.memo(function PermissionMatrix({ roles, permissions, onChangePermissions, loading }) {
  const [localRoles, setLocalRoles] = useState([]);
  const [toast, setToast] = useState(null);
  const [pendingChanges, setPendingChanges] = useState({});
  const [isCommitting, setIsCommitting] = useState(false);

  useEffect(() => {
    setLocalRoles(roles || []);
    setPendingChanges({});
  }, [roles]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  if (loading && (!localRoles || localRoles.length === 0)) {
    return (
      <div className="h-full flex flex-col w-full overflow-hidden p-6 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-white/5 rounded-xl skeleton w-full"></div>
        ))}
      </div>
    );
  }

  const getShortName = (permName) => {
    const [domain, action] = permName.split(':');
    let shortDomain = domain;
    if (domain === 'dashboard') shortDomain = 'Dash';
    else if (domain === 'transactions') shortDomain = 'Tx';
    else shortDomain = domain.charAt(0).toUpperCase() + domain.slice(1);
    
    const capitalizedAction = action.charAt(0).toUpperCase() + action.slice(1);
    return `${shortDomain} ${capitalizedAction}`;
  };

  const handleToggle = (roleId, currRole, perm) => {
    if (currRole.name === 'admin') return;

    const originalRole = roles.find((r) => r.id === roleId);
    const originalHasPerm = originalRole?.permissions?.some((p) => p.id === perm.id);

    setPendingChanges((prev) => {
      const roleChanges = prev[roleId] || { grant: [], revoke: [] };
      const newChanges = { grant: [...roleChanges.grant], revoke: [...roleChanges.revoke] };

      const granting = newChanges.grant.includes(perm.id);
      const revoking = newChanges.revoke.includes(perm.id);

      if (granting) {
        newChanges.grant = newChanges.grant.filter(id => id !== perm.id);
      } else if (revoking) {
        newChanges.revoke = newChanges.revoke.filter(id => id !== perm.id);
      } else {
        if (originalHasPerm) {
          newChanges.revoke.push(perm.id);
        } else {
          newChanges.grant.push(perm.id);
        }
      }

      const updated = { ...prev };
      if (newChanges.grant.length === 0 && newChanges.revoke.length === 0) {
        delete updated[roleId];
      } else {
        updated[roleId] = newChanges;
      }
      return updated;
    });
  };

  const commitChanges = async () => {
    setIsCommitting(true);
    try {
      const commitPromises = Object.entries(pendingChanges).map(([roleId, changes]) =>
        onChangePermissions(roleId, changes)
      );
      await Promise.all(commitPromises);
      await invalidateCache();
      setPendingChanges({});
      showToast('Permissions updated. Changes effective within 2 minutes.', 'success');
    } catch (err) {
      showToast(err?.message || 'Failed to update permissions', 'error');
    } finally {
      setIsCommitting(false);
    }
  };

  const pendingCount = Object.values(pendingChanges).reduce((acc, curr) => acc + curr.grant.length + curr.revoke.length, 0);

  return (
    <div className="h-full flex flex-col w-full overflow-hidden animate-in fade-in duration-500 relative">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`absolute top-6 left-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-2xl backdrop-blur-md border ${
              toast.type === 'success' 
                ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span className="text-sm font-semibold tracking-wide">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-6 py-5 border-b border-[var(--color-border)] bg-[rgba(12,18,34,0.95)] sticky top-0 z-20 backdrop-blur-xl shrink-0 flex justify-between items-start">
        <div>
          <h3 className="text-xl font-syne font-bold text-gray-100 flex items-center gap-3 tracking-wide">
            <Lock className="text-[var(--color-primary)]" size={22} />
            Role Permissions
          </h3>
          <p className="text-sm text-gray-400 mt-1">Manage access control and operational boundaries across roles.</p>
        </div>
        <div className="text-xs text-amber-400/80 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 font-medium">
          Changes take effect within 5 minutes
        </div>
      </div>
      
      <div className="overflow-auto flex-1 relative hide-scrollbars-on-mobile custom-scrollbar p-6">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[rgba(10,15,30,0.5)] overflow-x-auto backdrop-blur-sm shadow-xl">
          <table className="w-full text-left whitespace-nowrap border-collapse min-w-max">
            <thead className="bg-[#0c1222] border-b border-white/10 text-[10px] text-gray-400 uppercase tracking-widest font-syne font-semibold shadow-sm">
              <tr>
                <th className="px-6 py-4 sticky left-0 z-10 bg-[#0c1222] border-r border-[#1a2235]">Role</th>
                {permissions?.map((perm) => (
                  <th key={perm.id} className="px-4 py-4 text-center">
                    {getShortName(perm.name)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm text-gray-300">
              {localRoles?.map((role) => (
                <tr key={role.id} className="group hover:bg-white/5 transition-all duration-200">
                  <td className="px-6 py-4 sticky left-0 z-10 bg-[#0d1222] group-hover:bg-[#151b2b] border-r border-[#1a2235] transition-colors">
                     <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border border-white/10 shrink-0 ${
                          role.name === 'admin' ? 'bg-teal-500/20 text-teal-400' :
                          role.name === 'analyst' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {role.name === 'admin' ? <Shield size={14} /> : <User size={14} />}
                        </div>
                        <span className="font-bold text-gray-200 capitalize tracking-wide">{role.name}</span>
                     </div>
                  </td>
                  
                  {permissions?.map((perm) => {
                    const isAdmin = role.name === 'admin';
                    
                    const originalHasPerm = roles?.find(r => r.id === role.id)?.permissions?.some((p) => p.id === perm.id);
                    const changes = pendingChanges[role.id] || { grant: [], revoke: [] };
                    
                    let hasPerm = originalHasPerm;
                    if (changes.grant.includes(perm.id)) hasPerm = true;
                    if (changes.revoke.includes(perm.id)) hasPerm = false;
                    
                    if (isAdmin) hasPerm = true;

                    const isPending = changes.grant.includes(perm.id) || changes.revoke.includes(perm.id);
                    
                    return (
                      <td key={perm.id} className="px-4 py-4 text-center border-l border-white/5 relative">
                        <label 
                          className={`inline-flex relative items-center justify-center w-6 h-6 rounded border transition-colors ${
                            isAdmin 
                              ? 'bg-teal-500/20 border-teal-500/40 cursor-not-allowed opacity-80' 
                              : isPending
                                ? 'bg-amber-500/40 border-amber-500/60 cursor-pointer shadow-[0_0_8px_rgba(245,158,11,0.5)] hover:border-amber-400'
                                : hasPerm 
                                  ? 'bg-[var(--color-primary)] border-[var(--color-primary)] cursor-pointer hover:border-[var(--color-primary-light)]' 
                                  : 'bg-black/20 border-white/20 cursor-pointer hover:border-[var(--color-primary-light)]'
                          }`}
                          title={isAdmin ? "Admin has all permissions — cannot be modified" : (isPending ? "Pending change" : "")}
                        >
                          <input
                            type="checkbox"
                            checked={hasPerm || false}
                            disabled={isAdmin}
                            onChange={() => handleToggle(role.id, role, perm)}
                            className="absolute opacity-0 w-full h-full cursor-pointer disabled:cursor-not-allowed"
                          />
                          {isAdmin ? (
                            <Lock size={12} className="text-teal-400" />
                          ) : hasPerm ? (
                            <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-3.5 h-3.5 text-white pointer-events-none" viewBox="0 0 14 14" fill="none">
                               <path d="M3 8L6 11L11 3.5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" />
                            </motion.svg>
                          ) : null}
                        </label>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {pendingCount > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 20 }}
            className="px-6 py-4 flex justify-between items-center bg-[#0c1222] border-t border-[var(--color-border)] sticky bottom-0 z-20"
          >
            <div className="flex items-center gap-2 text-amber-400 font-medium text-sm">
              <AlertCircle size={18} />
              <span>You have {pendingCount} unsaved changes</span>
            </div>
            <button
              onClick={commitChanges}
              disabled={isCommitting}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-white font-bold text-sm transition-all
                ${isCommitting 
                  ? 'bg-teal-600/50 cursor-not-allowed' 
                  : 'bg-teal-500 hover:bg-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.4)] animate-pulse'
                }`}
            >
              {isCommitting ? 'Committing...' : `Commit ${pendingCount} Changes`}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
