import React from 'react';

export enum RiskCategory {
  CAT1 = 1,
  CAT2 = 2,
  CAT3 = 3,
  CAT4 = 4
}

export enum UtilizationType {
  I = "I",
  II = "II",
  III = "III",
  IV = "IV",
  V = "V",
  VI = "VI",
  VII = "VII",
  VIII = "VIII",
  IX = "IX",
  X = "X",
  XI = "XI",
  XII = "XII"
}

export enum RiskLocation {
  A = "A",
  B = "B",
  C = "C",
  D = "D",
  E = "E",
  F = "F"
}

export interface BuildingData {
  ut: UtilizationType;
  height: number;
  grossArea: number;
  occupancy: number; // Efetivo
  floorsBelow: number;
  hasSleepArea: boolean;
  hasBedridden: boolean;
}

export interface Space {
  id: string;
  name: string;
  type: string;
  area: number;
  occupancy: number;
  riskClass: RiskLocation;
  notes?: string;
}

export interface EvacuationPath {
  id: string;
  name: string;
  type: string; // 'local', 'interior', 'exterior'
  config: string; // 'impasse', 'distinct'
  distance: number;
  maxDistance: number;
  isCompliant: boolean;
}

export interface WidthCalculation {
  id: string;
  name: string; // e.g. "Total Building" or "Meeting Room"
  occupancy: number;
  up: number;
  width: number;
  exits: number;
}

export interface SmokeCalculation {
    id: string;
    name: string;
    method: 'general' | 'apsad';
    area: number;
    height: number;
    notes: string;
    results: {
        alpha?: number; // Only for APSAD
        areaUseful: number;
        areaGeometric?: number; // Only for APSAD
        flowM3S?: number; // Only for Mechanical
        flowM3H?: number; // Only for Mechanical
    }
}

export type AppMode = 'splash' | 'project_details' | 'modules' | 'report' | 'legislation';

export interface ProjectState {
  projectName: string;
  projectLocation: string;
  mode: AppMode;
  building: BuildingData;
  category: RiskCategory | null;
  spaces: Space[];
  evacuationPaths: EvacuationPath[];
  widthCalculations: WidthCalculation[];
  smokeCalculations: SmokeCalculation[];
  currentModule: number;
  completedModules: number[];
}

export interface UTDefinition {
  id: UtilizationType;
  name: string;
  icon: string;
  description: string;
  factors: Array<keyof BuildingData>;
}

export interface TechnicalRequirement {
  title: string;
  value: string;
  description: string;
  isCompliant?: boolean; // Optional manual check
}

export interface LegislationItem {
  id: string;
  category: string;
  title: string;
  tags: string[];
  content: React.ReactNode;
}