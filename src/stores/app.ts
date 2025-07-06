import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const locale = ref<string>(localStorage.getItem('locale') || 'zh-CN')
  const theme = ref<string>(localStorage.getItem('theme') || 'light')
  const sidebarCollapsed = ref<boolean>(false)

  const setLocale = (newLocale: string) => {
    locale.value = newLocale
    localStorage.setItem('locale', newLocale)
  }

  const setTheme = (newTheme: string) => {
    theme.value = newTheme
    localStorage.setItem('theme', newTheme)
  }

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  return {
    locale,
    theme,
    sidebarCollapsed,
    setLocale,
    setTheme,
    toggleSidebar
  }
})