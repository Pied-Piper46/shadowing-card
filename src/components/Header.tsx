'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bars3Icon } from '@heroicons/react/24/outline';

interface HeaderProps {
  currentGroupTitle: string;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentGroupTitle, onMenuClick }) => {
  return (
    <motion.header 
      className="w-full px-4 py-3 bg-neumorph-bg/95 backdrop-blur-sm border-b border-neumorph-primary-dark/20"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center justify-between max-w-sm mx-auto">
        <motion.button
          onClick={onMenuClick}
          className="p-2 rounded-xl transition-all duration-200 ease-in-out
            bg-neumorph-bg text-neumorph-text shadow-neumorph-icon 
            hover:shadow-neumorph-icon-hover active:shadow-neumorph-icon-pressed"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Open menu"
        >
          <Bars3Icon className="h-6 w-6" />
        </motion.button>
        
        <motion.div 
          className="flex-1 text-center px-4"
          key={currentGroupTitle} // Key ensures animation on title change
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-lg font-semibold text-neumorph-text truncate">
            {currentGroupTitle}
          </h1>
        </motion.div>
        
        {/* Placeholder for balance - could add settings button later */}
        <div className="w-10 h-10" />
      </div>
    </motion.header>
  );
};

export default Header;
