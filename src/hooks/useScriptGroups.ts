'use client';

import { useState, useEffect, useCallback } from 'react';
import { Script, ScriptGroup } from '@/types';
// import scriptsData from '@/data/scripts.json'; // Removed
import scriptGroupsData from '@/data/scriptGroups.json';

const STORAGE_KEY = 'shadowing-card-current-group';

export const useScriptGroups = () => {
  // const [allScripts] = useState<Script[]>(scriptsData as Script[]); // Removed
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
    if (currentGroupId) {
      const group = scriptGroups.find(g => g.id === currentGroupId);
      setCurrentGroup(group || null);

      if (group) {
        // Dynamically import the scripts for the current group
        import(`@/data/scripts-by-group/${currentGroupId}.json`)
          .then(module => {
            // Assuming the JSON file directly contains the array of scripts
            // and Next.js handles it as default export for JSON.
            setCurrentScripts(module.default as Script[]);
          })
          .catch(error => {
            console.error(`Error loading scripts for group ${currentGroupId}:`, error);
            setCurrentScripts([]); // Set to empty array on error
          });
        
        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, currentGroupId);
      } else {
        // If group is not found (e.g., invalid currentGroupId), clear scripts
        setCurrentScripts([]);
      }
    } else {
      // If no currentGroupId, clear scripts and currentGroup
      setCurrentScripts([]);
      setCurrentGroup(null);
    }
  }, [currentGroupId, scriptGroups]);

  const selectGroup = useCallback((groupId: string) => {
    setCurrentGroupId(groupId);
  }, []);

  const getCurrentGroupTitle = useCallback(() => {
    return currentGroup?.title || 'Loading...';
  }, [currentGroup]);

  const getShortGroupTitle = useCallback(() => {
    if (!currentGroup) return 'Loading...';
    
    // For Friends episodes, show just "Friends S01E01"
    if (currentGroup.details?.series && currentGroup.details?.season && currentGroup.details?.episode) {
      return `${currentGroup.details.series} S${String(currentGroup.details.season).padStart(2, '0')}E${String(currentGroup.details.episode).padStart(2, '0')}`;
    }
    
    // For other content, try to shorten the title
    const title = currentGroup.title;
    if (title.length > 25) {
      // Try to find a good breaking point
      const colonIndex = title.indexOf(':');
      if (colonIndex > 0 && colonIndex < 25) {
        return title.substring(0, colonIndex);
      }
      // Otherwise just truncate
      return title.substring(0, 22) + '...';
    }
    
    return title;
  }, [currentGroup]);

  return {
    scriptGroups,
    currentGroupId,
    currentScripts,
    currentGroup,
    selectGroup,
    getCurrentGroupTitle,
    getShortGroupTitle,
  };
};
