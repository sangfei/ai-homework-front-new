<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 顶部导航栏 -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-4">
            <router-link
              to="/"
              class="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft class="w-4 h-4" />
              <span>返回首页</span>
            </router-link>
          </div>
          <h1 class="text-xl font-bold text-gray-900">个人中心</h1>
          <div></div>
        </div>
      </div>
    </header>

    <!-- 主要内容 -->
    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div class="flex items-center space-x-6 mb-8">
          <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
            <User class="w-10 h-10 text-blue-600" />
          </div>
          <div>
            <h2 class="text-2xl font-bold text-gray-900">{{ user.name }}</h2>
            <p class="text-gray-600">{{ user.role }}</p>
            <p class="text-sm text-gray-500 mt-1">上次登录：2025年6月5日 09:30</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">基本信息</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                <input
                  type="text"
                  :value="user.name"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  readonly
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">职位</label>
                <input
                  type="text"
                  :value="user.role"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  readonly
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                <input
                  type="email"
                  value="teacher@example.com"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">手机号</label>
                <input
                  type="tel"
                  value="13800138000"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">统计信息</h3>
            <div class="space-y-4">
              <div class="bg-blue-50 rounded-lg p-4">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">本月批改作业</span>
                  <span class="text-2xl font-bold text-blue-600">156</span>
                </div>
              </div>
              <div class="bg-green-50 rounded-lg p-4">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">管理学生数</span>
                  <span class="text-2xl font-bold text-green-600">89</span>
                </div>
              </div>
              <div class="bg-orange-50 rounded-lg p-4">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">平均批改时间</span>
                  <span class="text-2xl font-bold text-orange-600">2.3分</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end space-x-4 mt-8">
          <button class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            取消
          </button>
          <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            保存修改
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { ArrowLeft, User } from 'lucide-react'

const store = useStore()
const user = computed(() => store.state.auth.user)
</script>