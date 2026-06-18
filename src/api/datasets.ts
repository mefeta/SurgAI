import { api } from './client'

export interface DatasetUploadResponse {
  id: number
  filename: string
  row_count: number
  column_count: number
  data_quality_score: number
  missing_value_count: number
  duplicate_count: number
  status: string
  uploaded_at?: string
}

export interface DatasetListResponse {
  total: number
  datasets: DatasetUploadResponse[]
}

export interface DatasetPreviewResponse {
  filename: string
  columns: string[]
  rows: Record<string, unknown>[]
  total_rows: number
}

export interface DatasetPrepareResponse {
  filename: string
  original_row_count: number
  cleaned_row_count: number
  duplicates_removed: number
  missing_values_filled: number
  status: string
}

export async function uploadDataset(file: File): Promise<DatasetUploadResponse> {
  return api.upload<DatasetUploadResponse>('/datasets/upload', file)
}

export async function getDatasets(): Promise<DatasetListResponse> {
  return api.get<DatasetListResponse>('/datasets')
}

export async function getDatasetPreview(id: number): Promise<DatasetPreviewResponse> {
  return api.get<DatasetPreviewResponse>(`/datasets/${id}/preview`)
}

export async function prepareDataset(id: number): Promise<DatasetPrepareResponse> {
  return api.post<DatasetPrepareResponse>(`/datasets/${id}/prepare`)
}
