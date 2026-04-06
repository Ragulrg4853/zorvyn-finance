import React, { useState } from 'react';
import { X, AlertCircle, Eye, EyeOff, Shield, Hash, Clock, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function InviteUserModal({ open, onClose, onSubmit }) {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'viewer' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Enforce username constraints inline for min chars / regex if needed
    if (name === 'username') {
      const sanitized = value.replace(/[^a-zA-Z0-9_]/g, '');
      setFormData(prev => ({ ...prev, [name]: sanitized }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    // Clear specific field errors
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }));
    }
    setError('');
  };

  const validate = () => {
    const errs = {};
    if (formData.username.length < 3) errs.username = 'Username must be at least 3 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) errs.username = 'Alphanumeric and underscores only';
    if (formData.password.length < 8) errs.password = 'Password must be at least 8 characters';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setError('');
    setFieldErrors({});
    setLoading(true);
    
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      if (err?.code === 'AUTH_001') {
        setFieldErrors(prev => ({ ...prev, username: 'Username already taken' }));
      } else if (err?.code === 'AUTH_002') {
        setFieldErrors(prev => ({ ...prev, email: 'Email already registered' }));
      } else {
        setError(typeof err === 'string' ? err : err.message || 'An error occurred while creating user');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050811]/80 backdrop-blur-md">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-2xl bg-[rgba(10,15,30,0.95)] border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] p-6 relative overflow-hidden"
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10">
            <X size={20} />
          </button>
          
          <h2 className="text-xl font-syne font-bold text-white mb-6 tracking-wide flex items-center gap-2">
            <Shield className="text-[var(--color-primary)]" size={24} />
            Create New User
          </h2>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
              <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={16} />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-8">
            {/* Left Col: Form */}
            <form onSubmit={handleSubmit} className="flex-1 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Username</label>
                <input 
                  type="text" name="username" required minLength={3} value={formData.username} onChange={handleChange}
                  className={`w-full h-10 px-3 bg-white/5 border ${fieldErrors.username ? 'border-red-500/50' : 'border-white/10'} rounded-lg text-white placeholder-gray-600 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-colors`}
                  placeholder="jdoe_99"
                />
                {fieldErrors.username && <p className="text-xs text-red-400 mt-1">{fieldErrors.username}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Email</label>
                <input 
                  type="email" name="email" required value={formData.email} onChange={handleChange}
                  className={`w-full h-10 px-3 bg-white/5 border ${fieldErrors.email ? 'border-red-500/50' : 'border-white/10'} rounded-lg text-white placeholder-gray-600 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-colors`}
                  placeholder="name@example.com"
                />
                {fieldErrors.email && <p className="text-xs text-red-400 mt-1">{fieldErrors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} name="password" required minLength={8} value={formData.password} onChange={handleChange}
                    className={`w-full h-10 pl-3 pr-10 bg-white/5 border ${fieldErrors.password ? 'border-red-500/50' : 'border-white/10'} rounded-lg text-white placeholder-gray-600 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-colors`}
                    placeholder="Min. 8 characters"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {fieldErrors.password && <p className="text-xs text-red-400 mt-1">{fieldErrors.password}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Role</label>
                <select 
                  name="role" value={formData.role} onChange={handleChange}
                  className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none appearance-none cursor-pointer"
                >
                  <option value="viewer" className="bg-[#0c1222]">Viewer</option>
                  <option value="analyst" className="bg-[#0c1222]">Analyst</option>
                  <option value="admin" className="bg-[#0c1222]">Admin</option>
                </select>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" disabled={loading}
                  className="w-full h-10 rounded-lg bg-[var(--color-primary)] text-white font-medium shadow hover:shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.4)] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? 'Creating...' : 'Confirm'}
                </button>
              </div>
            </form>

            <div className="w-px bg-white/5 hidden md:block"></div>

            {/* Right Col: System Read-only info */}
            <div className="flex-1 space-y-6 bg-white/[0.02] p-5 rounded-xl border border-white/5 self-start">
              <div>
                <h3 className="text-sm font-semibold text-white mb-4">System Details</h3>
                
                <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500 flex items-center gap-1.5"><Hash size={12}/> ID</span>
                    <span className="text-sm font-mono text-gray-300 bg-black/20 px-2 py-1 rounded">Auto-generated UUID</span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500 flex items-center gap-1.5"><CheckCircle size={12}/> Status</span>
                    <span className="text-sm text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2 py-1 rounded inline-flex w-fit">Active (default)</span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500 flex items-center gap-1.5"><Clock size={12}/> Created At</span>
                    <span className="text-sm text-gray-300 bg-black/20 px-2 py-1 rounded w-fit">Set on creation</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-auto pt-4 border-t border-white/5 text-xs text-gray-500 leading-relaxed">
                By creating this user, they will immediately gain access according to their assigned role. Permissions for Analyst and Admin roles can be granularly managed in the Roles matrix.
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
