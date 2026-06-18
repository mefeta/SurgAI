import { api } from './client'

export interface CaseFilters {
  operation_type?: string
  surgeon?: string
  risk_level?: string
  status?: string
  skip?: number
  limit?: number
}

export interface CaseResponse {
  id: number
  case_id: string
  patient_age_range?: string
  patient_gender?: string
  medical_risk_category?: string
  asa_score?: number
  operation_type: string
  surgical_specialty?: string
  procedure_complexity?: string
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
  status: string
  created_at?: string
  updated_at?: string
}

export interface CaseListResponse {
  total: number
  cases: CaseResponse[]
}

export async function getCases(filters: CaseFilters = {}): Promise<CaseListResponse> {
  const params = new URLSearchParams()
  if (filters.operation_type) params.set('operation_type', filters.operation_type)
  if (filters.surgeon) params.set('surgeon', filters.surgeon)
  if (filters.risk_level) params.set('risk_level', filters.risk_level)
  if (filters.status) params.set('status', filters.status)
  params.set('skip', String(filters.skip || 0))
  params.set('limit', String(filters.limit || 50))
  return api.get<CaseListResponse>(`/cases?${params.toString()}`)
}

export async function getCaseById(caseId: string): Promise<CaseResponse> {
  return api.get<CaseResponse>(`/cases/${caseId}`)
}

export async function createCase(data: Partial<CaseResponse>): Promise<CaseResponse> {
  return api.post<CaseResponse>('/cases', data)
}

export async function updateCase(caseId: string, data: Partial<CaseResponse>): Promise<CaseResponse> {
  return api.put<CaseResponse>(`/cases/${caseId}`, data)
}

export async function deleteCase(caseId: string): Promise<void> {
  return api.delete<void>(`/cases/${caseId}`)
}

export interface CaseHistoryItem {
  case_id: string
  operation_type: string
  procedure_complexity?: string
  status: string
  created_at?: string
  surgeon?: string
  predicted_duration?: number
  confidence_score?: number
  risk_level?: string
  scheduled_date?: string
  room_number?: string
}

export interface CaseHistoryResponse {
  total: number
  cases: CaseHistoryItem[]
}

export async function getCaseHistory(
  skip = 0,
  limit = 50,
  surgeon?: string,
): Promise<CaseHistoryResponse> {
  const params = new URLSearchParams()
  params.set('skip', String(skip))
  params.set('limit', String(limit))
  if (surgeon) params.set('surgeon', surgeon)
  return api.get<CaseHistoryResponse>(`/cases/history?${params.toString()}`)
}
