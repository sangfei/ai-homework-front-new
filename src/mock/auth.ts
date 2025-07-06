import Mock from 'mockjs'

export default () => {
  // 登录
  Mock.mock('/api/auth/login', 'post', (options) => {
    const { username, password, phone, smsCode, loginType } = JSON.parse(options.body)
    
    // 模拟登录验证
    let isValid = false
    if (loginType === 'password') {
      isValid = username === 'admin' && password === '123456'
    } else {
      isValid = phone === '13800138000' && smsCode === '123456'
    }
    
    if (isValid) {
      return {
        code: 200,
        message: '登录成功',
        data: {
          user: {
            id: '1',
            name: '李老师',
            role: '数学教师',
            email: 'teacher@example.com',
            phone: '13800138000'
          },
          token: Mock.Random.string('upper', 32)
        }
      }
    } else {
      return {
        code: 401,
        message: '用户名或密码错误'
      }
    }
  })

  // 登出
  Mock.mock('/api/auth/logout', 'post', {
    code: 200,
    message: '登出成功'
  })

  // 获取用户信息
  Mock.mock('/api/auth/user', 'get', {
    code: 200,
    data: {
      id: '1',
      name: '李老师',
      role: '数学教师',
      email: 'teacher@example.com',
      phone: '13800138000'
    }
  })
}