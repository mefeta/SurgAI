import type { PredictionInput, PredictionResult, DashboardStats, CaseRecord, ModelMetrics, Report } from '@/types'
import { dashboardStats, caseHistory, modelMetrics, reports } from './data'

export function predictOperationDuration(input: PredictionInput): Promise<PredictionResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const baseDuration = {
        'Total Knee Replacement': 120,
        'Cataract Surgery': 45,
        'Laparoscopic Cholecystectomy': 90,
        'Spinal Fusion': 180,
        'Wisdom Tooth Extraction': 35,
        'ACL Reconstruction': 110,
        'Dental Implant Placement': 60,
        'Hip Replacement': 150,
        'Tonsillectomy': 30,
        'Coronary Artery Bypass': 240,
      }[input.operationType] || 75

      const complexityMultiplier = {
        'Low': 0.85,
        'Medium': 1.0,
        'High': 1.25,
      }[input.procedureComplexity] || 1.0

      const experienceMultiplier = {
        'Junior': 1.2,
        'Intermediate': 1.05,
        'Senior': 0.95,
        'Expert': 0.85,
      }[input.surgeonExperience] || 1.0

      const riskMultiplier = {
        'Low': 0.9,
        'Medium': 1.0,
        'High': 1.15,
      }[input.riskCategory] || 1.0

      const randomFactor = 0.9 + Math.random() * 0.2
      const predictedDuration = Math.round(baseDuration * complexityMultiplier * experienceMultiplier * riskMultiplier * randomFactor)

      const confidenceBase = input.operationType && input.surgeonExperience ? 85 : 65
      const confidence = Math.min(98, confidenceBase + Math.round(Math.random() * 12))

      const error = Math.round(predictedDuration * 0.08 + Math.random() * 5)
      const minDuration = Math.max(15, predictedDuration - error)
      const maxDuration = predictedDuration + error + Math.round(Math.random() * 10)

      const riskScore = predictedDuration > 180 || input.riskCategory === 'High' ? 'High' as const
        : predictedDuration > 90 || input.procedureComplexity === 'Medium' ? 'Medium' as const
        : 'Low' as const

      const recommendedBuffer = riskScore === 'High' ? 25
        : riskScore === 'Medium' ? 15
        : 10

      const factors: string[] = []
      factors.push(`${input.operationType || 'Operation type'} complexity`)
      factors.push(`${input.surgeonExperience || 'Average'} surgeon experience`)
      factors.push(`${input.riskCategory || 'Standard'} patient risk level`)
      factors.push('Historical average duration: ~75 min')

      resolve({
        predictedDuration,
        confidence,
        minDuration,
        maxDuration,
        riskLevel: riskScore,
        recommendedBuffer,
        mainFactors: factors,
      })
    }, 2000)
  })
}

export function getDashboardStats(): Promise<DashboardStats> {
  return Promise.resolve(dashboardStats)
}

export function getCaseHistory(): Promise<CaseRecord[]> {
  return Promise.resolve(caseHistory)
}

export function getModelAnalytics(): Promise<ModelMetrics> {
  return Promise.resolve(modelMetrics)
}

export function generateReport(type: string): Promise<{ success: boolean; url: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, url: `/reports/${type}-report.pdf` })
    }, 1500)
  })
}

export function getSchedule(): Promise<typeof import('./data').scheduleData> {
  return import('./data').then((m) => m.scheduleData)
}

export function getReports(): Promise<Report[]> {
  return Promise.resolve(reports)
}
