import request from './request'
import type { Student, StudentParams } from '@/types/student'

// 获取学生列表
export const getStudentList = (params?: any): Promise<{ data: Student[] }> => {
  return request.get('/students', { params })
}

// 创建学生
export const createStudent = (data: StudentParams): Promise<any> => {
  return request.post('/students', data)
}

// 更新学生
export const updateStudent = (id: string, data: Partial<StudentParams>): Promise<any> => {
  return request.put(`/students/${id}`, data)
}

// 删除学生
export const deleteStudent = (id: string): Promise<any> => {
  return request.delete(`/students/${id}`)
}

// 获取学生详情
export const getStudentDetail = (id: string): Promise<{ data: Student }> => {
  return request.get(`/students/${id}`)
}