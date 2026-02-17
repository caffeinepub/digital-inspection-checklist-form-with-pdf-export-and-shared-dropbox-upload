import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2, Download, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import ChecklistSection from '../components/checklist/ChecklistSection';
import YesNoField from '../components/checklist/YesNoField';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useDropboxConfiguration, useGetDropboxToken } from '../hooks/useQueries';
import { generateChecklistPdf } from '../lib/pdf/generateChecklistPdf';
import { downloadPdf } from '../lib/pdf/downloadPdf';
import { sanitizeFilename } from '../lib/pdf/filename';
import { uploadChecklistPdf } from '../lib/upload/uploadChecklistPdf';
import type { ChecklistFormData } from '../lib/checklist/types';
import { getDefaultChecklistData } from '../lib/checklist/defaults';

export default function ChecklistFormPage() {
  const [formData, setFormData] = useState<ChecklistFormData>(getDefaultChecklistData());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const { isConfigured: dropboxConfigured } = useDropboxConfiguration();
  const { data: dropboxToken } = useGetDropboxToken();

  const updateField = <K extends keyof ChecklistFormData>(field: K, value: ChecklistFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.roomNumber.trim()) {
      toast.error('Room Number is required');
      return;
    }

    setIsSubmitting(true);
    setUploadStatus('idle');

    try {
      // Generate PDF
      const pdfBytes = await generateChecklistPdf(formData);
      const filename = sanitizeFilename(formData.roomNumber);

      // Download PDF
      downloadPdf(pdfBytes, filename);
      toast.success('PDF downloaded successfully');

      // Upload to Dropbox if configured
      if (dropboxConfigured && dropboxToken) {
        setUploadStatus('uploading');
        const result = await uploadChecklistPdf(formData.roomNumber, pdfBytes, dropboxToken);
        
        if (result.success) {
          setUploadStatus('success');
          toast.success('PDF uploaded to Dropbox successfully');
        } else {
          setUploadStatus('error');
          toast.error('Failed to upload to Dropbox');
          console.error('Dropbox upload error:', result.error);
        }
      } else {
        toast.info('Dropbox not configured. PDF downloaded only.');
      }

      // Reset form
      setFormData(getDefaultChecklistData());
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
                      updateField('section1', {
                        ...formData.section1,
                        scaleBuildup: !!checked
                      })
                    }
                  />
                  <Label htmlFor="scaleBuildup" className="font-medium">
                    Scale Buildup – Check for mineral deposits or scale buildup
                  </Label>
                </div>
              </div>
            </ChecklistSection>

            {/* Section 2: Electrical Inspection */}
            <ChecklistSection
              title="2. Electrical Inspection (5 Minutes)"
              description="Check electrical fixtures and safety"
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
                    Light switches work properly
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
                      All bulbs functional
                    </Label>
                  </div>
                  <Input
                    placeholder="Notes on bulbs"
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
                    Outlet and switch covers in place
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
                    GFCI outlets in wet areas
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
                    No burn marks on outlets or switches
                  </Label>
                </div>
              </div>
            </ChecklistSection>

            {/* Section 3: Plumbing & Bathroom */}
            <ChecklistSection
              title="3. Plumbing & Bathroom (5 Minutes)"
              description="Check plumbing fixtures and bathroom conditions"
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
                      Hot water available at fixtures
                    </Label>
                  </div>
                  <Input
                    placeholder="Water temperature (°F)"
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
                    Drainage working properly
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
                    Pop-up assembly functional
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
                    Soap dispenser working
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label className="font-medium">Toilet Flush Test</Label>
                  <div className="ml-6 space-y-3">
                    <YesNoField
                      label="Flush operation normal"
                      value={formData.section3.toiletFlushTest.flushOperation}
                      onChange={(value) =>
                        updateField('section3', {
                          ...formData.section3,
                          toiletFlushTest: { ...formData.section3.toiletFlushTest, flushOperation: value }
                        })
                      }
                    />
                    <YesNoField
                      label="Secure at base"
                      value={formData.section3.toiletFlushTest.secureAtBase}
                      onChange={(value) =>
                        updateField('section3', {
                          ...formData.section3,
                          toiletFlushTest: { ...formData.section3.toiletFlushTest, secureAtBase: value }
                        })
                      }
                    />
                    <YesNoField
                      label="Rear caulk leakage"
                      value={formData.section3.toiletFlushTest.rearCaulkLeakage}
                      onChange={(value) =>
                        updateField('section3', {
                          ...formData.section3,
                          toiletFlushTest: { ...formData.section3.toiletFlushTest, rearCaulkLeakage: value }
                        })
                      }
                    />
                    <YesNoField
                      label="Toilet tank is free of cracks/leaks"
                      value={formData.section3.toiletTankFreeOfCracks}
                      onChange={(value) =>
                        updateField('section3', {
                          ...formData.section3,
                          toiletTankFreeOfCracks: value
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
                    Rear caulk opening checked
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
                    Bathroom GFCI protection verified
                  </Label>
                </div>
              </div>
            </ChecklistSection>

            {/* Section 4: Water, Mold & Moisture Checks */}
            <ChecklistSection
              title="4. Water, Mold & Moisture Checks (5 Minutes)"
              description="Check for water damage and moisture issues"
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
                    Under sinks dry
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
                    Floors firm and dry
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
                    Ceilings and walls clean
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
                    Windows, sills, and doors dry
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
                    Behind refrigerator dry
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
                    Water heater area dry
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
                    Main Shut-Off Valve operational
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="mainShutOffValveExercised"
                    checked={formData.section4.mainShutOffValveExercised}
                    onCheckedChange={(checked) =>
                      updateField('section4', { ...formData.section4, mainShutOffValveExercised: !!checked })
                    }
                  />
                  <Label htmlFor="mainShutOffValveExercised" className="font-medium">
                    Main Shut Off Valve Exercised
                  </Label>
                </div>
              </div>
            </ChecklistSection>

            {/* Section 5: Final Walk-Through & Exit */}
            <ChecklistSection
              title="5. Final Walk-Through & Exit (1 Minute)"
              description="Final checks before leaving"
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
                    All fixtures turned OFF
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
                    No water running
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
                    Area left clean and orderly
                  </Label>
                </div>
              </div>
            </ChecklistSection>

            {/* Notes / Issues Identified */}
            <div className="space-y-2">
              <Label htmlFor="notesIssues" className="text-base font-semibold">
                Notes / Issues Identified
              </Label>
              <Textarea
                id="notesIssues"
                value={formData.notesIssues}
                onChange={(e) => updateField('notesIssues', e.target.value)}
                placeholder="Enter any notes or issues identified during inspection..."
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Final Work Order Guidance */}
            <ChecklistSection
              title="Final Work Order Guidance"
              description="Determine if a work order is needed"
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
                    Create a Work Order (W/O)
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
                    Do NOT create a W/O for minor adjustments
                  </Label>
                </div>
              </div>
            </ChecklistSection>

            {/* Submit Button */}
            <div className="flex flex-col gap-4 pt-4">
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full text-lg font-semibold"
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

              {uploadStatus === 'uploading' && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Uploading to Dropbox...</span>
                </div>
              )}

              {uploadStatus === 'success' && (
                <div className="flex items-center justify-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Successfully uploaded to Dropbox</span>
                </div>
              )}

              {uploadStatus === 'error' && (
                <div className="flex items-center justify-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span>Upload failed</span>
                </div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
