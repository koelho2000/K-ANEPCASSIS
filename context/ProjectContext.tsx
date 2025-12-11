import React, { createContext, useContext, useState, useEffect } from 'react';
import { BuildingData, ProjectState, RiskCategory, Space, UtilizationType, AppMode, EvacuationPath, WidthCalculation, SmokeCalculation } from '../types';
import { calculateRiskCategory } from '../data';

interface ProjectContextType {
  state: ProjectState;
  updateBuildingData: (data: Partial<BuildingData>) => void;
  addSpace: (space: Space) => void;
  removeSpace: (id: string) => void;
  addEvacuationPath: (path: EvacuationPath) => void;
  removeEvacuationPath: (id: string) => void;
  addWidthCalculation: (calc: WidthCalculation) => void;
  removeWidthCalculation: (id: string) => void;
  addSmokeCalculation: (calc: SmokeCalculation) => void;
  removeSmokeCalculation: (id: string) => void;
  setCurrentModule: (id: number) => void;
  setProjectDetails: (name: string, location: string) => void;
  setMode: (mode: AppMode) => void;
  resetProject: () => void;
  loadProject: (state: ProjectState) => void;
}

const defaultBuilding: BuildingData = {
  ut: UtilizationType.III,
  height: 0,
  grossArea: 0,
  occupancy: 0,
  floorsBelow: 0,
  hasSleepArea: false,
  hasBedridden: false
};

const defaultState: ProjectState = {
  projectName: '',
  projectLocation: '',
  mode: 'splash',
  building: defaultBuilding,
  category: null,
  spaces: [],
  evacuationPaths: [],
  widthCalculations: [],
  smokeCalculations: [],
  currentModule: 1,
  completedModules: []
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ProjectState>(defaultState);

  const updateBuildingData = (data: Partial<BuildingData>) => {
    setState(prev => {
      const newBuilding = { ...prev.building, ...data };
      const newCategory = calculateRiskCategory(newBuilding);
      
      // If module 1 is complete, add to completed list
      const completed = new Set(prev.completedModules);
      if (newBuilding.height > 0) completed.add(1);

      return {
        ...prev,
        building: newBuilding,
        category: newCategory,
        completedModules: Array.from(completed)
      };
    });
  };

  const addSpace = (space: Space) => {
    setState(prev => {
        const newSpaces = [...prev.spaces, space];
        const completed = new Set(prev.completedModules);
        if(newSpaces.length > 0) completed.add(2);
        
        return {
            ...prev,
            spaces: newSpaces,
            completedModules: Array.from(completed)
        }
    });
  };

  const removeSpace = (id: string) => {
    setState(prev => ({
      ...prev,
      spaces: prev.spaces.filter(s => s.id !== id)
    }));
  };

  const addEvacuationPath = (path: EvacuationPath) => {
    setState(prev => {
        const newPaths = [...prev.evacuationPaths, path];
        const completed = new Set(prev.completedModules);
        if(newPaths.length > 0) completed.add(3);
        
        return {
            ...prev,
            evacuationPaths: newPaths,
            completedModules: Array.from(completed)
        }
    });
  };

  const removeEvacuationPath = (id: string) => {
    setState(prev => ({
      ...prev,
      evacuationPaths: prev.evacuationPaths.filter(p => p.id !== id)
    }));
  };

  const addWidthCalculation = (calc: WidthCalculation) => {
    setState(prev => {
        const newCalcs = [...prev.widthCalculations, calc];
        const completed = new Set(prev.completedModules);
        if(newCalcs.length > 0) completed.add(4);
        
        return {
            ...prev,
            widthCalculations: newCalcs,
            completedModules: Array.from(completed)
        }
    });
  };

  const removeWidthCalculation = (id: string) => {
    setState(prev => ({
      ...prev,
      widthCalculations: prev.widthCalculations.filter(c => c.id !== id)
    }));
  };

  const addSmokeCalculation = (calc: SmokeCalculation) => {
    setState(prev => {
        const newCalcs = [...prev.smokeCalculations, calc];
        const completed = new Set(prev.completedModules);
        if(newCalcs.length > 0) completed.add(7);
        
        return {
            ...prev,
            smokeCalculations: newCalcs,
            completedModules: Array.from(completed)
        }
    });
  };

  const removeSmokeCalculation = (id: string) => {
    setState(prev => ({
      ...prev,
      smokeCalculations: prev.smokeCalculations.filter(c => c.id !== id)
    }));
  };

  const setCurrentModule = (id: number) => {
    setState(prev => ({ ...prev, currentModule: id }));
  };

  const setProjectDetails = (name: string, location: string) => {
    setState(prev => ({ ...prev, projectName: name, projectLocation: location }));
  };

  const setMode = (mode: AppMode) => {
    setState(prev => ({ ...prev, mode }));
  };

  const resetProject = () => {
    setState({
        ...defaultState,
        mode: 'project_details' // Skip splash on reset
    });
  };

  const loadProject = (newState: ProjectState) => {
    setState(newState);
  };

  return (
    <ProjectContext.Provider value={{ 
        state, 
        updateBuildingData, 
        addSpace, 
        removeSpace, 
        addEvacuationPath, 
        removeEvacuationPath, 
        addWidthCalculation, 
        removeWidthCalculation,
        addSmokeCalculation,
        removeSmokeCalculation,
        setCurrentModule, 
        setProjectDetails, 
        setMode, 
        resetProject, 
        loadProject 
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProject must be used within a ProjectProvider');
  return context;
};