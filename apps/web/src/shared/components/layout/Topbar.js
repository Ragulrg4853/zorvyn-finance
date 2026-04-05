'use client';
import { motion } from 'framer-motion';
import { Bell, Search } from 'lucide-react';

export default function Topbar({ title, user }) {
  return (
    <header className="h-20 w-full flex items-center justify-between px-6 md:px-8 border-b border-primary/10 bg-[#0a0f1e]/80 backdrop-blur-xl shrink-0 z-30 shadow-md">
      
      {/* Left section: Dynamic Page Title */}
      <div className="flex items-center gap-4 flex-1">
        <motion.h2 
          key={title}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="text-2xl font-syne font-bold text-white tracking-wide"
        >
          {title || "Dashboard"}
        </motion.h2>
      </div>

      {/* Right Section: Utilities */}
      <div className="flex items-center gap-6">
        
        {/* Subtle Global Search Placeholder */}
        <div className="hidden lg:flex items-center bg-[#111827] border border-white/5 rounded-full px-4 py-2 hover:border-primary/50 transition-colors group cursor-text">
          <Search className="w-4 h-4 text-gray-500 mr-2 group-hover:text-primary transition-colors" />
          <span className="text-sm text-gray-500 group-hover:text-gray-300 font-inter">Search everywhere...</span>
          <div className="ml-4 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-white/5 text-gray-400">âŒ˜K</div>
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/5 transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary animate-pulse" />
        </button>

      </div>
    </header>
  );
}