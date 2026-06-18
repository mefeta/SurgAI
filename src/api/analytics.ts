import { api } from './client'

export interface DashboardStats {
  today_scheduled_operations: number
  average_predicted_duration: number
  schedule_risk_level: string
  delayed_cases: number
  model_confidence_average: number
  total_analyzed_operations: number
  average_delay_reduction: number
  saved_clinic_hours: number
}

export interface ModelAnalytics {
  model_version: string
  accuracy_score: number
  mean_absolute_error: number
  average_error_minutes: number
  confidence_average: number
  training_data_size: number
  last_training_date: string
  model_health_status: string
}

export interface ErrorByOperationType {
  operation_type: string
  error_minutes: number
}

export interface AccuracyOverTime {
  date: string
  accuracy: number
}

export interface PredictedVsActual {
  predicted: number
  actual: number
}

export interface RetrainResponse {
  status: string
  message: string
  new_model_version: string
}

export interface RecentActivity {
  action: string
  detail: string
  time: string
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return api.get<DashboardStats>('/dashboard/stats')
}

export async function getRecentActivity(): Promise<RecentActivity[]> {
  return api.get<RecentActivity[]>('/dashboard/recent-activity')
}

export async function getModelAnalytics(): Promise<ModelAnalytics> {
  return api.get<ModelAnalytics>('/model/analytics')
}

export async function getErrorByOperationType(): Promise<ErrorByOperationType[]> {
  return api.get<ErrorByOperationType[]>('/model/error-by-operation-type')
}

export async function getAccuracyOverTime(): Promise<AccuracyOverTime[]> {
  return api.get<AccuracyOverTime[]>('/model/accuracy-over-time')
}

export async function getPredictedVsActual(): Promise<PredictedVsActual[]> {
  return api.get<PredictedVsActual[]>('/model/predicted-vs-actual')
}

export async function retrainModel(): Promise<RetrainResponse> {
  return api.post<RetrainResponse>('/model/retrain')
}
