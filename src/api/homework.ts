import request from './request'
import type { Homework, HomeworkParams } from '@/types/homework'

// 获取作业列表
export const getHomeworkList = (params?: any): Promise<{ data: Homework[] }> => {
  return request.get('/homework', { params })
}

// 创建作业
export const createHomework = (data: HomeworkParams): Promise<any> => {
  return request.post('/homework', data)
}

// 更新作业
export const updateHomework = (id: string, data: Partial<HomeworkParams>): Promise<any> => {
  return request.put(`/homework/${id}`, data)
}

// 删除作业
export const deleteHomework = (id: string): Promise<any> => {
  return request.delete(`/homework/${id}`)
}

// 获取作业详情
export const getHomeworkDetail = (id: string): Promise<{ data: Homework }> => {
  return request.get(`/homework/${id}`)
}