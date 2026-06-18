export interface PredictionInput {
  caseId: string
  patientAgeRange: string
  patientGender: string
  riskCategory: string
  asaScore: string
  notes: string
  operationType: string
  surgicalSpecialty: string
  procedureComplexity: string
  surgicalSteps: number
  anatomyRegion: string
  isEmergency: boolean
  anesthesiaType: string
  surgeonExperience: string
  assistantCount: number
  roomType: string
  previousDuration: string
  complexityNotes: string
  equipmentTime: string
  turnoverTime: string
  prepTime: string
  scheduledDate: string
  scheduledTime: string
}

export interface PredictionResult {
  predictedDuration: number
  confidence: number
  minDuration: number
  maxDuration: number
  riskLevel: 'Low' | 'Medium' | 'High'
  recommendedBuffer: number
  mainFactors: string[]
}

export interface DashboardStats {
  todayOperations: number
  averagePredictedDuration: number
  scheduleRiskLevel: 'Low' | 'Medium' | 'High'
  delayedCases: number
  modelConfidenceAverage: number
  averageAccuracy: number
  delayReduction: number
  analyzedOperations: number
  savedHours: number
}

export interface Operation {
  id: string
  caseId: string
  date: Date
  operationType: string
  surgeon: string
  room: string
  predictedDuration: number
  actualDuration?: number
  confidence: number
  riskLevel: 'Low' | 'Medium' | 'High'
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled' | 'Delayed'
}

export interface CaseRecord {
  id: string
  caseId: string
  date: Date
  operationType: string
  surgeon: string
  predictedDuration: number
  actualDuration: number
  predictionError: number
  confidence: number
  riskLevel: 'Low' | 'Medium' | 'High'
  status: string
  notes?: string
  explanation?: string
}

export interface ModelMetrics {
  accuracy: number
  meanAbsoluteError: number
  averageErrorMinutes: number
  confidenceDistribution: { range: string; count: number }[]
  errorByOperationType: { type: string; error: number }[]
  errorBySurgeon: { surgeon: string; error: number }[]
  lastTrainingDate: Date
  modelVersion: string
  healthStatus: 'Healthy' | 'Degraded' | 'Unhealthy'
}

export interface Report {
  id: string
  title: string
  description: string
  date: Date
  type: string
  status: 'Ready' | 'Generating' | 'Failed'
}
