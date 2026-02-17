import type { ChecklistFormData } from '../checklist/types';

// Simple PDF generation using jsPDF-like approach without external library
// Since pdf-lib is not installed, we'll create a minimal PDF structure
export async function generateChecklistPdf(data: ChecklistFormData): Promise<Uint8Array> {
  // Create a simple text-based PDF content
  const content = generatePdfContent(data);
  
  // Convert to PDF format (simplified)
  const pdfContent = createSimplePdf(content);
  
  return new TextEncoder().encode(pdfContent);
}

function generatePdfContent(data: ChecklistFormData): string {
  let content = '';
  
  content += 'COURTESY SAFETY & HEALTH INSPECTION CHECKLIST\n';
  content += 'Step-by-Step | ~20 Minutes | One Unit / Room\n\n';
  
  content += `Room Number: ${data.roomNumber}\n`;
  content += `Inspector: ${data.inspector || 'N/A'}\n`;
  content += `Date: ${data.date || 'N/A'}\n`;
  content += `Unit / Area: ${data.unitArea || 'N/A'}\n\n`;
  
  content += '1. ENTRY & INITIAL CONDITIONS (First 2 Minutes)\n';
  content += `[${data.section1.roomOdor.checked ? 'X' : ' '}] Room Odor: ${data.section1.roomOdor.observation || 'N/A'}\n`;
  content += `[${data.section1.thermostatCheck.checked ? 'X' : ' '}] Thermostat Check - Set Temp: ${data.section1.thermostatCheck.setTemp || 'N/A'}, Matches: ${data.section1.thermostatCheck.matchesActual || 'N/A'}\n`;
  content += `[${data.section1.scaleBuildup ? 'X' : ' '}] Scale Buildup in shower wand\n\n`;
  
  content += '2. LIGHTING & ELECTRICAL (3 Minutes)\n';
  content += `[${data.section2.lightSwitches ? 'X' : ' '}] Light Switches tested\n`;
  content += `[${data.section2.bulbs.checked ? 'X' : ' '}] Bulbs checked - Notes: ${data.section2.bulbs.notes || 'N/A'}\n`;
  content += `[${data.section2.outletSwitchCovers ? 'X' : ' '}] Outlet & Switch Covers secure\n`;
  content += `[${data.section2.gfciOutlets ? 'X' : ' '}] GFCI Outlets tested\n`;
  content += `[${data.section2.noBurnMarks ? 'X' : ' '}] No Burn Marks, Heat, or Odors\n\n`;
  
  content += '3. BATHROOM INSPECTION (8-9 Minutes)\n';
  content += `[${data.section3.hotWaterFixtures.checked ? 'X' : ' '}] Hot Water - Temp: ${data.section3.hotWaterFixtures.waterTemp || 'N/A'}°F\n`;
  content += `[${data.section3.drainage ? 'X' : ' '}] Drainage tested\n`;
  content += `[${data.section3.popUpAssembly ? 'X' : ' '}] Pop-Up Assembly verified\n`;
  content += `[${data.section3.soapDispenser ? 'X' : ' '}] Soap Dispenser tested\n`;
  content += 'Toilet Flush Test:\n';
  content += `  Flush operation: ${data.section3.toiletFlushTest.flushOperation || 'N/A'}\n`;
  content += `  Secure at base: ${data.section3.toiletFlushTest.secureAtBase || 'N/A'}\n`;
  content += `  Rear caulk leakage: ${data.section3.toiletFlushTest.rearCaulkLeakage || 'N/A'}\n`;
  content += `  Toilet tank is free of cracks/leaks: ${data.section3.toiletTankFreeOfCracks || 'N/A'}\n`;
  content += `[${data.section3.rearCaulkOpening ? 'X' : ' '}] Rear Caulk Opening checked\n`;
  content += `[${data.section3.bathroomGFCI ? 'X' : ' '}] Bathroom GFCI Protection verified\n\n`;
  
  content += '4. WATER, MOLD & MOISTURE CHECKS (5 Minutes)\n';
  content += `[${data.section4.underSinksDry ? 'X' : ' '}] Under sinks dry\n`;
  content += `[${data.section4.floorsFirmDry ? 'X' : ' '}] Floors firm and dry\n`;
  content += `[${data.section4.ceilingsWallsClean ? 'X' : ' '}] Ceilings and walls clean\n`;
  content += `[${data.section4.windowsSillsDoorsDry ? 'X' : ' '}] Windows, sills, and doors dry\n`;
  content += `[${data.section4.behindRefrigeratorDry ? 'X' : ' '}] Behind refrigerator dry\n`;
  content += `[${data.section4.waterHeaterAreaDry ? 'X' : ' '}] Water heater area dry\n`;
  content += `[${data.section4.mainShutOffValve ? 'X' : ' '}] Main Shut-Off Valve operational\n`;
  content += `[${data.section4.mainShutOffValveExercised ? 'X' : ' '}] Main Shut Off Valve Exercised\n\n`;
  
  content += '5. FINAL WALK-THROUGH & EXIT (1 Minute)\n';
  content += `[${data.section5.allFixturesOff ? 'X' : ' '}] All fixtures turned OFF\n`;
  content += `[${data.section5.noWaterRunning ? 'X' : ' '}] No water running\n`;
  content += `[${data.section5.areaCleanOrderly ? 'X' : ' '}] Area left clean and orderly\n\n`;
  
  content += 'NOTES / ISSUES IDENTIFIED:\n';
  content += `${data.notesIssues || 'None'}\n\n`;
  
  content += 'FINAL WORK ORDER GUIDANCE:\n';
  content += `[${data.workOrderGuidance.createWorkOrder ? 'X' : ' '}] Create a Work Order (W/O)\n`;
  content += `[${data.workOrderGuidance.doNotCreateWO ? 'X' : ' '}] Do NOT create a W/O for minor adjustments\n`;
  
  return content;
}

function createSimplePdf(content: string): string {
  // Create a minimal PDF structure
  // This is a simplified PDF that will be readable as text
  const pdfHeader = '%PDF-1.4\n';
  const pdfBody = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Courier >> >> >> /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length ${content.length + 100} >>\nstream\nBT\n/F1 10 Tf\n50 742 Td\n`;
  
  const lines = content.split('\n');
  let pdfContent = pdfBody;
  lines.forEach((line, index) => {
    const escapedLine = line.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    pdfContent += `(${escapedLine}) Tj\n0 -12 Td\n`;
  });
  
  pdfContent += 'ET\nendstream\nendobj\n';
  
  const xref = 'xref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\n0000000300 00000 n\n';
  const trailer = `trailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n${(pdfHeader + pdfContent).length}\n%%EOF`;
  
  return pdfHeader + pdfContent + xref + trailer;
}
