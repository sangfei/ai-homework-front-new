import request from './request'

// 获取数据分析统计
export const getAnalyticsStats = (params?: any): Promise<any> => {
  return request.get('/analytics/stats', { params })
}

// 获取学生个体分析
export const getStudentAnalysis = (params?: any): Promise<any> => {
  return request.get('/analytics/students', { params })
}

// 导出分析数据
export const exportAnalyticsData = (params?: any): Promise<any> => {
  return request.get('/analytics/export', { params })
}