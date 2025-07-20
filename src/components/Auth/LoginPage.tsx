import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Lock, Phone, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import { loginWithMobile, initializeAuth } from '../../services/auth';

interface LoginPageProps {
  onLogin: (userData: any) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState<'password' | 'sms'>('password');
  const [formData, setFormData] = useState({
    username: 'admin',
    password: '123456',
    phone: '',
    smsCode: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [smsCountdown, setSmsCountdown] = useState(0);
  const [loginError, setLoginError] = useState('');

  // 初始化认证状态
  useEffect(() => {
    initializeAuth();
  }, []);

  // 验证码倒计时
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (smsCountdown > 0) {
      timer = setTimeout(() => setSmsCountdown(smsCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [smsCountdown]);

  // 表单验证
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (loginType === 'password') {
      if (!formData.username.trim()) {
        newErrors.username = '请输入用户名';
      }
      if (!formData.password) {
        newErrors.password = '请输入密码';
      } else if (formData.password.length < 6) {
        newErrors.password = '密码长度不能少于6位';
      }
    } else {
      if (!formData.phone) {
        newErrors.phone = '请输入手机号';
      } else if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
        newErrors.phone = '请输入正确的手机号格式';
      }
      if (!formData.smsCode) {
        newErrors.smsCode = '请输入验证码';
      } else if (formData.smsCode.length !== 6) {
        newErrors.smsCode = '验证码为6位数字';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 获取验证码
  const handleGetSmsCode = async () => {
    if (!formData.phone) {
      setErrors({ phone: '请先输入手机号' });
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      setErrors({ phone: '请输入正确的手机号格式' });
      return;
    }

    setErrors({});
    setSmsCountdown(60);
    
    // 模拟发送验证码
    try {
      // 这里应该调用实际的短信发送API
      console.log('发送验证码到:', formData.phone);
    } catch (error) {
      console.error('发送验证码失败:', error);
    }
  };

  // 处理登录
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      if (loginType === 'password') {
        // 使用真实的登录API
        const loginResult = await loginWithMobile(formData.username, formData.password);
        
        // 准备用户信息
        const userData = {
          name: formData.username, // 临时使用用户名，实际信息会在Header组件中获取
          role: '教师',
          avatar: '',
          ...loginResult
        };
        
        // 调用父组件的登录回调
        onLogin(userData);
        
        // 登录成功后跳转到首页
        console.log('✅ 登录成功，跳转到首页');
        navigate('/', { replace: true });
      } else {
        // 短信登录暂时保持模拟逻辑
        if (formData.phone === '13800138000' && formData.smsCode === '123456') {
          const userData = {
            name: '李老师',
            role: '数学教师',
            avatar: ''
          };
          
          // 调用父组件的登录回调
          onLogin(userData);
          
          // 登录成功后跳转到首页
          console.log('✅ 短信登录成功，跳转到首页');
          navigate('/', { replace: true });
        } else {
          setLoginError('手机号或验证码错误');
        }
      }
    } catch (error) {
      console.error('登录错误:', error);
      if (error instanceof Error) {
        setLoginError(error.message);
      } else {
        setLoginError('登录失败，请稍后重试');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 处理输入变化
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    setLoginError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 flex items-center justify-center p-4">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* 左侧品牌展示区 */}
        <div className="hidden lg:block text-white space-y-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">智</span>
              </div>
              <h1 className="text-2xl font-bold">智飞学记</h1>
            </div>
            <h2 className="text-4xl font-bold leading-tight">
              个人学习成长纪录<br />
              高效知识管理空间
            </h2>
            <p className="text-blue-100 text-lg leading-relaxed">
              智飞学记是一个专注于个人学习成长纪录的空间，一个高效的知识管理和学习资源保存空间。
              提供学习材料保存、知识总结和归档功能，帮助您系统化管理学习资料，提升学习效率。
            </p>
          </div>

          <div className="flex space-x-4">
            <button className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-lg text-white font-medium hover:bg-white/30 transition-all duration-300 flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>查看演示</span>
            </button>
            <button className="px-6 py-3 border border-white/30 rounded-lg text-white font-medium hover:bg-white/10 transition-all duration-300">
              使用指南
            </button>
          </div>

          {/* 特色功能展示 */}
          <div className="grid grid-cols-2 gap-4 pt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="w-8 h-8 bg-green-400 rounded-lg flex items-center justify-center mb-3">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold mb-1">学习材料保存</h3>
              <p className="text-sm text-blue-100">便捷上传保存各类学习资料</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="w-8 h-8 bg-blue-400 rounded-lg flex items-center justify-center mb-3">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold mb-1">知识总结</h3>
              <p className="text-sm text-blue-100">整理总结学习内容，提升效率</p>
            </div>
          </div>
        </div>

        {/* 右侧登录表单区 */}
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">欢迎登录</h2>
              <p className="text-gray-600">登录您的账号，开始智能批改之旅</p>
            </div>

            {/* 登录方式切换 */}
            <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
              <button
                onClick={() => setLoginType('password')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  loginType === 'password'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                密码登录
              </button>
              <button
                onClick={() => setLoginType('sms')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  loginType === 'sms'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                验证码登录
              </button>
            </div>

            {/* 登录表单 */}
            <form onSubmit={handleLogin} className="space-y-4">
              {loginType === 'password' ? (
                <>
                  {/* 用户名输入 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">账号</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                          errors.username ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="请输入手机号/邮箱"
                      />
                    </div>
                    {errors.username && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.username}
                      </p>
                    )}
                  </div>

                  {/* 密码输入 */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-gray-700">密码</label>
                      <button
                        type="button"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        忘记密码？
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                          errors.password ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="请输入密码"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* 记住密码 */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={formData.rememberMe}
                      onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-600">
                      记住密码
                    </label>
                  </div>
                </>
              ) : (
                <>
                  {/* 手机号输入 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">手机号</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                          errors.phone ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="请输入手机号"
                        maxLength={11}
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* 验证码输入 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">验证码</label>
                    <div className="flex space-x-3">
                      <div className="flex-1 relative">
                        <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          value={formData.smsCode}
                          onChange={(e) => handleInputChange('smsCode', e.target.value)}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                            errors.smsCode ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="请输入验证码"
                          maxLength={6}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleGetSmsCode}
                        disabled={smsCountdown > 0}
                        className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                          smsCountdown > 0
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                        }`}
                      >
                        {smsCountdown > 0 ? `${smsCountdown}s` : '获取验证码'}
                      </button>
                    </div>
                    {errors.smsCode && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.smsCode}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* 登录错误提示 */}
              {loginError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {loginError}
                  </p>
                </div>
              )}

              {/* 登录按钮 */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    登录中...
                  </div>
                ) : (
                  '登录'
                )}
              </button>

              {/* 注册链接 */}
              <div className="text-center">
                <span className="text-sm text-gray-600">还没有账号？</span>
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium ml-1"
                >
                  立即注册
                </button>
              </div>
            </form>

            {/* 其他登录方式 */}
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">其他登录方式</span>
                </div>
              </div>

              <div className="mt-6 flex justify-center space-x-4">
                <button className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white hover:bg-green-600 transition-colors">
                  <span className="text-sm font-bold">微</span>
                </button>
                <button className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-colors">
                  <span className="text-sm font-bold">钉</span>
                </button>
                <button className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-white hover:bg-gray-700 transition-colors">
                  <span className="text-sm font-bold">企</span>
                </button>
              </div>
            </div>
          </div>

          {/* 底部版权信息 */}
          <div className="text-center mt-8 text-white/80 text-sm">
            <p>登录即表示同意我们的<button className="underline hover:text-white">服务条款</button>和<button className="underline hover:text-white">隐私政策</button></p>
            <div className="mt-2 space-y-1">
              <p>© 2025 智飞学记 版权所有</p>
              <p className="text-xs">陕ICP备2025073290号</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;