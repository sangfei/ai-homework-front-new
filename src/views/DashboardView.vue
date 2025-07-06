<template>
  <el-container class="dashboard-container">
    <!-- 顶部导航 -->
    <el-header class="dashboard-header">
      <div class="header-left">
        <div class="brand">
          <div class="brand-logo">
            <span>智</span>
          </div>
          <h1>{{ $t('dashboard.title') }}</h1>
        </div>
      </div>
      
      <div class="header-right">
        <!-- 时间显示 -->
        <div class="current-time">
          {{ currentTime }}
        </div>
        
        <!-- 语言切换 -->
        <el-dropdown @command="handleLanguageChange">
          <el-button text>
            <el-icon><Globe /></el-icon>
            {{ currentLanguage }}
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="zh-CN">中文</el-dropdown-item>
              <el-dropdown-item command="en-US">English</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        
        <!-- 通知 -->
        <el-badge :value="3" class="notification-badge">
          <el-button text :icon="Bell" />
        </el-badge>
        
        <!-- 用户菜单 -->
        <el-dropdown @command="handleUserMenuCommand">
          <div class="user-info">
            <el-avatar :size="32" :icon="UserFilled" />
            <div class="user-details">
              <div class="user-name">{{ user?.name }}</div>
              <div class="user-role">{{ user?.role }}</div>
            </div>
            <el-icon><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">
                <el-icon><User /></el-icon>
                {{ $t('dashboard.personalCenter') }}
              </el-dropdown-item>
              <el-dropdown-item command="settings">
                <el-icon><Setting /></el-icon>
                {{ $t('dashboard.systemSettings') }}
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <el-icon><SwitchButton /></el-icon>
                {{ $t('dashboard.logout') }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>
    
    <!-- 主要内容 -->
    <el-main class="dashboard-main">
      <!-- 问候语 -->
      <div class="welcome-section">
        <h2>{{ $t('dashboard.welcome', { name: user?.name }) }}</h2>
        <p>{{ $t('dashboard.currentDate', { date: currentDate }) }}</p>
      </div>
      
      <!-- 主横幅 -->
      <div class="hero-banner">
        <div class="hero-content">
          <div class="hero-text">
            <div class="hero-brand">
              <div class="hero-logo">智</div>
              <span>小芽作业</span>
            </div>
            <h1>小芽作业智能批改，<br />高效精准促提升</h1>
            <p>基于人工智能技术，为学生提供精准的作业批改和个性化学习指导，助力教育数字化转型，提升教学质量与效率。</p>
            <div class="hero-actions">
              <el-button type="primary" :icon="View">查看演示</el-button>
              <el-button :icon="Document">使用指南</el-button>
            </div>
          </div>
          <div class="hero-visual">
            <div class="visual-card">
              <div class="card-header">
                <div class="traffic-lights">
                  <span class="light red"></span>
                  <span class="light yellow"></span>
                  <span class="light green"></span>
                </div>
              </div>
              <div class="card-content">
                <div class="progress-bar" v-for="i in 4" :key="i"></div>
              </div>
              <div class="floating-icon success">
                <el-icon><Check /></el-icon>
              </div>
              <div class="floating-icon trend">
                <el-icon><TrendCharts /></el-icon>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 内容区域 -->
      <el-row :gutter="24" class="content-section">
        <!-- 待办事项 -->
        <el-col :lg="16" :md="24">
          <el-card class="todo-card">
            <template #header>
              <div class="card-header">
                <h3>{{ $t('dashboard.todoList') }}</h3>
                <div class="header-actions">
                  <el-button text @click="showAllTodos = !showAllTodos">
                    {{ showAllTodos ? $t('dashboard.collapse') : $t('dashboard.viewAll') }}
                  </el-button>
                  <el-button type="primary" :icon="Plus" @click="showAddTodoDialog = true">
                    {{ $t('dashboard.addTodo') }}
                  </el-button>
                </div>
              </div>
            </template>
            
            <div v-if="todos.length === 0" class="empty-state">
              <el-empty :description="$t('dashboard.noTodos')">
                <el-button type="primary" @click="showAddTodoDialog = true">
                  {{ $t('dashboard.addFirstTodo') }}
                </el-button>
              </el-empty>
            </div>
            
            <div v-else class="todo-list">
              <div
                v-for="todo in displayedTodos"
                :key="todo.id"
                class="todo-item"
              >
                <div class="todo-content">
                  <div :class="['todo-status', todo.status]"></div>
                  <div class="todo-info">
                    <h4>{{ todo.title }}</h4>
                    <p>{{ todo.description }}</p>
                  </div>
                </div>
                <div class="todo-actions">
                  <el-tag :type="getStatusTagType(todo.status)">
                    {{ $t(`dashboard.status.${todo.status}`) }}
                  </el-tag>
                  <el-button-group class="action-buttons">
                    <el-button text :icon="Check" @click="toggleTodoStatus(todo.id)" />
                    <el-button text :icon="Delete" @click="deleteTodo(todo.id)" />
                  </el-button-group>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <!-- 快速入口和统计 -->
        <el-col :lg="8" :md="24">
          <!-- 快速入口 -->
          <el-card class="shortcuts-card">
            <template #header>
              <h3>{{ $t('dashboard.quickAccess') }}</h3>
            </template>
            
            <div class="shortcuts-grid">
              <div
                v-for="shortcut in shortcuts"
                :key="shortcut.id"
                class="shortcut-item"
                @click="$router.push(shortcut.path)"
              >
                <div :class="['shortcut-icon', shortcut.color]">
                  <component :is="shortcut.icon" />
                </div>
                <div class="shortcut-info">
                  <h4>{{ $t(shortcut.title) }}</h4>
                  <p>{{ $t(shortcut.description) }}</p>
                </div>
              </div>
            </div>
          </el-card>
          
          <!-- 今日概览 -->
          <el-card class="overview-card">
            <template #header>
              <h3>{{ $t('dashboard.todayOverview') }}</h3>
            </template>
            
            <div class="overview-stats">
              <div class="stat-item">
                <div class="stat-icon">
                  <el-icon><Document /></el-icon>
                </div>
                <div class="stat-info">
                  <span class="stat-label">{{ $t('dashboard.pendingHomework') }}</span>
                  <span class="stat-value">24</span>
                </div>
              </div>
              
              <div class="stat-item">
                <div class="stat-icon">
                  <el-icon><User /></el-icon>
                </div>
                <div class="stat-info">
                  <span class="stat-label">{{ $t('dashboard.onlineStudents') }}</span>
                  <span class="stat-value">156</span>
                </div>
              </div>
              
              <div class="stat-item">
                <div class="stat-icon">
                  <el-icon><TrendCharts /></el-icon>
                </div>
                <div class="stat-info">
                  <span class="stat-label">{{ $t('dashboard.completionRate') }}</span>
                  <span class="stat-value">89%</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-main>
    
    <!-- 添加待办对话框 -->
    <el-dialog
      v-model="showAddTodoDialog"
      :title="$t('dashboard.addTodo')"
      width="500px"
    >
      <el-form :model="newTodo" label-width="80px">
        <el-form-item :label="$t('dashboard.todoTitle')">
          <el-input
            v-model="newTodo.title"
            :placeholder="$t('dashboard.todoTitlePlaceholder')"
          />
        </el-form-item>
        <el-form-item :label="$t('dashboard.todoDescription')">
          <el-input
            v-model="newTodo.description"
            type="textarea"
            :rows="3"
            :placeholder="$t('dashboard.todoDescriptionPlaceholder')"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showAddTodoDialog = false">
          {{ $t('common.cancel') }}
        </el-button>
        <el-button type="primary" @click="addTodo">
          {{ $t('common.add') }}
        </el-button>
      </template>
    </el-dialog>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import {
  Globe, Bell, UserFilled, ArrowDown, User, Setting, SwitchButton,
  View, Document, Check, TrendCharts, Plus, Delete
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'

const { t, locale } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()

// 用户信息
const user = computed(() => authStore.user)

// 时间相关
const currentTime = ref('')
const currentDate = ref('')

// 待办事项
const todos = ref([
  {
    id: 1,
    title: '七年级数学期中测试批改',
    description: '12人已提交',
    status: 'pending'
  },
  {
    id: 2,
    title: '八年级物理作业发布',
    description: '共3个任务，待发布',
    status: 'inProgress'
  },
  {
    id: 3,
    title: '九年级化学实验报告审核',
    description: '12人已提交',
    status: 'completed'
  }
])

const showAllTodos = ref(false)
const showAddTodoDialog = ref(false)
const newTodo = ref({
  title: '',
  description: ''
})

// 快速入口
const shortcuts = ref([
  {
    id: 1,
    title: 'dashboard.shortcuts.newHomework',
    description: 'dashboard.shortcuts.newHomeworkDesc',
    icon: 'Plus',
    color: 'blue',
    path: '/homework'
  },
  {
    id: 2,
    title: 'dashboard.shortcuts.gradeHomework',
    description: 'dashboard.shortcuts.gradeHomeworkDesc',
    icon: 'Check',
    color: 'green',
    path: '/homework'
  },
  {
    id: 3,
    title: 'dashboard.shortcuts.homeworkAnalysis',
    description: 'dashboard.shortcuts.homeworkAnalysisDesc',
    icon: 'TrendCharts',
    color: 'purple',
    path: '/analytics'
  },
  {
    id: 4,
    title: 'dashboard.shortcuts.gradeEntry',
    description: 'dashboard.shortcuts.gradeEntryDesc',
    icon: 'Edit',
    color: 'orange',
    path: '/students'
  },
  {
    id: 5,
    title: 'dashboard.shortcuts.studentManagement',
    description: 'dashboard.shortcuts.studentManagementDesc',
    icon: 'User',
    color: 'red',
    path: '/students'
  },
  {
    id: 6,
    title: 'dashboard.shortcuts.errorCollection',
    description: 'dashboard.shortcuts.errorCollectionDesc',
    icon: 'Download',
    color: 'teal',
    path: '/analytics'
  }
])

// 计算属性
const displayedTodos = computed(() => {
  return showAllTodos.value ? todos.value : todos.value.slice(0, 3)
})

const currentLanguage = computed(() => {
  return locale.value === 'zh-CN' ? '中文' : 'English'
})

// 方法
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  }
  currentDate.value = now.toLocaleDateString(locale.value, options)
}

const handleLanguageChange = (lang: string) => {
  locale.value = lang
  appStore.setLocale(lang)
  ElMessage.success(t('common.success'))
}

const handleUserMenuCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      authStore.logout()
      router.push('/login')
      break
  }
}

const getStatusTagType = (status: string) => {
  const typeMap = {
    pending: 'warning',
    inProgress: 'primary',
    completed: 'success'
  }
  return typeMap[status] || 'info'
}

const toggleTodoStatus = (id: number) => {
  const todo = todos.value.find(t => t.id === id)
  if (todo) {
    if (todo.status === 'pending') {
      todo.status = 'inProgress'
    } else if (todo.status === 'inProgress') {
      todo.status = 'completed'
    } else {
      todo.status = 'pending'
    }
  }
}

const deleteTodo = (id: number) => {
  const index = todos.value.findIndex(t => t.id === id)
  if (index > -1) {
    todos.value.splice(index, 1)
    ElMessage.success(t('common.success'))
  }
}

const addTodo = () => {
  if (!newTodo.value.title.trim()) {
    ElMessage.error('请输入标题')
    return
  }
  
  todos.value.unshift({
    id: Date.now(),
    title: newTodo.value.title,
    description: newTodo.value.description || '无描述',
    status: 'pending'
  })
  
  newTodo.value = { title: '', description: '' }
  showAddTodoDialog.value = false
  ElMessage.success(t('common.success'))
}

// 生命周期
onMounted(() => {
  updateTime()
  const timer = setInterval(updateTime, 1000)
  
  onUnmounted(() => {
    clearInterval(timer)
  })
})
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background: #f5f7fa;
}

.dashboard-header {
  background: white;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.header-left .brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-logo {
  width: 32px;
  height: 32px;
  background: #409eff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}

.brand h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.current-time {
  color: #606266;
  font-size: 14px;
}

.notification-badge {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.user-info:hover {
  background: #f5f7fa;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
}

.user-role {
  font-size: 12px;
  color: #909399;
}

.dashboard-main {
  padding: 24px;
}

.welcome-section {
  margin-bottom: 24px;
}

.welcome-section h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
}

.welcome-section p {
  margin: 0;
  color: #606266;
}

.hero-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 48px;
  margin-bottom: 24px;
  color: white;
  position: relative;
  overflow: hidden;
}

.hero-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: center;
}

.hero-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.hero-logo {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 20px;
}

.hero-text h1 {
  font-size: 36px;
  font-weight: bold;
  line-height: 1.2;
  margin: 0 0 16px 0;
}

.hero-text p {
  font-size: 16px;
  line-height: 1.6;
  opacity: 0.9;
  margin: 0 0 32px 0;
}

.hero-actions {
  display: flex;
  gap: 16px;
}

.hero-visual {
  display: flex;
  justify-content: center;
}

.visual-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  position: relative;
  backdrop-filter: blur(10px);
}

.card-header {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.traffic-lights {
  display: flex;
  gap: 6px;
}

.light {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.light.red { background: #ff5f56; }
.light.yellow { background: #ffbd2e; }
.light.green { background: #27ca3f; }

.card-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.progress-bar:nth-child(1) { width: 80%; }
.progress-bar:nth-child(2) { width: 60%; }
.progress-bar:nth-child(3) { width: 90%; }
.progress-bar:nth-child(4) { width: 70%; }

.floating-icon {
  position: absolute;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.floating-icon.success {
  background: #67c23a;
  top: -12px;
  right: -12px;
  animation: bounce 2s infinite;
}

.floating-icon.trend {
  background: #409eff;
  bottom: -12px;
  left: -12px;
  animation: pulse 2s infinite;
}

.content-section {
  margin-top: 24px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.todo-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.2s;
}

.todo-item:hover {
  background: #e9ecef;
}

.todo-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.todo-status {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.todo-status.pending { background: #e6a23c; }
.todo-status.inProgress { background: #409eff; }
.todo-status.completed { background: #67c23a; }

.todo-info h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 500;
}

.todo-info p {
  margin: 0;
  font-size: 12px;
  color: #909399;
}

.todo-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-buttons {
  opacity: 0;
  transition: opacity 0.2s;
}

.todo-item:hover .action-buttons {
  opacity: 1;
}

.shortcuts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.shortcut-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.shortcut-item:hover {
  background: #e9ecef;
  transform: translateY(-2px);
}

.shortcut-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  font-size: 20px;
  color: white;
}

.shortcut-icon.blue { background: #409eff; }
.shortcut-icon.green { background: #67c23a; }
.shortcut-icon.purple { background: #9c27b0; }
.shortcut-icon.orange { background: #e6a23c; }
.shortcut-icon.red { background: #f56c6c; }
.shortcut-icon.teal { background: #20b2aa; }

.shortcut-info h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 500;
}

.shortcut-info p {
  margin: 0;
  font-size: 12px;
  color: #909399;
}

.overview-card {
  margin-top: 16px;
}

.overview-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon {
  width: 32px;
  height: 32px;
  background: #f0f2f5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #409eff;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 48px 0;
}

@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0, 0, 0);
  }
  40%, 43% {
    transform: translate3d(0, -8px, 0);
  }
  70% {
    transform: translate3d(0, -4px, 0);
  }
  90% {
    transform: translate3d(0, -2px, 0);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

@media (max-width: 768px) {
  .hero-content {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .hero-visual {
    display: none;
  }
  
  .shortcuts-grid {
    grid-template-columns: 1fr;
  }
}
</style>