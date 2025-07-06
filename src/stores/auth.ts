import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as apiLogin, logout as apiLogout } from '@/api/auth'
import type { LoginParams, User } from '@/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const isLoggedIn = ref<boolean>(!!token.value)

  const login = async (params: LoginParams) => {
    try {
      const response = await apiLogin(params)
      const { user: userData, token: userToken } = response.data
      
      user.value = userData
      token.value = userToken
      isLoggedIn.value = true
      
      localStorage.setItem('token', userToken)
      localStorage.setItem('user', JSON.stringify(userData))
      
      return response
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await apiLogout()
    } catch (error) {
      console.error('Logout API error:', error)
    } finally {
      user.value = null
      token.value = null
      isLoggedIn.value = false
      
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }

  const initAuth = () => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (savedToken && savedUser) {
      token.value = savedToken
      user.value = JSON.parse(savedUser)
      isLoggedIn.value = true
    }
  }

  return {
    user,
    token,
    isLoggedIn,
    login,
    logout,
    initAuth
  }
})