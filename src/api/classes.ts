import request from './request'
import type { Class, ClassParams } from '@/types/class'

// 获取班级列表
export const getClassList = (params?: any): Promise<{ data: Class[] }> => {
  return request.get('/classes', { params })
}

// 创建班级
export const createClass = (data: ClassParams): Promise<any> => {
  return request.post('/classes', data)
}

// 更新班级
export const updateClass = (id: string, data: Partial<ClassParams>): Promise<any> => {
  return request.put(`/classes/${id}`, data)
}

// 删除班级
export const deleteClass = (id: string): Promise<any> => {
  return request.delete(`/classes/${id}`)
}

// 获取班级详情
export const getClassDetail = (id: string): Promise<{ data: Class }> => {
  return request.get(`/classes/${id}`)
}