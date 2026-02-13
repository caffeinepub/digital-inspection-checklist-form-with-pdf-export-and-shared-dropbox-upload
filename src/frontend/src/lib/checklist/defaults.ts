import type { ChecklistFormData } from './types';

export function getDefaultChecklistData(): ChecklistFormData {
  return {
    roomNumber: '',
    inspector: '',
    date: new Date().toISOString().split('T')[0],
    unitArea: '',
    
    section1: {
      roomOdor: {
        checked: false,
        observation: '',
      },
      thermostatCheck: {
        checked: false,
        setTemp: '',
        matchesActual: '',
      },
      scaleBuildup: false,
    },
    
    section2: {
      lightSwitches: false,
      bulbs: {
        checked: false,
        notes: '',
      },
      outletSwitchCovers: false,
      gfciOutlets: false,
      noBurnMarks: false,
    },
    
    section3: {
      hotWaterFixtures: {
        checked: false,
        waterTemp: '',
      },
      drainage: false,
      popUpAssembly: false,
      soapDispenser: false,
      toiletFlushTest: {
        flushOperation: '',
        secureAtBase: '',
        rearCaulkLeakage: '',
      },
      rearCaulkOpening: false,
      bathroomGFCI: false,
    },
    
    section4: {
      underSinksDry: false,
      floorsFirmDry: false,
      ceilingsWallsClean: false,
      windowsSillsDoorsDry: false,
      behindRefrigeratorDry: false,
      waterHeaterAreaDry: false,
      mainShutOffValve: false,
    },
    
    section5: {
      allFixturesOff: false,
      noWaterRunning: false,
      areaCleanOrderly: false,
    },
    
    notesIssues: '',
    
    workOrderGuidance: {
      createWorkOrder: false,
      doNotCreateWO: false,
    },
  };
}
