'use client';

import { useState, useEffect, useCallback } from 'react';
import { Script, ScriptGroup } from '@/types';
import scriptsData from '@/data/scripts.json';
import scriptGroupsData from '@/data/scriptGroups.json';

const STORAGE_KEY = 'shadowing-card-current-group';

export const useScriptGroups = () => {
  const [allScripts] = useState<Script[]>(scriptsData as Script[]);
  const [scriptGroups] = useState<ScriptGroup[]>(scriptGroupsData as ScriptGroup[]);
  const [currentGroupId, setCurrentGroupId] = useState<string>('');
  const [currentScripts, setCurrentScripts] = useState<Script[]>([]);
  const [currentGroup, setCurrentGroup] = useState<ScriptGroup | null>(null);

  // Load saved group from localStorage or use default
  useEffect(() => {
    const savedGroupId = localStorage.getItem(STORAGE_KEY);
    const defaultGroupId = scriptGroups.length > 0 ? scriptGroups[0].id : '';
    
    const groupIdToUse = savedGroupId && scriptGroups.find(g => g.id === savedGroupId) 
      ? savedGroupId 
      : defaultGroupId;
    
    if (groupIdToUse) {
      setCurrentGroupId(groupIdToUse);
    }
  }, [scriptGroups]);

  // Update current scripts when group changes
  useEffect(() => {
    if (currentGroupId && scriptGroups.length > 0) {
      const group = scriptGroups.find(g => g.id === currentGroupId);
      if (group) {
        setCurrentGroup(group);
        const groupScripts = allScripts.filter(script => 
          group.scriptIds.includes(script.id)
        );
        setCurrentScripts(groupScripts);
        
        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, currentGroupId);
      }
    }
  }, [currentGroupId, allScripts, scriptGroups]);

  const selectGroup = useCallback((groupId: string) => {
    setCurrentGroupId(groupId);
  }, []);

  const getCurrentGroupTitle = useCallback(() => {
    return currentGroup?.title || 'Loading...';
  }, [currentGroup]);

  return {
    scriptGroups,
    currentGroupId,
    currentScripts,
    currentGroup,
    selectGroup,
    getCurrentGroupTitle,
  };
};
