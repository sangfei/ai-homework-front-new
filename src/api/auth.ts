import request from './request'
import type { LoginParams, LoginResponse } from '@/types/auth'

// 登录
export const login = (data: LoginParams): Promise<LoginResponse> => {
  return request.post('/auth/login', data)
}

// 登出
export const logout = (): Promise<void> => {
  return request.post('/auth/logout')
}

// 获取用户信息
export const getUserInfo = (): Promise<any> => {
  return request.get('/auth/user')
}

// 刷新token
export const refreshToken = (): Promise<any> => {
  return request.post('/auth/refresh')
}