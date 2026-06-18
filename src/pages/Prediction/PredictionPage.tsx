import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/ui/Alert'
import { cn } from '@/lib/utils'
import { createPrediction } from '@/api/predictions'
import { createSchedule } from '@/api/schedule'
import { useAuth } from '@/context/AuthContext'
import { useLocale } from '@/context/LocaleContext'
import type { PredictionInput } from '@/types'
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Download,
  Brain,
  CheckCircle,
  Info,
  FileUp,
  User,
  Stethoscope,
  ClipboardList,
  RefreshCw,
  Calendar,
} from 'lucide-react'

const initialFormData: PredictionInput = {
  caseId: '',
  patientAgeRange: '',
  patientGender: '',
  riskCategory: '',
  asaScore: '',
  notes: '',
  operationType: '',
  surgicalSpecialty: '',
  procedureComplexity: '',
  surgicalSteps: 0,
  anatomyRegion: '',
  isEmergency: false,
  anesthesiaType: '',
  surgeonExperience: '',
  assistantCount: 0,
  roomType: '',
  previousDuration: '',
  complexityNotes: '',
  equipmentTime: '',
  turnoverTime: '',
  prepTime: '',
  scheduledDate: '',
  scheduledTime: '',
}

const stepKeys = ['prediction.step1', 'prediction.step2', 'prediction.step3', 'prediction.step4']
const steps = [
  { id: 1, icon: Stethoscope },
  { id: 2, icon: User },
  { id: 3, icon: ClipboardList },
  { id: 4, icon: FileUp },
]

export function PredictionPage() {
  const { user } = useAuth()
  const { t } = useLocale()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<PredictionInput>(() => {
    const draft = localStorage.getItem('surgai_prediction_draft')
    if (draft) {
      try { return { ...initialFormData, ...JSON.parse(draft) } } catch {}
    }
    return initialFormData
  })
  const [predicting, setPredicting] = useState(false)
  const [predictionError, setPredictionError] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [result, setResult] = useState<{
    predictedDuration: number
    confidence: number
    minDuration: number
    maxDuration: number
    riskLevel: 'Low' | 'Medium' | 'High'
    recommendedBuffer: number
    mainFactors: string[]
  } | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [addingToSchedule, setAddingToSchedule] = useState(false)
  const [scheduleAdded, setScheduleAdded] = useState(false)
  const [saved, setSaved] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateField = <K extends keyof PredictionInput>(field: K, value: PredictionInput[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.operationType) newErrors.operationType = t('prediction.opRequired')
      if (!formData.surgicalSpecialty) newErrors.surgicalSpecialty = t('prediction.specialtyRequired')
      if (!formData.procedureComplexity) newErrors.procedureComplexity = t('prediction.complexityRequired')
      if (!formData.surgeonExperience) newErrors.surgeonExperience = t('prediction.experienceRequired')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (currentStep === 1 && !validateStep(1)) return
    if (currentStep < 4) setCurrentStep((prev) => prev + 1)
  }

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1)
  }

  const handlePredict = async () => {
    setPredicting(true)
    setShowResult(false)
    setResult(null)
    setPredictionError(null)
    try {
      // Map frontend camelCase to backend snake_case
      const res = await createPrediction({
        operation_type: formData.operationType,
        procedure_complexity: formData.procedureComplexity,
        surgeon_experience_level: formData.surgeonExperience,
        medical_risk_category: formData.riskCategory,
        patient_age_range: formData.patientAgeRange || undefined,
        patient_gender: formData.patientGender || undefined,
        asa_score: formData.asaScore ? parseInt(formData.asaScore) : undefined,
        emergency_status: formData.isEmergency ? 'Emergency' : 'Planned',
        anesthesia_type: formData.anesthesiaType || undefined,
        assistant_count: formData.assistantCount || undefined,
        operating_room_type: formData.roomType || undefined,
        surgical_specialty: formData.surgicalSpecialty || undefined,
        estimated_surgical_steps: formData.surgicalSteps || undefined,
        anatomy_region: formData.anatomyRegion || undefined,
        previous_similar_duration: formData.previousDuration ? parseInt(formData.previousDuration) : undefined,
        equipment_preparation_time: formData.equipmentTime ? parseInt(formData.equipmentTime) : undefined,
        cleaning_turnover_time: formData.turnoverTime ? parseInt(formData.turnoverTime) : undefined,
        preop_preparation_duration: formData.prepTime ? parseInt(formData.prepTime) : undefined,
        notes: formData.notes || undefined,
      })
      setResult({
        predictedDuration: res.predicted_duration,
        confidence: res.confidence_score,
        minDuration: res.min_duration,
        maxDuration: res.max_duration,
        riskLevel: res.risk_level as 'Low' | 'Medium' | 'High',
        recommendedBuffer: res.recommended_buffer,
        mainFactors: res.main_factors,
      })
      setShowResult(true)
      setScheduleAdded(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : t('common.loading')
      setPredictionError(message)
    } finally {
      setPredicting(false)
    }
  }

  const handleSaveDraft = () => {
    localStorage.setItem('surgai_prediction_draft', JSON.stringify(formData))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleAddToSchedule = async () => {
    if (!formData.scheduledDate) {
      setPredictionError(t('prediction.scheduleDateRequired'))
      return
    }
    if (!result) return
    setAddingToSchedule(true)
    try {
      await createSchedule({
        scheduled_date: formData.scheduledDate,
        start_time: formData.scheduledTime || '08:00',
        room_number: formData.roomType || 'OR-1',
        assigned_surgeon: user?.full_name,
        operation_type: formData.operationType || undefined,
        predicted_duration: result.predictedDuration,
        risk_level: result.riskLevel,
      })
      setScheduleAdded(true)
      setPredictionError(null)
    } catch (err) {
      setPredictionError(err instanceof Error ? err.message : t('schedule.failedAdd'))
    } finally {
      setAddingToSchedule(false)
    }
  }

  const inputClasses = 'w-full px-3 py-2 text-sm backdrop-blur-sm bg-slate-800/50 dark:bg-slate-800/50 not-dark:bg-white/80 border border-slate-700/50 dark:border-slate-700/50 not-dark:border-slate-300/50 rounded-xl text-slate-200 dark:text-slate-200 not-dark:text-slate-900 placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none transition-all'
  const labelClasses = 'block text-sm font-medium text-slate-300 dark:text-slate-300 not-dark:text-slate-700 mb-1.5'
  const selectClasses = inputClasses
  const errorClasses = 'text-xs text-rose-400 mt-1'

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white dark:text-white not-dark:text-slate-900 font-heading">{t('prediction.title')}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t('prediction.subtitle')}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          {t('prediction.predictingAs', { name: user?.full_name || t('navbar.user') })}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Steps */}
          <Card className="p-5">
            <div className="flex items-center justify-between">
              {steps.map((step, idx) => (
                <div key={step.id} className="flex items-center">
                  <div className={cn(
                    'flex items-center gap-2',
                    currentStep === step.id ? 'text-surgai-600' : currentStep > step.id ? 'text-teal-600' : 'text-slate-400',
                  )}>
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors',
                      currentStep === step.id && 'border-surgai-500 bg-surgai-50 dark:bg-surgai-950 text-surgai-600',
                      currentStep > step.id && 'border-teal-500 bg-teal-50 dark:bg-teal-950 text-teal-600',
                      currentStep < step.id && 'border-slate-300 dark:border-slate-600',
                    )}>
                      {currentStep > step.id ? <CheckCircle className="w-4 h-4" /> : step.id}
                    </div>
                    <span className="text-sm font-medium hidden sm:inline">{t(stepKeys[idx])}</span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={cn(
                      'w-12 sm:w-20 h-0.5 mx-2 sm:mx-4',
                      currentStep > step.id ? 'bg-teal-500' : 'bg-slate-200 dark:bg-slate-700',
                    )} />
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Step 1: Operation Information */}
          {currentStep === 1 && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <Stethoscope className="w-5 h-5 text-surgai-500" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t('prediction.operationInfo')}</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className={labelClasses}>{t('prediction.opType')} *</label>
                  <select
                    className={cn(selectClasses, errors.operationType && 'border-red-400')}
                    value={formData.operationType}
                    onChange={(e) => updateField('operationType', e.target.value)}
                  >
                    <option value="">{t('prediction.selectOp')}</option>
                    <option value="Total Knee Replacement">Total Knee Replacement</option>
                    <option value="Cataract Surgery">Cataract Surgery</option>
                    <option value="Laparoscopic Cholecystectomy">Laparoscopic Cholecystectomy</option>
                    <option value="Spinal Fusion">Spinal Fusion</option>
                    <option value="Wisdom Tooth Extraction">Wisdom Tooth Extraction</option>
                    <option value="ACL Reconstruction">ACL Reconstruction</option>
                    <option value="Dental Implant Placement">Dental Implant Placement</option>
                    <option value="Hip Replacement">Hip Replacement</option>
                    <option value="Tonsillectomy">Tonsillectomy</option>
                    <option value="Coronary Artery Bypass">Coronary Artery Bypass</option>
                  </select>
                  {errors.operationType && <p className={errorClasses}>{errors.operationType}</p>}
                </div>

                <div>
                  <label className={labelClasses}>{t('prediction.surgicalSpecialty')} *</label>
                  <select className={cn(selectClasses, errors.surgicalSpecialty && 'border-red-400')}
                    value={formData.surgicalSpecialty}
                    onChange={(e) => updateField('surgicalSpecialty', e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Ophthalmology">Ophthalmology</option>
                    <option value="General Surgery">General Surgery</option>
                    <option value="Neurosurgery">Neurosurgery</option>
                    <option value="Dental Surgery">Dental Surgery</option>
                    <option value="Cardiothoracic">Cardiothoracic</option>
                  </select>
                  {errors.surgicalSpecialty && <p className={errorClasses}>{errors.surgicalSpecialty}</p>}
                </div>

                <div>
                  <label className={labelClasses}>{t('prediction.procedureComplexity')} *</label>
                  <select className={cn(selectClasses, errors.procedureComplexity && 'border-red-400')}
                    value={formData.procedureComplexity}
                    onChange={(e) => updateField('procedureComplexity', e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                  {errors.procedureComplexity && <p className={errorClasses}>{errors.procedureComplexity}</p>}
                </div>

                <div>
                  <label className={labelClasses}>{t('prediction.estSteps')}</label>
                  <input type="number" className={inputClasses}
                    value={formData.surgicalSteps || ''}
                    onChange={(e) => updateField('surgicalSteps', parseInt(e.target.value) || 0)}
                    placeholder={t('prediction.stepsPlaceholder')}
                  />
                </div>

                <div>
                  <label className={labelClasses}>{t('prediction.anatomy')}</label>
                  <input type="text" className={inputClasses}
                    value={formData.anatomyRegion}
                    onChange={(e) => updateField('anatomyRegion', e.target.value)}
                    placeholder={t('prediction.anatomyPlaceholder')}
                  />
                </div>

                <div>
                  <label className={labelClasses}>{t('prediction.anesthesiaType')}</label>
                  <select className={selectClasses}
                    value={formData.anesthesiaType}
                    onChange={(e) => updateField('anesthesiaType', e.target.value)}
                  >
                    <option value="">{t('prediction.select')}</option>
                    <option value="General">General</option>
                    <option value="Regional">Regional</option>
                    <option value="Local">Local</option>
                    <option value="Sedation">Sedation</option>
                  </select>
                </div>

                <div>
                  <label className={labelClasses}>{t('prediction.surgeonExp')} *</label>
                  <select className={cn(selectClasses, errors.surgeonExperience && 'border-red-400')}
                    value={formData.surgeonExperience}
                    onChange={(e) => updateField('surgeonExperience', e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="Junior">Junior (0-3 years)</option>
                    <option value="Intermediate">Intermediate (3-7 years)</option>
                    <option value="Senior">Senior (7-15 years)</option>
                    <option value="Expert">Expert (15+ years)</option>
                  </select>
                  {errors.surgeonExperience && <p className={errorClasses}>{errors.surgeonExperience}</p>}
                </div>

                <div>
                  <label className={labelClasses}>{t('prediction.numAssistants')}</label>
                  <input type="number" className={inputClasses}
                    value={formData.assistantCount || ''}
                    onChange={(e) => updateField('assistantCount', parseInt(e.target.value) || 0)}
                    placeholder={t('prediction.assistantsPlaceholder')}
                  />
                </div>

                <div>
                  <label className={labelClasses}>{t('prediction.roomType')}</label>
                  <select className={selectClasses}
                    value={formData.roomType}
                    onChange={(e) => updateField('roomType', e.target.value)}
                  >
                    <option value="">{t('prediction.select')}</option>
                    <option value="Standard OR">Standard OR</option>
                    <option value="Dental Suite">Dental Suite</option>
                    <option value="Endoscopy Suite">Endoscopy Suite</option>
                    <option value="Hybrid OR">Hybrid OR</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <input type="checkbox" id="emergency" className="w-4 h-4 rounded border-slate-300 text-surgai-600 focus:ring-surgai-500"
                    checked={formData.isEmergency}
                    onChange={(e) => updateField('isEmergency', e.target.checked)}
                  />
                  <label htmlFor="emergency" className="text-sm text-slate-700 dark:text-slate-300">{t('prediction.emergency')}</label>
                </div>
              </div>
            </Card>
          )}

          {/* Step 2: Patient Information */}
          {currentStep === 2 && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <User className="w-5 h-5 text-surgai-500" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t('prediction.patientInfo')}</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelClasses}>{t('prediction.caseId')}</label>
                  <input type="text" className={inputClasses}
                    value={formData.caseId}
                    onChange={(e) => updateField('caseId', e.target.value)}
                    placeholder={t('prediction.caseIdPlaceholder')}
                  />
                </div>
                <div>
                  <label className={labelClasses}>{t('prediction.ageRange')}</label>
                  <select className={selectClasses}
                    value={formData.patientAgeRange}
                    onChange={(e) => updateField('patientAgeRange', e.target.value)}
                  >
                    <option value="">{t('prediction.select')}</option>
                    <option value="0-18">0-18 (Pediatric)</option>
                    <option value="19-35">19-35 (Young Adult)</option>
                    <option value="36-55">36-55 (Adult)</option>
                    <option value="56-70">56-70 (Senior)</option>
                    <option value="70+">70+ (Geriatric)</option>
                  </select>
                </div>
                <div>
                  <label className={labelClasses}>{t('prediction.gender')}</label>
                  <select className={selectClasses}
                    value={formData.patientGender}
                    onChange={(e) => updateField('patientGender', e.target.value)}
                  >
                    <option value="">{t('prediction.select')}</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className={labelClasses}>{t('prediction.asaScore')}</label>
                  <select className={selectClasses}
                    value={formData.asaScore}
                    onChange={(e) => updateField('asaScore', e.target.value)}
                  >
                    <option value="">{t('prediction.select')}</option>
                    <option value="ASA I">ASA I - Normal healthy</option>
                    <option value="ASA II">ASA II - Mild systemic disease</option>
                    <option value="ASA III">ASA III - Severe systemic disease</option>
                    <option value="ASA IV">ASA IV - Severe life-threatening</option>
                  </select>
                </div>
                <div>
                  <label className={labelClasses}>{t('prediction.riskCategory')}</label>
                  <select className={selectClasses}
                    value={formData.riskCategory}
                    onChange={(e) => updateField('riskCategory', e.target.value)}
                  >
                    <option value="">{t('prediction.select')}</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClasses}>{t('prediction.notes')}</label>
                  <textarea className={cn(inputClasses, 'resize-none')} rows={3}
                    value={formData.notes}
                    onChange={(e) => updateField('notes', e.target.value)}
                    placeholder={t('prediction.notesPlaceholder')}
                  />
                </div>
                <div>
                  <label className={labelClasses}>{t('prediction.scheduledDate')}</label>
                  <input type="date" className={inputClasses}
                    value={formData.scheduledDate}
                    onChange={(e) => updateField('scheduledDate', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClasses}>{t('prediction.scheduledTime')}</label>
                  <input type="time" className={inputClasses}
                    value={formData.scheduledTime}
                    onChange={(e) => updateField('scheduledTime', e.target.value)}
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Step 3: Clinical Factors */}
          {currentStep === 3 && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <ClipboardList className="w-5 h-5 text-surgai-500" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t('prediction.clinicalFactors')}</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelClasses}>{t('prediction.prevDuration')}</label>
                  <input type="text" className={inputClasses}
                    value={formData.previousDuration}
                    onChange={(e) => updateField('previousDuration', e.target.value)}
                    placeholder={t('prediction.prevDurationPlaceholder')}
                  />
                </div>
                <div>
                  <label className={labelClasses}>{t('prediction.equipTime')}</label>
                  <input type="text" className={inputClasses}
                    value={formData.equipmentTime}
                    onChange={(e) => updateField('equipmentTime', e.target.value)}
                    placeholder={t('prediction.equipTimePlaceholder')}
                  />
                </div>
                <div>
                  <label className={labelClasses}>{t('prediction.turnoverTime')}</label>
                  <input type="text" className={inputClasses}
                    value={formData.turnoverTime}
                    onChange={(e) => updateField('turnoverTime', e.target.value)}
                    placeholder={t('prediction.turnoverTimePlaceholder')}
                  />
                </div>
                <div>
                  <label className={labelClasses}>{t('prediction.prepTime')}</label>
                  <input type="text" className={inputClasses}
                    value={formData.prepTime}
                    onChange={(e) => updateField('prepTime', e.target.value)}
                    placeholder={t('prediction.prepTimePlaceholder')}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClasses}>{t('prediction.complexityNotes')}</label>
                  <textarea className={cn(inputClasses, 'resize-none')} rows={3}
                    value={formData.complexityNotes}
                    onChange={(e) => updateField('complexityNotes', e.target.value)}
                    placeholder={t('prediction.complexityNotesPlaceholder')}
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Step 4: File Upload */}
          {currentStep === 4 && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <FileUp className="w-5 h-5 text-surgai-500" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t('prediction.fileUpload')}</h2>
              </div>
              <div className="space-y-5">
                <Alert
                  variant="info"
                  title={t('prediction.fileInfoTitle')}
                  description={t('prediction.fileInfoDesc')}
                />

                <div
                  className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center hover:border-surgai-400 dark:hover:border-surgai-500 transition-colors cursor-pointer"
                  onDragOver={(e) => { e.preventDefault() }}
                  onDrop={(e) => {
                    e.preventDefault()
                    const f = e.dataTransfer.files[0]
                    if (f) setUploadedFile(f)
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FileUp className="w-10 h-10 mx-auto text-slate-400 mb-3" />
                  {uploadedFile ? (
                    <div>
                      <p className="text-sm font-medium text-surgai-600 dark:text-surgai-400">{uploadedFile.name}</p>
                      <p className="text-xs text-slate-400 mt-1">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('prediction.dropFiles')}</p>
                      <p className="text-xs text-slate-400 mt-1">{t('prediction.fileFormats')}</p>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" className="hidden" accept=".csv,.xlsx"
                  onChange={(e) => { if (e.target.files?.[0]) setUploadedFile(e.target.files[0]) }}
                />

                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('prediction.acceptedColumns')}</h4>
                  <code className="text-xs text-slate-500 dark:text-slate-400 block">
                    operation_type, patient_age, risk_level, surgeon_experience, complexity_score, previous_duration, actual_duration, anesthesia_type, assistant_count
                  </code>
                </div>
              </div>
            </Card>
          )}

          {/* Navigation Buttons */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
                <ArrowLeft className="w-4 h-4" /> {t('prediction.back')}
              </Button>
              <div className="flex items-center gap-3">
                <Button variant="ghost" onClick={handleSaveDraft}>
                  <Save className="w-4 h-4" />
                  {saved ? t('prediction.saved') : t('prediction.saveDraft')}
                </Button>
                {currentStep < 4 ? (
                  <Button onClick={handleNext}>
                    {t('prediction.next')} <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button onClick={handlePredict} loading={predicting}>
                    <Brain className="w-4 h-4" />
                    {predicting ? t('prediction.generating') : t('prediction.generate')}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar / Result */}
        <div className="space-y-6">
          {/* Progress Indicator */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">{t('prediction.formProgress')}</h3>
            <div className="space-y-3">
              {steps.map((step) => (
                <div key={step.id} className="flex items-center gap-3">
                  <div className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
                    currentStep > step.id && 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
                    currentStep === step.id && 'bg-surgai-100 text-surgai-700 dark:bg-surgai-900/40 dark:text-surgai-300',
                    currentStep < step.id && 'bg-slate-100 text-slate-400 dark:bg-slate-800',
                  )}>
                    {currentStep > step.id ? <CheckCircle className="w-3.5 h-3.5" /> : step.id}
                  </div>
                  <span className={cn(
                    'text-sm',
                    currentStep === step.id ? 'font-medium text-slate-900 dark:text-white' : 'text-slate-400',
                  )}>{t(stepKeys[step.id - 1])}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Tips Card */}
          <Card className="p-5 bg-gradient-to-br from-surgai-50 to-white dark:from-surgai-950 dark:to-slate-900 border-surgai-200 dark:border-surgai-800">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-surgai-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-surgai-800 dark:text-surgai-200 mb-1">{t('prediction.tipsTitle')}</h4>
                <ul className="text-xs text-surgai-700 dark:text-surgai-300 space-y-1.5">
                  <li>{t('prediction.tip1')}</li>
                  <li>{t('prediction.tip2')}</li>
                  <li>{t('prediction.tip3')}</li>
                  <li>{t('prediction.tip4')}</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Prediction Result */}
          {predicting && (
            <Card className="p-6 text-center relative overflow-hidden">
              {/* Scanning laser line */}
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80 animate-scan" />
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-cyan-500/5 to-transparent animate-breathe" />
              <RefreshCw className="w-10 h-10 mx-auto text-cyan-400 animate-spin mb-3 relative" />
              <p className="text-sm font-medium text-slate-200 relative">{t('prediction.analyzing')}</p>
              <p className="text-xs text-slate-500 mt-1 relative">{t('prediction.runningModel')}</p>
            </Card>
          )}

          {predictionError && (
            <Alert variant="error" title={t('prediction.failed')} description={predictionError} />
          )}

          {showResult && result && (
            <Card className="p-6 border-surgai-200 dark:border-surgai-800 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">{t('prediction.result')}</h3>
                <Badge variant="success" size="md">{t('prediction.generated')}</Badge>
              </div>
              <div className="text-xs text-slate-400 mb-4 text-center">
                {t('prediction.surgeonLabel', { name: user?.full_name })}
              </div>

              <div className="text-center mb-6">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t('prediction.predDuration')}</p>
                <p className="text-4xl font-bold text-surgai-600 dark:text-surgai-400">{result.predictedDuration} <span className="text-lg">{t('prediction.min')}</span></p>
              </div>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-sm text-slate-500">{t('prediction.confidenceLabel')}</span>
                  <span className="text-sm font-semibold text-teal-600">{result.confidence}%</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-sm text-slate-500">{t('prediction.expectedRange')}</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{result.minDuration}–{result.maxDuration} min</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-sm text-slate-500">{t('prediction.riskLevel')}</span>
                  <Badge variant={result.riskLevel === 'Low' ? 'success' : result.riskLevel === 'Medium' ? 'warning' : 'danger'} size="sm">{result.riskLevel}</Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-sm text-slate-500">{t('prediction.recommendedBuffer')}</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">+{result.recommendedBuffer} min</span>
                </div>
              </div>

              <div className="mb-5">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('prediction.mainFactors')}</h4>
                <div className="space-y-1.5">
                  {result.mainFactors.map((factor, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-surgai-400" />
                      {factor}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Button className="w-full" variant="secondary" onClick={() => {
                  const lines = [
                    'Prediction Report',
                    '================',
                    `Predicted Duration: ${result.predictedDuration} min`,
                    `Confidence: ${result.confidence}%`,
                    `Range: ${result.minDuration}–${result.maxDuration} min`,
                    `Risk Level: ${result.riskLevel}`,
                    `Recommended Buffer: +${result.recommendedBuffer} min`,
                    '',
                    'Main Factors:',
                    ...result.mainFactors.map(f => `  - ${f}`),
                    '',
                    `Generated by SurgAI — ${new Date().toLocaleString()}`,
                  ]
                  const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url; a.download = 'prediction-report.txt'; a.click()
                  URL.revokeObjectURL(url)
                }}>
                  <Download className="w-4 h-4" /> {t('prediction.exportReport')}
                </Button>
                {!scheduleAdded ? (
                  <Button className="w-full" onClick={handleAddToSchedule} loading={addingToSchedule} disabled={!formData.scheduledDate}>
                    <Calendar className="w-4 h-4" />
                    {addingToSchedule ? t('prediction.addingToSchedule') : t('prediction.addToSchedule')}
                  </Button>
                ) : (
                  <div className="bg-teal-50 dark:bg-teal-950 border border-teal-200 dark:border-teal-800 rounded-lg p-3 text-center">
                    <CheckCircle className="w-5 h-5 mx-auto text-teal-500 mb-1" />
                    <p className="text-sm font-medium text-teal-800 dark:text-teal-200">{t('prediction.scheduleAdded')}</p>
                    <p className="text-xs text-teal-600 dark:text-teal-400 mt-0.5">
                      {formData.scheduledDate} at {formData.scheduledTime || '08:00'} &middot; {user?.full_name}
                    </p>
                  </div>
                )}
                <Button className="w-full" onClick={() => navigate(`/schedule?date=${formData.scheduledDate || ''}`)}>
                  <Calendar className="w-4 h-4" /> {t('prediction.viewInSchedule')}
                </Button>
                <p className="text-xs text-slate-400 text-center">
                  <Info className="w-3 h-3 inline mr-1" />
                  {t('prediction.disclaimer')}
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
