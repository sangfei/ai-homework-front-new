export interface User {
  id: string
  name: string
  role: string
  email?: string
  phone?: string
  avatar?: string
}

export interface LoginParams {
  username?: string
  password?: string
  phone?: string
  smsCode?: string
  loginType: 'password' | 'sms'
}

export interface LoginResponse {
  code: number
  message: string
  data: {
    user: User
    token: string
  }
}