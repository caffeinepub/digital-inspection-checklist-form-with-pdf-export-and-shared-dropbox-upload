import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2, Download, Upload, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import ChecklistSection from '../components/checklist/ChecklistSection';
import YesNoField from '../components/checklist/YesNoField';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useDropboxConfiguration, useGetDropboxToken } from '../hooks/useQueries';
import { generateChecklistPdf } from '../lib/pdf/generateChecklistPdf';
import { downloadPdf, revokeObjectUrlSafely } from '../lib/pdf/downloadPdf';
import { sanitizeFilename } from '../lib/pdf/filename';
import type { ChecklistFormData } from '../lib/checklist/types';
import { getDefaultChecklistData } from '../lib/checklist/defaults';

export default function ChecklistFormPage() {
  const [formData, setFormData] = useState<ChecklistFormData>(getDefaultChecklistData());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [pdfFallbackUrl, setPdfFallbackUrl] = useState<string | null>(null);
  const [pdfFilename, setPdfFilename] = useState<string>('');
  const { isConfigured: dropboxConfigured } = useDropboxConfiguration();
  const { data: dropboxToken } = useGetDropboxToken();

  const updateField = <K extends keyof ChecklistFormData>(field: K, value: ChecklistFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const uploadToDropbox = async (pdfBytes: Uint8Array, roomNumber: string, token: string) => {
    // Create a new Uint8Array to ensure proper typing for fetch body
    const bytes = new Uint8Array(pdfBytes);
    
    const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/octet-stream',
        'Dropbox-API-Arg': JSON.stringify({
          path: `/${roomNumber}.pdf`,
          mode: 'overwrite',
          autorename: false,
          mute: false,
        }),
      },
      body: bytes,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Dropbox upload failed: ${errorText}`);
    }
  };

  const handleOpenPdf = () => {
    if (pdfFallbackUrl) {
      window.open(pdfFallbackUrl, '_blank');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.roomNumber.trim()) {
      toast.error('Room Number is required');
      return;
    }

    setIsSubmitting(true);
    setUploadStatus('idle');
    
    // Clear any previous fallback URL
    if (pdfFallbackUrl) {
      revokeObjectUrlSafely(pdfFallbackUrl, 100);
      setPdfFallbackUrl(null);
    }

    try {
      // Generate PDF
      const pdfBytes = await generateChecklistPdf(formData);
      const filename = sanitizeFilename(formData.roomNumber);

      // Download PDF with mobile-safe handling
      const downloadResult = downloadPdf(pdfBytes, filename);
      
      // Store fallback URL and filename for "Open PDF" button
      if (downloadResult.objectUrl) {
        setPdfFallbackUrl(downloadResult.objectUrl);
        setPdfFilename(downloadResult.filename);
      }

      toast.success('PDF generated successfully');

      // Upload to Dropbox if configured
      if (dropboxConfigured && dropboxToken) {
        setUploadStatus('uploading');
        try {
          await uploadToDropbox(pdfBytes, formData.roomNumber, dropboxToken);
          setUploadStatus('success');
          toast.success('PDF uploaded to Dropbox successfully');
        } catch (uploadError) {
          setUploadStatus('error');
          toast.error('Failed to upload to Dropbox');
          console.error('Dropbox upload error:', uploadError);
        }
      } else {
        toast.info('Dropbox not configured. PDF downloaded only.');
      }

      // Reset form
      setFormData(getDefaultChecklistData());
      
      // Revoke URL after a safe delay (5 seconds to allow download/upload to complete)
      if (downloadResult.objectUrl) {
        revokeObjectUrlSafely(downloadResult.objectUrl, 5000);
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-4xl py-8 px-4">
      <Card className="shadow-lg">
        <CardHeader className="space-y-2 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950">
          <CardTitle className="text-3xl font-bold text-center">
            Courtesy Safety & Health Inspection Checklist
          </CardTitle>
          <p className="text-center text-muted-foreground">
            Step-by-Step | ~20 Minutes | One Unit / Room
          </p>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Header Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="roomNumber" className="text-base font-semibold">
                  Room Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="roomNumber"
                  value={formData.roomNumber}
                  onChange={(e) => updateField('roomNumber', e.target.value)}
                  placeholder="Enter room number"
                  required
                  className="border-2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="inspector" className="text-base font-semibold">Inspector</Label>
                <Input
                  id="inspector"
                  value={formData.inspector}
                  onChange={(e) => updateField('inspector', e.target.value)}
                  placeholder="Inspector name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date" className="text-base font-semibold">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => updateField('date', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unitArea" className="text-base font-semibold">Unit / Area</Label>
                <Input
                  id="unitArea"
                  value={formData.unitArea}
                  onChange={(e) => updateField('unitArea', e.target.value)}
                  placeholder="Unit or area"
                />
              </div>
            </div>

            <Separator className="my-6" />

            {/* Section 1: Entry & Initial Conditions */}
            <ChecklistSection
              title="1. Entry & Initial Conditions (First 2 Minutes)"
              description="Initial observations upon entering the unit"
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="roomOdor"
                      checked={formData.section1.roomOdor.checked}
                      onCheckedChange={(checked) =>
                        updateField('section1', {
                          ...formData.section1,
                          roomOdor: { ...formData.section1.roomOdor, checked: !!checked }
                        })
                      }
                    />
                    <Label htmlFor="roomOdor" className="font-medium">
                      Room Odor – Note smell upon entry (musty, chemical, sewage, neutral)
                    </Label>
                  </div>
                  <Input
                    placeholder="Observation"
                    value={formData.section1.roomOdor.observation}
                    onChange={(e) =>
                      updateField('section1', {
                        ...formData.section1,
                        roomOdor: { ...formData.section1.roomOdor, observation: e.target.value }
                      })
                    }
                    className="ml-6"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="thermostatCheck"
                      checked={formData.section1.thermostatCheck.checked}
                      onCheckedChange={(checked) =>
                        updateField('section1', {
                          ...formData.section1,
                          thermostatCheck: { ...formData.section1.thermostatCheck, checked: !!checked }
                        })
                      }
                    />
                    <Label htmlFor="thermostatCheck" className="font-medium">
                      Thermostat Check – Verify thermostat is functional and displayed room temperature matches actual room temp
                    </Label>
                  </div>
                  <div className="ml-6 grid grid-cols-2 gap-4">
                    <Input
                      placeholder="Set Temp (°F)"
                      value={formData.section1.thermostatCheck.setTemp}
                      onChange={(e) =>
                        updateField('section1', {
                          ...formData.section1,
                          thermostatCheck: { ...formData.section1.thermostatCheck, setTemp: e.target.value }
                        })
                      }
                    />
                    <YesNoField
                      label="Matches actual?"
                      value={formData.section1.thermostatCheck.matchesActual}
                      onChange={(value) =>
                        updateField('section1', {
                          ...formData.section1,
                          thermostatCheck: { ...formData.section1.thermostatCheck, matchesActual: value }
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="scaleBuildup"
                    checked={formData.section1.scaleBuildup}
                    onCheckedChange={(checked) =>
                      updateField('section1', { ...formData.section1, scaleBuildup: !!checked })
                    }
                  />
                  <Label htmlFor="scaleBuildup" className="font-medium">
                    Scale Buildup in shower wand – If significant scale is present, allow fixture to sit in descaler solution while completing the remainder of the inspection
                  </Label>
                </div>
              </div>
            </ChecklistSection>

            {/* Section 2: Lighting & Electrical */}
            <ChecklistSection
              title="2. Lighting & Electrical (3 Minutes)"
              description="Test all electrical components and lighting"
            >
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="lightSwitches"
                    checked={formData.section2.lightSwitches}
                    onCheckedChange={(checked) =>
                      updateField('section2', { ...formData.section2, lightSwitches: !!checked })
                    }
                  />
                  <Label htmlFor="lightSwitches" className="font-medium">
                    Light Switches – Test all switches for proper operation
                  </Label>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="bulbs"
                      checked={formData.section2.bulbs.checked}
                      onCheckedChange={(checked) =>
                        updateField('section2', {
                          ...formData.section2,
                          bulbs: { ...formData.section2.bulbs, checked: !!checked }
                        })
                      }
                    />
                    <Label htmlFor="bulbs" className="font-medium">
                      Bulbs – Check for dim, flickering, or burned-out bulbs
                    </Label>
                  </div>
                  <Input
                    placeholder="Notes / Locations"
                    value={formData.section2.bulbs.notes}
                    onChange={(e) =>
                      updateField('section2', {
                        ...formData.section2,
                        bulbs: { ...formData.section2.bulbs, notes: e.target.value }
                      })
                    }
                    className="ml-6"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="outletSwitchCovers"
                    checked={formData.section2.outletSwitchCovers}
                    onCheckedChange={(checked) =>
                      updateField('section2', { ...formData.section2, outletSwitchCovers: !!checked })
                    }
                  />
                  <Label htmlFor="outletSwitchCovers" className="font-medium">
                    Outlet & Switch Covers – Secure and undamaged
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="gfciOutlets"
                    checked={formData.section2.gfciOutlets}
                    onCheckedChange={(checked) =>
                      updateField('section2', { ...formData.section2, gfciOutlets: !!checked })
                    }
                  />
                  <Label htmlFor="gfciOutlets" className="font-medium">
                    GFCI Outlets – Press TEST (should click and cut power), then RESET
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="noBurnMarks"
                    checked={formData.section2.noBurnMarks}
                    onCheckedChange={(checked) =>
                      updateField('section2', { ...formData.section2, noBurnMarks: !!checked })
                    }
                  />
                  <Label htmlFor="noBurnMarks" className="font-medium">
                    No Burn Marks, Heat, or Odors at outlets or switches
                  </Label>
                </div>
              </div>
            </ChecklistSection>

            {/* Section 3: Bathroom Inspection */}
            <ChecklistSection
              title="3. Bathroom Inspection (8–9 Minutes)"
              description="Comprehensive bathroom fixture and plumbing checks"
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hotWaterFixtures"
                      checked={formData.section3.hotWaterFixtures.checked}
                      onCheckedChange={(checked) =>
                        updateField('section3', {
                          ...formData.section3,
                          hotWaterFixtures: { ...formData.section3.hotWaterFixtures, checked: !!checked }
                        })
                      }
                    />
                    <Label htmlFor="hotWaterFixtures" className="font-medium">
                      Hot Water Through Fixtures – Run hot water at sinks and showers
                    </Label>
                  </div>
                  <Input
                    placeholder="Water Temp (°F)"
                    value={formData.section3.hotWaterFixtures.waterTemp}
                    onChange={(e) =>
                      updateField('section3', {
                        ...formData.section3,
                        hotWaterFixtures: { ...formData.section3.hotWaterFixtures, waterTemp: e.target.value }
                      })
                    }
                    className="ml-6"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="drainage"
                    checked={formData.section3.drainage}
                    onCheckedChange={(checked) =>
                      updateField('section3', { ...formData.section3, drainage: !!checked })
                    }
                  />
                  <Label htmlFor="drainage" className="font-medium">
                    Drainage – Test sink, tub, and shower for proper drainage
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="popUpAssembly"
                    checked={formData.section3.popUpAssembly}
                    onCheckedChange={(checked) =>
                      updateField('section3', { ...formData.section3, popUpAssembly: !!checked })
                    }
                  />
                  <Label htmlFor="popUpAssembly" className="font-medium">
                    Pop-Up Assembly – Verify opens, closes, and seals properly
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="soapDispenser"
                    checked={formData.section3.soapDispenser}
                    onCheckedChange={(checked) =>
                      updateField('section3', { ...formData.section3, soapDispenser: !!checked })
                    }
                  />
                  <Label htmlFor="soapDispenser" className="font-medium">
                    Soap Dispenser – Test for proper operation
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label className="font-medium">
                    Toilet Flush Test – Check the inside of the tank for cracks, and condition of the flapper. If the flapper is in poor condition, replace
                  </Label>
                  <div className="ml-6 space-y-3">
                    <YesNoField
                      label="Flush Operation"
                      value={formData.section3.toiletFlushTest.flushOperation}
                      onChange={(value) =>
                        updateField('section3', {
                          ...formData.section3,
                          toiletFlushTest: { ...formData.section3.toiletFlushTest, flushOperation: value }
                        })
                      }
                    />
                    <YesNoField
                      label="Secure at Base"
                      value={formData.section3.toiletFlushTest.secureAtBase}
                      onChange={(value) =>
                        updateField('section3', {
                          ...formData.section3,
                          toiletFlushTest: { ...formData.section3.toiletFlushTest, secureAtBase: value }
                        })
                      }
                    />
                    <YesNoField
                      label="Rear Caulk Leakage"
                      value={formData.section3.toiletFlushTest.rearCaulkLeakage}
                      onChange={(value) =>
                        updateField('section3', {
                          ...formData.section3,
                          toiletFlushTest: { ...formData.section3.toiletFlushTest, rearCaulkLeakage: value }
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rearCaulkOpening"
                    checked={formData.section3.rearCaulkOpening}
                    onCheckedChange={(checked) =>
                      updateField('section3', { ...formData.section3, rearCaulkOpening: !!checked })
                    }
                  />
                  <Label htmlFor="rearCaulkOpening" className="font-medium">
                    Rear Caulk Opening – Check for gaps or openings
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="bathroomGFCI"
                    checked={formData.section3.bathroomGFCI}
                    onCheckedChange={(checked) =>
                      updateField('section3', { ...formData.section3, bathroomGFCI: !!checked })
                    }
                  />
                  <Label htmlFor="bathroomGFCI" className="font-medium">
                    Bathroom GFCI – Test GFCI outlets in bathroom
                  </Label>
                </div>
              </div>
            </ChecklistSection>

            {/* Section 4: Moisture & Structural */}
            <ChecklistSection
              title="4. Moisture & Structural Inspection (3 Minutes)"
              description="Check for moisture, leaks, and structural integrity"
            >
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="underSinksDry"
                    checked={formData.section4.underSinksDry}
                    onCheckedChange={(checked) =>
                      updateField('section4', { ...formData.section4, underSinksDry: !!checked })
                    }
                  />
                  <Label htmlFor="underSinksDry" className="font-medium">
                    Under Sinks Dry – Check for leaks or moisture
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="floorsFirmDry"
                    checked={formData.section4.floorsFirmDry}
                    onCheckedChange={(checked) =>
                      updateField('section4', { ...formData.section4, floorsFirmDry: !!checked })
                    }
                  />
                  <Label htmlFor="floorsFirmDry" className="font-medium">
                    Floors Firm & Dry – Check for soft spots or water damage
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ceilingsWallsClean"
                    checked={formData.section4.ceilingsWallsClean}
                    onCheckedChange={(checked) =>
                      updateField('section4', { ...formData.section4, ceilingsWallsClean: !!checked })
                    }
                  />
                  <Label htmlFor="ceilingsWallsClean" className="font-medium">
                    Ceilings & Walls Clean – No stains, mold, or damage
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="windowsSillsDoorsDry"
                    checked={formData.section4.windowsSillsDoorsDry}
                    onCheckedChange={(checked) =>
                      updateField('section4', { ...formData.section4, windowsSillsDoorsDry: !!checked })
                    }
                  />
                  <Label htmlFor="windowsSillsDoorsDry" className="font-medium">
                    Windows, Sills & Doors Dry – Check for moisture or condensation
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="behindRefrigeratorDry"
                    checked={formData.section4.behindRefrigeratorDry}
                    onCheckedChange={(checked) =>
                      updateField('section4', { ...formData.section4, behindRefrigeratorDry: !!checked })
                    }
                  />
                  <Label htmlFor="behindRefrigeratorDry" className="font-medium">
                    Behind Refrigerator Dry – Check for leaks or moisture
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="waterHeaterAreaDry"
                    checked={formData.section4.waterHeaterAreaDry}
                    onCheckedChange={(checked) =>
                      updateField('section4', { ...formData.section4, waterHeaterAreaDry: !!checked })
                    }
                  />
                  <Label htmlFor="waterHeaterAreaDry" className="font-medium">
                    Water Heater Area Dry – Check for leaks around water heater
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="mainShutOffValve"
                    checked={formData.section4.mainShutOffValve}
                    onCheckedChange={(checked) =>
                      updateField('section4', { ...formData.section4, mainShutOffValve: !!checked })
                    }
                  />
                  <Label htmlFor="mainShutOffValve" className="font-medium">
                    Main Shut-Off Valve – Verify location and accessibility
                  </Label>
                </div>
              </div>
            </ChecklistSection>

            {/* Section 5: Final Checks */}
            <ChecklistSection
              title="5. Final Checks (1 Minute)"
              description="Final walkthrough and verification"
            >
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allFixturesOff"
                    checked={formData.section5.allFixturesOff}
                    onCheckedChange={(checked) =>
                      updateField('section5', { ...formData.section5, allFixturesOff: !!checked })
                    }
                  />
                  <Label htmlFor="allFixturesOff" className="font-medium">
                    All Fixtures Off – Turn off all water and lights
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="noWaterRunning"
                    checked={formData.section5.noWaterRunning}
                    onCheckedChange={(checked) =>
                      updateField('section5', { ...formData.section5, noWaterRunning: !!checked })
                    }
                  />
                  <Label htmlFor="noWaterRunning" className="font-medium">
                    No Water Running – Verify no water is running
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="areaCleanOrderly"
                    checked={formData.section5.areaCleanOrderly}
                    onCheckedChange={(checked) =>
                      updateField('section5', { ...formData.section5, areaCleanOrderly: !!checked })
                    }
                  />
                  <Label htmlFor="areaCleanOrderly" className="font-medium">
                    Area Clean & Orderly – Leave unit in good condition
                  </Label>
                </div>
              </div>
            </ChecklistSection>

            {/* Notes & Issues */}
            <div className="space-y-2">
              <Label htmlFor="notesIssues" className="text-base font-semibold">
                Notes / Issues Found
              </Label>
              <Textarea
                id="notesIssues"
                value={formData.notesIssues}
                onChange={(e) => updateField('notesIssues', e.target.value)}
                placeholder="Document any issues, concerns, or follow-up items..."
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Work Order Guidance */}
            <ChecklistSection
              title="Work Order Guidance"
              description="Determine if a work order should be created"
            >
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="createWorkOrder"
                    checked={formData.workOrderGuidance.createWorkOrder}
                    onCheckedChange={(checked) =>
                      updateField('workOrderGuidance', {
                        ...formData.workOrderGuidance,
                        createWorkOrder: !!checked
                      })
                    }
                  />
                  <Label htmlFor="createWorkOrder" className="font-medium">
                    Create Work Order – Issues require maintenance attention
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="doNotCreateWO"
                    checked={formData.workOrderGuidance.doNotCreateWO}
                    onCheckedChange={(checked) =>
                      updateField('workOrderGuidance', {
                        ...formData.workOrderGuidance,
                        doNotCreateWO: !!checked
                      })
                    }
                  />
                  <Label htmlFor="doNotCreateWO" className="font-medium">
                    Do Not Create Work Order – No issues found
                  </Label>
                </div>
              </div>
            </ChecklistSection>

            <Separator className="my-6" />

            {/* Submit Section */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  size="lg"
                  className="min-w-[200px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-5 w-5" />
                      Generate & Download PDF
                    </>
                  )}
                </Button>

                {pdfFallbackUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={handleOpenPdf}
                    className="min-w-[200px]"
                  >
                    <ExternalLink className="mr-2 h-5 w-5" />
                    Open PDF
                  </Button>
                )}
              </div>

              {/* Upload Status */}
              {uploadStatus !== 'idle' && (
                <div className="flex items-center justify-center gap-2 text-sm">
                  {uploadStatus === 'uploading' && (
                    <>
                      <Upload className="h-4 w-4 animate-pulse text-blue-600" />
                      <span className="text-muted-foreground">Uploading to Dropbox...</span>
                    </>
                  )}
                  {uploadStatus === 'success' && (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-green-600 font-medium">Uploaded to Dropbox</span>
                    </>
                  )}
                  {uploadStatus === 'error' && (
                    <>
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      <span className="text-destructive font-medium">Dropbox upload failed</span>
                    </>
                  )}
                </div>
              )}

              {pdfFallbackUrl && (
                <p className="text-center text-sm text-muted-foreground">
                  If the download didn't start, use the "Open PDF" button above
                </p>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
