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
          <h1 class="text-xl font-bold text-gray-900">系统设置</h1>
          <div></div>
        </div>
      </div>
    </header>

    <!-- 主要内容 -->
    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 class="text-xl font-bold text-gray-900 mb-6">系统设置</h2>
        
        <div class="space-y-8">
          <!-- 通知设置 -->
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">通知设置</h3>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="font-medium text-gray-900">作业提醒</h4>
                  <p class="text-sm text-gray-500">新作业提交时发送通知</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" class="sr-only peer" checked>
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="font-medium text-gray-900">邮件通知</h4>
                  <p class="text-sm text-gray-500">重要事件通过邮件通知</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" class="sr-only peer">
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          <!-- 界面设置 -->
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">界面设置</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">主题</label>
                <select class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>浅色主题</option>
                  <option>深色主题</option>
                  <option>跟随系统</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">语言</label>
                <select class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>简体中文</option>
                  <option>繁体中文</option>
                  <option>English</option>
                </select>
              </div>
            </div>
          </div>

          <!-- 安全设置 -->
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">安全设置</h3>
            <div class="space-y-4">
              <button class="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <h4 class="font-medium text-gray-900">修改密码</h4>
                <p class="text-sm text-gray-500">定期修改密码以保护账户安全</p>
              </button>
              
              <button class="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <h4 class="font-medium text-gray-900">两步验证</h4>
                <p class="text-sm text-gray-500">启用两步验证增强账户安全性</p>
              </button>
            </div>
          </div>
        </div>

        <div class="flex justify-end space-x-4 mt-8">
          <button class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            重置
          </button>
          <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            保存设置
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft } from 'lucide-react'
</script>