'use client';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppShell({ children, user, onLogout, hasPermission, pageTitle }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a0f1e] text-gray-200">
      {/* Fixed Left Sidebar */}
      <Sidebar user={user} onLogout={onLogout} hasPermission={hasPermission} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative min-w-0 overflow-x-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-[#0a0f1e] to-[#0a0f1e]">
        {/* Top Header */}
        <Topbar title={pageTitle} user={user} />
        
        {/* Inner Panel */}
        <main className="flex-1 overflow-hidden relative" id="main-scroll-container">
          <AnimatePresence mode="wait">
            <motion.div
              key={usePathname()}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="h-full flex flex-col p-6 md:p-8 max-w-[1600px] mx-auto w-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}