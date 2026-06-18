import { api } from './client'

export interface ReportGenerateRequest {
  report_type: string
  related_case_id?: string
}

export interface ReportSection {
  title: string
  content: string
}

export interface ReportGenerateResponse {
  report_id: number
  report_type: string
  title: string
  generated_at: string
  status: string
  summary?: string
  sections: ReportSection[]
}

export interface ReportResponse {
  id: number
  report_type: string
  title: string
  related_case_id?: string
  report_status: string
  summary?: string
  generated_at?: string
}

export interface ReportListResponse {
  total: number
  reports: ReportResponse[]
}

export async function generateReport(data: ReportGenerateRequest): Promise<ReportGenerateResponse> {
  return api.post<ReportGenerateResponse>('/reports/generate', data)
}

export async function getReports(): Promise<ReportListResponse> {
  return api.get<ReportListResponse>('/reports')
}

export async function getReportById(id: number): Promise<ReportResponse> {
  return api.get<ReportResponse>(`/reports/${id}`)
}
