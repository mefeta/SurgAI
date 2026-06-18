import type { DashboardStats, Operation, CaseRecord, ModelMetrics, Report } from '@/types'

export const dashboardStats: DashboardStats = {
  todayOperations: 12,
  averagePredictedDuration: 74,
  scheduleRiskLevel: 'Medium',
  delayedCases: 2,
  modelConfidenceAverage: 87,
  averageAccuracy: 94.2,
  delayReduction: 32,
  analyzedOperations: 1847,
  savedHours: 128,
}

export const upcomingOperations: Operation[] = [
  { id: '1', caseId: 'CAS-2024-001', date: new Date(), operationType: 'Total Knee Replacement', surgeon: 'Dr. Sarah Chen', room: 'OR-3', predictedDuration: 120, confidence: 92, riskLevel: 'Medium', status: 'Scheduled' },
  { id: '2', caseId: 'CAS-2024-002', date: new Date(), operationType: 'Cataract Surgery', surgeon: 'Dr. James Wilson', room: 'OR-1', predictedDuration: 45, confidence: 95, riskLevel: 'Low', status: 'Scheduled' },
  { id: '3', caseId: 'CAS-2024-003', date: new Date(), operationType: 'Laparoscopic Cholecystectomy', surgeon: 'Dr. Maria Rodriguez', room: 'OR-2', predictedDuration: 90, confidence: 88, riskLevel: 'Low', status: 'Scheduled' },
  { id: '4', caseId: 'CAS-2024-004', date: new Date(), operationType: 'Spinal Fusion L4-L5', surgeon: 'Dr. Robert Kim', room: 'OR-4', predictedDuration: 180, confidence: 79, riskLevel: 'High', status: 'Delayed' },
  { id: '5', caseId: 'CAS-2024-005', date: new Date(), operationType: 'Wisdom Tooth Extraction', surgeon: 'Dr. Lisa Park', room: 'DEN-1', predictedDuration: 35, confidence: 97, riskLevel: 'Low', status: 'Scheduled' },
  { id: '6', caseId: 'CAS-2024-006', date: new Date(), operationType: 'ACL Reconstruction', surgeon: 'Dr. Michael Torres', room: 'OR-2', predictedDuration: 110, confidence: 85, riskLevel: 'Medium', status: 'Scheduled' },
  { id: '7', caseId: 'CAS-2024-007', date: new Date(), operationType: 'Dental Implant Placement', surgeon: 'Dr. Lisa Park', room: 'DEN-2', predictedDuration: 60, confidence: 91, riskLevel: 'Low', status: 'Scheduled' },
  { id: '8', caseId: 'CAS-2024-008', date: new Date(), operationType: 'Hip Replacement', surgeon: 'Dr. Sarah Chen', room: 'OR-3', predictedDuration: 150, confidence: 83, riskLevel: 'Medium', status: 'Delayed' },
]

export const caseHistory: CaseRecord[] = [
  { id: '1', caseId: 'CAS-2024-001', date: new Date('2024-12-15'), operationType: 'Total Knee Replacement', surgeon: 'Dr. Sarah Chen', predictedDuration: 120, actualDuration: 128, predictionError: 8, confidence: 92, riskLevel: 'Medium', status: 'Completed' },
  { id: '2', caseId: 'CAS-2024-002', date: new Date('2024-12-14'), operationType: 'Cataract Surgery', surgeon: 'Dr. James Wilson', predictedDuration: 45, actualDuration: 42, predictionError: 3, confidence: 95, riskLevel: 'Low', status: 'Completed' },
  { id: '3', caseId: 'CAS-2024-003', date: new Date('2024-12-14'), operationType: 'Laparoscopic Cholecystectomy', surgeon: 'Dr. Maria Rodriguez', predictedDuration: 90, actualDuration: 95, predictionError: 5, confidence: 88, riskLevel: 'Low', status: 'Completed' },
  { id: '4', caseId: 'CAS-2024-004', date: new Date('2024-12-13'), operationType: 'Spinal Fusion L4-L5', surgeon: 'Dr. Robert Kim', predictedDuration: 180, actualDuration: 210, predictionError: 30, confidence: 79, riskLevel: 'High', status: 'Completed' },
  { id: '5', caseId: 'CAS-2024-005', date: new Date('2024-12-13'), operationType: 'Wisdom Tooth Extraction', surgeon: 'Dr. Lisa Park', predictedDuration: 35, actualDuration: 33, predictionError: 2, confidence: 97, riskLevel: 'Low', status: 'Completed' },
  { id: '6', caseId: 'CAS-2024-006', date: new Date('2024-12-12'), operationType: 'ACL Reconstruction', surgeon: 'Dr. Michael Torres', predictedDuration: 110, actualDuration: 115, predictionError: 5, confidence: 85, riskLevel: 'Medium', status: 'Completed' },
  { id: '7', caseId: 'CAS-2024-007', date: new Date('2024-12-12'), operationType: 'Dental Implant Placement', surgeon: 'Dr. Lisa Park', predictedDuration: 60, actualDuration: 62, predictionError: 2, confidence: 91, riskLevel: 'Low', status: 'Completed' },
  { id: '8', caseId: 'CAS-2024-008', date: new Date('2024-12-11'), operationType: 'Hip Replacement', surgeon: 'Dr. Sarah Chen', predictedDuration: 150, actualDuration: 155, predictionError: 5, confidence: 83, riskLevel: 'Medium', status: 'Completed' },
  { id: '9', caseId: 'CAS-2024-009', date: new Date('2024-12-11'), operationType: 'Tonsillectomy', surgeon: 'Dr. James Wilson', predictedDuration: 30, actualDuration: 28, predictionError: 2, confidence: 96, riskLevel: 'Low', status: 'Completed' },
  { id: '10', caseId: 'CAS-2024-010', date: new Date('2024-12-10'), operationType: 'Coronary Artery Bypass', surgeon: 'Dr. Robert Kim', predictedDuration: 240, actualDuration: 255, predictionError: 15, confidence: 76, riskLevel: 'High', status: 'Completed' },
]

export const modelMetrics: ModelMetrics = {
  accuracy: 94.2,
  meanAbsoluteError: 8.3,
  averageErrorMinutes: 7.8,
  confidenceDistribution: [
    { range: '90-100%', count: 845 },
    { range: '80-89%', count: 523 },
    { range: '70-79%', count: 312 },
    { range: '60-69%', count: 124 },
    { range: '<60%', count: 43 },
  ],
  errorByOperationType: [
    { type: 'Total Knee Replacement', error: 8 },
    { type: 'Cataract Surgery', error: 3 },
    { type: 'Laparoscopic Cholecystectomy', error: 5 },
    { type: 'Spinal Fusion', error: 30 },
    { type: 'Wisdom Tooth Extraction', error: 2 },
    { type: 'ACL Reconstruction', error: 5 },
    { type: 'Hip Replacement', error: 5 },
  ],
  errorBySurgeon: [
    { surgeon: 'Dr. Sarah Chen', error: 6 },
    { surgeon: 'Dr. James Wilson', error: 3 },
    { surgeon: 'Dr. Maria Rodriguez', error: 5 },
    { surgeon: 'Dr. Robert Kim', error: 22 },
    { surgeon: 'Dr. Lisa Park', error: 2 },
    { surgeon: 'Dr. Michael Torres', error: 5 },
  ],
  lastTrainingDate: new Date('2024-12-10'),
  modelVersion: 'SurgAI v3.2.1',
  healthStatus: 'Healthy',
}

export const reports: Report[] = [
  { id: '1', title: 'Operation Duration Prediction Report', description: 'Complete prediction analysis for Q4 2024', date: new Date('2024-12-15'), type: 'Prediction', status: 'Ready' },
  { id: '2', title: 'System Test Report', description: 'Validation results for prediction accuracy', date: new Date('2024-12-14'), type: 'Test', status: 'Ready' },
  { id: '3', title: 'Monthly Clinic Performance Report', description: 'December 2024 clinic scheduling efficiency', date: new Date('2024-12-13'), type: 'Performance', status: 'Ready' },
  { id: '4', title: 'Model Accuracy Report', description: 'Detailed accuracy metrics by procedure type', date: new Date('2024-12-12'), type: 'Model', status: 'Generating' },
  { id: '5', title: 'Schedule Optimization Report', description: 'Recommendations for schedule improvement', date: new Date('2024-12-11'), type: 'Schedule', status: 'Ready' },
]

export const operationTypes = [
  'Total Knee Replacement',
  'Cataract Surgery',
  'Laparoscopic Cholecystectomy',
  'Spinal Fusion',
  'Wisdom Tooth Extraction',
  'ACL Reconstruction',
  'Dental Implant Placement',
  'Hip Replacement',
  'Tonsillectomy',
  'Coronary Artery Bypass',
  'Mastectomy',
  'Hernia Repair',
  'Appendectomy',
  'Dental Crown Placement',
  'Root Canal Therapy',
]

export const surgeons = [
  'Dr. Sarah Chen',
  'Dr. James Wilson',
  'Dr. Maria Rodriguez',
  'Dr. Robert Kim',
  'Dr. Lisa Park',
  'Dr. Michael Torres',
]

export const scheduleData = [
  { time: '08:00', operations: [
    { id: '1', caseId: 'CAS-2024-001', surgeon: 'Dr. Chen', type: 'Knee Replacement', duration: 120, room: 'OR-3', risk: 'Medium' as const, status: 'Scheduled' as const },
    { id: '2', caseId: 'CAS-2024-002', surgeon: 'Dr. Wilson', type: 'Cataract Surgery', duration: 45, room: 'OR-1', risk: 'Low' as const, status: 'Scheduled' as const },
  ]},
  { time: '08:30', operations: [
    { id: '3', caseId: 'CAS-2024-003', surgeon: 'Dr. Rodriguez', type: 'Lap. Cholecystectomy', duration: 90, room: 'OR-2', risk: 'Low' as const, status: 'Scheduled' as const },
  ]},
  { time: '09:00', operations: [
    { id: '4', caseId: 'CAS-2024-004', surgeon: 'Dr. Kim', type: 'Spinal Fusion', duration: 180, room: 'OR-4', risk: 'High' as const, status: 'Delayed' as const },
  ]},
  { time: '10:00', operations: [
    { id: '5', caseId: 'CAS-2024-005', surgeon: 'Dr. Park', type: 'Wisdom Tooth Extraction', duration: 35, room: 'DEN-1', risk: 'Low' as const, status: 'Scheduled' as const },
    { id: '6', caseId: 'CAS-2024-006', surgeon: 'Dr. Torres', type: 'ACL Reconstruction', duration: 110, room: 'OR-2', risk: 'Medium' as const, status: 'Scheduled' as const },
  ]},
  { time: '11:00', operations: [
    { id: '7', caseId: 'CAS-2024-007', surgeon: 'Dr. Park', type: 'Dental Implant', duration: 60, room: 'DEN-2', risk: 'Low' as const, status: 'Scheduled' as const },
  ]},
  { time: '13:00', operations: [
    { id: '8', caseId: 'CAS-2024-008', surgeon: 'Dr. Chen', type: 'Hip Replacement', duration: 150, room: 'OR-3', risk: 'Medium' as const, status: 'Delayed' as const },
  ]},
]

export const chartData = {
  predictedVsActual: [
    { name: 'Knee Replacement', predicted: 120, actual: 128 },
    { name: 'Cataract Surgery', predicted: 45, actual: 42 },
    { name: 'Lap. Cholecystectomy', predicted: 90, actual: 95 },
    { name: 'Spinal Fusion', predicted: 180, actual: 210 },
    { name: 'Wisdom Tooth Extraction', predicted: 35, actual: 33 },
    { name: 'ACL Reconstruction', predicted: 110, actual: 115 },
    { name: 'Dental Implant', predicted: 60, actual: 62 },
    { name: 'Hip Replacement', predicted: 150, actual: 155 },
  ],
  operationTypeDistribution: [
    { name: 'Orthopedic', value: 35, color: '#2e93ff' },
    { name: 'Ophthalmology', value: 20, color: '#06b489' },
    { name: 'General Surgery', value: 18, color: '#8dd0ff' },
    { name: 'Dental', value: 15, color: '#f59e0b' },
    { name: 'Neurosurgery', value: 12, color: '#ef4444' },
  ],
  accuracyOverTime: [
    { month: 'Jul', accuracy: 91 },
    { month: 'Aug', accuracy: 91.5 },
    { month: 'Sep', accuracy: 92.8 },
    { month: 'Oct', accuracy: 93.1 },
    { month: 'Nov', accuracy: 93.8 },
    { month: 'Dec', accuracy: 94.2 },
  ],
  errorByType: [
    { type: 'Knee Replacement', error: 8 },
    { type: 'Cataract Surgery', error: 3 },
    { type: 'Lap. Cholecystectomy', error: 5 },
    { type: 'Spinal Fusion', error: 30 },
    { type: 'Tooth Extraction', error: 2 },
    { type: 'ACL Reconstruction', error: 5 },
    { type: 'Hip Replacement', error: 5 },
  ],
}
