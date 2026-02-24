export interface ChecklistFormData {
  roomNumber: string;
  inspector: string;
  date: string;
  
  section1: {
    roomOdor: {
      checked: boolean;
      observation: string;
    };
    thermostatCheck: {
      checked: boolean;
      setTemp: string;
      matchesActual: 'yes' | 'no' | '';
    };
    scaleBuildup: boolean;
  };
  
  section2: {
    lightSwitches: boolean;
    bulbs: {
      checked: boolean;
      notes: string;
    };
    outletSwitchCovers: boolean;
    gfciOutlets: boolean;
    noBurnMarks: boolean;
    carbonMonoxideTest: 'yes' | 'no' | '';
  };
  
  section3: {
    hotWaterFixtures: {
      checked: boolean;
      waterTemp: string;
    };
    hotWaterArrivalTime: string;
    drainage: boolean;
    popUpAssembly: boolean;
    soapDispenser: boolean;
    toiletFlushTest: {
      flushOperation: 'yes' | 'no' | '';
      secureAtBase: 'yes' | 'no' | '';
      rearCaulkLeakage: 'yes' | 'no' | '';
    };
    toiletTankFreeOfCracks: 'yes' | 'no' | '';
    rearCaulkOpening: boolean;
    bathroomGFCI: boolean;
    washerDrainSecured: 'yes' | 'no' | '';
  };
  
  section4: {
    underSinksDry: boolean;
    floorsFirmDry: boolean;
    ceilingsWallsClean: boolean;
    windowsSillsDoorsDry: boolean;
    behindRefrigeratorDry: boolean;
    waterHeaterAreaDry: boolean;
    mainShutOffValve: boolean;
    mainShutOffValveExercised: boolean;
  };
  
  section5: {
    allFixturesOff: boolean;
    noWaterRunning: boolean;
    areaCleanOrderly: boolean;
  };
  
  notesIssues: string;
  
  workOrderGuidance: {
    createWorkOrder: boolean;
    doNotCreateWO: boolean;
  };
}
