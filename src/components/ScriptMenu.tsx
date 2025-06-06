'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ScriptGroup } from '@/types';

interface ScriptMenuProps {
  isOpen: boolean;
  onClose: () => void;
  scriptGroups: ScriptGroup[];
  currentGroupId: string;
  onGroupSelect: (groupId: string) => void;
}

const ScriptMenu: React.FC<ScriptMenuProps> = ({
  isOpen,
  onClose,
  scriptGroups,
  currentGroupId,
  onGroupSelect,
}) => {
  const handleGroupSelect = (groupId: string) => {
    onGroupSelect(groupId);
    onClose();
  };

  // Group scripts by category for better organization
  const groupedByCategory = scriptGroups.reduce((acc, group) => {
    if (!acc[group.category]) {
      acc[group.category] = [];
    }
    acc[group.category].push(group);
    return acc;
  }, {} as Record<string, ScriptGroup[]>);

  const menuVariants = {
    closed: {
      x: '-100%',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
    open: {
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
  };

  const overlayVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 },
  };

  const itemVariants = {
    closed: { opacity: 0, x: -20 },
    open: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    }),
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            onClick={onClose}
          />

          {/* Menu Panel */}
          <motion.div
            className="fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-neumorph-bg shadow-neumorph-convex z-50 overflow-y-auto"
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-neumorph-text">
                  Script Collections
                </h2>
                <motion.button
                  onClick={onClose}
                  className="p-2 rounded-xl transition-all duration-200 ease-in-out
                    bg-neumorph-bg text-neumorph-text shadow-neumorph-icon 
                    hover:shadow-neumorph-icon-hover active:shadow-neumorph-icon-pressed"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Close menu"
                >
                  <XMarkIcon className="h-5 w-5" />
                </motion.button>
              </div>

              {/* Script Groups by Category */}
              <div className="space-y-6">
                {Object.entries(groupedByCategory).map(([category, groups], categoryIndex) => (
                  <motion.div
                    key={category}
                    variants={itemVariants}
                    initial="closed"
                    animate="open"
                    custom={categoryIndex}
                  >
                    <h3 className="text-sm font-semibold text-neumorph-text/70 uppercase tracking-wide mb-3">
                      {category}
                    </h3>
                    <div className="space-y-2">
                      {groups.map((group, groupIndex) => {
                        const isSelected = group.id === currentGroupId;
                        const itemIndex = categoryIndex * 10 + groupIndex; // Stagger animation

                        return (
                          <motion.button
                            key={group.id}
                            onClick={() => handleGroupSelect(group.id)}
                            className={`w-full text-left p-4 rounded-2xl transition-all duration-200 ease-in-out
                              ${isSelected 
                                ? 'bg-neumorph-accent text-white shadow-neumorph-pressed' 
                                : 'bg-neumorph-bg text-neumorph-text shadow-neumorph-convex hover:shadow-neumorph-icon-hover'
                              }
                            `}
                            variants={itemVariants}
                            initial="closed"
                            animate="open"
                            custom={itemIndex}
                            whileHover={{ scale: isSelected ? 1 : 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium text-sm leading-tight mb-1">
                                {group.title}
                              </span>
                              {group.subCategory && (
                                <span className={`text-xs ${isSelected ? 'text-white/80' : 'text-neumorph-text/60'}`}>
                                  {group.subCategory}
                                </span>
                              )}
                              {group.description && (
                                <span className={`text-xs mt-1 ${isSelected ? 'text-white/70' : 'text-neumorph-text/50'}`}>
                                  {group.description}
                                </span>
                              )}
                              <span className={`text-xs mt-2 ${isSelected ? 'text-white/60' : 'text-neumorph-text/40'}`}>
                                {group.scriptIds.length} scripts
                              </span>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ScriptMenu;
