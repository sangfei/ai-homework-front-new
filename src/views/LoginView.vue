<template>
  <div class="login-container">
    <div class="login-background">
      <div class="background-decoration"></div>
    </div>
    
    <div class="login-content">
      <!-- 左侧品牌展示 -->
      <div class="brand-section">
        <div class="brand-header">
          <div class="brand-logo">
            <span>智</span>
          </div>
          <h1>{{ $t('dashboard.title') }}</h1>
        </div>
        
        <h2 class="brand-title">
          {{ $t('login.title') }}
        </h2>
        
        <p class="brand-description">
          {{ $t('login.subtitle') }}
        </p>
        
        <div class="brand-actions">
          <el-button type="primary" :icon="View">
            {{ $t('common.info') }}
          </el-button>
          <el-button>
            {{ $t('common.info') }}
          </el-button>
        </div>
      </div>
      
      <!-- 右侧登录表单 -->
      <div class="form-section">
        <el-card class="login-card">
          <div class="form-header">
            <h2>{{ $t('login.title') }}</h2>
            <p>{{ $t('login.subtitle') }}</p>
          </div>
          
          <!-- 登录方式切换 -->
          <el-segmented
            v-model="loginType"
            :options="loginOptions"
            class="login-type-switch"
          />
          
          <!-- 登录表单 -->
          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            @submit.prevent="handleLogin"
          >
            <!-- 密码登录 -->
            <template v-if="loginType === 'password'">
              <el-form-item prop="username">
                <el-input
                  v-model="loginForm.username"
                  :placeholder="$t('login.username')"
                  :prefix-icon="User"
                  size="large"
                />
              </el-form-item>
              
              <el-form-item prop="password">
                <el-input
                  v-model="loginForm.password"
                  type="password"
                  :placeholder="$t('login.password')"
                  :prefix-icon="Lock"
                  :show-password="true"
                  size="large"
                />
              </el-form-item>
              
              <div class="form-options">
                <el-checkbox v-model="loginForm.rememberMe">
                  {{ $t('login.rememberMe') }}
                </el-checkbox>
                <el-link type="primary">
                  {{ $t('login.forgotPassword') }}
                </el-link>
              </div>
            </template>
            
            <!-- 短信登录 -->
            <template v-else>
              <el-form-item prop="phone">
                <el-input
                  v-model="loginForm.phone"
                  :placeholder="$t('login.phone')"
                  :prefix-icon="Phone"
                  size="large"
                />
              </el-form-item>
              
              <el-form-item prop="smsCode">
                <div class="sms-input-group">
                  <el-input
                    v-model="loginForm.smsCode"
                    :placeholder="$t('login.smsCode')"
                    :prefix-icon="Message"
                    size="large"
                  />
                  <el-button
                    :disabled="smsCountdown > 0"
                    @click="getSmsCode"
                  >
                    {{ smsCountdown > 0 ? `${smsCountdown}s` : $t('login.getSmsCode') }}
                  </el-button>
                </div>
              </el-form-item>
            </template>
            
            <!-- 登录按钮 -->
            <el-form-item>
              <el-button
                type="primary"
                size="large"
                :loading="loading"
                @click="handleLogin"
                class="login-button"
              >
                {{ $t('login.loginBtn') }}
              </el-button>
            </el-form-item>
            
            <!-- 注册链接 -->
            <div class="register-link">
              <span>{{ $t('login.noAccount') }}</span>
              <el-link type="primary">{{ $t('login.registerBtn') }}</el-link>
            </div>
          </el-form>
          
          <!-- 其他登录方式 -->
          <div class="other-login">
            <el-divider>{{ $t('common.info') }}</el-divider>
            <div class="social-login">
              <el-button circle :icon="ChatDotRound" />
              <el-button circle :icon="Message" />
              <el-button circle :icon="User" />
            </div>
          </div>
        </el-card>
        
        <!-- 版权信息 -->
        <div class="copyright">
          <p>© 2025 {{ $t('dashboard.title') }} {{ $t('common.info') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { User, Lock, Phone, Message, View, ChatDotRound } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import type { LoginParams } from '@/types/auth'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

// 表单引用
const loginFormRef = ref<FormInstance>()

// 登录类型
const loginType = ref<'password' | 'sms'>('password')
const loginOptions = computed(() => [
  { label: t('login.passwordLogin'), value: 'password' },
  { label: t('login.smsLogin'), value: 'sms' }
])

// 表单数据
const loginForm = reactive<LoginParams>({
  username: '',
  password: '',
  phone: '',
  smsCode: '',
  loginType: 'password'
})

// 表单验证规则
const loginRules = computed<FormRules>(() => ({
  username: [
    { required: true, message: t('login.usernameRequired'), trigger: 'blur' }
  ],
  password: [
    { required: true, message: t('login.passwordRequired'), trigger: 'blur' },
    { min: 6, message: t('login.passwordRequired'), trigger: 'blur' }
  ],
  phone: [
    { required: true, message: t('login.phoneRequired'), trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: t('login.invalidPhone'), trigger: 'blur' }
  ],
  smsCode: [
    { required: true, message: t('login.smsCodeRequired'), trigger: 'blur' },
    { len: 6, message: t('login.smsCodeRequired'), trigger: 'blur' }
  ]
}))

// 状态
const loading = ref(false)
const smsCountdown = ref(0)

// 获取验证码
const getSmsCode = async () => {
  if (!loginForm.phone) {
    ElMessage.error(t('login.phoneRequired'))
    return
  }
  
  if (!/^1[3-9]\d{9}$/.test(loginForm.phone)) {
    ElMessage.error(t('login.invalidPhone'))
    return
  }
  
  smsCountdown.value = 60
  const timer = setInterval(() => {
    smsCountdown.value--
    if (smsCountdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
  
  ElMessage.success('验证码已发送')
}

// 登录处理
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    await loginFormRef.value.validate()
    
    loading.value = true
    loginForm.loginType = loginType.value
    
    await authStore.login(loginForm)
    
    ElMessage.success(t('login.loginSuccess'))
    router.push('/')
  } catch (error: any) {
    ElMessage.error(error.message || t('login.loginFailed'))
  } finally {
    loading.value = false
  }
}

// 监听登录类型变化
watch(loginType, (newType) => {
  loginForm.loginType = newType
  // 清空表单验证
  loginFormRef.value?.clearValidate()
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.login-background {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.background-decoration::before,
.background-decoration::after {
  content: '';
  position: absolute;
  width: 400px;
  height: 400px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  filter: blur(100px);
}

.background-decoration::before {
  top: -200px;
  right: -200px;
}

.background-decoration::after {
  bottom: -200px;
  left: -200px;
}

.login-content {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  gap: 4rem;
}

.brand-section {
  color: white;
  padding: 2rem;
}

.brand-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.brand-logo {
  width: 3rem;
  height: 3rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.25rem;
}

.brand-title {
  font-size: 3rem;
  font-weight: bold;
  line-height: 1.2;
  margin-bottom: 1.5rem;
}

.brand-description {
  font-size: 1.125rem;
  line-height: 1.6;
  opacity: 0.9;
  margin-bottom: 2rem;
}

.brand-actions {
  display: flex;
  gap: 1rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.login-card {
  width: 100%;
  max-width: 400px;
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
}

.form-header h2 {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.form-header p {
  color: var(--el-text-color-secondary);
}

.login-type-switch {
  width: 100%;
  margin-bottom: 1.5rem;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.sms-input-group {
  display: flex;
  gap: 0.5rem;
  width: 100%;
}

.sms-input-group .el-input {
  flex: 1;
}

.login-button {
  width: 100%;
}

.register-link {
  text-align: center;
  margin-top: 1rem;
}

.other-login {
  margin-top: 2rem;
}

.social-login {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.copyright {
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .login-content {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
  
  .brand-section {
    display: none;
  }
  
  .brand-title {
    font-size: 2rem;
  }
}
</style>