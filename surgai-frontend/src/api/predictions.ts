import { api } from './client'

export interface PredictionRequest {
  case_id?: string
  patient_age_range?: string
  patient_gender?: string
  medical_risk_category?: string
  asa_score?: number
  operation_type: string
  surgical_specialty?: string
  procedure_complexity: string
  estimated_surgical_steps?: number
  anatomy_region?: string
  emergency_status?: string
  anesthesia_type?: string
  surgeon_experience_level?: string
  assistant_count?: number
  operating_room_type?: string
  previous_similar_duration?: number
  equipment_preparation_time?: number
  cleaning_turnover_time?: number
  preop_preparation_duration?: number
  notes?: string
  scheduled_date?: string
  scheduled_time?: string
}

export interface PredictionResult {
  id: number
  case_id: string
  predicted_duration: number
  min_duration: number
  max_duration: number
  confidence_score: number
  risk_level: string
  recommended_buffer: number
  suggested_room_slot: string
  main_factors: string[]
  explanation: string
  model_version: string
  created_at: string
  scheduled?: boolean
  scheduled_date?: string
  scheduled_time?: string
}

export interface PredictionListResponse {
  total: number
  predictions: PredictionResult[]
}

export async function createPrediction(data: PredictionRequest): Promise<PredictionResult> {
  return api.post<PredictionResult>('/predictions', data)
}

export async function getPredictions(skip = 0, limit = 50): Promise<PredictionListResponse> {
  return api.get<PredictionListResponse>(`/predictions?skip=${skip}&limit=${limit}`)
}

export async function getPredictionById(id: number): Promise<PredictionResult> {
  return api.get<PredictionResult>(`/predictions/${id}`)
}

export async function deletePrediction(id: number): Promise<void> {
  return api.delete<void>(`/predictions/${id}`)
}
