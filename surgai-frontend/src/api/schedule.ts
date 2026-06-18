import { api } from './client'

export interface ScheduleCreateRequest {
  surgical_case_id?: number
  case_id?: string
  scheduled_date: string
  start_time: string
  end_time?: string
  room_number: string
  assigned_surgeon?: string
  operation_type?: string
  predicted_duration?: number
  risk_level?: string
  schedule_status?: string
}

export interface ScheduleResponse {
  id: number
  surgical_case_id?: number
  case_id?: string
  scheduled_date?: string
  start_time?: string
  end_time?: string
  room_number?: string
  assigned_surgeon?: string
  operation_type?: string
  predicted_duration?: number
  risk_level?: string
  schedule_status: string
  conflict_warning?: string
  created_at?: string
}

export interface ScheduleListResponse {
  total: number
  schedules: ScheduleResponse[]
}

export async function getSchedule(skip = 0, limit = 50): Promise<ScheduleListResponse> {
  return api.get<ScheduleListResponse>(`/schedule?skip=${skip}&limit=${limit}`)
}

export async function getScheduleByDay(date: string): Promise<ScheduleListResponse> {
  return api.get<ScheduleListResponse>(`/schedule/day/${date}`)
}

export async function getScheduleByWeek(startDate: string): Promise<ScheduleListResponse> {
  return api.get<ScheduleListResponse>(`/schedule/week/${startDate}`)
}

export async function createSchedule(data: ScheduleCreateRequest): Promise<ScheduleResponse> {
  return api.post<ScheduleResponse>('/schedule', data)
}

export async function updateSchedule(id: number, data: Partial<ScheduleCreateRequest>): Promise<ScheduleResponse> {
  return api.put<ScheduleResponse>(`/schedule/${id}`, data)
}

export async function deleteSchedule(id: number): Promise<void> {
  return api.delete<void>(`/schedule/${id}`)
}
