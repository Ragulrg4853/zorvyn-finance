import React, { useState } from 'react';
import { Pencil, Save, X, Shield, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export function PermissionMatrix({ roles, permissions, onChangePermissions, loading }) {
  const [editingRole, setEditingRole] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  if (loading && (!roles || roles.length === 0)) {
    return (
      <div className="h-full flex flex-col w-full overflow-hidden p-6 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-white/5 rounded-xl skeleton w-full"></div>
        ))}
      </div>
    );
  }

  const handleEdit = (role) => {
    setEditingRole(role);
    setSelectedPermissions(role.permissions?.map(p => p.name) || []);
  };

  const handleSave = async (roleId) => {
    await onChangePermissions(roleId, { permissions: selectedPermissions });
    setEditingRole(null);
  };

  const togglePermission = (permName) => {
    setSelectedPermissions(prev =>
      prev.includes(permName)
        ? prev.filter(p => p !== permName)
        : [...prev, permName]
    );
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
        <div className="grid gap-6">
          {roles?.map((role, idx) => {
            const isEditing = editingRole?.name === role.name;
            
            return (
              <motion.div 
                key={role.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`flex flex-col rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isEditing 
                    ? 'bg-white/5 border-[var(--color-primary)] shadow-[0_0_30px_rgba(var(--color-primary-rgb),0.15)] ring-1 ring-[var(--color-primary)]' 
                    : 'bg-[rgba(10,15,30,0.5)] hover:bg-[rgba(15,20,40,0.6)] border-white/10'
                }`}
              >
                {/* Header Line */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/20">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${role.name === 'admin' ? 'bg-emerald-500/20' : 'bg-blue-500/20'}`}>
                      <Shield size={20} className={role.name === 'admin' ? 'text-emerald-400' : 'text-blue-400'} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-200 capitalize tracking-wide">{role.name}</h4>
                      <p className="text-xs text-gray-500 uppercase tracking-widest">{role.permissions?.length || 0} permissions granted</p>
                    </div>
                  </div>
                  
                  <div>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setEditingRole(null)} 
                          className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <X size={14} /> Cancel
                        </button>
                        <button 
                          onClick={() => handleSave(role.id)} 
                          className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded-lg transition-all shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.4)] flex items-center gap-2"
                        >
                          <Save size={14} /> Save
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleEdit(role)} 
                        className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-[var(--color-primary)] hover:text-white border border-[var(--color-primary)] hover:bg-[var(--color-primary)] rounded-lg transition-all flex items-center gap-2"
                      >
                        <Pencil size={14} /> Edit Role
                      </button>
                    )}
                  </div>
                </div>

                {/* Permissions Grid */}
                <div className="px-6 py-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6">
                    {permissions?.map(perm => {
                      const hasPermission = isEditing 
                        ? selectedPermissions.includes(perm.name) 
                        : role.permissions?.some(rp => rp.name === perm.name);

                      return (
                        <label 
                          key={perm.name} 
                          className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                            isEditing ? 'cursor-pointer hover:bg-white/5' : 'cursor-default opacity-80'
                          } ${
                            hasPermission 
                              ? 'bg-[var(--color-primary-muted)] border-[var(--color-primary)]' 
                              : 'bg-black/20 border-white/5'
                          }`}
                        >
                          <div className={`relative flex items-center justify-center w-5 h-5 rounded border ${
                            hasPermission ? 'bg-[var(--color-primary)] border-[var(--color-primary)]' : 'bg-transparent border-gray-600'
                          } ${isEditing ? 'transition-colors' : ''}`}>
                            <input
                              type="checkbox"
                              checked={hasPermission}
                              disabled={!isEditing}
                              onChange={() => togglePermission(perm.name)}
                              className="absolute opacity-0 w-full h-full cursor-pointer disabled:cursor-default"
                            />
                            {hasPermission && (
                              <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-3 h-3 text-white pointer-events-none" viewBox="0 0 14 14" fill="none">
                                <path d="M3 8L6 11L11 3.5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" />
                              </motion.svg>
                            )}
                          </div>
                          
                          <div className="flex flex-col">
                            <span className={`text-sm font-semibold ${hasPermission ? 'text-white' : 'text-gray-400'}`}>
                              {perm.name.split(':').join(' : ')}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
