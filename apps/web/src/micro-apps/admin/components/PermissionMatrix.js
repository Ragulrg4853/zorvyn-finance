import React, { useState, useEffect } from 'react';
import { Lock, Shield, User } from 'lucide-react';
import { motion } from 'framer-motion';

export function PermissionMatrix({ roles, permissions, onChangePermissions, loading }) {
  const [localRoles, setLocalRoles] = useState([]);

  useEffect(() => {
    setLocalRoles(roles || []);
  }, [roles]);

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
    return \\ \\;
  };

  const handleToggle = async (roleId, currRole, perm) => {
    const isProtectAdminRule = currRole.name === 'admin' && perm.name === 'roles:manage';
    if (isProtectAdminRule) return;

    const hasPerm = currRole.permissions?.some((p) => p.id === perm.id);
    
    const newPermissions = hasPerm 
      ? currRole.permissions.filter((p) => p.id !== perm.id)
      : [...(currRole.permissions || []), perm];
      
    const updatedRoles = localRoles.map((r) => 
      r.id === roleId ? { ...r, permissions: newPermissions } : r
    );
    setLocalRoles(updatedRoles);

    try {
      if (hasPerm) {
        await onChangePermissions(roleId, { revoke: [perm.id] });
      } else {
        await onChangePermissions(roleId, { grant: [perm.id] });
      }
    } catch (err) {
      setLocalRoles(roles || []);
    }
  };

  return (
    <div className="h-full flex flex-col w-full overflow-hidden animate-in fade-in duration-500">
      <div className="px-6 py-5 border-b border-[var(--color-border)] bg-[rgba(12,18,34,0.95)] sticky top-0 z-20 backdrop-blur-xl shrink-0">
        <h3 className="text-xl font-syne font-bold text-gray-100 flex items-center gap-3 tracking-wide">
          <Lock className="text-[var(--color-primary)]" size={22} />
          Role Permissions
        </h3>
        <p className="text-sm text-gray-400 mt-1">Manage access control and operational boundaries across roles.</p>
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
                        <div className={\w-8 h-8 rounded-full flex items-center justify-center border border-white/10 shrink-0 \\}>
                          {role.name === 'admin' ? <Shield size={14} /> : <User size={14} />}
                        </div>
                        <span className="font-bold text-gray-200 capitalize tracking-wide">{role.name}</span>
                     </div>
                  </td>
                  
                  {permissions?.map((perm) => {
                    const hasPerm = role.permissions?.some((p) => p.id === perm.id);
                    const isProtected = role.name === 'admin' && perm.name === 'roles:manage';
                    
                    return (
                      <td key={perm.id} className="px-4 py-4 text-center border-l border-white/5">
                        <label 
                          className={\inline-flex relative items-center justify-center w-5 h-5 rounded border \ \ transition-colors\}
                          title={isProtected ? "Admin must retain roles manage permission" : ""}
                        >
                          <input
                            type="checkbox"
                            checked={hasPerm || false}
                            disabled={isProtected}
                            onChange={() => handleToggle(role.id, role, perm)}
                            className="absolute opacity-0 w-full h-full cursor-pointer disabled:cursor-not-allowed"
                          />
                          {hasPerm && (
                            <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-3 h-3 text-white pointer-events-none" viewBox="0 0 14 14" fill="none">
                               <path d="M3 8L6 11L11 3.5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" />
                            </motion.svg>
                          )}
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
    </div>
  );
}
